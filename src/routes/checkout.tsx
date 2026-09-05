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
  Store,
  Clock,
  Navigation,
  Tag,
  X,
} from "lucide-react";
import { useCart, formatPrice, type ShippingAddress } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import {
  submitOrderToBackend,
  checkPincodeServiceability,
  fetchStoreSettings,
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchMyAddresses,
  createAddress,
  validateCoupon,
  type SavedAddress,
} from "@/lib/api";
import { CityStateFields } from "@/components/CityStateFields";
import { PincodeField } from "@/components/PincodeField";
import { WAREHOUSE, isPickupEligible } from "@/lib/pickup";
import { cartWeightKg } from "@/lib/shipping-weight";
import { prefillableName, sanitizeNameInput } from "@/lib/name";
import { sanitizePhoneInput, isValidIndianMobile } from "@/lib/phone";
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

// Delivery is quoted live per PIN code by Shiprocket and waived above the
// threshold. Mirrors Backend/src/controllers/orderController.ts, which is the
// authority on what actually gets charged — this side only displays it.
const FREE_SHIPPING_THRESHOLD = 3499;

// Shown before a PIN code is known, and used if the live quote fails. Must
// match FALLBACK_DELIVERY_CHARGE on the server.
const FALLBACK_DELIVERY_CHARGE = 79;

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
  // Online payment is temporarily disabled — COD is the only method for now.
  const ONLINE_PAYMENT_ENABLED = false;
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
    ONLINE_PAYMENT_ENABLED ? "razorpay" : "cod"
  );

  // Fulfilment: "ship" couriers the order; "pickup" lets a Delhi NCR customer
  // collect it from the Sector 63 warehouse — no delivery charge, never pushed
  // to Shiprocket. The pickup choice only appears once the address the customer
  // has entered is inside NCR (checked by PIN code / city).
  const [fulfillment, setFulfillment] = useState<"ship" | "pickup">("ship");
  // Set once the underlying Order document is created, so a retry after a
  // cancelled/failed payment reuses it instead of creating a duplicate order.
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Coupon — the percentage is what we keep; the rupee amount is recomputed
  // from the live subtotal so it stays correct. The server re-validates on
  // order placement and is the authority on what is actually discounted.
  const [couponInput, setCouponInput] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponChecking(true);
    try {
      const res = await validateCoupon(code, subtotal);
      if (res.valid && res.code && typeof res.discountPercent === "number") {
        setAppliedCoupon({ code: res.code, discountPercent: res.discountPercent });
        toast.success(`Coupon ${res.code} applied — ${res.discountPercent}% off`);
      } else {
        setAppliedCoupon(null);
        toast.error(res.message || "That coupon code isn't valid.");
      }
    } finally {
      setCouponChecking(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  // COD surcharge, set by the admin in Merchandising. Falls back to the same
  // default the server uses; the server stays the authority on what is charged.
  const [codHandlingFee, setCodHandlingFee] = useState(10);
  useEffect(() => {
    let isCurrent = true;
    fetchStoreSettings().then((s) => {
      if (isCurrent) setCodHandlingFee(s.codHandlingFee);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  // Shiprocket Pincode Serviceability State
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    isServiceable?: boolean;
    etd?: string;
    courierName?: string;
    courierRate?: number;
    region?: string;
  } | null>(null);

  // Auto-check Shiprocket serviceability and pricing when a 6-digit PIN code
  // is entered. Always quoted at the prepaid rate (isCod = false): Shiprocket's
  // COD rate bundles a collection fee, which would make the delivery line jump
  // when the customer picks COD. The flat COD handling fee is a separate line.
  useEffect(() => {
    if (fulfillment === "pickup") {
      setPincodeResult(null);
      return;
    }
    const pin = addressForm.pincode ? addressForm.pincode.replace(/\D/g, "") : "";
    if (pin.length === 6) {
      let isCurrent = true;
      setPincodeChecking(true);
      checkPincodeServiceability(pin, cartWeightKg(items), false)
        .then((res) => {
          if (isCurrent && res.success) {
            setPincodeResult({
              isServiceable: res.isServiceable,
              etd: res.etd || "2–3 Business Days",
              courierName: res.courierName || "Blue Dart Air",
              courierRate: res.courierRate,
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
  }, [addressForm.pincode, items, fulfillment]);

  // Whether warehouse pickup can be offered — driven entirely by the address
  // the customer has entered (PIN code, or city as a fallback). The pickup
  // choice is hidden until this is true.
  const pickupEligible = isPickupEligible({
    pincode: (addressForm.pincode || "").replace(/\D/g, ""),
    city: addressForm.city,
  });

  // If the address stops qualifying (customer edits the PIN / city), fall back
  // to shipping so they can't submit a pickup order the server would reject.
  useEffect(() => {
    if (fulfillment === "pickup" && !pickupEligible) setFulfillment("ship");
  }, [fulfillment, pickupEligible]);

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

  const isPickup = fulfillment === "pickup";
  const freeDelivery = subtotal >= FREE_SHIPPING_THRESHOLD;
  // Rounded up to whole rupees the same way the server does, so the figure
  // shown here is the figure charged.
  // The live courier rate exactly as Shiprocket quoted it — nothing added.
  const quotedDelivery =
    typeof pincodeResult?.courierRate === "number" && pincodeResult.courierRate > 0
      ? Math.ceil(pincodeResult.courierRate)
      : undefined;
  // A PIN code is the only thing that yields a real number. Until one is
  // entered we show nothing rather than a placeholder figure — real rates run
  // well above the fallback, so a stand-in would understate the total badly.
  const pincodeReady = (addressForm.pincode || "").replace(/\D/g, "").length === 6;
  const quoteFailed = pincodeReady && !pincodeChecking && quotedDelivery === undefined;
  // Pickup: no courier, so delivery is a settled ₹0 and there's no COD surcharge.
  const deliveryKnown = isPickup || freeDelivery || quotedDelivery !== undefined || quoteFailed;
  const shippingPrice = isPickup
    ? 0
    : freeDelivery
      ? 0
      : (quotedDelivery ?? (quoteFailed ? FALLBACK_DELIVERY_CHARGE : 0));
  const amountToFreeDelivery = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const deliveryProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  // Coupon discount comes off the items subtotal; recomputed from the live
  // subtotal so it can't drift. Free delivery (above) is judged on the
  // pre-discount subtotal, so a coupon never removes earned free shipping.
  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  // GST is charged on the discounted subtotal. Mirrors the server.
  const taxPrice = Math.round(discountedSubtotal * 0.05);
  // COD surcharge is its own line, not part of delivery, so it still applies
  // once delivery becomes free. Mirrors the server's codFee calculation. Never
  // applied to a pickup order — "pay on pickup" is not Cash on Delivery.
  const codFee = !isPickup && paymentMethod === "cod" ? codHandlingFee : 0;
  const totalPrice = discountedSubtotal + shippingPrice + taxPrice + codFee;

  // Validate Address. The full address is always collected — its PIN/city is
  // also what decides pickup eligibility — so the same checks apply either way.
  const validateAddress = (): boolean => {
    if (!addressForm.fullName.trim()) { toast.error("Full Name is required"); return false; }
    if (!isValidIndianMobile(addressForm.phone)) { toast.error("Enter a valid 10-digit mobile number (starting 6–9)"); return false; }
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
          // Sent so the server derives the same parcel weight this page quoted on.
          serving: product.serving,
          weightKg: selectedVariant?.weightKg ?? product?.weightKg,
          variantTitle: selectedVariant?.title,
          variantSku: selectedVariant?.sku,
          selectedOptions: selectedVariant?.options,
        }));

        const res = await submitOrderToBackend({
          orderItems,
          shippingAddress: addressForm,
          guestEmail: user?.email || "",
          fulfillmentMethod: fulfillment,
          couponCode: appliedCoupon?.code,
          paymentMethod:
            paymentMethod === "razorpay"
              ? "Razorpay"
              : isPickup
                ? "Pay on Pickup"
                : "Cash on Delivery",
        });

        if (!res.success || !res.data?._id) {
          // The coupon can turn invalid between "Apply" and "Place order"
          // (expiry, usage cap). Drop it so a retry goes through at full price.
          if (appliedCoupon && /coupon/i.test(res.message || "")) {
            setAppliedCoupon(null);
          }
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
        toast.success(isPickup ? "Pickup order placed!" : "Order submitted successfully!");
        navigate({
          to: "/order-success",
          search: { orderId: confirmedOrderId, amount: totalPrice, pickup: isPickup ? 1 : undefined },
        });
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
            navigate({
              to: "/order-success",
              search: { orderId: confirmedOrderId, amount: totalPrice, pickup: isPickup ? 1 : undefined },
            });
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
            search={{ tab: "orders" }}
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

              {/* Delivery Address — always collected; its PIN/city also decides
                  whether warehouse pickup is offered below. */}
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
                      inputMode="numeric"
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, phone: sanitizePhoneInput(e.target.value) })
                      }
                      placeholder="10-digit mobile number"
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
                  <PincodeField
                    city={addressForm.city}
                    state={addressForm.state}
                    pincode={addressForm.pincode}
                    onPincodeChange={(pincode) => setAddressForm({ ...addressForm, pincode })}
                    inputClass="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                    labelClass="block text-[10px] tracked text-muted-foreground uppercase mb-1"
                    required
                  />
                </div>

                {/* Shiprocket Delivery Estimation Badge — courier only */}
                {!isPickup && pincodeChecking && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-cream/50 p-2.5 rounded border border-border/60">
                    <Loader2 size={13} className="animate-spin text-clay" />
                    <span>Checking Shiprocket delivery serviceability...</span>
                  </div>
                )}

                {!isPickup && pincodeResult && !pincodeChecking && (
                  <div className="flex items-center justify-between p-3 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-semibold">Estimated Delivery: {pincodeResult.etd}</span>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Available ✓
                    </span>
                  </div>
                )}
              </div>

              {/* Fulfilment — appears only when the entered address is in Delhi
                  NCR. Anywhere else, there's nothing to choose: the order ships. */}
              {pickupEligible && (
                <div className="bg-background border border-border p-6 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                    <Truck size={16} className="text-clay" /> How would you like to get this?
                  </h3>

                  <button
                    type="button"
                    onClick={() => setFulfillment("ship")}
                    className={`w-full p-4 border-2 flex items-center justify-between text-left transition-colors ${
                      !isPickup ? "border-clay bg-cream/30" : "border-border hover:border-clay/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-4 bg-white shrink-0 ${!isPickup ? "border-clay" : "border-border"}`} />
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-clay shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-ink">Ship to my address</p>
                          <p className="text-[10px] text-muted-foreground">Delivered by courier · charge quoted by PIN code</p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment("pickup")}
                    className={`w-full p-4 border-2 flex items-center justify-between text-left transition-colors ${
                      isPickup ? "border-clay bg-cream/30" : "border-border hover:border-clay/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-4 bg-white shrink-0 ${isPickup ? "border-clay" : "border-border"}`} />
                      <div className="flex items-center gap-2">
                        <Store size={16} className="text-clay shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-ink">Store / Warehouse Pickup — Free</p>
                          <p className="text-[10px] text-muted-foreground">Collect from our Sector 63, Noida unit · no delivery charge</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-clay bg-clay/10 px-2 py-0.5 shrink-0">Free</span>
                  </button>
                </div>
              )}

              {/* Warehouse details — shown once pickup is chosen */}
              {isPickup && (
                <div className="bg-background border border-border p-6 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                    <Store size={16} className="text-clay" /> Collect from
                  </h3>
                  <p className="text-xs font-semibold text-ink">{WAREHOUSE.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {WAREHOUSE.lines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Clock size={12} className="text-clay shrink-0" /> {WAREHOUSE.hours}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Phone size={12} className="text-clay shrink-0" /> {WAREHOUSE.phone}
                  </p>
                  <p className="text-[11px] text-ink bg-cream/50 border border-border/60 rounded p-2.5 leading-relaxed">
                    {WAREHOUSE.readyNote} Bring your order number when you come.
                  </p>
                  <a
                    href={WAREHOUSE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracked uppercase text-clay border-b border-clay/50 hover:text-ink hover:border-ink transition-colors pb-0.5"
                  >
                    <Navigation size={12} /> Get directions
                  </a>
                </div>
              )}

              {/* Delivery Charges — quoted live per PIN code. Not shown for pickup. */}
              {!isPickup && (
              <div className="bg-background border border-border p-6 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                  <Truck size={16} className="text-clay" /> Delivery
                </h3>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">
                      {freeDelivery
                        ? "Free delivery unlocked"
                        : pincodeChecking
                          ? "Checking rates for your PIN code…"
                          : quotedDelivery !== undefined
                            ? `Delivery to ${addressForm.pincode}`
                            : "Enter your PIN code for exact charges"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {freeDelivery
                        ? `Your order is above ${formatPrice(FREE_SHIPPING_THRESHOLD)}`
                        : quotedDelivery !== undefined
                          ? `via ${pincodeResult?.courierName} · free above ${formatPrice(FREE_SHIPPING_THRESHOLD)} · add ${formatPrice(amountToFreeDelivery)} more`
                          : `Charges vary by destination · free above ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
                    </p>
                  </div>
                  <span className="text-[11px] tracked font-bold uppercase text-clay shrink-0 tabular-nums">
                    {freeDelivery ? (
                      "Free"
                    ) : pincodeChecking ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : deliveryKnown ? (
                      formatPrice(shippingPrice)
                    ) : (
                      <span className="text-muted-foreground normal-case tracking-normal">—</span>
                    )}
                  </span>
                </div>

                <div className="w-full h-[3px] bg-ink/10 overflow-hidden">
                  <div
                    className="h-full bg-clay transition-all duration-700 ease-out"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                </div>
              </div>
              )}

              {/* Payment Selection */}
              <div className="bg-background border border-border p-6 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                  <ShieldCheck size={16} className="text-clay" /> Payment Method
                </h3>

                <button
                  type="button"
                  onClick={() => ONLINE_PAYMENT_ENABLED && setPaymentMethod("razorpay")}
                  disabled={!ONLINE_PAYMENT_ENABLED}
                  aria-disabled={!ONLINE_PAYMENT_ENABLED}
                  className={`w-full p-4 border-2 flex items-center justify-between text-left transition-colors ${
                    !ONLINE_PAYMENT_ENABLED
                      ? "border-border bg-ink/[0.03] opacity-60 cursor-not-allowed"
                      : paymentMethod === "razorpay"
                        ? "border-clay bg-cream/30"
                        : "border-border hover:border-clay/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-4 bg-white shrink-0 ${
                        ONLINE_PAYMENT_ENABLED && paymentMethod === "razorpay" ? "border-clay" : "border-border"
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-clay shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-ink">Pay Online</p>
                        <p className="text-[10px] text-muted-foreground">Card, UPI, Netbanking &amp; Wallets via Razorpay</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-ink/10 px-2 py-0.5 shrink-0 whitespace-nowrap">
                    {ONLINE_PAYMENT_ENABLED ? "Secure" : "Available Soon"}
                  </span>
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
                        <p className="text-xs font-semibold text-ink">
                          {isPickup ? "Pay on Pickup" : "Cash on Delivery (COD)"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isPickup
                            ? "Pay by cash or UPI when you collect · no extra fee"
                            : `Pay with cash or UPI upon delivery${
                                codHandlingFee > 0 ? ` · ${formatPrice(codHandlingFee)} handling fee` : ""
                              }`}
                        </p>
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
                    <span>
                      {isPickup ? "Confirm & Place Pickup Order" : "Confirm & Place Order"} — {formatPrice(totalPrice)}
                    </span>
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

                {/* Coupon code */}
                <div className="border-t border-border pt-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                        <Tag size={12} />
                        {appliedCoupon.code} · {appliedCoupon.discountPercent}% off
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-emerald-700 hover:text-emerald-900"
                        aria-label="Remove coupon"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Coupon code"
                        className="flex-1 px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent uppercase tracking-wide"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponChecking || !couponInput.trim()}
                        className="px-4 py-2 text-[11px] font-semibold tracked uppercase border border-ink text-ink hover:bg-ink hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink flex items-center gap-1.5"
                      >
                        {couponChecking ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums text-ink font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="tabular-nums font-medium">−{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>{isPickup ? "Pickup" : "Delivery"}</span>
                    <span className="tabular-nums font-medium">
                      {isPickup ? (
                        <span className="text-clay font-bold">FREE</span>
                      ) : !deliveryKnown ? (
                        <span className="text-muted-foreground text-[10px]">Enter PIN code</span>
                      ) : shippingPrice === 0 ? (
                        <span className="text-clay font-bold">FREE</span>
                      ) : (
                        formatPrice(shippingPrice)
                      )}
                    </span>
                  </div>
                  {codFee > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>COD handling fee</span>
                      <span className="tabular-nums text-ink font-medium">{formatPrice(codFee)}</span>
                    </div>
                  )}
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
                  {isPickup ? (
                    <p className="flex items-center gap-2"><Store size={12} className="text-clay" /> Packed in 10–15 min · collect from Sector 63, Noida</p>
                  ) : (
                    <p className="flex items-center gap-2"><Truck size={12} className="text-clay" /> Dispatch within 24–48 Hours</p>
                  )}
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
