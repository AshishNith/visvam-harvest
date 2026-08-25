import Fuse from "fuse.js";
import type { Product } from "./products";

// Typo-tolerant product search. threshold 0.4 forgives a couple of
// misspelled/transposed letters (e.g. "almnod" -> "almond") while still
// ranking closer matches first; name/tagline are weighted highest since
// that's what a shopper is usually thinking of when they type.
const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Product>>[1] = {
  keys: [
    { name: "name", weight: 0.45 },
    { name: "tagline", weight: 0.2 },
    { name: "category", weight: 0.15 },
    { name: "description", weight: 0.15 },
    { name: "badge", weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.trim();
  if (!q) return [];
  const fuse = new Fuse(products, FUSE_OPTIONS);
  return fuse.search(q).map((result) => result.item);
}
