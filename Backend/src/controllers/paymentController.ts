import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import type { IOrder } from "../models/Order.js";
import { getRazorpayInstance, isRazorpayConfigured } from "../config/razorpay.js";
import { ensureShiprocketOrder } from "../services/orderFulfillment.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { assignOrderNumber, normalizeChannel } from "../utils/orderId.js";

/**
 * Records a payment Razorpay has confirmed against `order`, and runs everything
 * a confirmed prepaid order is owed: its master order number, the confirmation
 * email, and (for shipped orders) the push to Shiprocket's "New" tab.
 *
 * The single path shared by /verify, the webhook and the admin reconcile, so a
 * payment learned about through any of them ends up in exactly the same state.
 * Safe to call repeatedly: the paid fields and the email only happen on the
 * first call, and the order number and Shiprocket push are idempotent — which
 * also lets a replay finish an order whose earlier numbering or push failed.
 *
 * Returns true if this call is the one that marked the order paid.
 */
async function recordCapturedPayment(
  order: IOrder,
  payment: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature?: string }
): Promise<boolean> {
  const wasUnpaid = !order.isPaid;
  if (wasUnpaid) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "Processing";
    order.paymentMethod = "Razorpay";
    order.paymentResult = {
      ...order.paymentResult,
      // The Razorpay order that was actually paid — after a retry this can be
      // an earlier one than the last one created for this order.
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      ...(payment.razorpaySignature ? { razorpaySignature: payment.razorpaySignature } : {}),
    };
    await order.save();
  }

  // Payment captured — this is the moment a prepaid order earns its master
  // order number. Idempotent, so every path that learns of the same payment
  // hands back the one number already issued rather than minting a second.
  await assignOrderNumber(order, normalizeChannel(order.channel)).catch((err) =>
    console.error(`Order number assignment failed for ${String(order._id)}:`, err)
  );

  // Confirmation email goes out on first payment only — never on a replay.
  // Fire-and-forget.
  if (wasUnpaid) {
    sendOrderConfirmationEmail(order).catch((err) =>
      console.error(`Order confirmation email failed for ${String(order._id)}:`, err)
    );
  }

  // Hand the paid order to Shiprocket's "New" tab. Pickup orders are collected
  // in person and never go to Shiprocket (ensureShiprocketOrder guards that too).
  if (order.fulfillmentMethod !== "pickup") {
    await ensureShiprocketOrder(order);
  }

  return wasUnpaid;
}

/**
 * The Viśvam order id a Razorpay order was created for. Every Razorpay order is
 * created with `receipt` (and `notes.visvamOrderId`) set to our Mongo `_id`, so
 * this ties a payment back to its order even when `paymentResult.razorpayOrderId`
 * has since moved on to a newer attempt.
 */
async function visvamOrderIdFor(razorpayOrderId: string): Promise<string | null> {
  try {
    const rpOrder: any = await getRazorpayInstance().orders.fetch(razorpayOrderId);
    const id = String(rpOrder?.notes?.visvamOrderId || rpOrder?.receipt || "");
    return mongoose.Types.ObjectId.isValid(id) ? id : null;
  } catch (err) {
    console.error(`Could not fetch Razorpay order ${razorpayOrderId}:`, err);
    return null;
  }
}

/** Finds the Viśvam order a Razorpay order belongs to. */
async function findOrderForRazorpayOrder(razorpayOrderId: string): Promise<IOrder | null> {
  const direct = await Order.findOne({ "paymentResult.razorpayOrderId": razorpayOrderId });
  if (direct) return direct;
  const visvamOrderId = await visvamOrderIdFor(razorpayOrderId);
  return visvamOrderId ? Order.findById(visvamOrderId) : null;
}

/**
 * Asks Razorpay whether `order` has actually been paid, across every Razorpay
 * order ever created for it (a customer who retried has several). Returns the
 * captured payment if there is one, otherwise the best other status seen so the
 * caller can say why the order is still unpaid.
 */
