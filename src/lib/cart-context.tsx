import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

export type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
};

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (p: Product, openDrawer?: boolean) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
  shippingAddress: ShippingAddress;
  setShippingAddress: (addr: ShippingAddress) => void;
};

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

const CART_STORAGE_KEY = "visvam_cart_items";
const ADDRESS_STORAGE_KEY = "visvam_shipping_address";

function sanitizeCartItem(item: any): CartItem | null {
  if (!item) return null;
  // If item itself is a product (old storage format), wrap it
  if (item.slug && item.name && typeof item.price === "number") {
    return {
      product: {
        slug: item.slug,
        name: item.name,
        tagline: item.tagline || "",
        price: item.price || 0,
        category: item.category || "nuts",
        images: Array.isArray(item.images) ? item.images : [],
        description: item.description || "",
        serving: item.serving || "",
        origin: item.origin || "",
      },
      qty: typeof item.qty === "number" && item.qty > 0 ? item.qty : 1,
    };
  }
  // Modern format: { product: {...}, qty: 1 }
  if (item.product && typeof item.product === "object" && item.product.slug) {
    return {
      product: {
        ...item.product,
        images: Array.isArray(item.product.images) ? item.product.images : [],
        price: typeof item.product.price === "number" ? item.product.price : 0,
      },
      qty: typeof item.qty === "number" && item.qty > 0 ? item.qty : 1,
    };
  }
  return null;
}

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeCartItem)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore quota errors */ }
}

function loadAddressFromStorage(): ShippingAddress {
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (!raw) return EMPTY_ADDRESS;
    return { ...EMPTY_ADDRESS, ...JSON.parse(raw) };
  } catch {
    return EMPTY_ADDRESS;
  }
}

function saveAddressToStorage(addr: ShippingAddress) {
  try {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addr));
  } catch { /* ignore */ }
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isOpen, setIsOpen] = useState(false);
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress>(() => loadAddressFromStorage());

  // Persist cart items whenever they change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const setShippingAddress = useCallback((addr: ShippingAddress) => {
    setShippingAddressState(addr);
    saveAddressToStorage(addr);
  }, []);

  const add = useCallback((p: Product, openDrawer = false) => {
    if (!p || !p.slug) return;
    const sanitizedProduct: Product = {
      ...p,
      price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [""],
    };

    setItems((prev) => {
      const validPrev = prev.filter((i) => i && i.product && i.product.slug);
      const existing = validPrev.find((i) => i.product.slug === sanitizedProduct.slug);
      if (existing) {
        return validPrev.map((i) =>
          i.product.slug === sanitizedProduct.slug ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...validPrev, { product: sanitizedProduct, qty: 1 }];
    });

    if (sanitizedProduct.name) {
      toast.success(`Added ${sanitizedProduct.name} to harvest bag`);
    }
    if (openDrawer) {
      setIsOpen(true);
    }
  }, []);

  const remove = useCallback(
    (slug: string) =>
      setItems((p) => p.filter((i) => i && i.product && i.product.slug !== slug)),
    []
  );

  const setQty = useCallback((slug: string, qty: number) => {
    if (qty <= 0) {
      return setItems((p) => p.filter((i) => i && i.product && i.product.slug !== slug));
    }
    setItems((p) =>
      p.map((i) => (i && i.product && i.product.slug === slug ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const subtotal = items.reduce((s, i) => s + (i?.product?.price || 0) * (i?.qty || 0), 0);
  const count = items.reduce((s, i) => s + (i?.qty || 0), 0);

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
        clearCart,
        subtotal,
        count,
        shippingAddress,
        setShippingAddress,
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
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
