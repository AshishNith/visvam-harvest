import { useState, useEffect, useRef } from "react";
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
  Plus,
  Pencil,
  Trash2,
  Settings,
  Camera,
  Download,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import {
  fetchMyOrders,
  fetchMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  fetchNewsletterPreference,
  setNewsletterPreference,
  deleteMyAccount,
  uploadAvatar,
  trackOrderShipment,
  fetchProductBySlugFromBackend,
  type SavedAddress,
} from "@/lib/api";
import { useCart, formatPrice } from "@/lib/cart-context";
import { prefillableName, sanitizeNameInput } from "@/lib/name";
import { CityStateFields } from "@/components/CityStateFields";
import { PincodeField } from "@/components/PincodeField";
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

type ProfileTab = "info" | "addresses" | "orders" | "settings";

/**
 * Seller details printed on customer invoices.
 *
 * The FSSAI licence is intentionally blank until the client hands it over —
 * an invoice showing a placeholder number would be worse than one that simply
 * omits the line, so the renderer skips empty values.
 */
const SELLER = {
  brand: "Viśvam",
  legalName: "Tej Kripa Private Limited",
  address: "F-329, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309",
  email: "Contact@visvam.in",
  phone: "+91 92178 70974",
  gstin: "09AANCT2392L1ZM",
  fssai: "",
};

