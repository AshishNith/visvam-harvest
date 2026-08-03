import { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-context";
import { products } from "@/lib/products";

const FREE_SHIPPING_THRESHOLD = 50;
const FREE_GIFT_THRESHOLD = 100;

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    subtotal,
    setQty,
    remove,
    add,
  } = useCart();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const target = subtotal >= FREE_SHIPPING_THRESHOLD ? FREE_GIFT_THRESHOLD : FREE_SHIPPING_THRESHOLD;
  const targetLabel =
    subtotal >= FREE_SHIPPING_THRESHOLD ? "a complimentary 7-in-1 Superseeds pouch" : "free express courier shipping";
  const remaining = Math.max(0, target - subtotal);
  const progress = Math.min(100, (subtotal / target) * 100);
  const reached = remaining === 0;

  const suggestions = products
    .filter((p) => !items.find((i) => i.product.slug === p.slug))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Close harvest bag"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-overlay-in"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[470px] bg-background flex flex-col animate-drawer-in shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-cream/30">
          <h3 className="text-[11px] tracked font-semibold uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag size={14} className="text-clay" /> Harvest Bag ({items.length})
          </h3>
          <button
            onClick={closeCart}
            aria-label="Close"
            className="size-8 grid place-items-center hover:rotate-90 transition-transform duration-300"
          >
            <X size={18} strokeWidth={1.25} />
          </button>
        </div>

        <div className="p-5 bg-sand/40 border-b border-border">
          <p className="text-[10.5px] tracked mb-2.5 flex items-center gap-2">
            <Truck size={13} className="text-clay" />
            {reached ? (
              <span className="font-semibold text-clay">Unlocked — {targetLabel}</span>
            ) : (
              <>
                Add <span className="font-semibold">{formatPrice(remaining)}</span> more for {targetLabel}
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
              {items.map(({ product, qty }) => (
                <li key={product.slug} className="flex gap-5">
                  <img
                    src={product.images[0]}
                    alt={product.name}
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
                          onClick={() => setQty(product.slug, qty - 1)}
                          className="px-2.5 py-1.5 hover:bg-cream"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} strokeWidth={1.5} />
                        </button>
                        <span className="px-3 text-xs tabular-nums font-medium">{qty}</span>
                        <button
                          onClick={() => setQty(product.slug, qty + 1)}
                          className="px-2.5 py-1.5 hover:bg-cream"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatPrice(product.price * qty)}</p>
                        <button
                          onClick={() => remove(product.slug)}
                          className="text-[9.5px] tracked text-muted-foreground underline mt-1 hover:text-clay transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
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
                      src={p.images[0]}
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
            disabled={items.length === 0}
            className="w-full bg-ink text-white py-4 text-[11px] tracked font-semibold uppercase tracking-widest hover:bg-clay transition-colors disabled:opacity-40"
          >
            Proceed to Secure Checkout
          </button>
          <p className="text-[9.5px] text-muted-foreground text-center tracking-wide">
            Nitrogen-flushed packaging · 100% Quality Guaranteed
          </p>
        </div>
      </aside>
    </div>
  );
}
