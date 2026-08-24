import Razorpay from "razorpay";

let instance: Razorpay | null = null;

// Lazily constructed so a missing key pair doesn't crash server startup —
// only requests that actually need Razorpay fail, with a clear message.
export const getRazorpayInstance = (): Razorpay => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
  }

  if (!instance) {
    instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  return instance;
};

export const isRazorpayConfigured = (): boolean =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
