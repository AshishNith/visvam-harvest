import { Request, Response } from "express";
import { Coupon, ICoupon } from "../models/Coupon.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export type CouponEval =
  | { valid: true; coupon: ICoupon; discountPercent: number; discountAmount: number }
  | { valid: false; reason: string };

/**
 * The single source of truth for whether a coupon can be used and how much it
 * takes off. Called both by the checkout preview endpoint and, authoritatively,
 * by orderController when the order is actually created.
 *
 * The discount is a whole-rupee amount off `itemsSubtotal` (the pre-discount
 * cart items total). `email` is the customer's lowercased email, used only for
 * the once-per-customer rule; pass it whenever it is known.
 */
export async function evaluateCoupon(
  codeRaw: string,
  ctx: { itemsSubtotal: number; email?: string }
): Promise<CouponEval> {
  const code = String(codeRaw || "").trim().toUpperCase();
  if (!code) return { valid: false, reason: "Enter a coupon code." };

  const coupon = await Coupon.findOne({ code });
  if (!coupon) return { valid: false, reason: "That coupon code isn't valid." };
  if (!coupon.active) return { valid: false, reason: "This coupon is no longer active." };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now())
    return { valid: false, reason: "This coupon has expired." };

  const subtotal = Number(ctx.itemsSubtotal) || 0;
  if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue)
    return {
      valid: false,
      reason: `Add more to your bag — this coupon needs a subtotal of at least ₹${coupon.minOrderValue}.`,
    };

  if (coupon.maxRedemptions > 0 && coupon.timesRedeemed >= coupon.maxRedemptions)
    return { valid: false, reason: "This coupon has reached its usage limit." };

  const email = String(ctx.email || "").trim().toLowerCase();
  if (coupon.oncePerCustomer && email && coupon.redeemedEmails.includes(email))
    return { valid: false, reason: "You've already used this coupon." };

  const discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);
  return { valid: true, coupon, discountPercent: coupon.discountPercent, discountAmount };
}

/**
 * Records that a coupon was used on an order. Fire-and-forget from the caller —
 * a failure here must never fail an order that has already been created.
 */
export async function redeemCoupon(code: string, email?: string): Promise<void> {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return;
  const cleanEmail = String(email || "").trim().toLowerCase();
  const update: Record<string, unknown> = { $inc: { timesRedeemed: 1 } };
  if (cleanEmail) update.$addToSet = { redeemedEmails: cleanEmail };
  await Coupon.updateOne({ code: normalized }, update);
}

// @desc    Check a coupon for the checkout (advisory preview — the order
//          endpoint re-checks and recomputes authoritatively)
// @route   POST /api/v1/coupons/validate
// @access  Public (reads the customer email from an optional auth token)
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { code, subtotal } = req.body;
    const result = await evaluateCoupon(String(code || ""), {
      itemsSubtotal: Number(subtotal) || 0,
      email: authReq.user?.email,
    });

    if (!result.valid) {
      res.status(200).json({ success: true, valid: false, message: result.reason });
      return;
    }

    res.status(200).json({
      success: true,
      valid: true,
      code: result.coupon.code,
      discountPercent: result.discountPercent,
      discountAmount: result.discountAmount,
    });
  } catch (error: any) {
    console.error("Coupon validate error:", error);
    res.status(500).json({ success: false, valid: false, message: "Could not check that coupon." });
  }
};

// ─── Admin CRUD ──────────────────────────────────────────────────

// @desc    List all coupons
// @route   GET /api/v1/coupons
// @access  Admin
export const listCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Coerce + clamp the writable fields of a coupon from a request body. */
function sanitizeCouponInput(body: any, forCreate: boolean): Record<string, unknown> | { error: string } {
  const out: Record<string, unknown> = {};

  if (forCreate || body.code !== undefined) {
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) return { error: "A coupon code is required." };
    if (!/^[A-Z0-9._-]{2,32}$/.test(code))
      return { error: "Code must be 2–32 characters: letters, digits, . _ - only." };
    out.code = code;
  }

  if (forCreate || body.discountPercent !== undefined) {
    const pct = Math.round(Number(body.discountPercent));
    if (!Number.isFinite(pct) || pct < 1 || pct > 100)
      return { error: "Discount percent must be between 1 and 100." };
    out.discountPercent = pct;
  }

  if (body.active !== undefined) out.active = Boolean(body.active);
  if (body.oncePerCustomer !== undefined) out.oncePerCustomer = Boolean(body.oncePerCustomer);

  if (body.minOrderValue !== undefined) {
    const n = Math.max(0, Math.round(Number(body.minOrderValue) || 0));
    out.minOrderValue = n;
  }
  if (body.maxRedemptions !== undefined) {
    const n = Math.max(0, Math.round(Number(body.maxRedemptions) || 0));
    out.maxRedemptions = n;
  }
  if (body.expiresAt !== undefined) {
    if (!body.expiresAt) {
      out.expiresAt = null;
    } else {
      const d = new Date(body.expiresAt);
      if (isNaN(d.getTime())) return { error: "Expiry date is not a valid date." };
      out.expiresAt = d;
    }
  }

  return out;
}

// @desc    Create a coupon
// @route   POST /api/v1/coupons
// @access  Admin
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const sanitized = sanitizeCouponInput(req.body, true);
    if ("error" in sanitized) {
      res.status(400).json({ success: false, message: sanitized.error });
      return;
    }

    const exists = await Coupon.findOne({ code: sanitized.code });
    if (exists) {
      res.status(409).json({ success: false, message: `A coupon with the code "${sanitized.code}" already exists.` });
      return;
    }

    const coupon = await Coupon.create(sanitized);
    res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    console.error("Coupon create error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create coupon" });
  }
};

// @desc    Update a coupon
// @route   PUT /api/v1/coupons/:id
// @access  Admin
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const sanitized = sanitizeCouponInput(req.body, false);
    if ("error" in sanitized) {
      res.status(400).json({ success: false, message: sanitized.error });
      return;
    }

    if (sanitized.code) {
      const clash = await Coupon.findOne({ code: sanitized.code, _id: { $ne: req.params.id } });
      if (clash) {
        res.status(409).json({ success: false, message: `Another coupon already uses the code "${sanitized.code}".` });
        return;
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, sanitized, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error: any) {
    console.error("Coupon update error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update coupon" });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Admin
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
