import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

export const LANES = [
  { id: "riverside", name: "Riverside Lane", detail: "1420 Kestrel Rd · open till 11pm" },
  { id: "northgate", name: "Northgate Lane", detail: "88 Northgate Pkwy · open 24h" },
  { id: "millyard", name: "Mill Yard Lane", detail: "9 Mill Yard · open till 10pm" },
] as const;

export const PICKUP_SLOTS = ["ASAP", "In 15 min", "In 30 min", "In 1 hour"] as const;

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (p: Product) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  subtotal: number;
  count: number;
  lane: string;
  setLane: (id: string) => void;
  slot: string;
  setSlot: (s: string) => void;
  prepMinutes: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lane, setLane] = useState<string>(LANES[0].id);
  const [slot, setSlot] = useState<string>(PICKUP_SLOTS[0]);

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === p.slug);
      if (existing)
        return prev.map((i) =>
          i.product.slug === p.slug ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { product: p, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback(
    (slug: string) => setItems((p) => p.filter((i) => i.product.slug !== slug)),
    [],
  );
  const setQty = useCallback((slug: string, qty: number) => {
    if (qty <= 0) return setItems((p) => p.filter((i) => i.product.slug !== slug));
    setItems((p) => p.map((i) => (i.product.slug === slug ? { ...i, qty } : i)));
  }, []);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const prepMinutes = items.reduce((m, i) => Math.max(m, i.product.prepMinutes || 0), 0);

  return (
    <Ctx.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        add,
        remove,
        setQty,
        subtotal,
        count,
        lane,
        setLane,
        slot,
        setSlot,
        prepMinutes,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
