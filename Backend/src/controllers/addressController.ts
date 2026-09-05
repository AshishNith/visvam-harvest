import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { User, IUser, IAddress } from "../models/User.js";

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
//
// Builds the new address on the in-memory document (so shouldBeDefault can see
// the current count and absorbLegacyAddress can run first), then persists with
// a plain `user.save()`. A prior version of this reused the same in-memory
// `user` document across two separate save() calls fine for a single request,
// but that read-modify-write shape is exactly what drops data under
// concurrent requests: a customer double-tapping "Save", or a stale mobile tab
// left open, both push into the SAME in-memory addresses array loaded at the
// top of the request. Whichever save() lands second overwrites the first with
// a list that never saw the other one's push, silently losing the address that
// "saved successfully" a moment earlier. Persisting through `User.findByIdAndUpdate`
// with an atomic `$push` makes each request append to whatever is in the
// database *at the moment it writes*, not a snapshot read at the start of the
// request — so two concurrent saves both land.
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

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      label: String(label || "Home").trim(),
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      street: String(street).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      country: "India",
      isDefault: false,
    };

    // The very first address is the default whether or not the client asked.
    const shouldBeDefault = Boolean(isDefault) || user.addresses.length === 0;

    // MongoDB rejects `$push: { addresses: ... }` and `$set: { "addresses.$[].x": ... }`
    // in one update — "addresses" is treated as a conflicting prefix of
    // "addresses.$[].isDefault" — so clearing existing defaults is a separate
    // write, run before the push.
    if (shouldBeDefault) {
      await User.updateOne({ _id: user._id }, { $set: { "addresses.$[].isDefault": false } });
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $push: { addresses: { ...newAddress, isDefault: shouldBeDefault } } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "Account not found" });
      return;
    }

    res.status(201).json({ success: true, message: "Address saved", data: updated.addresses });
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
    const exists = user.addresses.some((a) => String(a._id) === String(addressId));
    if (!exists) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    const { label, fullName, phone, street, city, state, pincode, isDefault } = authReq.body;

    if (pincode !== undefined && !/^\d{6}$/.test(String(pincode).trim())) {
      res.status(400).json({ success: false, message: "Pincode must be a 6-digit Indian PIN code" });
      return;
    }

    const fieldUpdates: Record<string, any> = {};
    if (label !== undefined) fieldUpdates["addresses.$[target].label"] = String(label).trim();
    if (fullName !== undefined) fieldUpdates["addresses.$[target].fullName"] = String(fullName).trim();
    if (phone !== undefined) fieldUpdates["addresses.$[target].phone"] = String(phone).trim();
    if (street !== undefined) fieldUpdates["addresses.$[target].street"] = String(street).trim();
    if (city !== undefined) fieldUpdates["addresses.$[target].city"] = String(city).trim();
    if (state !== undefined) fieldUpdates["addresses.$[target].state"] = String(state).trim();
    if (pincode !== undefined) fieldUpdates["addresses.$[target].pincode"] = String(pincode).trim();

    const arrayFilters = [{ "target._id": new mongoose.Types.ObjectId(String(addressId)) }];

    // MongoDB rejects a single update that writes to both `addresses.$[]` and
    // `addresses.$[target]` on the same field (they can resolve to the same
    // array element, which it treats as a conflicting path) — so clearing
    // every default is a separate write from setting this address's own
    // fields, run first.
    if (isDefault === true) {
      await User.updateOne({ _id: user._id }, { $set: { "addresses.$[].isDefault": false } });
      fieldUpdates["addresses.$[target].isDefault"] = true;
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: fieldUpdates },
      { new: true, runValidators: true, arrayFilters }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "Account not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Address updated", data: updated.addresses });
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

    let updated = await User.findByIdAndUpdate(
      user._id,
      { $pull: { addresses: { _id: new mongoose.Types.ObjectId(String(addressId)) } } },
      { new: true }
    );

    // Never leave the customer with addresses but no default — checkout relies
    // on one being selectable without them having to pick again.
    if (updated && wasDefault && updated.addresses.length > 0) {
      const fallbackId = updated.addresses[0]._id;
      updated =
        (await User.findByIdAndUpdate(
          user._id,
          { $set: { "addresses.$[fallback].isDefault": true } },
          { new: true, arrayFilters: [{ "fallback._id": fallbackId }] }
        )) || updated;
    }

    if (!updated) {
      res.status(404).json({ success: false, message: "Account not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Address removed", data: updated.addresses });
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

    await User.updateOne({ _id: user._id }, { $set: { "addresses.$[].isDefault": false } });
    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: { "addresses.$[target].isDefault": true } },
      { new: true, arrayFilters: [{ "target._id": new mongoose.Types.ObjectId(String(addressId)) }] }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "Account not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Default address updated", data: updated.addresses });
  } catch (error: any) {
    console.error("Set default address error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to set default address" });
  }
};
