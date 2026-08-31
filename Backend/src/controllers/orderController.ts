import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { ShiprocketService } from "../services/shiprocketService.js";
import { orderWeightKg } from "../utils/shippingWeight.js";

// Delivery is quoted live per PIN code by Shiprocket, then waived once the
// order clears the threshold the storefront advertises ("Free delivery on
// orders above ₹3,499"). Mirrored in src/routes/checkout.tsx, but this is the
// authority on what actually gets charged — the client is never trusted for a
// shipping price.
const FREE_DELIVERY_THRESHOLD = 3499;

// Used only when Shiprocket can't be reached or quotes nothing usable. Better
// to charge a known-sane figure than to ship free by accident.
const FALLBACK_DELIVERY_CHARGE = 79;

/**
 * The live courier rate for a destination, rounded up to whole rupees.
 * Returns the fallback if the lookup fails, the PIN is unserviceable, or the
 * response carries no rate.
 */
async function quoteDeliveryCharge(
  pincode: string,
  weightKg: number,
  isCod: boolean
): Promise<number> {
  try {
    const quote = await ShiprocketService.checkServiceability(pincode, weightKg, isCod);
    const rate = Number((quote as any)?.courierRate);
    if (quote?.success && Number.isFinite(rate) && rate > 0) return Math.ceil(rate);
  } catch (error) {
    console.error("Shiprocket rate lookup failed, using fallback delivery charge:", error);
  }
  return FALLBACK_DELIVERY_CHARGE;
}

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Public / Protected
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const {
      orderItems,
      pickupLane,
      pickupSlot,
      shippingAddress,
      paymentMethod,
      guestEmail,
    } = authReq.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      res.status(400).json({ success: false, message: "No items in order" });
      return;
    }

    // Sanitize order items and resolve Mongoose ObjectId for product field safely
    const sanitizedOrderItems = [];
    for (const item of orderItems) {
      let productObjId: mongoose.Types.ObjectId | undefined = undefined;

      if (item.product && mongoose.Types.ObjectId.isValid(String(item.product))) {
        productObjId = new mongoose.Types.ObjectId(String(item.product));
      } else if (item.slug) {
        const dbProd = await Product.findOne({ slug: item.slug });
        if (dbProd) {
          productObjId = dbProd._id as mongoose.Types.ObjectId;
        }
      }

      sanitizedOrderItems.push({
        product: productObjId,
        slug: item.slug || item.product || "product",
        name: item.name || "Viśvam Item",
        qty: Math.max(1, Number(item.qty) || 1),
        price: Number(item.price) || 0,
        image: typeof item.image === "string" ? item.image : (Array.isArray(item.images) ? item.images[0] : "") || "",
        variantTitle: typeof item.variantTitle === "string" ? item.variantTitle : undefined,
        variantSku: typeof item.variantSku === "string" ? item.variantSku : undefined,
        selectedOptions:
          item.selectedOptions && typeof item.selectedOptions === "object" ? item.selectedOptions : undefined,
        serving: typeof item.serving === "string" ? item.serving : undefined,
      });
    }

    const itemsPrice = sanitizedOrderItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));

    const deliveryPincode = String(
      shippingAddress?.pincode || shippingAddress?.postalCode || ""
    ).replace(/\D/g, "");
    const isCod = String(paymentMethod || "").toLowerCase().includes("cash");

    const shippingPrice =
      itemsPrice >= FREE_DELIVERY_THRESHOLD
        ? 0
        : deliveryPincode.length === 6
          ? await quoteDeliveryCharge(deliveryPincode, orderWeightKg(sanitizedOrderItems), isCod)
          : FALLBACK_DELIVERY_CHARGE;

    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    const order = await Order.create({
      user: authReq.user?._id,
      guestEmail: authReq.user?.email || guestEmail || shippingAddress?.email || "",
      orderItems: sanitizedOrderItems,
      pickupLane: pickupLane || "riverside",
      pickupSlot: pickupSlot || "ASAP",
      shippingAddress: {
        fullName: shippingAddress?.fullName || authReq.user?.name || "Customer",
        address: shippingAddress?.street || shippingAddress?.address || "",
        city: shippingAddress?.city || "",
        state: shippingAddress?.state || "",
        postalCode: shippingAddress?.pincode || shippingAddress?.postalCode || "",
        phone: shippingAddress?.phone || authReq.user?.phone || "",
        email: shippingAddress?.email || authReq.user?.email || guestEmail || "",
        country: shippingAddress?.country || "India",
      },
      paymentMethod: paymentMethod || "Cash on Delivery",
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: "Pending",
    });

    // Auto-update user profile phone and saved address in MongoDB
    if (authReq.user) {
      try {
        const userDoc = await User.findById(authReq.user._id);
        if (userDoc) {
          if (shippingAddress?.phone) userDoc.phone = shippingAddress.phone;
          userDoc.address = {
            street: shippingAddress?.street || shippingAddress?.address || userDoc.address?.street || "",
            city: shippingAddress?.city || userDoc.address?.city || "",
            state: shippingAddress?.state || userDoc.address?.state || "",
            zipCode: shippingAddress?.pincode || shippingAddress?.postalCode || userDoc.address?.zipCode || "",
            country: shippingAddress?.country || userDoc.address?.country || "India",
          };
          await userDoc.save();
        }
      } catch (err) {
        console.warn("Could not auto-update user saved address:", err);
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: order,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to place order" });
  }
};

// @desc    Get order history for current user
// @route   GET /api/v1/orders/my-orders
// @access  Protected
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const userId = authReq.user._id;
    const userEmail = authReq.user.email ? authReq.user.email.toLowerCase().trim() : "";
    const userPhone = authReq.user.phone ? authReq.user.phone.replace(/[^0-9]/g, "") : "";

    // Comprehensive query matching user ID, guestEmail, shipping address email, or phone number
    const orConditions: any[] = [{ user: userId }];

    if (userEmail) {
      const emailRegex = new RegExp(`^${userEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i");
      orConditions.push({ guestEmail: emailRegex });
      orConditions.push({ "shippingAddress.email": emailRegex });
    }

    if (userPhone && userPhone.length >= 7) {
      const lastDigits = userPhone.slice(-10);
      orConditions.push({ "shippingAddress.phone": new RegExp(lastDigits) });
    }

    const orders = await Order.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Protected
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = authReq.params;
    const order = await Order.findById(id).populate("user", "name email").lean();

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Verify ownership or admin privileges
    if (
      authReq.user &&
      order.user &&
      order.user._id.toString() !== authReq.user._id.toString() &&
      authReq.user.role !== "admin"
    ) {
      res.status(403).json({ success: false, message: "Not authorized to view this order" });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
// @access  Admin
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isPaid } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (status) order.status = status;
    if (typeof isPaid === "boolean") {
      order.isPaid = isPaid;
      if (isPaid) order.paidAt = new Date();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track order by ID (Public)
// @route   GET /api/v1/orders/track/:orderId
// @access  Public
export const trackOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    let order = null;

    if (orderId && orderId.length === 24) {
      order = await Order.findById(orderId).select("status pickupLane pickupSlot totalPrice createdAt orderItems isPaid").lean();
    } else if (orderId) {
      order = await Order.findOne({ _id: orderId }).select("status pickupLane pickupSlot totalPrice createdAt orderItems isPaid").lean();
    }

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found with the provided Tracking ID." });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to track order" });
  }
};
