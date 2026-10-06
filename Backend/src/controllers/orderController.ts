import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { ShiprocketService } from "../services/shiprocketService.js";
import { ensureShiprocketOrder } from "../services/orderFulfillment.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { getNumericSetting } from "./settingsController.js";
import { evaluateCoupon, redeemCoupon } from "./couponController.js";
import { orderWeightKg } from "../utils/shippingWeight.js";
import { isPickupEligible } from "../config/pickup.js";
import { assignOrderNumber, isOrderNumber, normalizeChannel } from "../utils/orderId.js";

// Delivery is quoted live per PIN code by Shiprocket, then waived once the
// order clears the threshold the storefront advertises ("Free delivery on
// orders above ₹3,499"). Mirrored in src/routes/checkout.tsx, but this is the
// authority on what actually gets charged — the client is never trusted for a
// shipping price.
const FREE_DELIVERY_THRESHOLD = 3499;

// Used only when Shiprocket can't be reached or quotes nothing usable. Better
// to charge a known-sane figure than to ship free by accident.
const FALLBACK_DELIVERY_CHARGE = 79;

// Delivery is charged at the live courier rate, nothing added. It is ALWAYS
// quoted at the prepaid rate — never Shiprocket's COD rate, which bundles a
// percent-of-order-value collection fee and would make the delivery line swing
// the moment a customer switched to COD. Cash-on-Delivery instead carries a
// separate, flat surcharge (`codHandlingFee`, editable in Admin Panel →
// Merchandising) that is its own line on the order, so it also still applies on
// free-delivery orders.

/**
 * The live prepaid courier rate for a destination, rounded up to whole rupees.
 * Returns the fallback if the lookup fails, the PIN is unserviceable, or the
 * response carries no rate.
 */
async function quoteDeliveryCharge(pincode: string, weightKg: number): Promise<number> {
  try {
    const quote = await ShiprocketService.checkServiceability(pincode, weightKg, false);
    const rate = Number((quote as any)?.courierRate);
    if (quote?.success && Number.isFinite(rate) && rate > 0) return Math.ceil(rate);
  } catch (error) {
    console.error("Shiprocket rate lookup failed, using fallback delivery charge:", error);
  }
  return FALLBACK_DELIVERY_CHARGE;
}

/**
 * The live COD collection-fee component Shiprocket quotes for a destination —
 * from the same cheapest-serviceable-courier lookup `quoteDeliveryCharge` uses,
 * just with `isCod=true` so the response splits out `codCharges`. This is the
 * distance-dependent figure the Admin Panel courier picker already shows
 * ("₹X freight + ₹Y COD"); quoting it live here means the handling fee tracks
 * real cost by zone instead of one flat rupee figure that undercharges far
 * zones and overcharges near ones. Falls back to the flat admin-configured
 * `codHandlingFee` setting when Shiprocket can't be reached or reports nothing
 * usable, so a lookup failure never blocks checkout.
 */
