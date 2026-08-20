import { useState, useRef, useEffect } from "react";
import { X, User, Mail, Phone, ArrowRight, Loader2, ArrowLeft, PackageCheck, CheckCircle2, LogOut, Package, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { trackOrderByIdFromBackend } from "@/lib/api";
import { formatPrice } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import type { ConfirmationResult } from "@/lib/firebase";

type UserAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AuthMethod = "email" | "phone";
type AuthStep = "input" | "otp" | "email-sent";

export function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  const { user, loginWithGoogle, logout, sendEmailLink, sendPhoneOTP, verifyPhoneOTP } = useAuth();

  const [method, setMethod] = useState<AuthMethod>("phone");
  const [step, setStep] = useState<AuthStep>("input");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Track Order state
  const [showTrack, setShowTrack] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("input");
      setOtpCode("");
      setLoading(false);
      setConfirmationResult(null);
      setResendTimer(0);
      setShowTrack(false);
      setTrackedOrder(null);
      if (typeof window !== "undefined") {
        if ((window as any).__recaptchaVerifier) {
          try { (window as any).__recaptchaVerifier.clear(); } catch {}
          (window as any).__recaptchaVerifier = null;
        }
        const container = document.getElementById("recaptcha-container");
        if (container) container.innerHTML = "";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const res = await sendEmailLink(email.trim());
      if (res.success) {
        setStep("email-sent");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const phone = phoneNumber.trim();
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    // Auto-prefix +91 if not already prefixed
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\s/g, "")}`;

    setLoading(true);
    try {
      const res = await sendPhoneOTP(formattedPhone, "recaptcha-container");
      if (res.success && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setStep("otp");
        setResendTimer(30);
        toast.success("OTP sent to your phone!");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    if (!confirmationResult) {
      toast.error("Session expired. Please request a new OTP.");
      setStep("input");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyPhoneOTP(confirmationResult, otpCode);
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    setOtpCode("");
    handleSendPhoneOTP();
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
              <h3 className="font-display italic text-lg text-ink">Viśvam Royal Account</h3>
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

        {/* reCAPTCHA container (invisible) */}
        <div id="recaptcha-container" />

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
                {user.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                {user.phone && <p className="text-xs text-muted-foreground truncate">{user.phone}</p>}
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
                onClick={() => setShowTrack(!showTrack)}
                className="w-full p-3 border border-border hover:border-clay bg-background text-left flex items-center justify-between text-xs transition-colors mt-2"
              >
                <span className="flex items-center gap-2 font-medium">
                  <PackageCheck size={14} className="text-clay" /> Quick Order Lookup
                </span>
                <ArrowRight size={12} className="text-muted-foreground" />
              </button>
            </div>

            {/* Quick Track (inline) */}
            {showTrack && (
              <div className="space-y-3 animate-fade-up">
                <form onSubmit={handleTrackOrder} className="space-y-3">
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
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="w-full bg-clay text-white py-2.5 text-xs tracked font-medium uppercase hover:bg-ink transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {trackingLoading ? (
                      <><Loader2 size={14} className="animate-spin" /> Searching...</>
                    ) : (
                      <>Track Dispatch Status <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>
                {trackedOrder && (
                  <div className="p-3 bg-cream/60 border border-clay/30 space-y-2 animate-fade-up">
                    <div className="flex items-center gap-2 text-clay font-medium text-xs">
                      <CheckCircle2 size={16} /> <span>Order Found</span>
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

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-ink border border-border hover:bg-cream/40 transition-colors uppercase tracked flex items-center justify-center gap-2"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        ) : (
          <div>
            {/* Auth Input Step */}
            {step === "input" && (
              <div className="p-6">
                {/* Google Sign-In */}
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
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/70" />
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
                    <span className="bg-background px-2 text-muted-foreground font-semibold">Or continue with</span>
                  </div>
                </div>

                {/* Method Toggle */}
                <div className="grid grid-cols-2 border border-border mb-5 text-[10.5px] tracked font-medium text-center">
                  <button
                    onClick={() => setMethod("phone")}
                    className={`py-2.5 transition-colors flex items-center justify-center gap-1.5 ${
                      method === "phone"
                        ? "bg-ink text-white"
                        : "bg-background text-muted-foreground hover:text-ink"
                    }`}
                  >
                    <Phone size={13} /> Phone OTP
                  </button>
                  <button
                    onClick={() => setMethod("email")}
                    className={`py-2.5 transition-colors flex items-center justify-center gap-1.5 ${
                      method === "email"
                        ? "bg-ink text-white"
                        : "bg-background text-muted-foreground hover:text-ink"
                    }`}
                  >
                    <Mail size={13} /> Email Link
                  </button>
                </div>

                {/* Phone Input */}
                {method === "phone" && (
                  <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                    <div>
                      <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">
                        Phone Number
                      </label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-3 text-xs text-muted-foreground border border-r-0 border-border bg-cream/50 font-mono">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                          placeholder="98765 43210"
                          maxLength={12}
                          className="flex-1 px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-ink text-white py-3 text-xs tracked font-medium uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 size={14} className="animate-spin" /> Sending OTP...</>
                      ) : (
                        <>Send OTP <ArrowRight size={14} /></>
                      )}
                    </button>
                  </form>
                )}

                {/* Email Input */}
                {method === "email" && (
                  <form onSubmit={handleSendEmailLink} className="space-y-4">
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
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-ink text-white py-3 text-xs tracked font-medium uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 size={14} className="animate-spin" /> Sending Link...</>
                      ) : (
                        <>Send Magic Link <ArrowRight size={14} /></>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-[10px] text-center text-muted-foreground mt-4">
                  Passwordless, secure sign-in via {method === "phone" ? "SMS verification" : "email link"}.
                </p>
              </div>
            )}

            {/* Phone OTP Verification Step */}
            {step === "otp" && (
              <div className="p-6">
                <button
                  onClick={() => { setStep("input"); setOtpCode(""); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ink transition-colors mb-4"
                >
                  <ArrowLeft size={14} /> Change number
                </button>

                <div className="text-center mb-6">
                  <h4 className="font-display italic text-lg text-ink mb-1">Verify OTP</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Enter the 6-digit code sent to <strong className="text-ink">+91 {phoneNumber}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  {/* OTP Input - clean 6-digit input */}
                  <div className="flex justify-center">
                    <input
                      ref={otpInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="------"
                      className="w-full max-w-[220px] text-center text-2xl font-mono tracking-[0.6em] py-3 border-b-2 border-border focus:border-clay outline-none bg-transparent placeholder:text-border"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full bg-ink text-white py-3 text-xs tracked font-medium uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> Verifying...</>
                    ) : (
                      <>Verify & Sign In <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  {resendTimer > 0 ? (
                    <p className="text-[10px] text-muted-foreground">
                      Resend OTP in <span className="text-clay font-semibold">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      className="text-[10px] text-clay hover:underline font-semibold uppercase tracked"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Email Link Sent Confirmation */}
            {step === "email-sent" && (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto bg-cream border border-clay/30 flex items-center justify-center">
                  <Mail size={24} className="text-clay" />
                </div>
                <div>
                  <h4 className="font-display italic text-lg text-ink mb-1">Check Your Inbox</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    We've sent a magic sign-in link to<br />
                    <strong className="text-ink">{email}</strong>
                  </p>
                </div>
                <div className="p-3 bg-cream/60 border border-border text-[10px] text-muted-foreground leading-relaxed">
                  Click the link in the email to sign in. The link is valid for a single use. Check spam if you don't see it.
                </div>
                <button
                  onClick={() => { setStep("input"); setEmail(""); }}
                  className="text-[10px] text-clay hover:underline font-semibold uppercase tracked"
                >
                  Use a different method
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
