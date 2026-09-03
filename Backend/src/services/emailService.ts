import { Resend } from "resend";
import type { IOrder } from "../models/Order.js";
import { WAREHOUSE } from "../config/pickup.js";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || "Viśvam <onboarding@resend.dev>";
}

function subscriptionConfirmationHtml(): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background-color:#fdfaf5; font-family: Georgia, 'Times New Roman', serif; color:#241a12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdfaf5; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid rgba(36,26,18,0.1); border-radius:16px; overflow:hidden; max-width:480px;">
            <tr>
              <td style="background-color:#f8f1e7; padding:32px; text-align:center;">
                <img src="https://visvam.in/Visvam-Logo.png" alt="" width="44" height="44" style="display:block; margin:0 auto 14px; width:44px; height:44px;" />
                <img src="https://visvam.in/Visvam-Wordmark.png" alt="Viśvam" width="140" style="display:block; margin:0 auto; width:140px; height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 24px;">
                <p style="font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#6d5c4c; margin:0 0 16px;">Subscription Confirmed</p>
                <h1 style="font-size:26px; font-weight:400; margin:0 0 20px; line-height:1.3; color:#241a12;">You're on the list.</h1>
                <p style="font-size:15px; line-height:1.7; color:#6d5c4c; margin:0 0 16px;">
                  This is a confirmation mail from Viśvam. You are a subscriber now.
                </p>
                <p style="font-size:15px; line-height:1.7; color:#6d5c4c; margin:0 0 24px;">
                  You will get regular updates on new arrivals, seasonal releases, and first word on anything worth knowing.
                </p>
                <a href="https://visvam.in" style="display:inline-block; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#241a12; text-decoration:none; border-bottom:2px solid #8a4f27; padding-bottom:4px;">Visit Viśvam</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 32px; border-top:1px solid rgba(36,26,18,0.1);">
                <p style="font-size:11px; color:#9c8c7c; margin:0;">© ${year} Viśvam. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const STORE_URL = "https://www.visvam.in";

