// Phone-only sign-ups used to land with the phone number stored as the account
// name, so every "Full Name" field prefilled with a number. The sync no longer
// does that, but accounts created before the fix still carry it — and the
// backend needs *some* name on the User document, so it falls back to a
// placeholder. Both cases mean "we don't actually know this person's name yet",
// which is what these helpers detect.

const PLACEHOLDER_NAMES = new Set([
  "viśvam member",
  "viśvam customer",
  "viśvam admin",
  "visvam member",
  "visvam customer",
  "visvam admin",
]);

/**
 * The account name to prefill a "Full Name" input with, or "" when what we have
 * on file isn't a real name (a phone number, or a system placeholder). Real
 * names don't contain digits, so any digit disqualifies the value.
 *
 * Display-only surfaces (the profile header, the checkout account chip) should
 * keep using `user.name` directly — they need to render *something*.
 */
export function prefillableName(name?: string | null): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "";
  if (/\d/.test(trimmed)) return "";
  if (PLACEHOLDER_NAMES.has(trimmed.toLowerCase())) return "";
  return trimmed;
}

/**
 * Strips characters that don't belong in a person's name, so a phone number
 * can't be typed or pasted into a name field.
 */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[\d+]/g, "");
}
