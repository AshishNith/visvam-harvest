import { useState } from "react";
import { X, User, ShieldCheck, Mail, Lock, Phone, MapPin, PackageCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type UserAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  const [tab, setTab] = useState<"login" | "register" | "track">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setUser({ name: name || email.split("@")[0], email });
    toast.success(`Welcome back to Viśvam Harvest, ${name || email.split("@")[0]}!`);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    setUser({ name, email });
    toast.success("Account created successfully! Welcome to Viśvam Harvest.");
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      toast.error("Please enter your Order ID");
      return;
    }
    toast.info(`Order #${orderId} is currently in Nitrogen Cold-Lock Packaging. Estimated delivery: 2 Days.`);
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
              <div className="w-12 h-12 rounded-full bg-clay text-white flex items-center justify-center font-display italic text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium text-ink">{user.name}</h4>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <span className="inline-block mt-1 text-[9px] tracked text-clay border border-clay/30 px-2 py-0.5 uppercase bg-background">
                  Royal Member
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] tracked text-muted-foreground uppercase">Quick Member Services</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => toast.info("Your order history is synced with your backend account.")}
                  className="p-3 border border-border hover:border-clay bg-background text-left flex items-center gap-2 transition-colors"
                >
                  <PackageCheck size={14} className="text-clay" /> My Orders
                </button>
                <button
                  onClick={() => toast.info("Cold-Chain Priority Sourcing active for your account.")}
                  className="p-3 border border-border hover:border-clay bg-background text-left flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck size={14} className="text-clay" /> Priority Club
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setUser(null);
                toast.info("Signed out of your account.");
              }}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-ink border border-border hover:bg-cream/40 transition-colors uppercase tracked"
            >
              Sign Out
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
                    className="w-full bg-ink text-white py-3 text-xs tracked font-medium uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2"
                  >
                    Sign In to Account <ArrowRight size={14} />
                  </button>

                  <p className="text-[10px] text-center text-muted-foreground mt-3">
                    Protected by Firebase Auth & 256-bit Cold-Chain Security.
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
                        placeholder="Royal Harvest Member"
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
                      Create Password
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
                    className="w-full bg-ink text-white py-3 text-xs tracked font-medium uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2"
                  >
                    Create Royal Account <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {tab === "track" && (
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
                    className="w-full bg-clay text-white py-3 text-xs tracked font-medium uppercase hover:bg-ink transition-colors flex items-center justify-center gap-2"
                  >
                    Track Dispatch Status <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
