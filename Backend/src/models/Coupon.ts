import mongoose, { Document, Schema } from "mongoose";

/**
 * A percentage-off discount code the admin creates in the Admin Panel and a
 * customer enters at checkout. The discount always applies to the items
 * subtotal (never delivery or the COD fee); GST is then charged on the
 * discounted subtotal, and free-delivery eligibility is still judged on the
 * pre-discount subtotal. See `evaluateCoupon` in couponController for the rules.
 */
export interface ICoupon extends Document {
  /** Uppercased, unique. What the customer types. */
  code: string;
  /** Whole-number percent off the items subtotal, 1–100. */
  discountPercent: number;
  /** Master on/off switch; an inactive coupon is rejected regardless of dates. */
  active: boolean;
  /** After this instant the coupon is rejected. Null/undefined = never expires. */
  expiresAt?: Date | null;
  /** Cart items subtotal must be at least this (rupees). 0 = no minimum. */
  minOrderValue: number;
  /** Coupon auto-stops once this many orders have used it. 0 = unlimited. */
  maxRedemptions: number;
  /** When true, each customer email can redeem the coupon only once. */
  oncePerCustomer: boolean;
  /** How many orders have successfully used the coupon. */
  timesRedeemed: number;
  /**
   * Stable per-customer keys that have already redeemed this coupon, for the
   * `oncePerCustomer` rule. A key is the customer's User id when the order was
   * placed signed-in (the normal case — checkout requires a login), falling
   * back to their lowercased email for any order without one. `redeemedEmails`
   * is the older email-only list, still checked so redemptions recorded before
   * this field existed keep counting.
   */
  redeemedBy: string[];
  /** Legacy: lowercased customer emails that have redeemed it. Still honoured. */
  redeemedEmails: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    active: { type: Boolean, required: true, default: true },
    expiresAt: { type: Date, default: null },
    minOrderValue: { type: Number, required: true, default: 0, min: 0 },
    maxRedemptions: { type: Number, required: true, default: 0, min: 0 },
    oncePerCustomer: { type: Boolean, required: true, default: false },
    timesRedeemed: { type: Number, required: true, default: 0, min: 0 },
    redeemedBy: { type: [String], default: [] },
    redeemedEmails: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
