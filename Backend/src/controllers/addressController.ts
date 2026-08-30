import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { IUser, IAddress } from "../models/User.js";

/**
 * Accounts created before multiple addresses existed carry a single `address`
 * object instead. Fold it into the array the first time the list is read so
 * those customers do not lose the address they already saved, and so the rest
 * of the app only ever has to deal with `addresses`.
 */
const absorbLegacyAddress = async (user: IUser): Promise<void> => {
  if (user.addresses.length > 0) return;
  if (!user.address?.street) return;

  user.addresses.push({
    label: "Home",
    fullName: user.name,
    phone: user.phone || "",
    street: user.address.street,
    city: user.address.city || "",
    state: user.address.state || "",
    pincode: user.address.zipCode || "",
    country: user.address.country || "India",
    isDefault: true,
  } as IAddress);

  await user.save();
};

/** Exactly one address may be the default; the newest claim wins. */
const applyDefault = (user: IUser, addressId: string): void => {
  user.addresses.forEach((addr) => {
    addr.isDefault = String(addr._id) === String(addressId);
  });
};

// @desc    List the signed-in customer's saved addresses
// @route   GET /api/v1/addresses
// @access  Private
export const listAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    await absorbLegacyAddress(user);

    res.status(200).json({ success: true, data: user.addresses });
  } catch (error: any) {
    console.error("List addresses error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to load addresses" });
  }
};

// @desc    Save a new delivery address
// @route   POST /api/v1/addresses
// @access  Private
export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { label, fullName, phone, street, city, state, pincode, isDefault } = authReq.body;

    const missing = ["fullName", "phone", "street", "city", "state", "pincode"].filter(
      (field) => !String(authReq.body[field] || "").trim()
    );
    if (missing.length > 0) {
      res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });
      return;
    }

    if (!/^\d{6}$/.test(String(pincode).trim())) {
      res.status(400).json({ success: false, message: "Pincode must be a 6-digit Indian PIN code" });
      return;
    }

    await absorbLegacyAddress(user);

    // The very first address is the default whether or not the client asked.
    const shouldBeDefault = Boolean(isDefault) || user.addresses.length === 0;

    user.addresses.push({
      label: String(label || "Home").trim(),
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      street: String(street).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      country: "India",
      isDefault: false,
    } as IAddress);

    if (shouldBeDefault) {
      const added = user.addresses[user.addresses.length - 1];
      applyDefault(user, String(added._id));
    }

    await user.save();

    res.status(201).json({ success: true, message: "Address saved", data: user.addresses });
  } catch (error: any) {
    console.error("Add address error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to save address" });
  }
};

// @desc    Update one saved address
// @route   PUT /api/v1/addresses/:addressId
// @access  Private
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { addressId } = authReq.params;
    const target = user.addresses.find((a) => String(a._id) === String(addressId));
    if (!target) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    const { label, fullName, phone, street, city, state, pincode, isDefault } = authReq.body;

    if (pincode !== undefined && !/^\d{6}$/.test(String(pincode).trim())) {
      res.status(400).json({ success: false, message: "Pincode must be a 6-digit Indian PIN code" });
      return;
    }

    if (label !== undefined) target.label = String(label).trim();
    if (fullName !== undefined) target.fullName = String(fullName).trim();
    if (phone !== undefined) target.phone = String(phone).trim();
    if (street !== undefined) target.street = String(street).trim();
    if (city !== undefined) target.city = String(city).trim();
    if (state !== undefined) target.state = String(state).trim();
    if (pincode !== undefined) target.pincode = String(pincode).trim();

    if (isDefault === true) {
      applyDefault(user, String(target._id));
    }

    await user.save();

    res.status(200).json({ success: true, message: "Address updated", data: user.addresses });
  } catch (error: any) {
    console.error("Update address error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update address" });
  }
};

// @desc    Remove a saved address
// @route   DELETE /api/v1/addresses/:addressId
// @access  Private
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { addressId } = authReq.params;
    const target = user.addresses.find((a) => String(a._id) === String(addressId));
    if (!target) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    const wasDefault = target.isDefault;
    user.addresses = user.addresses.filter((a) => String(a._id) !== String(addressId)) as any;

    // Never leave the customer with addresses but no default — checkout relies
    // on one being selectable without them having to pick again.
    if (wasDefault && user.addresses.length > 0) {
      applyDefault(user, String(user.addresses[0]._id));
    }

    await user.save();

    res.status(200).json({ success: true, message: "Address removed", data: user.addresses });
  } catch (error: any) {
    console.error("Delete address error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to remove address" });
  }
};

// @desc    Mark one address as the default for checkout
// @route   PATCH /api/v1/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { addressId } = authReq.params;
    const exists = user.addresses.some((a) => String(a._id) === String(addressId));
    if (!exists) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    applyDefault(user, String(addressId));
    await user.save();

    res.status(200).json({ success: true, message: "Default address updated", data: user.addresses });
  } catch (error: any) {
    console.error("Set default address error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to set default address" });
  }
};
