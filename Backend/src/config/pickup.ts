// Warehouse self-pickup for Delhi NCR customers: collect an order in person
// from the Sector 63, Noida unit instead of having it shipped. No courier is
// booked, no delivery charge, and the order is never pushed to Shiprocket.
//
// Mirrored on the storefront in src/lib/pickup.ts — keep the address and the
// NCR check in sync across both. This module is the authority for what the
// server accepts and records.

export const WAREHOUSE = {
  name: "Viśvam Warehouse — Sector 63",
  addressLine: "F-329, 2nd floor, Sector 63, Noida, Uttar Pradesh 201309",
  city: "Noida",
  state: "Uttar Pradesh",
  pincode: "201309",
  phone: "+91 9217870974",
  hours: "Mon – Sat, 9:30 AM – 6:00 PM IST",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("F-329, 2nd floor, Sector 63, Noida, 201309"),
  readyNote:
    "Your order is packed within 10–15 minutes — collect any time during opening hours.",
} as const;

// Delhi NCR by the first three digits of the PIN code. Every prefix is a whole
// postal range inside an NCR district. Keep in exact sync with the storefront
// copy in src/lib/pickup.ts.
const NCR_PIN_PREFIXES = [
  "110", // Delhi (all)
  "121", // Faridabad, Palwal
  "122", // Gurugram
  "123", // Rewari, Nuh/Mewat, Mahendragarh
  "124", // Rohtak, Jhajjar, Bahadurgarh
  "127", // Bhiwani, Charkhi Dadri
  "131", // Sonipat
  "132", // Panipat, Karnal
  "201", // Ghaziabad, Noida, Greater Noida, Loni, Modinagar
  "203", // Bulandshahr, Dadri, Sikandrabad, Khurja
  "245", // Hapur, Garhmukteshwar, Pilkhuwa
  "250", // Meerut, Baghpat
  "251", // Muzaffarnagar
  "301", // Alwar
  "321", // Bharatpur
];

const NCR_CITIES = new Set(
  [
    "delhi", "new delhi", "noida", "greater noida", "ghaziabad", "faridabad",
    "gurugram", "gurgaon", "sonipat", "sonepat", "bahadurgarh", "rewari",
    "rohtak", "jhajjar", "meerut", "baghpat", "bagpat", "bulandshahr", "hapur",
    "palwal", "nuh", "mewat", "panipat", "alwar", "bharatpur", "muzaffarnagar",
    "shamli",
  ].map((c) => c.toLowerCase())
);

/** True when a 6-digit PIN code falls inside Delhi NCR. */
export function isNcrPincode(pincode: string): boolean {
  const pin = String(pincode || "").replace(/\D/g, "");
  if (pin.length !== 6) return false;
  return NCR_PIN_PREFIXES.some((prefix) => pin.startsWith(prefix));
}

/** True when a city name is a known NCR town. */
export function isNcrCity(city: string): boolean {
  return NCR_CITIES.has(String(city || "").trim().toLowerCase());
}

/**
 * Pickup is allowed for Delhi NCR customers. A complete 6-digit PIN is the
 * precise locator and is trusted on its own, so an out-of-region PIN can't be
 * overridden by a stray NCR city name. City is only a fallback when no full PIN
 * is present (it never is on the server path, which always sends the PIN).
 */
export function isPickupEligible(opts: { pincode?: string; city?: string }): boolean {
  const pin = String(opts.pincode || "").replace(/\D/g, "");
  if (pin.length === 6) return isNcrPincode(pin);
  return isNcrCity(opts.city || "");
}