async function quoteCodHandlingFee(pincode: string, weightKg: number): Promise<number> {
  try {
    const quote = await ShiprocketService.checkServiceability(pincode, weightKg, true);
    const codCharges = Number((quote as any)?.availableCouriers?.[0]?.codCharges);
    if (quote?.success && Number.isFinite(codCharges)) return Math.max(0, Math.ceil(codCharges));
  } catch (error) {
    console.error("Shiprocket COD-fee lookup failed, using fallback handling fee:", error);
  }
  return getNumericSetting("codHandlingFee");
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
      fulfillmentMethod,
      shippingAddress,
      paymentMethod,
      guestEmail,
      couponCode: rawCouponCode,
      idempotencyKey: rawIdempotencyKey,
      channel: rawChannel,
    } = authReq.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      res.status(400).json({ success: false, message: "No items in order" });
      return;
    }

    const channel = normalizeChannel(rawChannel);
    const idempotencyKey =
      typeof rawIdempotencyKey === "string" && rawIdempotencyKey.trim()
        ? rawIdempotencyKey.trim().slice(0, 100)
        : undefined;

    // A double-clicked "Place Order" (or a retry after a flaky response) must
    // return the order already created, never a second one billed twice.
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) {
        res.status(200).json({
          success: true,
          message: "Order already placed",
          data: existing,
        });
        return;
      }
    }

    // Sanitize order items and resolve Mongoose ObjectId for product field safely
    const sanitizedOrderItems = [];
    for (const item of orderItems) {
      // Always resolve the catalogue product: it gives us the ObjectId AND lets
      // us guarantee a pack size is stored on every line, whatever the client
      // sent. A reorder from history or an older cart can arrive with no
      // variant and no serving, and the order must not be left size-less.
      let dbProd: any = null;
      if (item.slug) {
        dbProd = await Product.findOne({ slug: item.slug });
      }
      if (!dbProd && item.product && mongoose.Types.ObjectId.isValid(String(item.product))) {
        dbProd = await Product.findById(String(item.product));
      }

      const productObjId: mongoose.Types.ObjectId | undefined = dbProd?._id
        ? (dbProd._id as mongoose.Types.ObjectId)
        : item.product && mongoose.Types.ObjectId.isValid(String(item.product))
          ? new mongoose.Types.ObjectId(String(item.product))
          : undefined;

      // Whatever the client provided, kept as-is when present.
      let variantTitle = typeof item.variantTitle === "string" ? item.variantTitle : undefined;
      let variantSku = typeof item.variantSku === "string" ? item.variantSku : undefined;
      let selectedOptions =
        item.selectedOptions && typeof item.selectedOptions === "object"
          ? (item.selectedOptions as Record<string, string>)
          : undefined;
      let serving = typeof item.serving === "string" ? item.serving : undefined;
      // Trusted only as a weight hint for the courier quote, never for price.
      let weightKg = Number(item.weightKg) > 0 ? Number(item.weightKg) : undefined;

      // Backfill the pack size from the catalogue when the client omitted it.
      if (dbProd) {
        const optVal = (opts: any, k: string): string | undefined =>
          opts instanceof Map ? opts.get(k) : opts?.[k];
        const variants: any[] = Array.isArray(dbProd.variants) ? dbProd.variants : [];
        let matched: any =
          (variantSku && variants.find((v) => v.sku && v.sku === variantSku)) ||
          (selectedOptions &&
            Object.keys(selectedOptions).length > 0 &&
            variants.find(
              (v) =>
                v.options &&
                Object.entries(selectedOptions as Record<string, string>).every(
                  ([k, val]) => optVal(v.options, k) === val
                )
            )) ||
          null;
        if (!matched && dbProd.hasVariants && variants.length) {
          matched = variants.find((v) => v.isDefault) || variants[0];
        }
        if (matched) {
          if (!variantTitle && typeof matched.title === "string") variantTitle = matched.title;
          if (!variantSku && typeof matched.sku === "string") variantSku = matched.sku;
          if (!selectedOptions && matched.options) {
            selectedOptions =
              matched.options instanceof Map
                ? Object.fromEntries(matched.options)
                : { ...matched.options };
          }
          if (weightKg == null && Number(matched.weightKg) > 0) weightKg = Number(matched.weightKg);
        }
        if (!serving && typeof dbProd.serving === "string") serving = dbProd.serving;
        if (weightKg == null && Number(dbProd.weightKg) > 0) weightKg = Number(dbProd.weightKg);
      }

      sanitizedOrderItems.push({
        product: productObjId,
        slug: item.slug || item.product || "product",
        name: item.name || dbProd?.name || "Viśvam Item",
        qty: Math.max(1, Number(item.qty) || 1),
        price: Number(item.price) || 0,
        image: typeof item.image === "string" ? item.image : (Array.isArray(item.images) ? item.images[0] : "") || "",
        variantTitle,
        variantSku,
        selectedOptions,
        serving,
        weightKg,
      });
    }

    const itemsPrice = sanitizedOrderItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);

    // Coupon — the checkout only previews it; this is the authoritative check.
    // Re-evaluate against the real items total and reject if it stopped being
    // valid in between (expired, hit its cap, minimum not met) so the customer
    // sees it before paying rather than being silently overcharged.
    const customerEmail =
      authReq.user?.email || guestEmail || shippingAddress?.email || "";
    // The signed-in User id is the stable per-customer key for the
    // once-per-customer rule; email is only a fallback for a guest order.
    const customerKey = authReq.user?._id ? String(authReq.user._id) : "";
    let couponCode = "";
    let discountAmount = 0;
    if (rawCouponCode && String(rawCouponCode).trim()) {
      const evald = await evaluateCoupon(String(rawCouponCode), {
        itemsSubtotal: itemsPrice,
        customerKey,
        email: customerEmail,
      });
      if (!evald.valid) {
        res.status(400).json({
          success: false,
          message: `Coupon "${String(rawCouponCode).trim().toUpperCase()}" can't be applied: ${evald.reason}`,
        });
        return;
      }
      couponCode = evald.coupon.code;
      discountAmount = evald.discountAmount;
    }

    // Free delivery below is judged on the pre-discount `itemsPrice`.
    const discountedItems = Math.max(0, itemsPrice - discountAmount);
    const taxPrice = 0;

    const wantsPickup = String(fulfillmentMethod || "").toLowerCase() === "pickup";
    const deliveryPincode = String(
      shippingAddress?.pincode || shippingAddress?.postalCode || ""
    ).replace(/\D/g, "");
    const deliveryCity = String(shippingAddress?.city || "");

    // Warehouse pickup is Delhi NCR only — re-check server-side, never trust the
    // client that the order qualifies. A pickup order carries no courier cost
    // and no COD surcharge, and is kept out of Shiprocket entirely.
    if (wantsPickup && !isPickupEligible({ pincode: deliveryPincode, city: deliveryCity })) {
      res.status(400).json({
        success: false,
        message: "Warehouse pickup is only available for Delhi NCR addresses.",
      });
      return;
    }

    // "Cash on Delivery" only applies to shipped orders. A pickup order paid at
    // the counter is a separate method ("Pay on Pickup") with no surcharge.
    const isCod =
      !wantsPickup && String(paymentMethod || "").toLowerCase().includes("cash");

    const orderWeight = orderWeightKg(sanitizedOrderItems);

    const shippingPrice = wantsPickup
      ? 0
      : itemsPrice >= FREE_DELIVERY_THRESHOLD
        ? 0
        : deliveryPincode.length === 6
          ? await quoteDeliveryCharge(deliveryPincode, orderWeight)
          : FALLBACK_DELIVERY_CHARGE;

    // COD costs more to service, so it carries a surcharge, quoted live per
    // destination so it tracks the real zone-based cost. Deliberately NOT
    // folded into shippingPrice: a free-delivery order still owes this fee.
    const codFee = isCod
      ? deliveryPincode.length === 6
        ? await quoteCodHandlingFee(deliveryPincode, orderWeight)
        : await getNumericSetting("codHandlingFee")
      : 0;

    const totalPrice = Number((discountedItems + taxPrice + shippingPrice + codFee).toFixed(2));

    const order = await Order.create({
      user: authReq.user?._id,
      guestEmail: authReq.user?.email || guestEmail || shippingAddress?.email || "",
      orderItems: sanitizedOrderItems,
      pickupLane: pickupLane || "riverside",
      pickupSlot: pickupSlot || "ASAP",
      fulfillmentMethod: wantsPickup ? "pickup" : "ship",
      // The customer's real address is kept even for pickup — it's useful
      // context for the team, and `fulfillmentMethod` is what flags a pickup
      // order everywhere it matters (no courier, never sent to Shiprocket).
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
      couponCode: couponCode || undefined,
      discountAmount,
      taxPrice,
      shippingPrice,
      codFee,
      totalPrice,
      status: "Pending",
      channel,
      idempotencyKey,
    });

    // Record the redemption now that the order exists. Awaited so the
    // customer's *next* order sees it, but its failure must never fail an
    // order that has already been placed — hence the swallowed catch.
    if (couponCode) {
      await redeemCoupon(couponCode, { customerKey, email: customerEmail }).catch((err) =>
        console.error(`Coupon redemption update failed for ${couponCode}:`, err)
      );
    }

    // Auto-update user profile phone and saved address in MongoDB.
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

    // Confirmation email — fire-and-forget. Sent now for any order that won't
    // have a later payment step: COD, or a pickup order paid at the counter. A
    // prepaid (Razorpay) order is still unpaid here, so its confirmation is
    // sent from paymentController once payment verifies.
    const isPrepaidPending = String(paymentMethod || "").toLowerCase().includes("razorpay");

    // Mint the master order number now for anything that is already confirmed —
    // COD and pay-on-pickup have no later payment step. A prepaid order stays
    // unnumbered until Razorpay captures the payment (paymentController), so an
    // abandoned checkout never burns a number. Must happen before the Shiprocket
    // push below, which quotes this number as its order reference.
    if (!isPrepaidPending) {
      try {
        await assignOrderNumber(order, channel);
      } catch (err) {
        console.error(`Order number assignment failed for ${String(order._id)}:`, err);
      }
    }

    if (wantsPickup) {
      // Pickup orders never touch Shiprocket — the customer collects in person.
      if (!isPrepaidPending) {
        sendOrderConfirmationEmail(order).catch((err) =>
          console.error(`Order confirmation email failed for ${String(order._id)}:`, err)
        );
      }
    } else if (isCod) {
      // COD orders enter Shiprocket's "New" tab right away so the team can pick
      // a courier from the Admin Panel. Best-effort — never fail placement.
      await ensureShiprocketOrder(order);

      sendOrderConfirmationEmail(order).catch((err) =>
        console.error(`Order confirmation email failed for ${String(order._id)}:`, err)
      );
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

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"] as const;

// @desc    Update order status and/or payment state (Admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Admin
//
// Fulfilment status and payment are two independent facts and this endpoint
// keeps them that way. Moving a COD order to "Shipped" says the parcel left the
// warehouse, NOT that the customer has paid — the cash arrives on delivery.
// Callers that only want to move the status simply omit `isPaid`, and the
// stored payment record is left exactly as it was.
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isPaid } = req.body;

    if (status !== undefined && !ORDER_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Expected one of: ${ORDER_STATUSES.join(", ")}.`,
      });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (status) order.status = status;

    if (typeof isPaid === "boolean" && isPaid !== order.isPaid) {
      // A payment settled by Razorpay is the gateway's record, not a flag to be
      // flipped by hand. Reversing it here would leave the books disagreeing
      // with Razorpay while the customer's money is still captured — a refund
      // has to be issued in the Razorpay dashboard instead.
      if (!isPaid && order.paymentResult?.razorpayPaymentId) {
        res.status(400).json({
          success: false,
          message:
            "This order was paid online through Razorpay and can't be marked unpaid here. Issue a refund from the Razorpay dashboard instead.",
        });
        return;
      }

      order.isPaid = isPaid;
      order.paidAt = isPaid ? new Date() : undefined;
    }

    const updatedOrder = await order.save();

    // A prepaid order only earns its VSV number once payment is confirmed. If
    // that confirmation never arrived from Razorpay and an admin is marking it
    // paid by hand, this is that confirmation — give it its number now rather
    // than leaving it on the short Mongo id. Idempotent for orders that already
    // have one.
    if (updatedOrder.isPaid && !updatedOrder.orderNumber) {
      await assignOrderNumber(updatedOrder, normalizeChannel(updatedOrder.channel)).catch((err) =>
        console.error(`Order number assignment failed for ${String(updatedOrder._id)}:`, err)
      );

      // Such a stuck online order also never got its confirmation email or its
      // Shiprocket push (COD / pay-on-pickup orders got both at placement).
      if (String(updatedOrder.paymentMethod).toLowerCase().includes("razorpay")) {
        sendOrderConfirmationEmail(updatedOrder).catch((err) =>
          console.error(`Order confirmation email failed for ${String(updatedOrder._id)}:`, err)
        );
        await ensureShiprocketOrder(updatedOrder);
      }
    }

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
    const fields = "orderNumber status pickupLane pickupSlot totalPrice createdAt orderItems isPaid";
    let order = null;

    // Customers quote the VSV number from their confirmation; older orders (and
    // internal links) still use the Mongo id, so accept either.
    const query = String(orderId || "").trim();
    if (isOrderNumber(query)) {
      order = await Order.findOne({ orderNumber: query.toUpperCase() }).select(fields).lean();
    } else if (mongoose.Types.ObjectId.isValid(query)) {
      order = await Order.findById(query).select(fields).lean();
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
