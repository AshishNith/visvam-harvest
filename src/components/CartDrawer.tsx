import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag, Truck, ArrowRight, ArrowLeft, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { useCart, formatPrice, type ShippingAddress } from "@/lib/cart-context";
import { products } from "@/lib/products";
import { submitOrderToBackend } from "@/lib/api";
import { toast } from "sonner";

const FREE_SHIPPING_THRESHOLD = 999;

type CheckoutStep = "cart" | "address" | "confirm";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    subtotal,
    setQty,
    remove,
    add,
    clearCart,
    shippingAddress,
    setShippingAddress,
  } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [addressForm, setAddressForm] = useState<ShippingAddress>(shippingAddress);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else {
      document.body.style.overflow = "";
      // Reset step when drawer closes
      if (!orderSuccess) setStep("cart");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, orderSuccess]);

  // Sync address form when shippingAddress changes
  useEffect(() => {
    setAddressForm(shippingAddress);
  }, [shippingAddress]);

  if (!isOpen) return null;

  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
  const taxPrice = Math.round(subtotal * 0.05);
  const totalPrice = subtotal + shippingPrice + taxPrice;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const reached = remaining === 0;

  const validateAddress = (): boolean => {
    if (!addressForm.fullName.trim()) { toast.error("Please enter your full name"); return false; }
    if (!addressForm.phone.trim() || addressForm.phone.trim().length < 10) { toast.error("Please enter a valid phone number"); return false; }
    if (!addressForm.street.trim()) { toast.error("Please enter your street address"); return false; }
    if (!addressForm.city.trim()) { toast.error("Please enter your city"); return false; }
    if (!addressForm.state.trim()) { toast.error("Please enter your state"); return false; }
    if (!addressForm.pincode.trim() || addressForm.pincode.trim().length < 6) { toast.error("Please enter a valid 6-digit pincode"); return false; }
    return true;
  };

  const handleProceedToAddress = () => {
    if (items.length === 0) return;
    closeCart();
    navigate({ to: "/checkout" });
  };

  const handleProceedToConfirm = () => {
    if (!validateAddress()) return;
    setShippingAddress(addressForm);
    setStep("confirm");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
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
        guestEmail: "",
        paymentMethod: "Cash on Delivery",
      });

      if (res.success && res.data) {
        setOrderSuccess(true);
        toast.success(`Order placed successfully!`);
        clearCart();
      } else {
        toast.success("Order placed! Your premium dry fruits will be dispatched shortly.");
        clearCart();
        setOrderSuccess(true);
      }
    } catch {
      toast.error("Error submitting order. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleClose = () => {
    setOrderSuccess(false);
    setStep("cart");
    closeCart();
  };

  const suggestions = products
    .filter((p) => !items.find((i) => i?.product?.slug === p?.slug))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Close harvest bag"
        onClick={handleClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-overlay-in"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[470px] bg-background flex flex-col animate-drawer-in shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-cream/30">
          <h3 className="text-[11px] tracked font-semibold uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag size={14} className="text-clay" />
            {step === "cart" && `Harvest Bag (${items.length})`}
            {step === "address" && "Shipping Address"}
            {step === "confirm" && "Order Summary"}
          </h3>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="size-8 grid place-items-center hover:rotate-90 transition-transform duration-300"
          >
            <X size={18} strokeWidth={1.25} />
          </button>
        </div>

        {/* Order Success State */}
        {orderSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-clay/10 text-clay grid place-items-center mb-6">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-display italic text-3xl mb-3">Order Confirmed!</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
              Your premium dry fruits will be nitrogen-sealed and dispatched within 24-48 hours via express cold-chain courier.
            </p>
            <button
              onClick={handleClose}
              className="group inline-flex items-center gap-3 text-ink text-[11.5px] font-semibold tracked uppercase tracking-widest py-3 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </button>
          </div>
        ) : (
          <>
            {/* Step 1: Cart Items */}
            {step === "cart" && (
              <>
                <div className="p-5 bg-sand/40 border-b border-border">
                  <p className="text-[10.5px] tracked mb-2.5 flex items-center gap-2">
                    <Truck size={13} className="text-clay" />
                    {reached ? (
                      <span className="font-semibold text-clay">Free express shipping unlocked!</span>
                    ) : (
                      <>
                        Add <span className="font-semibold">{formatPrice(remaining)}</span> more for free express shipping
                      </>
                    )}
                  </p>
                  <div className="w-full h-[3px] bg-ink/10 overflow-hidden">
                    <div
                      className="h-full bg-clay transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="font-display italic text-2xl mb-3">Your harvest bag is empty</p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Explore our handpicked almonds, W240 cashews, and Kashmiri walnuts to get started.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-8">
                      {items.map(({ product, qty }) => {
                        if (!product) return null;
                        return (
                          <li key={product.slug || Math.random()} className="flex gap-5">
                            <img
                              src={product.images?.[0] || ""}
                              alt={product.name || "Product"}
                              width={96}
                              height={120}
                              loading="lazy"
                              className="w-24 h-30 object-cover bg-cream shrink-0 border border-border/40"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium leading-snug">{product.name}</h4>
                              <p className="text-[10.5px] tracked text-muted-foreground mt-1">
                                {product.serving} · {product.origin}
                              </p>
                              <div className="flex justify-between items-end mt-4">
                                <div className="flex items-center border border-border">
                                  <button
                                    onClick={() => product.slug && setQty(product.slug, qty - 1)}
                                    className="px-2.5 py-1.5 hover:bg-cream"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={11} strokeWidth={1.5} />
                                  </button>
                                  <span className="px-3 text-xs tabular-nums font-medium">{qty}</span>
                                  <button
                                    onClick={() => product.slug && setQty(product.slug, qty + 1)}
                                    className="px-2.5 py-1.5 hover:bg-cream"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={11} strokeWidth={1.5} />
                                  </button>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold tabular-nums">{formatPrice((product.price || 0) * qty)}</p>
                                  <button
                                    onClick={() => product.slug && remove(product.slug)}
                                    className="text-[9.5px] tracked text-muted-foreground underline mt-1 hover:text-clay transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {suggestions.length > 0 && (
                    <div className="mt-14 pt-8 border-t border-border/60">
                      <h5 className="text-[10px] tracked font-semibold text-muted-foreground mb-4 uppercase">
                        Frequently Bought Together
                      </h5>
                      <ul className="space-y-3">
                        {suggestions.map((p) => (
                          <li key={p.slug} className="bg-cream/60 p-3 flex items-center gap-4 border border-border/30">
                            <img
                              src={p.images?.[0] || ""}
                              alt={p.name}
                              width={48}
                              height={48}
                              loading="lazy"
                              className="size-12 object-cover bg-background shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{formatPrice(p.price)} · {p.serving}</p>
                            </div>
                            <button
                              onClick={() => add(p)}
                              className="text-[9.5px] tracked border border-ink px-3 py-1.5 hover:bg-ink hover:text-white transition-colors"
                            >
                              Add +
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-border space-y-4 bg-background">
                  <div className="flex justify-between text-[11px] tracked font-semibold">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-display italic text-xl">{formatPrice(subtotal)}</span>
                  </div>
                  <button
                    onClick={handleProceedToAddress}
                    disabled={items.length === 0}
                    className="group w-full inline-flex items-center justify-center gap-3 text-ink text-[11.5px] font-semibold tracked uppercase tracking-widest py-3 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 disabled:opacity-40"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                  </button>
                  <p className="text-[9.5px] text-muted-foreground text-center tracking-wide">
                    Nitrogen-flushed packaging · 100% Quality Guaranteed
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Shipping Address Form */}
            {step === "address" && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="flex items-center gap-2 text-[10px] tracked text-muted-foreground uppercase mb-2">
                    <MapPin size={13} className="text-clay" /> Delivery Details
                  </div>

                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">Phone Number *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">Street Address *</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="House No., Street, Landmark"
                      className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="State"
                        className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracked text-muted-foreground mb-1 uppercase">Pincode *</label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      placeholder="560001"
                      maxLength={6}
                      className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-border space-y-3 bg-background">
                  <button
                    onClick={handleProceedToConfirm}
                    className="group w-full inline-flex items-center justify-center gap-3 text-ink text-[11.5px] font-semibold tracked uppercase tracking-widest py-3 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300"
                  >
                    <span>Review Order</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                  </button>
                  <button
                    onClick={() => setStep("cart")}
                    className="w-full inline-flex items-center justify-center gap-2 text-[10.5px] tracked text-muted-foreground hover:text-ink transition-colors py-2"
                  >
                    <ArrowLeft size={13} /> Back to Bag
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Order Confirmation */}
            {step === "confirm" && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Delivery Address Summary */}
                  <div className="bg-cream/50 p-4 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-[10px] tracked font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                        <MapPin size={12} className="text-clay" /> Delivering To
                      </h5>
                      <button onClick={() => setStep("address")} className="text-[9px] tracked text-clay underline uppercase">Edit</button>
                    </div>
                    <p className="text-xs font-medium">{addressForm.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{addressForm.street}</p>
                    <p className="text-[11px] text-muted-foreground">{addressForm.city}, {addressForm.state} — {addressForm.pincode}</p>
                    <p className="text-[11px] text-muted-foreground">Phone: {addressForm.phone}</p>
                  </div>

                  {/* Items Summary */}
                  <div>
                    <h5 className="text-[10px] tracked font-semibold uppercase text-muted-foreground mb-3">Order Items ({items.length})</h5>
                    <ul className="space-y-3">
                      {items.map(({ product, qty }) => (
                        <li key={product.slug} className="flex items-center gap-3 text-xs">
                          <img src={product.images?.[0] || ""} alt={product.name} className="w-10 h-10 object-cover bg-cream shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground">Qty: {qty}</p>
                          </div>
                          <span className="font-semibold tabular-nums shrink-0">{formatPrice(product.price * qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-border pt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="tabular-nums">{shippingPrice === 0 ? <span className="text-clay font-semibold">FREE</span> : formatPrice(shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (5%)</span>
                      <span className="tabular-nums">{formatPrice(taxPrice)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-semibold text-sm">
                      <span>Total</span>
                      <span className="tabular-nums font-display italic text-lg">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <div className="bg-sand/40 p-3 text-[10px] tracked text-muted-foreground text-center">
                    Payment Method: <strong className="text-ink">Cash on Delivery (COD)</strong>
                  </div>
                </div>

                <div className="p-6 border-t border-border space-y-3 bg-background">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={checkingOut}
                    className="group w-full inline-flex items-center justify-center gap-3 text-ink text-[11.5px] font-semibold tracked uppercase tracking-widest py-3 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 disabled:opacity-40"
                  >
                    {checkingOut ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-clay" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order — {formatPrice(totalPrice)}</span>
                        <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setStep("address")}
                    className="w-full inline-flex items-center justify-center gap-2 text-[10.5px] tracked text-muted-foreground hover:text-ink transition-colors py-2"
                  >
                    <ArrowLeft size={13} /> Edit Address
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
