import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Zap,
} from "lucide-react";
import { useCart, formatPrice, type ShippingAddress } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import {
  submitOrderToBackend,
  checkPincodeServiceability,
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchMyAddresses,
  createAddress,
  type SavedAddress,
} from "@/lib/api";
import { CityStateFields } from "@/components/CityStateFields";
import { prefillableName, sanitizeNameInput } from "@/lib/name";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toast } from "sonner";
import type { ConfirmationResult } from "@/lib/firebase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Viśvam" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

// Express delivery is the only paid option, and it is complimentary once the
// order clears this threshold. Standard delivery is always free. Mirrors the
// same rule in Backend/src/controllers/orderController.ts, which is the
// authority on what actually gets charged.
const FREE_SHIPPING_THRESHOLD = 3499;
const EXPRESS_SHIPPING_FEE = 79;

type ShippingMethod = "standard" | "express";

/** Saved addresses store a `pincode`; the checkout form expects the same shape. */
const toShippingAddress = (address: SavedAddress): ShippingAddress => ({
  fullName: address.fullName || "",
  phone: address.phone || "",
  street: address.street || "",
  city: address.city || "",
  state: address.state || "",
  pincode: address.pincode || "",
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, shippingAddress, setShippingAddress } = useCart();
  const { user, isAuthenticated, isLoading: authLoading, loginWithGoogle, sendEmailLink, sendPhoneOTP, verifyPhoneOTP } = useAuth();

  // Checkout inline auth state
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [authStep, setAuthStep] = useState<"input" | "otp" | "email-sent">("input");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [addressForm, setAddressForm] = useState<ShippingAddress>(shippingAddress);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  // Defaults to standard - express is never applied unless the customer picks it.
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  // Set once the underlying Order document is created, so a retry after a
  // cancelled/failed payment reuses it instead of creating a duplicate order.
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Shiprocket Pincode Serviceability State
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    isServiceable?: boolean;
    etd?: string;
    courierName?: string;
    region?: string;
  } | null>(null);

  // Auto-check Shiprocket serviceability when 6-digit PIN code is entered
  useEffect(() => {
    const pin = addressForm.pincode ? addressForm.pincode.replace(/\D/g, "") : "";
    if (pin.length === 6) {
      let isCurrent = true;
      setPincodeChecking(true);
      checkPincodeServiceability(pin)
        .then((res) => {
          if (isCurrent && res.success) {
            setPincodeResult({
              isServiceable: res.isServiceable,
              etd: res.etd || "2–3 Business Days",
              courierName: res.courierName || "Blue Dart Air",
              region: res.region,
            });
          }
        })
        .finally(() => {
          if (isCurrent) setPincodeChecking(false);
        });

      return () => {
        isCurrent = false;
      };
    } else {
      setPincodeResult(null);
    }
  }, [addressForm.pincode]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendPhoneOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const phone = authPhone.trim();
    if (!phone) return toast.error("Please enter your phone number");
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\s/g, "")}`;
    setAuthSubmitting(true);
    try {
      const res = await sendPhoneOTP(formattedPhone, "checkout-recaptcha");
      if (res.success && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setAuthStep("otp");
        toast.success("OTP sent to your phone!");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp || authOtp.length < 6 || !confirmationResult) return;
    setAuthSubmitting(true);
    try {
      const res = await verifyPhoneOTP(confirmationResult, authOtp);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return toast.error("Please enter your email");
    setAuthSubmitting(true);
    try {
      const res = await sendEmailLink(authEmail.trim());
      if (res.success) {
        setAuthStep("email-sent");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Sync address form when shipping address from context updates
  useEffect(() => {
    setAddressForm(shippingAddress);
  }, [shippingAddress]);

  // Pull the customer's saved addresses once they are signed in and drop the
  // default one straight into the form, so a returning customer does not retype
  // an address they already gave us.
  useEffect(() => {
    if (!isAuthenticated) {
      setSavedAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setAddressesLoading(true);
      try {
        const res = await fetchMyAddresses();
        if (cancelled) return;

        const list = res.success && Array.isArray(res.data) ? res.data : [];
        setSavedAddresses(list);

        if (list.length > 0) {
          const preferred = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(preferred._id);
          setAddressForm(toShippingAddress(preferred));
        }
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Fall back to the profile name when there is nothing saved to prefill from.
  useEffect(() => {
    if (user && !addressForm.fullName) {
      setAddressForm((prev) => ({ ...prev, fullName: prefillableName(user.name) }));
    }
  }, [user]);

  const handleSelectSavedAddress = (address: SavedAddress) => {
    setSelectedAddressId(address._id);
    setAddressForm(toShippingAddress(address));
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setAddressForm({ fullName: prefillableName(user?.name), phone: "", street: "", city: "", state: "", pincode: "" });
  };

  const expressIsFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingPrice = shippingMethod === "express" && !expressIsFree ? EXPRESS_SHIPPING_FEE : 0;
  const taxPrice = Math.round(subtotal * 0.05);
  const totalPrice = subtotal + shippingPrice + taxPrice;

  // The Order document is created before payment and priced server-side, so a
  // delivery-speed change after that point has to void the pending order -
  // otherwise the customer pays the total from the previous selection.
  const handleSelectShippingMethod = (method: ShippingMethod) => {
    if (method === shippingMethod) return;
    setShippingMethod(method);
    setPendingOrderId(null);
  };

  // Validate Address
  const validateAddress = (): boolean => {
    if (!addressForm.fullName.trim()) { toast.error("Full Name is required"); return false; }
    if (!addressForm.phone.trim() || addressForm.phone.length < 10) { toast.error("Valid 10-digit phone number is required"); return false; }
    if (!addressForm.street.trim()) { toast.error("Street Address is required"); return false; }
    if (!addressForm.city.trim()) { toast.error("City is required"); return false; }
    if (!addressForm.state.trim()) { toast.error("State is required"); return false; }
    if (!addressForm.pincode.trim() || addressForm.pincode.length < 6) { toast.error("6-digit pincode is required"); return false; }
    return true;
  };

  // Place Order — creates the Order document first (shared by both payment
  // paths), then either finishes immediately (COD) or opens Razorpay Checkout.
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Please log in to place your order");
    if (items.length === 0) return toast.error("Your bag is empty");
    if (!validateAddress()) return;

    setSubmittingOrder(true);
    try {
      setShippingAddress(addressForm);

      // A freshly typed address is worth keeping for next time. Saving is a
      // convenience, never a reason to block the order, so failures stay quiet.
      if (selectedAddressId === null) {
        createAddress({
          label: savedAddresses.length === 0 ? "Home" : "Other",
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          isDefault: savedAddresses.length === 0,
        }).catch(() => {});
      }

      let orderId: string | null = pendingOrderId;

      if (!orderId) {
        const orderItems = items.map(({ product, qty, selectedVariant }) => ({
          product: product._id || product.slug,
          slug: product.slug,
          name: product.name,
          qty,
          price: selectedVariant?.price ?? product.price,
          image: product.images[0] || "",
          variantTitle: selectedVariant?.title,
          variantSku: selectedVariant?.sku,
          selectedOptions: selectedVariant?.options,
        }));

        const res = await submitOrderToBackend({
          orderItems,
          shippingAddress: addressForm,
          guestEmail: user?.email || "",
          paymentMethod: paymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery",
          shippingMethod,
        });

        if (!res.success || !res.data?._id) {
          toast.error(res.message || "Order placement failed");
          setSubmittingOrder(false);
          return;
        }

        orderId = String(res.data._id);
        setPendingOrderId(orderId);
      }

      // `orderId` is always a string past this point: either it came in
      // already set, or the block above set it and returns early on failure.
      const confirmedOrderId: string = orderId;

      if (paymentMethod === "cod") {
        clearCart();
        setPendingOrderId(null);
        toast.success("Order submitted successfully!");
        navigate({ to: "/order-success", search: { orderId: confirmedOrderId, amount: totalPrice } });
        return;
      }

      // ── Razorpay Online Payment ──
      const [scriptLoaded, rpOrder] = await Promise.all([
        loadRazorpayScript(),
        createRazorpayOrder(confirmedOrderId),
      ]);

      if (!scriptLoaded) {
        toast.error("Could not load the payment gateway. Check your connection and try again.");
        setSubmittingOrder(false);
        return;
      }

      if (!rpOrder.success || !rpOrder.razorpayOrderId || !rpOrder.keyId) {
        toast.error(rpOrder.message || "Could not start payment. Please try Cash on Delivery instead.");
        setSubmittingOrder(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency || "INR",
        order_id: rpOrder.razorpayOrderId,
        name: "Viśvam",
        description: "Royal Dry Fruits & Nuts",
        prefill: {
          name: addressForm.fullName,
          email: user?.email || "",
          contact: addressForm.phone,
        },
        theme: { color: "#8a4f27" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await verifyRazorpayPayment({
            orderId: confirmedOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.success) {
            clearCart();
            setPendingOrderId(null);
            toast.success("Payment successful! Order confirmed.");
            navigate({ to: "/order-success", search: { orderId: confirmedOrderId, amount: totalPrice } });
          } else {
            toast.error(verifyRes.message || "Payment could not be verified. Contact us if the amount was deducted.");
          }
          setSubmittingOrder(false);
        },
        modal: {
          ondismiss: () => {
            setSubmittingOrder(false);
            toast.error("Payment cancelled. You can retry or choose Cash on Delivery.");
          },
        },
      });

      razorpay.on("payment.failed", (resp: { error?: { description?: string } }) => {
        toast.error(resp.error?.description || "Payment failed. Please try again.");
        setSubmittingOrder(false);
      });

      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || "Error connecting to server");
      setSubmittingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-16 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-clay/10 text-clay grid place-items-center mb-6">
          <CheckCircle2 size={44} />
        </div>
        <h1 className="font-display italic text-4xl mb-3">Order Confirmed!</h1>
        <p className="text-sm text-muted-foreground max-w-md mb-2">
          Thank you for choosing Viśvam. Order reference: <strong className="text-ink font-mono">{orderSuccess}</strong>
        </p>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed mb-8">
          Your order will be carefully packed and dispatched via priority courier. A tracking notification has been sent to your account email: <strong className="text-ink">{user?.email}</strong>.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-ink text-white text-xs tracked font-medium uppercase hover:bg-clay transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/profile"
            className="px-6 py-3 border border-ink text-ink text-xs tracked font-medium uppercase hover:bg-ink hover:text-white transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-28 pb-16 sm:pb-20 px-3.5 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-ink transition-colors" title="Back to Home">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Secure Express Checkout</h1>
              <p className="text-[10px] sm:text-[11px] tracked uppercase text-muted-foreground">Encrypted Authentication & Priority Delivery</p>
            </div>
          </div>
          <Link
            to="/nuts"
            className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 py-1 self-start sm:self-auto"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
          </Link>
        </div>

        {authLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-clay" />
            <p className="text-xs text-muted-foreground">Verifying Authentication...</p>
          </div>
        ) : !isAuthenticated ? (
          /* Auth Required Gate */
          <div className="max-w-md mx-auto bg-cream/40 border border-border p-5 sm:p-8 shadow-sm text-center my-6 sm:my-8 rounded-2xl">
            <div id="checkout-recaptcha" />
            <div className="w-12 h-12 rounded-full bg-clay/10 text-clay grid place-items-center mx-auto mb-4">
              <User size={24} />
            </div>
            <h2 className="font-display italic text-2xl mb-2">Sign In to Checkout</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Verify your identity to complete your order and track deliveries.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 border border-border bg-background hover:bg-cream/60 transition-colors flex items-center justify-center gap-3 text-xs font-semibold text-ink shadow-2xs mb-5 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin text-clay" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
                <span className="bg-cream/40 px-2 text-muted-foreground font-semibold">Or continue with</span>
              </div>
            </div>

            {/* Method Toggle */}
            <div className="grid grid-cols-2 border border-border mb-5 text-[10.5px] tracked font-medium text-center">
              <button
                onClick={() => { setAuthMethod("phone"); setAuthStep("input"); }}
                className={`py-2.5 transition-colors flex items-center justify-center gap-1.5 ${
                  authMethod === "phone" ? "bg-ink text-white" : "bg-background text-muted-foreground hover:text-ink"
                }`}
              >
                <Phone size={13} /> Phone OTP
              </button>
              <button
                onClick={() => { setAuthMethod("email"); setAuthStep("input"); }}
                className={`py-2.5 transition-colors flex items-center justify-center gap-1.5 ${
                  authMethod === "email" ? "bg-ink text-white" : "bg-background text-muted-foreground hover:text-ink"
                }`}
              >
                <Mail size={13} /> Email Link
              </button>
            </div>

            {authStep === "input" && authMethod === "phone" && (
              <form onSubmit={handleSendPhoneOTP} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Phone Number</label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 text-xs text-muted-foreground border border-r-0 border-border bg-cream/50 font-mono">+91</span>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                      placeholder="98765 43210"
                      maxLength={12}
                      className="flex-1 px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-ink text-white text-xs tracked font-semibold uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2"
                >
                  {authSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Send OTP <ArrowRight size={14} /></>}
                </button>
              </form>
            )}

            {authStep === "input" && authMethod === "email" && (
              <form onSubmit={handleSendEmailLink} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-ink text-white text-xs tracked font-semibold uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2"
                >
                  {authSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Send Magic Link <ArrowRight size={14} /></>}
                </button>
              </form>
            )}

            {authStep === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <p className="text-[11px] text-muted-foreground mb-2">Enter the 6-digit code sent to <strong className="text-ink">+91 {authPhone}</strong></p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={authOtp}
                  onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="------"
                  className="w-full max-w-[220px] mx-auto block text-center text-2xl font-mono tracking-[0.6em] py-3 border-b-2 border-border focus:border-clay outline-none bg-transparent placeholder:text-border"
                  autoComplete="one-time-code"
                />
                <button
                  type="submit"
                  disabled={authSubmitting || authOtp.length < 6}
                  className="w-full py-3 bg-ink text-white text-xs tracked font-semibold uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Verify & Continue <ArrowRight size={14} /></>}
                </button>
                <button type="button" onClick={() => { setAuthStep("input"); setAuthOtp(""); }} className="text-[10px] text-clay hover:underline">
                  Change number
                </button>
              </form>
            )}

            {authStep === "email-sent" && (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-cream border border-clay/30 flex items-center justify-center">
                  <Mail size={20} className="text-clay" />
                </div>
                <p className="text-[11px] text-muted-foreground">Check your inbox at <strong className="text-ink">{authEmail}</strong> for a sign-in link.</p>
                <button onClick={() => { setAuthStep("input"); setAuthEmail(""); }} className="text-[10px] text-clay hover:underline">
                  Use a different method
                </button>
              </div>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display italic text-2xl mb-2">Your bag is empty</p>
            <p className="text-xs text-muted-foreground mb-6">Add dry fruits or gift boxes to your bag before checking out.</p>
            <Link to="/nuts" className="px-6 py-3 bg-ink text-white text-xs tracked uppercase font-medium">Browse Nuts & Dried Fruits</Link>
          </div>
        ) : (
          /* Main Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Address & Payment */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
              {/* Logged in User Bar */}
              <div className="p-4 bg-cream/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-clay text-white grid place-items-center font-display italic text-sm">
                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink">{user?.name || user?.email}</p>
                    <p className="text-[10px] text-muted-foreground">Authenticated · Member</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="text-[10px] text-clay underline uppercase font-semibold hover:text-ink"
                >
                  My Profile
                </Link>
              </div>

              {/* Delivery Address */}
              <div className="bg-background border border-border p-6 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                  <MapPin size={16} className="text-clay" /> Shipping & Delivery Address
                </h3>

                {addressesLoading && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <Loader2 size={11} className="animate-spin text-clay" /> Loading your saved addresses...
                  </p>
                )}

                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] tracked text-muted-foreground uppercase">Deliver to a saved address</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedAddresses.map((address) => {
                        const isSelected = selectedAddressId === address._id;
                        return (
                          <button
                            key={address._id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(address)}
                            className={`text-left p-3 border transition-colors ${
                              isSelected
                                ? "border-clay bg-cream/60"
                                : "border-border hover:border-clay/50 bg-transparent"
                            }`}
                          >
                            <span className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] tracked uppercase font-semibold text-ink">
                                {address.label || "Address"}
                              </span>
                              {address.isDefault && (
                                <span className="text-[8px] tracked uppercase text-clay border border-clay/40 px-1.5 py-0.5">
                                  Default
                                </span>
                              )}
                            </span>
                            <span className="block text-[10px] text-muted-foreground leading-relaxed">
                              {address.fullName} · {address.phone}
                              <br />
                              {address.street}, {address.city}, {address.state} — {address.pincode}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className={`text-[10px] tracked uppercase font-semibold underline transition-colors ${
                        selectedAddressId === null ? "text-clay" : "text-muted-foreground hover:text-clay"
                      }`}
                    >
                      + Deliver somewhere else
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: sanitizeNameInput(e.target.value) })}
                      placeholder="Receiver's name"
                      className="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="House No, Apartment, Street Name"
                    className="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <CityStateFields
                    city={addressForm.city}
                    state={addressForm.state}
                    onCityChange={(city) => setAddressForm({ ...addressForm, city })}
                    onStateChange={(state) => setAddressForm({ ...addressForm, state })}
                    inputClass="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                    labelClass="block text-[10px] tracked text-muted-foreground uppercase mb-1"
                    required
                  />
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      placeholder="560001"
                      maxLength={6}
                      className="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Shiprocket Delivery Estimation Badge */}
                {pincodeChecking && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-cream/50 p-2.5 rounded border border-border/60">
                    <Loader2 size={13} className="animate-spin text-clay" />
                    <span>Checking Shiprocket delivery serviceability...</span>
                  </div>
                )}

                {pincodeResult && !pincodeChecking && (
                  <div className="flex items-center justify-between p-3 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-semibold">Estimated Delivery: {pincodeResult.etd}</span>
                        <span className="text-[10px] text-emerald-700 block">
                          Dispatched via {pincodeResult.courierName} with live GPS tracking
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Available ✓
                    </span>
                  </div>
                )}
              </div>

              {/* Delivery Speed Selection */}
              <div className="bg-background border border-border p-6 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                  <Truck size={16} className="text-clay" /> Delivery Speed
                </h3>

                <button
                  type="button"
                  onClick={() => handleSelectShippingMethod("standard")}
                  className={`w-full p-4 border-2 flex items-center justify-between transition-colors text-left ${
                    shippingMethod === "standard" ? "border-clay bg-cream/30" : "border-border hover:border-clay/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        shippingMethod === "standard" ? "border-clay" : "border-border"
                      }`}
                    >
                      {shippingMethod === "standard" && <span className="size-2 rounded-full bg-clay" />}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink">Standard Delivery</p>
                      <p className="text-[10px] text-muted-foreground">Arrives in 5–7 business days</p>
                    </div>
                  </div>
                  <span className="text-[10px] tracked font-bold uppercase text-clay shrink-0">Free</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectShippingMethod("express")}
                  className={`w-full p-4 border-2 flex items-center justify-between transition-colors text-left ${
                    shippingMethod === "express" ? "border-clay bg-cream/30" : "border-border hover:border-clay/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        shippingMethod === "express" ? "border-clay" : "border-border"
                      }`}
                    >
                      {shippingMethod === "express" && <span className="size-2 rounded-full bg-clay" />}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                        <Zap size={12} className="text-clay" /> Express Delivery
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Arrives in 3–5 business days
                        {!expressIsFree && ` · complimentary over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] tracked font-bold uppercase text-clay shrink-0 tabular-nums">
                    {expressIsFree ? "Free" : formatPrice(EXPRESS_SHIPPING_FEE)}
                  </span>
                </button>
              </div>
              {/* Payment Selection */}
              <div className="bg-background border border-border p-6 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                  <ShieldCheck size={16} className="text-clay" /> Payment Method
                </h3>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`w-full p-4 border-2 flex items-center justify-between transition-colors text-left ${
                    paymentMethod === "razorpay" ? "border-clay bg-cream/30" : "border-border hover:border-clay/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-4 bg-white shrink-0 ${
                        paymentMethod === "razorpay" ? "border-clay" : "border-border"
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-clay shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-ink">Pay Online</p>
                        <p className="text-[10px] text-muted-foreground">Card, UPI, Netbanking & Wallets via Razorpay</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-clay bg-clay/10 px-2 py-0.5 shrink-0">Secure</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full p-4 border-2 flex items-center justify-between transition-colors text-left ${
                    paymentMethod === "cod" ? "border-clay bg-cream/30" : "border-border hover:border-clay/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-4 bg-white shrink-0 ${
                        paymentMethod === "cod" ? "border-clay" : "border-border"
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <Banknote size={16} className="text-clay shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-ink">Cash on Delivery (COD)</p>
                        <p className="text-[10px] text-muted-foreground">Pay with cash or UPI upon delivery</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full py-4 bg-ink text-white text-xs font-semibold tracked uppercase tracking-widest hover:bg-clay transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-clay" />
                    <span>{paymentMethod === "razorpay" ? "Opening Secure Payment..." : "Submitting Order..."}</span>
                  </>
                ) : paymentMethod === "razorpay" ? (
                  <>
                    <CreditCard size={16} className="text-clay" />
                    <span>Pay {formatPrice(totalPrice)} Securely</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order — {formatPrice(totalPrice)}</span>
                    <ArrowRight size={16} className="text-clay" />
                  </>
                )}
              </button>
            </form>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-cream/40 border border-border p-6 sticky top-28 space-y-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                  <ShoppingBag size={16} className="text-clay" /> Bag Items ({items.length})
                </h3>

                <ul className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {items.map(({ product, qty, selectedVariant, cartKey }) => {
                    if (!product) return null;
                    const itemPrice = selectedVariant?.price ?? product.price ?? 0;
                    const key = cartKey || product.slug;
                    return (
                      <li key={key} className="flex items-center gap-3 text-xs">
                        <img
                          src={selectedVariant?.image || product.images?.[0] || ""}
                          alt={product.name || "Product"}
                          className="w-12 h-14 object-cover bg-cream shrink-0 border border-border/50"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedVariant ? (
                              <span className="text-clay font-mono">{selectedVariant.title}</span>
                            ) : (
                              product.serving
                            )}{" "}
                            · Qty: {qty}
                          </p>
                        </div>
                        <span className="font-semibold tabular-nums text-ink">{formatPrice(itemPrice * qty)}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t border-border pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums text-ink font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{shippingMethod === "express" ? "Express Shipping" : "Standard Shipping"}</span>
                    <span className="tabular-nums font-medium">
                      {shippingPrice === 0 ? <span className="text-clay font-bold">FREE</span> : formatPrice(shippingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (5%)</span>
                    <span className="tabular-nums text-ink font-medium">{formatPrice(taxPrice)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 font-semibold text-sm">
                    <span>Total Amount</span>
                    <span className="tabular-nums font-display italic text-2xl text-ink">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-muted-foreground space-y-1.5 border-t border-border/60">
                  <p className="flex items-center gap-2"><Truck size={12} className="text-clay" /> Dispatch within 24–48 Hours</p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <Link
                    to="/nuts"
                    className="w-full py-3 border border-ink/40 text-ink text-xs font-semibold tracked uppercase tracking-widest hover:bg-ink hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-center"
                  >
                    <ArrowLeft size={14} />
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
