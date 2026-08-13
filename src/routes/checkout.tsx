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
  Lock,
  Mail,
} from "lucide-react";
import { useCart, formatPrice, type ShippingAddress } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { submitOrderToBackend } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const FREE_SHIPPING_THRESHOLD = 999;

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, shippingAddress, setShippingAddress } = useCart();
  const { user, isAuthenticated, isLoading: authLoading, login, register, loginWithGoogle } = useAuth();

  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [addressForm, setAddressForm] = useState<ShippingAddress>(shippingAddress);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Sync address form when shipping address from context updates
  useEffect(() => {
    setAddressForm(shippingAddress);
  }, [shippingAddress]);

  // Pre-fill name from user profile
  useEffect(() => {
    if (user && !addressForm.fullName) {
      setAddressForm((prev) => ({ ...prev, fullName: user.name || "" }));
    }
  }, [user]);

  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
  const taxPrice = Math.round(subtotal * 0.05);
  const totalPrice = subtotal + shippingPrice + taxPrice;

  // Handle JWT Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter email and password");
    setAuthSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(res.message);
        setEmail(""); setPassword("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return toast.error("Please fill in all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setAuthSubmitting(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        toast.success(res.message);
        setEmail(""); setPassword(""); setName("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setAuthSubmitting(false);
    }
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

  // Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Please log in to place your order");
    if (items.length === 0) return toast.error("Your harvest bag is empty");
    if (!validateAddress()) return;

    setSubmittingOrder(true);
    try {
      setShippingAddress(addressForm);

      const orderItems = items.map(({ product, qty }) => ({
        product: product._id || product.slug,
        slug: product.slug,
        name: product.name,
        qty,
        price: product.price,
        image: product.images[0] || "",
      }));

      const res = await submitOrderToBackend({
        orderItems,
        shippingAddress: addressForm,
        guestEmail: user?.email || "",
        paymentMethod: "Cash on Delivery",
      });

      if (res.success || res.data) {
        const orderId = res.data?._id || `VIS-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderSuccess(orderId);
        clearCart();
        toast.success("Order submitted successfully!");
      } else {
        toast.error(res.message || "Order placement failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error connecting to server");
    } finally {
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
          Thank you for choosing Viśvam Harvest. Order reference: <strong className="text-ink font-mono">{orderSuccess}</strong>
        </p>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed mb-8">
          Your order will be nitrogen-sealed in airtight cold-chain packaging and dispatched via priority courier. A tracking notification has been sent to your account email: <strong className="text-ink">{user?.email}</strong>.
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
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-ink transition-colors" title="Back to Home">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display italic text-3xl text-ink">Secure Express Checkout</h1>
              <p className="text-[11px] tracked uppercase text-muted-foreground">Encrypted JWT Authentication & Priority Delivery</p>
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
          <div className="max-w-md mx-auto bg-cream/40 border border-border p-8 shadow-sm text-center my-8">
            <div className="w-12 h-12 rounded-full bg-clay/10 text-clay grid place-items-center mx-auto mb-4">
              <User size={24} />
            </div>
            <h2 className="font-display italic text-2xl mb-2">Sign In to Checkout</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Log in or create an account to complete your order and track deliveries.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 border border-border bg-background hover:bg-cream/60 transition-colors flex items-center justify-center gap-3 text-xs font-semibold text-ink shadow-2xs mb-6 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin text-clay" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
                <span className="bg-cream/40 px-2 text-muted-foreground font-semibold">Or with Email</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border text-xs font-semibold mb-6">
              <button
                onClick={() => setAuthTab("login")}
                className={`py-2.5 border-b-2 ${authTab === "login" ? "border-clay text-clay" : "border-transparent text-muted-foreground"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthTab("register")}
                className={`py-2.5 border-b-2 ${authTab === "register" ? "border-clay text-clay" : "border-transparent text-muted-foreground"}`}
              >
                Create Account
              </button>
            </div>

            {authTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-border bg-background outline-none focus:border-clay"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-border bg-background outline-none focus:border-clay"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-ink text-white text-xs tracked font-semibold uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2"
                >
                  {authSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Sign In & Proceed"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 text-xs border border-border bg-background outline-none focus:border-clay"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 text-xs border border-border bg-background outline-none focus:border-clay"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Password (min 6 chars)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-border bg-background outline-none focus:border-clay"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-ink text-white text-xs tracked font-semibold uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2"
                >
                  {authSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Register & Proceed"}
                </button>
              </form>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display italic text-2xl mb-2">Your harvest bag is empty</p>
            <p className="text-xs text-muted-foreground mb-6">Add dry fruits or gift boxes to your bag before checking out.</p>
            <Link to="/nuts" className="px-6 py-3 bg-ink text-white text-xs tracked uppercase font-medium">Browse Nuts & Kernels</Link>
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
                    <p className="text-[10px] text-muted-foreground">Authenticated · Royal Member</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
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
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="City"
                      className="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">State *</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="State"
                      className="w-full px-3 py-2 text-xs border border-border outline-none focus:border-clay bg-transparent"
                      required
                    />
                  </div>
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
              </div>

              {/* Payment Selection */}
              <div className="bg-background border border-border p-6 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-ink border-b border-border pb-3">
                  <ShieldCheck size={16} className="text-clay" /> Payment Method
                </h3>
                <div className="p-4 border-2 border-clay bg-cream/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-4 border-clay bg-white" />
                    <div>
                      <p className="text-xs font-semibold text-ink">Cash on Delivery (COD)</p>
                      <p className="text-[10px] text-muted-foreground">Pay with cash or UPI upon delivery</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-clay bg-clay/10 px-2 py-0.5">Active</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full py-4 bg-ink text-white text-xs font-semibold tracked uppercase tracking-widest hover:bg-clay transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-clay" />
                    <span>Submitting Order...</span>
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
                  <ShoppingBag size={16} className="text-clay" /> Harvest Bag Items ({items.length})
                </h3>

                <ul className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {items.map(({ product, qty }) => {
                    if (!product) return null;
                    return (
                      <li key={product.slug || Math.random()} className="flex items-center gap-3 text-xs">
                        <img src={product.images?.[0] || ""} alt={product.name || "Product"} className="w-12 h-14 object-cover bg-cream shrink-0 border border-border/50" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">{product.serving} · Qty: {qty}</p>
                        </div>
                        <span className="font-semibold tabular-nums text-ink">{formatPrice((product.price || 0) * qty)}</span>
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
                    <span>Express Shipping</span>
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
                  <p className="flex items-center gap-2"><ShieldCheck size={12} className="text-clay" /> Nitrogen-Flushed Sealed Packaging</p>
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
