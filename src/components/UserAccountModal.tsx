import { useState } from "react";
import { X, User, ShieldCheck, Mail, Lock, PackageCheck, ArrowRight, Loader2, CheckCircle2, LogOut, Package, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { trackOrderByIdFromBackend } from "@/lib/api";
import { formatPrice } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

type UserAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  const { user, login, register, loginWithGoogle, logout } = useAuth();
  const [tab, setTab] = useState<"login" | "register" | "track">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);

  if (!isOpen) return null;

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(res.message);
        setEmail(""); setPassword("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Unable to connect. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        toast.success(res.message);
        setEmail(""); setPassword(""); setName("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Unable to connect. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    toast.info("Signed out of your account.");
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error("Please enter your Order ID / Tracking Number");
      return;
    }

    setTrackingLoading(true);
    setTrackedOrder(null);
    try {
      const res = await trackOrderByIdFromBackend(orderId.trim());
      if (res.success && res.data) {
        setTrackedOrder(res.data);
        toast.success("Order status retrieved successfully!");
      } else {
        toast.error(res.message || "Order not found. Please check your Order ID.");
      }
    } catch {
      toast.error("Unable to connect to tracking server. Please try again.");
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-md bg-background border border-border shadow-2xl z-10 overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-cream/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cream text-clay border border-border/80">
              <User size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display italic text-lg text-ink">Royal Harvest Account</h3>
              <p className="text-[10px] tracked text-muted-foreground uppercase">Viśvam Member Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:text-clay transition-colors rounded-full hover:bg-sand/40"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* User Logged In State */}
        {user ? (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-cream/60 border border-border flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-clay/30 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-clay text-white flex items-center justify-center font-display italic text-xl shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-ink truncate">{user.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[9px] tracked text-clay border border-clay/30 px-2 py-0.5 uppercase bg-background font-semibold">
                  Royal Member
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] tracked text-muted-foreground uppercase">Account Navigation</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="p-3 border border-border hover:border-clay bg-background text-left flex items-center justify-between transition-colors group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <User size={14} className="text-clay" /> My Profile
                  </span>
                  <ExternalLink size={12} className="text-muted-foreground group-hover:text-clay" />
                </Link>
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="p-3 border border-border hover:border-clay bg-background text-left flex items-center justify-between transition-colors group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Package size={14} className="text-clay" /> My Orders
                  </span>
                  <ExternalLink size={12} className="text-muted-foreground group-hover:text-clay" />
                </Link>
              </div>
              <button
                onClick={() => setTab("track")}
                className="w-full p-3 border border-border hover:border-clay bg-background text-left flex items-center justify-between text-xs transition-colors mt-2"
              >
                <span className="flex items-center gap-2 font-medium">
                  <PackageCheck size={14} className="text-clay" /> Quick Order Lookup
                </span>
                <ArrowRight size={12} className="text-muted-foreground" />
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-ink border border-border hover:bg-cream/40 transition-colors uppercase tracked flex items-center justify-center gap-2"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="grid grid-cols-3 border-b border-border text-[10.5px] tracked font-medium text-center bg-cream/20">
              <button
                onClick={() => setTab("login")}
                className={`py-3 transition-colors border-b-2 ${
                  tab === "login"
                    ? "border-clay text-clay font-semibold bg-background"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("register")}
                className={`py-3 transition-colors border-b-2 ${
                  tab === "register"
                    ? "border-clay text-clay font-semibold bg-background"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => setTab("track")}
                className={`py-3 transition-colors border-b-2 ${
                  tab === "track"
                    ? "border-clay text-clay font-semibold bg-background"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                Track Order
              </button>
            </div>

            <div className="p-6">
              {(tab === "login" || tab === "register") && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full py-2.5 px-4 border border-border bg-background hover:bg-cream/50 transition-colors flex items-center justify-center gap-3 text-xs font-semibold text-ink shadow-2xs disabled:opacity-50"
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

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/70" />
                    </div>
                    <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
                      <span className="bg-background px-2 text-muted-foreground font-semibold">Or with Email</span>
                    </div>
                  </div>
                </div>
              )}

              {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-ink text-white py-3 text-xs tracked font-medium uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <><Loader2 size={14} className="animate-spin" /> Signing In...</>
                    ) : (
                      <>Sign In to Account <ArrowRight size={14} /></>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-muted-foreground mt-3">
                    Secure login with encrypted authentication.
                  </p>
                </form>
              )}

              {tab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">
                      Create Password (min 6 chars)
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-ink text-white py-3 text-xs tracked font-medium uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <><Loader2 size={14} className="animate-spin" /> Creating Account...</>
                    ) : (
                      <>Create Royal Account <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>
              )}

              {tab === "track" && (
                <div className="space-y-4">
                  <form onSubmit={handleTrackOrder} className="space-y-4">
                    <div>
                      <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">
                        Order ID / Tracking Number
                      </label>
                      <div className="relative">
                        <PackageCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={orderId}
                          onChange={(e) => setOrderId(e.target.value)}
                          placeholder="e.g. VIS-92841"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={trackingLoading}
                      className="w-full bg-clay text-white py-3 text-xs tracked font-medium uppercase hover:bg-ink transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {trackingLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Searching Database...</span>
                        </>
                      ) : (
                        <>
                          <span>Track Dispatch Status</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>

                  {trackedOrder && (
                    <div className="mt-4 p-4 bg-cream/60 border border-clay/30 rounded-sm space-y-2 animate-fade-up">
                      <div className="flex items-center gap-2 text-clay font-medium text-xs">
                        <CheckCircle2 size={16} />
                        <span>Order Found</span>
                      </div>
                      <div className="text-xs space-y-1 text-ink pt-1 border-t border-border/50">
                        <p><span className="text-muted-foreground">Status:</span> <strong className="uppercase text-clay">{trackedOrder.status}</strong></p>
                        {trackedOrder.totalPrice && <p><span className="text-muted-foreground">Total Amount:</span> {formatPrice(trackedOrder.totalPrice)}</p>}
                        {trackedOrder.createdAt && <p><span className="text-muted-foreground">Ordered:</span> {new Date(trackedOrder.createdAt).toLocaleDateString("en-IN")}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
