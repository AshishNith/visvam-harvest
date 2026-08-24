import { Request, Response } from "express";
import crypto from "crypto";
import { Order } from "../models/Order.js";
import { getRazorpayInstance, isRazorpayConfigured } from "../config/razorpay.js";

// @desc    Create a Razorpay order for an existing Viśvam order
// @route   POST /api/v1/payments/razorpay/order
// @access  Public (order ownership isn't enforced here — same trust level as order creation)
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isRazorpayConfigured()) {
      res.status(503).json({ success: false, message: "Online payments are temporarily unavailable. Please choose Cash on Delivery." });
      return;
    }

    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, message: "orderId is required" });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.isPaid) {
      res.status(400).json({ success: false, message: "This order has already been paid for" });
      return;
    }

    // Amount is always derived from the server-computed order total, never
    // trusted from the client, so a tampered request can't pay a lower price.
    const amountInPaise = Math.round(order.totalPrice * 100);

    const razorpayOrder = await getRazorpayInstance().orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: String(order._id),
      notes: { visvamOrderId: String(order._id) },
    });

    order.paymentResult = { ...(order.paymentResult || {}), razorpayOrderId: razorpayOrder.id };
    await order.save();

    res.status(200).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to initiate payment" });
  }
};

// @desc    Verify a Razorpay payment signature and mark the order as paid
// @route   POST /api/v1/payments/razorpay/verify
// @access  Public
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: "Missing payment verification fields" });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      res.status(503).json({ success: false, message: "Online payments are temporarily unavailable" });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.paymentResult?.razorpayOrderId !== razorpay_order_id) {
      res.status(400).json({ success: false, message: "Payment does not match this order" });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!isValid) {
      res.status(400).json({ success: false, message: "Payment signature verification failed" });
      return;
    }

    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "Processing";
      order.paymentMethod = "Razorpay";
      order.paymentResult = {
        ...order.paymentResult,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      };
      await order.save();
    }

    res.status(200).json({ success: true, message: "Payment verified successfully", data: order });
  } catch (error: any) {
    console.error("Razorpay payment verification error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to verify payment" });
  }
};

// @desc    Razorpay webhook — safety net that marks an order paid even if the
//          customer's browser never returns to call the verify endpoint
//          (closed tab, network drop, etc. right after a successful charge)
// @route   POST /api/v1/payments/razorpay/webhook
// @access  Public (authenticated via the x-razorpay-signature header)
export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const rawBody = (req as any).rawBody as Buffer | undefined;

    if (!webhookSecret || !signature || !rawBody) {
      res.status(400).json({ success: false, message: "Webhook not configured or missing signature" });
      return;
    }

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    const isValid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

    if (!isValid) {
      res.status(400).json({ success: false, message: "Invalid webhook signature" });
      return;
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity?.order_id) {
      const order = await Order.findOne({ "paymentResult.razorpayOrderId": paymentEntity.order_id });
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = "Processing";
        order.paymentMethod = "Razorpay";
        order.paymentResult = {
          ...order.paymentResult,
          razorpayPaymentId: paymentEntity.id,
        };
        await order.save();
      }
    }

    // Always acknowledge with 200 once the signature checks out, so Razorpay
    // doesn't keep retrying an event we've already understood.
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};