/** Rupee amount, no decimals: 1234.5 -> "₹1,235". */
function inr(amount: number): string {
  return `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;
}

/** Minimal HTML-escape for values that land inside the email markup. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Exported for preview/tests; the send path uses it internally. */
export function orderConfirmationHtml(order: IOrder): string {
  const year = new Date().getFullYear();
  const orderNo = String(order._id).slice(-8).toUpperCase();
  const placedOn = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const firstName = (order.shippingAddress?.fullName || "there").trim().split(/\s+/)[0];
  const isPickup = order.fulfillmentMethod === "pickup";
  const isCod = !order.isPaid;
  const addr = order.shippingAddress;

  const itemRows = (order.orderItems || [])
    .map((item) => {
      const label = item.variantTitle
        ? `${esc(item.name)} <span style="color:#9c8c7c;">· ${esc(item.variantTitle)}</span>`
        : esc(item.name);
      return `<tr>
        <td style="padding:10px 0; border-bottom:1px solid rgba(36,26,18,0.08); font-size:14px; color:#241a12;">
          ${label}<br /><span style="font-size:12px; color:#9c8c7c;">Qty ${esc(item.qty)}</span>
        </td>
        <td style="padding:10px 0; border-bottom:1px solid rgba(36,26,18,0.08); font-size:14px; color:#241a12; text-align:right; white-space:nowrap;">
          ${inr(item.price * item.qty)}
        </td>
      </tr>`;
    })
    .join("");

  const totalRow = (label: string, value: string, strong = false) => `<tr>
    <td style="padding:4px 0; font-size:${strong ? "15px" : "13px"}; color:${strong ? "#241a12" : "#6d5c4c"}; ${strong ? "font-weight:bold;" : ""}">${label}</td>
    <td style="padding:4px 0; font-size:${strong ? "15px" : "13px"}; color:${strong ? "#241a12" : "#6d5c4c"}; text-align:right; ${strong ? "font-weight:bold;" : ""}">${value}</td>
  </tr>`;

  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background-color:#fdfaf5; font-family: Georgia, 'Times New Roman', serif; color:#241a12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdfaf5; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid rgba(36,26,18,0.1); border-radius:16px; overflow:hidden; max-width:520px;">
            <tr>
              <td style="background-color:#f8f1e7; padding:32px; text-align:center;">
                <img src="${STORE_URL}/Visvam-Logo.png" alt="" width="44" height="44" style="display:block; margin:0 auto 14px; width:44px; height:44px;" />
                <img src="${STORE_URL}/Visvam-Wordmark.png" alt="Viśvam" width="140" style="display:block; margin:0 auto; width:140px; height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 8px;">
                <p style="font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#6d5c4c; margin:0 0 16px;">Order Confirmed</p>
                <h1 style="font-size:24px; font-weight:400; margin:0 0 16px; line-height:1.3; color:#241a12;">Thank you, ${esc(firstName)}.</h1>
                <p style="font-size:15px; line-height:1.7; color:#6d5c4c; margin:0 0 8px;">
                  ${
                    isPickup
                      ? "We've received your order. It's packed within 10–15 minutes — collect it any time during opening hours."
                      : "We've received your order and started getting it ready. You'll get another email with tracking once it ships."
                  }
                </p>
                <p style="font-size:13px; color:#9c8c7c; margin:16px 0 0;">
                  Order <strong style="color:#241a12;">#${orderNo}</strong> &nbsp;·&nbsp; ${placedOn}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${totalRow("Subtotal", inr(order.itemsPrice))}
                  ${
                    order.discountAmount > 0
                      ? totalRow(
                          `Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ""}`,
                          "−" + inr(order.discountAmount)
                        )
                      : ""
                  }
                  ${totalRow(
                    isPickup ? "Collection" : "Delivery",
                    isPickup ? "Store pickup" : order.shippingPrice > 0 ? inr(order.shippingPrice) : "Free"
                  )}
                  ${totalRow("GST (5%)", inr(order.taxPrice))}
                  ${order.codFee > 0 ? totalRow("COD handling fee", inr(order.codFee)) : ""}
                  <tr><td colspan="2" style="border-top:1px solid rgba(36,26,18,0.15); padding-top:6px;"></td></tr>
                  ${totalRow(
                    isCod ? (isPickup ? "Amount due on collection" : "Amount due on delivery") : "Total paid",
                    inr(order.totalPrice),
                    true
                  )}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 8px;">
                <div style="background-color:#f8f1e7; border-radius:10px; padding:16px 18px;">
                  <p style="font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#9c8c7c; margin:0 0 8px;">
                    ${isCod ? (isPickup ? "Payment — Pay on Pickup" : "Payment — Cash on Delivery") : "Payment — Paid online"}
                  </p>
                  <p style="font-size:14px; line-height:1.6; color:#6d5c4c; margin:0;">
                    ${
                      isCod
                        ? isPickup
                          ? `Please keep <strong style="color:#241a12;">${inr(order.totalPrice)}</strong> ready in cash (or pay by UPI) when you collect your order.`
                          : `Please keep <strong style="color:#241a12;">${inr(order.totalPrice)}</strong> ready in cash (or pay by UPI) when the parcel arrives.`
                        : `Your payment has been received in full. Nothing more to pay.`
                    }
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 8px;">
                ${
                  isPickup
                    ? `<p style="font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#9c8c7c; margin:0 0 8px;">Collect from</p>
                <p style="font-size:14px; line-height:1.6; color:#6d5c4c; margin:0;">
                  <strong style="color:#241a12;">${esc(WAREHOUSE.name)}</strong><br />
                  ${esc(WAREHOUSE.addressLine)}<br />
                  ${esc(WAREHOUSE.hours)}<br />
                  Phone: ${esc(WAREHOUSE.phone)}
                </p>
                <p style="font-size:13px; line-height:1.6; color:#9c8c7c; margin:10px 0 0;">
                  ${esc(WAREHOUSE.readyNote)} Bring your order number <strong style="color:#241a12;">#${orderNo}</strong>.
                  <a href="${esc(WAREHOUSE.mapsUrl)}" style="color:#8a4f27;">Get directions</a>
                </p>`
                    : `<p style="font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#9c8c7c; margin:0 0 8px;">Delivering to</p>
                <p style="font-size:14px; line-height:1.6; color:#6d5c4c; margin:0;">
                  ${esc(addr?.fullName)}<br />
                  ${esc(addr?.address)}<br />
                  ${esc(addr?.city)}${addr?.state ? ", " + esc(addr.state) : ""} ${esc(addr?.postalCode)}<br />
                  ${addr?.phone ? "Phone: " + esc(addr.phone) : ""}
                </p>`
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px; text-align:center;">
                <a href="${STORE_URL}/track?orderId=${esc(order._id)}" style="display:inline-block; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#241a12; text-decoration:none; border-bottom:2px solid #8a4f27; padding-bottom:4px;">Track this order</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 32px; border-top:1px solid rgba(36,26,18,0.1);">
                <p style="font-size:12px; line-height:1.6; color:#9c8c7c; margin:0 0 6px;">
                  Questions about your order? Reply to this email or write to
                  <a href="mailto:care@visvam.in" style="color:#8a4f27;">care@visvam.in</a>.
                </p>
                <p style="font-size:11px; color:#9c8c7c; margin:0;">© ${year} Viśvam. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function orderConfirmationText(order: IOrder): string {
  const orderNo = String(order._id).slice(-8).toUpperCase();
  const isPickup = order.fulfillmentMethod === "pickup";
  const isCod = !order.isPaid;
  const lines = (order.orderItems || [])
    .map((i) => `  - ${i.name}${i.variantTitle ? ` (${i.variantTitle})` : ""} x${i.qty} — ${inr(i.price * i.qty)}`)
    .join("\n");
  return [
    `Thank you for your order with Viśvam.`,
    ``,
    `Order #${orderNo}`,
    ``,
    lines,
    ``,
    `Subtotal: ${inr(order.itemsPrice)}`,
    order.discountAmount > 0
      ? `Discount${order.couponCode ? ` (${order.couponCode})` : ""}: -${inr(order.discountAmount)}`
      : ``,
    isPickup
      ? `Collection: Store pickup`
      : `Delivery: ${order.shippingPrice > 0 ? inr(order.shippingPrice) : "Free"}`,
    `GST (5%): ${inr(order.taxPrice)}`,
    order.codFee > 0 ? `COD handling fee: ${inr(order.codFee)}` : ``,
    `${isCod ? (isPickup ? "Amount due on collection" : "Amount due on delivery") : "Total paid"}: ${inr(order.totalPrice)}`,
    ``,
    isCod
      ? isPickup
        ? `Payment: Pay on Pickup — please keep ${inr(order.totalPrice)} ready in cash or UPI.`
        : `Payment: Cash on Delivery — please keep ${inr(order.totalPrice)} ready.`
      : `Payment: Paid online in full.`,
    ``,
    isPickup
      ? [
          `Collect from:`,
          `  ${WAREHOUSE.name}`,
          `  ${WAREHOUSE.addressLine}`,
          `  ${WAREHOUSE.hours}`,
          `  Phone: ${WAREHOUSE.phone}`,
          `  ${WAREHOUSE.readyNote} Bring your order number #${orderNo}.`,
          `  Directions: ${WAREHOUSE.mapsUrl}`,
        ].join("\n")
      : undefined,
    isPickup ? `` : undefined,
    `Track your order: ${STORE_URL}/track?orderId=${order._id}`,
    ``,
    `Questions? Write to care@visvam.in`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");
}

