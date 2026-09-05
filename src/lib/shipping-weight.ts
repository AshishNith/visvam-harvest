/**
 * Derives a parcel weight for a Shiprocket rate lookup.
 *
 * Products carry no weight field — the only weight we have is the text in a
 * variant title ("250g", "Extra Bold · 500g") with the `serving` string
 * ("500g Pack") as a fallback. Mirrored on the server in
 * Backend/src/utils/shippingWeight.ts; the two MUST stay in step, because a
 * different weight means Shiprocket quotes a different rate and the price shown
 * here stops matching the price the server charges.
 */

import type { CartItem } from "./cart-context";

/** Fallback when nothing in an item's text looks like a weight. */
export const DEFAULT_ITEM_WEIGHT_KG = 0.5;

/** A real weight if one was entered in the catalogue, else undefined. */
function explicitWeightKg(raw: unknown): number | undefined {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Pulls a weight out of free text: "250g", "Long · 500g", "1kg", "1.5 kg". */
export function parseWeightKg(text?: string | null): number | undefined {
  if (!text) return undefined;
  const match = String(text).match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
  if (!match) return undefined;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return match[2].toLowerCase() === "kg" ? value : value / 1000;
}

/**
 * Total shipped weight for the cart.
 *
 * A pack's label ("500g") is its gross packed weight — the packaging itself
 * weighs next to nothing — so no packaging allowance is added on top.
 */
export function cartWeightKg(items: CartItem[]): number {
  const contents = items.reduce((total, item) => {
    const perUnit =
      explicitWeightKg(item.selectedVariant?.weightKg) ??
      explicitWeightKg(item.product?.weightKg) ??
      parseWeightKg(item.selectedVariant?.title) ??
      parseWeightKg(item.product?.serving) ??
      parseWeightKg(item.product?.name) ??
      DEFAULT_ITEM_WEIGHT_KG;
    return total + perUnit * Math.max(1, Number(item.qty) || 1);
  }, 0);

  // Shiprocket rejects a zero/absent weight, so an empty or wholly
  // unparseable cart still quotes on one default pack.
  return contents > 0 ? Math.round(contents * 1000) / 1000 : DEFAULT_ITEM_WEIGHT_KG;
}