const EMPTY_ADDRESS_FORM = {
  label: "Home",
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

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

const inputClass =
  "w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent";
const labelClass = "block text-[10px] tracked text-muted-foreground uppercase mb-1";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, updateProfile, refreshUser, logout } = useAuth();
  const { add: addToCart } = useCart();

  const [tab, setTab] = useState<ProfileTab>("info");

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState<string | null>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingByOrder, setTrackingByOrder] = useState<Record<string, any>>({});
  const [trackingLoadingId, setTrackingLoadingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Settings
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [newsletter, setNewsletter] = useState<{ subscribed: boolean; available: boolean } | null>(null);
  const [newsletterSaving, setNewsletterSaving] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(prefillableName(user.name));
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Each tab loads its own data the first time it is opened, so signing in
  // does not fire four requests the customer may never look at.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (tab === "orders") loadOrders();
    if (tab === "addresses") loadAddresses();
    if (tab === "settings") loadNewsletterPreference();
  }, [tab, isAuthenticated]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetchMyOrders();
      if (res.success && Array.isArray(res.data)) setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await fetchMyAddresses();
      if (res.success && Array.isArray(res.data)) setAddresses(res.data);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setAddressesLoading(false);
    }
  };

  const loadNewsletterPreference = async () => {
    const res = await fetchNewsletterPreference();
    if (res.success && res.data) setNewsletter(res.data);
  };

  /* ── Profile ─────────────────────────────────────────────── */
  const handleProfileSave = async () => {
    if (!profileName.trim()) return toast.error("Name is required");
    setProfileSaving(true);
    try {
      const res = await updateProfile({ name: profileName, phone: profilePhone } as any);
      if (res.success) {
        toast.success("Profile updated");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Addresses ───────────────────────────────────────────── */
  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({ ...EMPTY_ADDRESS_FORM, fullName: prefillableName(user?.name), phone: user?.phone || "" });
    setShowAddressForm(true);
  };

  const openEditAddress = (address: SavedAddress) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || "Home",
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setShowAddressForm(true);
  };

  const handleAddressSave = async () => {
    const required: Array<[keyof typeof addressForm, string]> = [
      ["fullName", "Full name"],
      ["phone", "Phone number"],
      ["street", "Street address"],
      ["city", "City"],
      ["state", "State"],
      ["pincode", "Pincode"],
    ];
    for (const [field, label] of required) {
      if (!String(addressForm[field]).trim()) return toast.error(`${label} is required`);
    }
    if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
      return toast.error("Pincode must be 6 digits");
    }

    setAddressSaving(true);
    try {
      const res = editingAddressId
        ? await updateAddress(editingAddressId, addressForm)
        : await createAddress(addressForm);

      if (res.success && Array.isArray(res.data)) {
        setAddresses(res.data);
        setShowAddressForm(false);
        setEditingAddressId(null);
        toast.success(editingAddressId ? "Address updated" : "Address saved");
      } else {
        toast.error(res.message || "Could not save address");
      }
    } finally {
      setAddressSaving(false);
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    const res = await deleteAddress(addressId);
    if (res.success && Array.isArray(res.data)) {
      setAddresses(res.data);
      toast.success("Address removed");
    } else {
      toast.error(res.message || "Could not remove address");
    }
    setConfirmDeleteAddressId(null);
  };

  const handleSetDefault = async (addressId: string) => {
    const res = await setDefaultAddress(addressId);
    if (res.success && Array.isArray(res.data)) {
      setAddresses(res.data);
      toast.success("Default delivery address updated");
    } else {
      toast.error(res.message || "Could not update default address");
    }
  };

  /* ── Orders: tracking, reorder, invoice ──────────────────── */
  const handleTrack = async (order: any) => {
    const reference = order.shiprocket?.awbCode || order._id;
    setTrackingLoadingId(order._id);
    try {
      const res = await trackOrderShipment(reference);
      if (res.success) {
        setTrackingByOrder((prev) => ({ ...prev, [order._id]: res }));
      } else {
        toast.error(res.message || "Tracking is not available for this order yet");
      }
    } finally {
      setTrackingLoadingId(null);
    }
  };

  const handleReorder = async (order: any) => {
    setReorderingId(order._id);
    try {
      let added = 0;
      let unavailable = 0;

      for (const item of order.orderItems || []) {
        const slug = item.slug || item.product?.slug;
        if (!slug) {
          unavailable += 1;
          continue;
        }

        // The order only stores a snapshot of each item, so the live product
        // has to be fetched before it can go back into the cart at today's price.
        const product = await fetchProductBySlugFromBackend(slug);
        if (!product) {
          unavailable += 1;
          continue;
        }

        for (let i = 0; i < (item.qty || 1); i += 1) {
          addToCart(product);
        }
        added += 1;
      }

      if (added === 0) {
        toast.error("None of these items are available right now");
      } else if (unavailable > 0) {
        toast.success(`${added} item(s) added — ${unavailable} no longer available`);
      } else {
        toast.success("Items added back to your bag");
      }
    } catch {
      toast.error("Could not rebuild this order");
    } finally {
      setReorderingId(null);
    }
  };

  const handleDownloadInvoice = (order: any) => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) {
      toast.error("Allow pop-ups to download your invoice");
      return;
    }

    const orderNumber = String(order._id || "").slice(-8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const addr = order.shippingAddress || {};

    const rows = (order.orderItems || [])
      .map(
        (item: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.name || "Item"}</td>
            <td class="num">${item.qty}</td>
            <td class="num">${formatPrice(item.price)}</td>
            <td class="num">${formatPrice(item.price * item.qty)}</td>
          </tr>`
      )
      .join("");

    const sellerIds = [
      SELLER.gstin ? `GSTIN: ${SELLER.gstin}` : "",
      SELLER.fssai ? `FSSAI: ${SELLER.fssai}` : "",
    ]
      .filter(Boolean)
      .join(" &nbsp;·&nbsp; ");

    invoiceWindow.document.write(`
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${orderNumber} — ${SELLER.brand}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Georgia, 'Times New Roman', serif; color: #241a12; margin: 0; padding: 40px; }
          .head { display: flex; justify-content: space-between; align-items: flex-start;
                  border-bottom: 2px solid #8a4f27; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 26px; font-style: italic; margin: 0; }
          .legal { font-size: 11px; color: #6d5c4c; margin-top: 4px; line-height: 1.6; }
          .doc { text-align: right; font-size: 11px; color: #6d5c4c; line-height: 1.7; }
          .doc strong { color: #241a12; font-size: 13px; }
          .parties { display: flex; gap: 40px; margin-bottom: 24px; font-size: 12px; line-height: 1.7; }
          .parties h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
                        color: #8a4f27; margin: 0 0 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
          th { background: #faf7f2; text-align: left; font-size: 10px; text-transform: uppercase;
               letter-spacing: 0.5px; color: #6d5c4c; padding: 8px; border-bottom: 1px solid #e5d8c8; }
          td { padding: 8px; border-bottom: 1px solid #f0e9e0; }
          .num { text-align: right; }
          .totals { margin-left: auto; width: 260px; font-size: 12px; }
          .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
          .totals .grand { border-top: 1.5px solid #241a12; margin-top: 6px; padding-top: 8px;
                           font-weight: bold; font-size: 14px; }
          .foot { margin-top: 32px; border-top: 1px solid #e5d8c8; padding-top: 14px;
                  font-size: 10px; color: #6d5c4c; text-align: center; line-height: 1.8; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="head">
          <div>
            <h1 class="brand">${SELLER.brand}</h1>
            <div class="legal">
              ${SELLER.legalName}<br />
              ${SELLER.address}<br />
              ${SELLER.email} &nbsp;·&nbsp; ${SELLER.phone}
              ${sellerIds ? `<br />${sellerIds}` : ""}
            </div>
          </div>
          <div class="doc">
            <strong>TAX INVOICE</strong><br />
            Invoice No: ${orderNumber}<br />
            Date: ${orderDate}<br />
            Payment: ${order.paymentMethod || "—"}<br />
            Status: ${order.isPaid ? "Paid" : "Unpaid"}
          </div>
        </div>

        <div class="parties">
          <div>
            <h4>Billed &amp; Shipped To</h4>
            ${addr.fullName || "Valued Customer"}<br />
            ${addr.address || addr.street || ""}<br />
            ${addr.city || ""}${addr.state ? `, ${addr.state}` : ""}<br />
            ${addr.postalCode || addr.pincode || ""}<br />
            ${addr.phone ? `Phone: ${addr.phone}` : ""}
          </div>
        </div>

        <table>
          <thead>
            <tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal</span><span>${formatPrice(order.itemsPrice || 0)}</span></div>
          <div><span>Shipping</span><span>${
            order.shippingPrice === 0 ? "FREE" : formatPrice(order.shippingPrice || 0)
          }</span></div>
          <div><span>Tax</span><span>${formatPrice(order.taxPrice || 0)}</span></div>
          <div class="grand"><span>Total</span><span>${formatPrice(order.totalPrice || 0)}</span></div>
        </div>

        <div class="foot">
          Thank you for shopping with ${SELLER.brand}.<br />
          This is a computer-generated invoice and does not require a signature.
        </div>
        <script>window.onload = function () { window.print(); };<\/script>
      </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  /* ── Settings ────────────────────────────────────────────── */
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image under 5MB");
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await uploadAvatar(file);
      if (res.success) {
        await refreshUser();
        toast.success("Profile picture updated");
      } else {
        toast.error(res.message || "Could not upload picture");
      }
    } finally {
      setAvatarUploading(false);
      // Clear the input so picking the same file again still fires onChange.
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleNewsletterToggle = async () => {
    if (!newsletter) return;
    const next = !newsletter.subscribed;
    setNewsletterSaving(true);
    try {
      const res = await setNewsletterPreference(next);
      if (res.success) {
        setNewsletter({ ...newsletter, subscribed: next });
        toast.success(next ? "Subscribed to the newsletter" : "Unsubscribed");
      } else {
        toast.error(res.message || "Could not update preference");
      }
    } finally {
      setNewsletterSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await deleteMyAccount();
      if (res.success) {
        toast.success("Your account has been deleted");
        logout();
        navigate({ to: "/" });
      } else {
        toast.error(res.message || "Could not delete account");
      }
    } finally {
      setDeletingAccount(false);
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

  const tabs: Array<{ id: ProfileTab; label: string; icon: React.ReactNode }> = [
    { id: "info", label: "Profile", icon: <User size={14} /> },
    { id: "addresses", label: "Addresses", icon: <MapPin size={14} /> },
    { id: "orders", label: "Orders", icon: <Package size={14} /> },
    { id: "settings", label: "Settings", icon: <Settings size={14} /> },
  ];

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
                Viśvam Member Portal
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
              {user.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail size={12} /> {user.email}
                </p>
              )}
              {user.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone size={12} /> {user.phone}
                </p>
              )}
            </div>
            <span className="text-[9px] tracked text-clay border border-clay/30 px-2.5 py-1 uppercase bg-background font-semibold shrink-0">
              Member
            </span>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border text-[11px] tracked font-medium text-center mb-8">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  tab === t.id
                    ? "border-clay text-clay font-semibold"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── Profile tab ─────────────────────────────────── */}
          {tab === "info" && (
            <div className="max-w-lg space-y-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(sanitizeNameInput(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={user.email || "Not linked"}
                  disabled
                  className="w-full px-3 py-2.5 text-xs border border-border bg-cream/40 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[9px] text-muted-foreground mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </div>

              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 text-xs tracked font-semibold uppercase hover:bg-clay transition-colors disabled:opacity-50"
              >
                {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>

              <div className="pt-5 border-t border-border/60">
                <p className="text-[11px] text-muted-foreground">
                  Delivery addresses now live under the{" "}
                  <button onClick={() => setTab("addresses")} className="text-clay underline font-semibold">
                    Addresses
                  </button>{" "}
                  tab, where you can save more than one.
                </p>
              </div>
            </div>
          )}

          {/* ── Addresses tab ───────────────────────────────── */}
          {tab === "addresses" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-muted-foreground">
                  Saved addresses appear at checkout — your default one is filled in automatically.
                </p>
                {!showAddressForm && (
                  <button
                    onClick={openAddAddress}
                    className="inline-flex items-center gap-1.5 bg-ink text-white px-4 py-2.5 text-[10px] tracked font-semibold uppercase hover:bg-clay transition-colors shrink-0"
                  >
                    <Plus size={13} /> Add Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <div className="border border-clay/40 bg-cream/30 p-5 space-y-4">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    {editingAddressId ? "Edit Address" : "New Address"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        type="text"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        placeholder="Home, Office..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: sanitizeNameInput(e.target.value) })}
                        placeholder="Receiver's name"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Street Address *</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="House no., Street, Area"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CityStateFields
                      city={addressForm.city}
                      state={addressForm.state}
                      onCityChange={(city) => setAddressForm({ ...addressForm, city })}
                      onStateChange={(state) => setAddressForm({ ...addressForm, state })}
                      inputClass={inputClass}
                      labelClass={labelClass}
                      required
                    />
                    <PincodeField
                      city={addressForm.city}
                      state={addressForm.state}
                      pincode={addressForm.pincode}
                      onPincodeChange={(pincode) => setAddressForm({ ...addressForm, pincode })}
                      inputClass={inputClass}
                      labelClass={labelClass}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleAddressSave}
                      disabled={addressSaving}
                      className="inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 text-[10px] tracked font-semibold uppercase hover:bg-clay transition-colors disabled:opacity-50"
                    >
                      {addressSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      {editingAddressId ? "Update" : "Save"} Address
                    </button>
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                      }}
                      className="text-[10px] tracked uppercase text-muted-foreground hover:text-ink underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {addressesLoading ? (
                <div className="py-14 text-center flex flex-col items-center gap-3">
                  <Loader2 size={20} className="animate-spin text-clay" />
                  <p className="text-xs text-muted-foreground">Loading your addresses...</p>
                </div>
              ) : addresses.length === 0 && !showAddressForm ? (
                <div className="py-14 text-center">
                  <MapPin size={38} className="mx-auto text-muted-foreground/40 mb-4" />
                  <p className="font-display italic text-xl mb-2">No saved addresses</p>
                  <p className="text-xs text-muted-foreground mb-6">
                    Save an address once and checkout fills it in for you every time.
                  </p>
                  <button
                    onClick={openAddAddress}
                    className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 text-xs tracked font-semibold uppercase hover:bg-clay transition-colors"
                  >
                    <Plus size={14} /> Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border p-4 space-y-3 ${
                        address.isDefault ? "border-clay bg-cream/40" : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tracked uppercase font-semibold text-ink">
                          {address.label || "Address"}
                        </span>
                        {address.isDefault && (
                          <span className="text-[8px] tracked uppercase text-clay border border-clay/40 px-1.5 py-0.5">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground leading-relaxed">
                        <p className="text-ink font-medium">{address.fullName}</p>
                        <p>{address.phone}</p>
                        <p>
                          {address.street}, {address.city}, {address.state} — {address.pincode}
                        </p>
                      </div>

                      {confirmDeleteAddressId === address._id ? (
                        <div className="flex items-center gap-3 pt-1 border-t border-border/60">
                          <span className="text-[10px] text-muted-foreground">Remove this address?</span>
                          <button
                            onClick={() => handleAddressDelete(address._id)}
                            className="text-[10px] tracked uppercase font-semibold text-red-600 hover:underline"
                          >
                            Yes, remove
                          </button>
                          <button
                            onClick={() => setConfirmDeleteAddressId(null)}
                            className="text-[10px] tracked uppercase text-muted-foreground hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefault(address._id)}
                              className="text-[10px] tracked uppercase text-clay hover:underline font-semibold"
                            >
                              Set default
                            </button>
                          )}
                          <button
                            onClick={() => openEditAddress(address)}
                            className="inline-flex items-center gap-1 text-[10px] tracked uppercase text-muted-foreground hover:text-ink"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteAddressId(address._id)}
                            className="inline-flex items-center gap-1 text-[10px] tracked uppercase text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Orders tab ──────────────────────────────────── */}
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
                  const tracking = trackingByOrder[order._id];

                  return (
                    <div key={order._id} className="border border-border bg-background overflow-hidden">
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

                          {/* Live tracking timeline */}
                          {tracking && (
                            <div className="border-t border-border/60 pt-3">
                              <h5 className="text-[10px] tracked font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                <Truck size={11} className="text-clay" /> Shipment Tracking
                              </h5>
                              <div className="text-[11px] text-muted-foreground mb-3 space-y-0.5">
                                {tracking.awbCode && (
                                  <p>
                                    AWB: <span className="font-mono text-ink">{tracking.awbCode}</span>
                                    {tracking.courier ? ` · ${tracking.courier}` : ""}
                                  </p>
                                )}
                                {tracking.currentStatus && (
                                  <p>
                                    Status:{" "}
                                    <span className="text-ink font-medium">{tracking.currentStatus}</span>
                                    {tracking.etd ? ` · ETA ${tracking.etd}` : ""}
                                  </p>
                                )}
                              </div>
                              <ol className="space-y-2.5">
                                {(tracking.timeline || []).map((step: any, idx: number) => (
                                  <li key={idx} className="flex gap-3 text-[11px]">
                                    <span
                                      className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                                        step.completed === false ? "bg-border" : "bg-clay"
                                      }`}
                                    />
                                    <div className="min-w-0">
                                      <p className="text-ink">{step.activity}</p>
                                      <p className="text-muted-foreground text-[10px]">
                                        {step.location}
                                        {step.date ? ` · ${step.date}` : ""}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="border-t border-border/60 pt-3 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleTrack(order)}
                              disabled={trackingLoadingId === order._id}
                              className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[10px] tracked uppercase font-semibold hover:border-clay hover:text-clay transition-colors disabled:opacity-50"
                            >
                              {trackingLoadingId === order._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Truck size={12} />
                              )}
                              {tracking ? "Refresh Tracking" : "Track Order"}
                            </button>

                            <button
                              onClick={() => handleReorder(order)}
                              disabled={reorderingId === order._id}
                              className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[10px] tracked uppercase font-semibold hover:border-clay hover:text-clay transition-colors disabled:opacity-50"
                            >
                              {reorderingId === order._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <RotateCcw size={12} />
                              )}
                              Reorder
                            </button>

                            <button
                              onClick={() => handleDownloadInvoice(order)}
                              className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[10px] tracked uppercase font-semibold hover:border-clay hover:text-clay transition-colors"
                            >
                              <Download size={12} /> Invoice
                            </button>
                          </div>

                          {/* Payment info */}
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

          {/* ── Settings tab ────────────────────────────────── */}
          {tab === "settings" && (
            <div className="max-w-lg space-y-8">
              {/* Profile picture */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Camera size={14} className="text-clay" /> Profile Picture
                </h3>
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-clay/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-clay text-white flex items-center justify-center font-display italic text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[10px] tracked uppercase font-semibold hover:border-clay hover:text-clay transition-colors disabled:opacity-50"
                    >
                      {avatarUploading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Camera size={13} />
                      )}
                      Change Picture
                    </button>
                    <p className="text-[9px] text-muted-foreground mt-1.5">JPG or PNG, up to 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="space-y-3 pt-6 border-t border-border/60">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={14} className="text-clay" /> Email Preferences
                </h3>
                {newsletter === null ? (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <Loader2 size={11} className="animate-spin text-clay" /> Loading preferences...
                  </p>
                ) : !newsletter.available ? (
                  <p className="text-[11px] text-muted-foreground">
                    Add an email address to your profile to receive our newsletter.
                  </p>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-ink font-medium">Viśvam Newsletter</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        New harvest arrivals, seasonal boxes, and member offers.
                      </p>
                    </div>
                    <button
                      onClick={handleNewsletterToggle}
                      disabled={newsletterSaving}
                      className={`shrink-0 px-4 py-2 text-[10px] tracked uppercase font-semibold border transition-colors disabled:opacity-50 ${
                        newsletter.subscribed
                          ? "border-clay text-clay hover:bg-cream/60"
                          : "border-border text-muted-foreground hover:border-clay hover:text-clay"
                      }`}
                    >
                      {newsletterSaving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : newsletter.subscribed ? (
                        "Subscribed"
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Sign out */}
              <div className="pt-6 border-t border-border/60">
                <button
                  onClick={handleSignOut}
                  className="text-xs text-muted-foreground hover:text-clay underline uppercase tracked"
                >
                  Sign Out of Account
                </button>
              </div>

              {/* Danger zone */}
              <div className="pt-6 border-t border-border space-y-3">
                <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Delete Account
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  This permanently removes your profile and saved addresses. Past orders are kept for
                  our accounting and delivery records. This cannot be undone.
                </p>
                <div>
                  <label className={labelClass}>Type DELETE to confirm</label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full max-w-[200px] px-3 py-2.5 text-xs border border-border focus:border-red-500 outline-none bg-transparent"
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deletingAccount}
                  className="inline-flex items-center gap-2 border border-red-300 text-red-700 px-5 py-2.5 text-[10px] tracked uppercase font-semibold hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deletingAccount ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
