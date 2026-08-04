import { Response } from "express";
import { Order } from "../models/Order.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Public / Protected
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      pickupLane,
      pickupSlot,
      shippingAddress,
      paymentMethod,
      guestEmail,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: "No items in order" });
      return;
    }

    const itemsPrice = orderItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const shippingPrice = itemsPrice >= 50 ? 0 : 5;
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    const order = await Order.create({
      user: req.user?._id,
      guestEmail: req.user ? undefined : guestEmail,
      orderItems,
      pickupLane: pickupLane || "riverside",
      pickupSlot: pickupSlot || "ASAP",
      shippingAddress,
      paymentMethod: paymentMethod || "Card / Pickup",
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order history for current user
// @route   GET /api/v1/orders/my-orders
// @access  Protected
export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

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
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email").lean();

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Verify ownership or admin privileges
    if (
      req.user &&
      order.user &&
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
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
export const getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