async function findRazorpayPaymentFor(order: IOrder): Promise<{
  captured?: { razorpayOrderId: string; razorpayPaymentId: string; amount: number };
  authorizedPaymentId?: string;
}> {
  const razorpay = getRazorpayInstance();
  const rpOrderIds = new Set<string>();
  if (order.paymentResult?.razorpayOrderId) rpOrderIds.add(order.paymentResult.razorpayOrderId);

  const byReceipt: any = await razorpay.orders.all({ receipt: String(order._id), count: 100 } as any);
  for (const rpOrder of byReceipt?.items || []) rpOrderIds.add(rpOrder.id);

  let authorizedPaymentId: string | undefined;
  for (const rpOrderId of rpOrderIds) {
    const payments: any = await razorpay.orders.fetchPayments(rpOrderId);
    for (const payment of payments?.items || []) {
      if (payment.status === "captured") {
        return {
          captured: {
            razorpayOrderId: rpOrderId,
            razorpayPaymentId: payment.id,
            amount: Number(payment.amount) / 100,
          },
        };
      }
      if (payment.status === "authorized") authorizedPaymentId = payment.id;
    }
  }
  return { authorizedPaymentId };
}

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
      res.status(400).json({
        success: false,
        alreadyPaid: true,
        orderNumber: order.orderNumber,
        message: "This order has already been paid for",
      });
      return;
    }

    // Amount is always derived from the server-computed order total, never
    // trusted from the client, so a tampered request can't pay a lower price.
    const amountInPaise = Math.round(order.totalPrice * 100);

    // A retry (customer closed the popup, or payment failed) reuses the
    // Razorpay order already created for this order instead of minting a new
    // one. Razorpay accepts further attempts on an unpaid order, and keeping
    // one Razorpay order per Viśvam order means a late success on the first
    // attempt — e.g. a UPI request approved after the popup was closed — still
    // matches this order when /verify or the webhook reports it.
    const existingRpOrderId = order.paymentResult?.razorpayOrderId;
    if (existingRpOrderId) {
      try {
        const existing: any = await getRazorpayInstance().orders.fetch(existingRpOrderId);
        if (existing?.status === "paid") {
          // The earlier attempt was paid and we never heard about it. Record it
          // now rather than charging the customer a second time.
          const { captured } = await findRazorpayPaymentFor(order);
          if (captured) {
            await recordCapturedPayment(order, captured);
            res.status(400).json({
              success: false,
              alreadyPaid: true,
              orderNumber: order.orderNumber,
              message: "This order has already been paid for",
            });
            return;
          }
          // Paid, but the payment isn't visible yet. Never open a second
          // checkout on an order Razorpay already considers paid.
          res.status(409).json({
            success: false,
            message:
              "A payment for this order is already being processed. Please don't pay again — contact us if it isn't confirmed shortly.",
          });
          return;
        } else if (Number(existing?.amount) === amountInPaise) {
          res.status(200).json({
            success: true,
            keyId: process.env.RAZORPAY_KEY_ID,
            amount: existing.amount,
            currency: existing.currency,
            razorpayOrderId: existing.id,
          });
          return;
        }
      } catch (err) {
        // Couldn't look it up — fall through and create a fresh one. Its
        // receipt still ties it to this order for /verify and the webhook.
        console.error(`Could not reuse Razorpay order ${existingRpOrderId}:`, err);
      }
    }

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

    // Normally the payment is for the Razorpay order stored on this order. If
    // it isn't (the payment landed on an earlier attempt's Razorpay order),
    // accept it only when Razorpay confirms that order was created for this one.
    if (
      order.paymentResult?.razorpayOrderId !== razorpay_order_id &&
      (await visvamOrderIdFor(razorpay_order_id)) !== String(order._id)
    ) {
      res.status(400).json({ success: false, message: "Payment does not match this order" });
      return;
    }

    await recordCapturedPayment(order, {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

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

    if (!webhookSecret) {
      // Loud on purpose: without this secret every webhook is rejected, and a
      // payment whose customer never returned to the site stays "Unpaid".
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not set — rejecting a Razorpay webhook. Paid orders will stay unpaid if the customer's browser doesn't return."
      );
      res.status(400).json({ success: false, message: "Webhook not configured" });
      return;
    }

    if (!signature || !rawBody) {
      res.status(400).json({ success: false, message: "Missing webhook signature" });
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

    // `order.paid` carries the same payment entity, so either event (or both)
    // being enabled in the Razorpay dashboard works. Replays are harmless:
    // recordCapturedPayment only acts on the first delivery.
    if (
      (event === "payment.captured" || event === "order.paid") &&
      paymentEntity?.order_id &&
      paymentEntity?.status === "captured"
    ) {
      // Looked up through Razorpay's receipt as well, so a payment on an
      // earlier attempt's Razorpay order still finds its Viśvam order.
      const order = await findOrderForRazorpayOrder(paymentEntity.order_id);
      if (order) {
        await recordCapturedPayment(order, {
          razorpayOrderId: paymentEntity.order_id,
          razorpayPaymentId: paymentEntity.id,
        });
      } else {
        console.error(`Razorpay webhook: no Viśvam order for ${paymentEntity.order_id} (${paymentEntity.id})`);
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

// @desc    Ask Razorpay whether an order was actually paid, and record it if so
// @route   POST /api/v1/payments/razorpay/reconcile/:orderId
// @access  Admin
//
// For the order that shows "Unpaid" although the customer says they paid: the
// browser never came back to /verify and the webhook didn't land. This checks
// every Razorpay order created for it and, if one holds a captured payment,
// runs the exact same steps /verify would have (paid, order number, email,
// Shiprocket).
export const reconcileRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isRazorpayConfigured()) {
      res.status(503).json({ success: false, message: "Razorpay is not configured on the server." });
      return;
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.isPaid && order.paymentResult?.razorpayPaymentId) {
      // Already recorded — still re-run the idempotent steps, which fills in
      // an order number that failed to mint the first time.
      await recordCapturedPayment(order, {
        razorpayOrderId: order.paymentResult.razorpayOrderId || "",
        razorpayPaymentId: order.paymentResult.razorpayPaymentId,
      });
      res.status(200).json({ success: true, paid: true, message: "Payment was already recorded.", data: order });
      return;
    }

    const { captured, authorizedPaymentId } = await findRazorpayPaymentFor(order);

    if (!captured) {
      res.status(200).json({
        success: true,
        paid: false,
        message: authorizedPaymentId
          ? `Payment ${authorizedPaymentId} is authorised but not captured. Capture it in the Razorpay dashboard, then check again.`
          : "Razorpay has no captured payment for this order.",
        data: order,
      });
      return;
    }

    if (captured.amount + 0.01 < order.totalPrice) {
      res.status(200).json({
        success: true,
        paid: false,
        message: `Razorpay captured ₹${captured.amount} (${captured.razorpayPaymentId}) but the order total is ₹${order.totalPrice}. Not marked paid — check it in the Razorpay dashboard.`,
        data: order,
      });
      return;
    }

    await recordCapturedPayment(order, captured);
    res.status(200).json({
      success: true,
      paid: true,
      message: `Payment ${captured.razorpayPaymentId} found and recorded.`,
      data: order,
    });
  } catch (error: any) {
    console.error("Razorpay reconcile error:", error);
    res.status(500).json({
      success: false,
      message: error?.error?.description || error.message || "Failed to check payment with Razorpay",
    });
  }
};
