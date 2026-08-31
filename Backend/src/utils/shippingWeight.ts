/**
 * Derives a parcel weight for a Shiprocket rate lookup.
 *
 * Products carry no weight field — the only weight we have is the text in a
 * variant title ("250g", "Extra Bold · 500g") with the `serving` string
 * ("500g Pouch") as a fallback. Mirrored on the storefront in
 * src/lib/shipping-weight.ts; the two MUST stay in step, because a different
 * weight means Shiprocket quotes a different rate and the price the customer
 * was shown stops matching the price they are charged.
 */

/** Fallback when nothing in an item's text looks like a weight. */
export const DEFAULT_ITEM_WEIGHT_KG = 0.5;

/**
 * Added once per order for the box, filler and labels. Shiprocket bills on
 * shipped weight, which is always more than the contents weigh, so this errs
 * high rather than under-quoting on every order.
 */
export const PACKAGING_ALLOWANCE_KG = 0.15;

/** Pulls a weight out of free text: "250g", "Long · 500g", "1kg", "1.5 kg". */
export function parseWeightKg(text?: string | null): number | undefined {
  if (!text) return undefined;
  const match = String(text).match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
  if (!match) return undefined;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return match[2].toLowerCase() === "kg" ? value : value / 1000;
}

export type WeighableItem = {
  qty?: number;
  variantTitle?: string;
  serving?: string;
  name?: string;
};

/** Total shipped weight for a set of line items, packaging included. */
export function orderWeightKg(items: WeighableItem[]): number {
  const contents = items.reduce((total, item) => {
    const perUnit =
      parseWeightKg(item.variantTitle) ??
      parseWeightKg(item.serving) ??
      parseWeightKg(item.name) ??
      DEFAULT_ITEM_WEIGHT_KG;
    return total + perUnit * Math.max(1, Number(item.qty) || 1);
  }, 0);

  // Shiprocket rejects a zero/absent weight, so never return less than the
  // allowance itself.
  return Math.round((contents + PACKAGING_ALLOWANCE_KG) * 1000) / 1000;
}
