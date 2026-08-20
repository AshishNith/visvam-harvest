import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  User,
  Package,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  XCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Save,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import { fetchMyOrders } from "@/lib/api";
import { formatPrice } from "@/lib/cart-context";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Account — Viśvam" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
});

type ProfileTab = "info" | "orders";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Processing: "bg-blue-100 text-blue-800 border-blue-200",
  Shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  Pending: <Clock size={13} />,
  Processing: <Loader2 size={13} className="animate-spin" />,
  Shipped: <Truck size={13} />,
  Completed: <CheckCircle2 size={13} />,
  Cancelled: <XCircle size={13} />,
};

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuth();

  const [tab, setTab] = useState<ProfileTab>("info");

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);



  // Init profile form
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
      setStreet(user.address?.street || "");
      setCity(user.address?.city || "");
      setState(user.address?.state || "");
      setZipCode(user.address?.zipCode || "");
    }
  }, [user]);

  // Redirect if not authed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Load orders when tab changes
  useEffect(() => {
    if (tab === "orders" && isAuthenticated) {
      loadOrders();
    }
  }, [tab, isAuthenticated]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetchMyOrders();
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!profileName.trim()) return toast.error("Name is required");
    setProfileSaving(true);
    try {
      const res = await updateProfile({
        name: profileName,
        phone: profilePhone,
        address: { street, city, state, zipCode, country: "India" },
      } as any);
      if (res.success) {
        toast.success("Profile and saved address updated successfully!");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };



  const handleSignOut = () => {
    logout();
    toast.info("Signed out successfully");
    navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-clay" />
        </div>
      </SiteLayout>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-border">
            <Link to="/" className="text-muted-foreground hover:text-ink transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1">
              <h1 className="font-display italic text-3xl text-ink">My Account</h1>
              <p className="text-[11px] tracked uppercase text-muted-foreground">
                Viśvam Royal Member Portal
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="p-5 bg-cream/50 border border-border flex items-center gap-4 mb-8">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border-2 border-clay/30 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-clay text-white flex items-center justify-center font-display italic text-2xl shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-ink text-lg">{user.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail size={12} /> {user.email}
              </p>
              {user.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone size={12} /> {user.phone}
                </p>
              )}
            </div>
            <span className="text-[9px] tracked text-clay border border-clay/30 px-2.5 py-1 uppercase bg-background font-semibold shrink-0">
              Royal Member
            </span>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-border text-[11px] tracked font-medium text-center mb-8">
            <button
              onClick={() => setTab("info")}
              className={`py-3 transition-colors border-b-2 flex items-center justify-center gap-2 ${
                tab === "info"
                  ? "border-clay text-clay font-semibold"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              <User size={14} /> Profile
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`py-3 transition-colors border-b-2 flex items-center justify-center gap-2 ${
                tab === "orders"
                  ? "border-clay text-clay font-semibold"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              <Package size={14} /> My Orders
            </button>
          </div>

          {/* Tab Content */}
          {tab === "info" && (
            <div className="max-w-lg space-y-5">
              <div>
                <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2.5 text-xs border border-border bg-cream/40 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[9px] text-muted-foreground mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                />
              </div>

              {/* Saved Delivery Address */}
              <div className="pt-4 border-t border-border/60 space-y-4">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-clay" /> Saved Delivery Address
                </h3>
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House no., Street, Area"
                    className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Pincode / Postal Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="6-digit Pincode"
                    className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 text-xs tracked font-semibold uppercase hover:bg-clay transition-colors disabled:opacity-50"
              >
                {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>

              <div className="pt-6 border-t border-border mt-6">
                <button
                  onClick={handleSignOut}
                  className="text-xs text-muted-foreground hover:text-clay underline uppercase tracked"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="py-16 text-center flex flex-col items-center gap-3">
                  <Loader2 size={20} className="animate-spin text-clay" />
                  <p className="text-xs text-muted-foreground">Loading your order history...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center">
                  <Package size={40} className="mx-auto text-muted-foreground/40 mb-4" />
                  <p className="font-display italic text-xl mb-2">No orders yet</p>
                  <p className="text-xs text-muted-foreground mb-6">
                    Your premium dry fruit orders will appear here.
                  </p>
                  <Link
                    to="/nuts"
                    className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 text-xs tracked font-semibold uppercase hover:bg-clay transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order: any) => {
                  const isExpanded = expandedOrder === order._id;
                  const statusClass = statusColors[order.status] || "bg-gray-100 text-gray-800";
                  const statusIcon = statusIcons[order.status] || <Clock size={13} />;
                  return (
                    <div
                      key={order._id}
                      className="border border-border bg-background overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-cream/30 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium text-ink font-mono truncate">
                              #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] tracked font-semibold uppercase px-2 py-0.5 border ${statusClass}`}
                            >
                              {statusIcon} {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}{" "}
                            · {order.orderItems?.length || 0} item(s)
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold tabular-nums text-ink">
                            {formatPrice(order.totalPrice)}
                          </p>
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-muted-foreground ml-auto mt-1" />
                          ) : (
                            <ChevronDown size={14} className="text-muted-foreground ml-auto mt-1" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border p-4 bg-cream/20 space-y-4 animate-fade-up">
                          {/* Items */}
                          <div>
                            <h5 className="text-[10px] tracked font-semibold uppercase text-muted-foreground mb-2">
                              Order Items
                            </h5>
                            <ul className="space-y-2">
                              {order.orderItems?.map((item: any, idx: number) => (
                                <li key={idx} className="flex items-center gap-3 text-xs">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 object-cover bg-cream shrink-0 border border-border/50"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground">Qty: {item.qty}</p>
                                  </div>
                                  <span className="font-semibold tabular-nums shrink-0">
                                    {formatPrice(item.price * item.qty)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Price breakdown */}
                          <div className="border-t border-border/60 pt-3 text-xs space-y-1">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span>{formatPrice(order.itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Shipping</span>
                              <span>
                                {order.shippingPrice === 0 ? (
                                  <span className="text-clay font-semibold">FREE</span>
                                ) : (
                                  formatPrice(order.shippingPrice)
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Tax</span>
                              <span>{formatPrice(order.taxPrice)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t border-border/60 pt-2">
                              <span>Total</span>
                              <span>{formatPrice(order.totalPrice)}</span>
                            </div>
                          </div>

                          {/* Shipping address */}
                          {order.shippingAddress && (
                            <div className="border-t border-border/60 pt-3">
                              <h5 className="text-[10px] tracked font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                                <MapPin size={11} className="text-clay" /> Delivered To
                              </h5>
                              <p className="text-xs text-muted-foreground">
                                {order.shippingAddress.fullName && `${order.shippingAddress.fullName}, `}
                                {order.shippingAddress.address || order.shippingAddress.street}
                                {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                                {order.shippingAddress.postalCode || order.shippingAddress.pincode
                                  ? ` — ${order.shippingAddress.postalCode || order.shippingAddress.pincode}`
                                  : ""}
                              </p>
                            </div>
                          )}

                          {/* Payment & tracking info */}
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/60 pt-3">
                            <span className="flex items-center gap-1">
                              <ShieldCheck size={11} className="text-clay" />
                              {order.paymentMethod} · {order.isPaid ? "Paid" : "Unpaid"}
                            </span>
                            <span className="font-mono">ID: {order._id?.slice(-12)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}


        </div>
      </div>
    </SiteLayout>
  );
}