/**
 * Sends the order-confirmation email. Silently skips (with a warning) if
 * RESEND_API_KEY isn't configured or the order carries no customer email, so a
 * missing email setup never breaks order placement.
 */
export async function sendOrderConfirmationEmail(
  order: IOrder
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured — skipping order confirmation email.");
    return { success: false, skipped: true };
  }

  const toEmail =
    order.shippingAddress?.email || order.guestEmail || "";
  if (!toEmail) {
    console.warn(`Order ${String(order._id)} has no customer email — skipping confirmation.`);
    return { success: false, skipped: true };
  }

  try {
    const orderNo = String(order._id).slice(-8).toUpperCase();
    const { error } = await client.emails.send({
      from: getFromAddress(),
      to: toEmail,
      subject: `Your Viśvam order #${orderNo} is confirmed`,
      html: orderConfirmationHtml(order),
      text: orderConfirmationText(order),
    });

    if (error) {
      console.error("Resend order confirmation email error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Failed to send order confirmation email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends the "you're subscribed" confirmation email. Silently skips (with a
 * warning) if RESEND_API_KEY isn't configured, so local/dev environments
 * without email credentials don't crash the newsletter signup flow.
 */
export async function sendSubscriptionConfirmationEmail(
  toEmail: string
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured — skipping subscription confirmation email.");
    return { success: false, skipped: true };
  }

  try {
    const { error } = await client.emails.send({
      from: getFromAddress(),
      to: toEmail,
      subject: "You're subscribed to Viśvam",
      html: subscriptionConfirmationHtml(),
      text: "This is a confirmation mail from Viśvam. You are a subscriber now. You will get regular updates on new arrivals, seasonal releases, and first word on anything worth knowing.",
    });

    if (error) {
      console.error("Resend subscription email error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Failed to send subscription confirmation email:", err);
    return { success: false, error: err.message };
  }
}
