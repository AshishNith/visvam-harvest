/**
 * Indian mobile numbers as they're typed into delivery-address forms.
 *
 * These values end up on the order and are handed straight to Shiprocket,
 * which rejects anything that isn't a bare 10-digit number with
 * `422 Phone number is in invalid format` — no "+91", no spaces, no dashes.
 * That rejection used to be invisible, so keeping the stored value clean at
 * the source matters. Mirrored on the server by `toShiprocketPhone` in
 * Backend/src/services/shiprocketService.ts, which still normalises defensively
 * for addresses saved before this existed.
 */

/**
 * Strips a typed or pasted value down to the 10-digit local number, so
 * pasting "+91 98765 43210" leaves "9876543210".
 */
export function sanitizePhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** Indian mobile numbers are 10 digits starting 6–9. */
export function isValidIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(sanitizePhoneInput(value));
}
