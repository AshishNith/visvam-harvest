import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchPincodesForCity, type PincodeOption } from "@/lib/pincode-lookup";

type Props = {
  city: string;
  state?: string;
  pincode: string;
  onPincodeChange: (pincode: string) => void;
  inputClass: string;
  labelClass: string;
  required?: boolean;
};

/**
 * PIN code input that fills itself from the chosen city.
 *
 * Most Indian cities cover many PIN codes, and the PIN decides both the
 * delivery charge and where the parcel goes — so this only fills automatically
 * when the city has exactly one. Otherwise it offers that city's PIN codes as a
 * one-tap list instead of guessing. Typing a PIN directly always works.
 */
export function PincodeField({
  city,
  state,
  pincode,
  onPincodeChange,
  inputClass,
  labelClass,
  required,
}: Props) {
  const [options, setOptions] = useState<PincodeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Tracks the city we last auto-filled for, so re-renders don't overwrite a
  // PIN the customer has since corrected by hand.
  const autofilledFor = useRef<string | null>(null);

  useEffect(() => {
    const name = city.trim();
    if (name.length < 3) {
      setOptions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchPincodesForCity(name, state)
      .then((found) => {
        if (cancelled) return;
        setOptions(found);

        const key = `${name.toLowerCase()}|${(state || "").toLowerCase()}`;
        if (autofilledFor.current === key) return;
        autofilledFor.current = key;

        if (found.length === 1) {
          // Unambiguous — fill it.
          onPincodeChange(found[0].pincode);
        } else if (found.length > 1 && !pincode) {
          // Ambiguous and nothing entered yet: show the choices rather than
          // picking one, since a wrong PIN misprices and misdelivers.
          setOpen(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Deliberately keyed on the city/state only — re-running when `pincode`
    // changes would re-open the list on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, state]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const visible = pincode
    ? options.filter((o) => o.pincode.startsWith(pincode))
    : options;

  return (
    <div>
      <label className={labelClass}>PIN Code {required && "*"}</label>
      <div className="relative" ref={wrapperRef}>
        <input
          type="text"
          inputMode="numeric"
          value={pincode}
          onChange={(e) => {
            onPincodeChange(e.target.value.replace(/\D/g, "").slice(0, 6));
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? "Looking up…" : "6-digit PIN"}
          maxLength={6}
          className={inputClass}
          required={required}
          autoComplete="postal-code"
        />

        {loading && (
          <Loader2
            size={13}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-clay animate-spin pointer-events-none"
          />
        )}

        {open && !loading && visible.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-background border border-border shadow-lg">
            {visible.length > 1 && (
              <li className="px-3 py-1.5 text-[9px] tracked uppercase text-muted-foreground border-b border-border/60">
                {visible.length} PIN codes in {city}
              </li>
            )}
            {visible.map((option) => (
              <li key={option.pincode}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onPincodeChange(option.pincode);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-cream/60 flex items-baseline gap-2"
                >
                  <span className="font-medium tabular-nums">{option.pincode}</span>
                  {option.area && (
                    <span className="text-[10px] text-muted-foreground truncate">{option.area}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
