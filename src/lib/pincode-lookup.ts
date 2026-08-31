/**
 * PIN codes for a city, from India Post's public directory.
 *
 * A city is not one PIN code — Kochi has 16, Dehradun 8 — and the PIN now
 * decides both the delivery charge and where the parcel physically goes. So
 * this returns the whole list to offer the customer rather than letting the
 * form guess one on their behalf. Only a city with a single PIN is safe to
 * fill automatically.
 *
 * The endpoint sends `Access-Control-Allow-Origin: *`, so it is called straight
 * from the browser with no backend proxy.
 */

const ENDPOINT = "https://api.postalpincode.in/postoffice";

export type PincodeOption = {
  pincode: string;
  /** Post office name, e.g. "Rajpur Road" — helps tell nearby PINs apart. */
  area: string;
};

// Cities are re-selected constantly while a customer edits an address; cache
// per city+state at module scope so it is fetched once per page load.
const cache = new Map<string, PincodeOption[]>();

const norm = (value: unknown): string => String(value || "").trim().toLowerCase();

/**
 * Whether a directory field names this city. Accepts an exact match or the
 * city followed by a non-letter — "Leh (Ladakh)" and "Udaipur City" count,
 * "Lehangewala" does not.
 */
function belongsToCity(field: unknown, want: string): boolean {
  const value = norm(field);
  if (value === want) return true;
  return value.startsWith(want) && /[^a-z]/.test(value.charAt(want.length));
}

export async function fetchPincodesForCity(
  city: string,
  state?: string
): Promise<PincodeOption[]> {
  const name = city.trim();
  if (name.length < 3) return [];

  const key = `${name.toLowerCase()}|${(state || "").toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(name)}`);
    if (!res.ok) return [];

    const json = await res.json();
    const offices = Array.isArray(json) ? json[0]?.PostOffice : null;
    if (!Array.isArray(offices)) return [];

    const want = norm(name);

    // Some city names exist in more than one state (Udaipur is in both
    // Rajasthan and Tripura). When we know the state, drop the rest outright —
    // falling back to other states would offer a Haryana PIN to someone who
    // picked Tripura, which is worse than offering nothing.
    const inState = state ? offices.filter((o: any) => norm(o?.State) === norm(state)) : offices;

    // The endpoint substring-matches office names, so a search for "Leh"
    // returns "Lehangewala" and "Salehpur". Keep only offices that genuinely
    // belong to this city.
    const belonging = inState.filter((o: any) =>
      [o?.Name, o?.District, o?.Block, o?.Division, o?.Region].some((field) =>
        belongsToCity(field, want)
      )
    );

    // With a state in hand, no genuine match means no suggestion — never fall
    // back to the loose results.
    const usable = belonging.length > 0 ? belonging : state ? [] : inState;

    const seen = new Set<string>();
    const options: PincodeOption[] = [];
    for (const office of usable) {
      const pincode = String(office?.Pincode || "").replace(/\D/g, "");
      if (pincode.length !== 6 || seen.has(pincode)) continue;
      seen.add(pincode);
      options.push({ pincode, area: String(office?.Name || "").trim() });
    }

    options.sort((a, b) => a.pincode.localeCompare(b.pincode));
    cache.set(key, options);
    return options;
  } catch {
    // A lookup failure must never block checkout — the field stays typable.
    return [];
  }
}
