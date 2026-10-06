import { Counter } from "../models/Counter.js";
import { Order } from "../models/Order.js";
import type { IOrder } from "../models/Order.js";

/**
 * Viśvam master order ID — `VSV-<CH>-<YYMMDD>-<NNN>` (e.g. `VSV-W-260910-007`).
 *
 * This is the number the customer, Shiprocket and the invoice all quote. The
 * Mongo `_id` stays the internal primary key and the temporary reference while
 * a prepaid customer is still paying; Razorpay's `pay_xxx` is stored against
 * the order and never merged into this ID.
 *
 * See visvam-order-id-spec.md. Deliberately encodes nothing else — no batch or
 * lot number (one order can draw from several batches), no payment method,
 * customer ID, pincode, amount or other PII.
 */

/** Sales channel the order came through. `W` (website / D2C) is the default. */
export type OrderChannel = "W" | "G" | "S" | "M" | "R";

export const ORDER_CHANNELS: OrderChannel[] = ["W", "G", "S", "M", "R"];

const ORDER_ID_RE = /^VSV-[WGSMR]-\d{6}-\d{3,}$/;

/** True for a string shaped like a minted order ID. */
export function isOrderNumber(value?: string | null): boolean {
  return typeof value === "string" && ORDER_ID_RE.test(value.trim().toUpperCase());
}

/**
 * The number to show a human. Orders placed before this scheme have no
 * `orderNumber`, so they keep falling back to the short form of their Mongo id
 * that customers were already quoted.
 */
export function displayOrderNumber(order: { orderNumber?: string | null; _id: unknown }): string {
  return order.orderNumber || String(order._id).slice(-8).toUpperCase();
}

/** The reference to put in a `/track?orderId=` link — both forms are accepted. */
export function trackingReference(order: { orderNumber?: string | null; _id: unknown }): string {
  return order.orderNumber || String(order._id);
}

export function normalizeChannel(value?: string | null): OrderChannel {
  const ch = String(value || "").trim().toUpperCase();
  return (ORDER_CHANNELS as string[]).includes(ch) ? (ch as OrderChannel) : "W";
}

/**
 * `YYMMDD` for *India* — pinned to Asia/Kolkata, never the server clock.
 *
 * A server running UTC would stamp the previous day on anything placed after
 * 18:30 UTC (00:00 IST), which is the single most common bug in date-based IDs.
 */
export function istDateStamp(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}${part("month")}${part("day")}`;
}

/**
 * Mints the next ID for `channel` today. Each call consumes one number, so only
 * call it for an order that is actually confirmed — see `assignOrderNumber`.
 *
 * The counter is shared by every order on that channel for the day, prepaid and
 * COD alike; padded to three digits and widening naturally past 999.
 */
export async function generateOrderId(channel: OrderChannel = "W"): Promise<string> {
  const day = istDateStamp();
  const counter = await Counter.findByIdAndUpdate(
    `${channel}:${day}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const seq = counter?.seq ?? 1;
  return `VSV-${channel}-${day}-${String(seq).padStart(3, "0")}`;
}

/**
 * Gives `order` its permanent order number, exactly once.
 *
 * Idempotent and safe under concurrency: the write only lands on an order that
 * still has no number, so a replayed Razorpay `payment.captured` or a
 * double-clicked "Place Order" gets back the number already issued instead of
 * minting a second one. Returns the order's number either way.
 */
export async function assignOrderNumber(
  order: IOrder,
  channel: OrderChannel = "W"
): Promise<string> {
  if (order.orderNumber) return order.orderNumber;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = await generateOrderId(channel);
    try {
      const claimed = await Order.findOneAndUpdate(
        { _id: order._id, orderNumber: { $in: [null, undefined] } },
        { $set: { orderNumber: candidate, channel } },
        { new: true }
      )
        .select("orderNumber")
        .lean();

      if (claimed?.orderNumber) {
        // Mirror onto the in-memory doc so a later `.save()` and any response
        // built from it carry the number too.
        order.orderNumber = claimed.orderNumber;
        order.channel = channel;
        return claimed.orderNumber;
      }

      // Nothing matched — another request numbered this order first. Use theirs.
      const existing = await Order.findById(order._id).select("orderNumber").lean();
      if (existing?.orderNumber) {
        order.orderNumber = existing.orderNumber;
        return existing.orderNumber;
      }
    } catch (err: any) {
      // 11000 = the unique index rejected a number that raced in elsewhere.
      // Burn it and take the next one.
      if (err?.code !== 11000) throw err;
    }
  }

  throw new Error(`Could not assign an order number to ${String(order._id)}`);
}
