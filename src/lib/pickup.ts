// Warehouse self-pickup: customers in Delhi NCR can collect an order in person
// from the Sector 63, Noida unit instead of having it shipped. No courier, no
// delivery charge. Mirrored server-side in Backend/src/config/pickup.ts — keep
// the address and the NCR check in sync across both.

export const WAREHOUSE = {
  name: "Viśvam Warehouse — Sector 63",
  lines: ["F-329, 2nd floor, Sector 63", "Noida, Uttar Pradesh 201309"],
  pincode: "201309",
  phone: "+91 9217870974",
  hours: "Mon – Sat, 9:30 AM – 6:00 PM IST",
  // "Get directions" — opens the location in Google Maps.
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("F-329, 2nd floor, Sector 63, Noida, 201309"),
  /** Roughly how long after ordering a pickup order is packed and ready. */
  readyNote: "Your order is packed within 10–15 minutes — collect any time during opening hours.",
} as const;

/** Full single-line address, e.g. for order records and emails. */
export const WAREHOUSE_ADDRESS_LINE = WAREHOUSE.lines.join(", ");

// Delhi NCR, by the first three digits of the PIN code. The National Capital
// Region spans Delhi plus neighbouring districts of Haryana, Uttar Pradesh and
// Rajasthan; every prefix below is a whole postal range that sits inside one of
// those districts, so a 6-digit PIN starting with it is in NCR.
//
// Deliberately a little generous at the edges (Panipat, Alwar…) — a false
// positive only offers pickup to someone who is unlikely to want it and can
// simply not choose it. Keep in exact sync with Backend/src/config/pickup.ts.
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

/** True when a city name is a known NCR town. A softer fallback for the PIN check. */
export function isNcrCity(city: string): boolean {
  return NCR_CITIES.has(String(city || "").trim().toLowerCase());
}

/**
 * Pickup is offered to Delhi NCR customers. A complete 6-digit PIN is the
 * precise locator, so it is trusted on its own — a stray NCR city name typed
 * next to an out-of-region PIN must not unlock pickup. The city is only a
 * fallback for the moment before a PIN has been entered.
 */
export function isPickupEligible(opts: { pincode?: string; city?: string }): boolean {
  const pin = String(opts.pincode || "").replace(/\D/g, "");
  if (pin.length === 6) return isNcrPincode(pin);
  return isNcrCity(opts.city || "");
}
