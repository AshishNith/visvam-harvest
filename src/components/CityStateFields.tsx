import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { INDIAN_STATES, citiesForState, stateForCity } from "@/lib/india-locations";

type Props = {
  city: string;
  state: string;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  /** Matches the surrounding form's input styling. */
  inputClass: string;
  labelClass: string;
  required?: boolean;
};

const MAX_SUGGESTIONS = 8;

/**
 * The City + State pair for every address form.
 *
 * State is a real <select> over the closed list of states/UTs — there is no
 * valid delivery address outside it. City is a combobox: it suggests cities
 * (narrowed to the chosen state) but still accepts a typed value, because the
 * bundled list can't cover every Indian town and a hard restriction would
 * block real orders.
 */
export function CityStateFields({
  city,
  state,
  onCityChange,
  onStateChange,
  inputClass,
  labelClass,
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const pool = citiesForState(state);
    const query = city.trim().toLowerCase();
    if (!query) return pool.slice(0, MAX_SUGGESTIONS);

    // Prefix matches first — typing "Ban" should surface Bangalore before Alibag.
    const prefix = pool.filter((c) => c.toLowerCase().startsWith(query));
    const contains = pool.filter(
      (c) => !c.toLowerCase().startsWith(query) && c.toLowerCase().includes(query)
    );
    return [...prefix, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [city, state]);

  // Close the list when focus or a click lands outside the field.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [city, state]);

  // Addresses saved while State was a free-text field can hold a value that
  // isn't an exact match for anything in the list ("Delhi NCR", "M.P."). A
  // <select> silently shows nothing for an unmatched value, which would wipe
  // the saved state on the next save — so keep it as an option of its own.
  const stateOptions = useMemo(() => {
    const known: readonly string[] = INDIAN_STATES;
    return state && !known.includes(state) ? [state, ...known] : known;
  }, [state]);

  const selectCity = (value: string) => {
    onCityChange(value);
    // Picking a city from the list is enough to know the state in almost every
    // case — fill it in rather than making the customer pick it twice.
    if (!state) {
      const inferred = stateForCity(value);
      if (inferred) onStateChange(inferred);
    }
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      // Takes the highlighted suggestion and closes the list; a second Enter
      // then submits. A city that matches nothing leaves `suggestions` empty,
      // so Enter falls through to the form as usual.
      e.preventDefault();
      selectCity(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      <div>
        <label className={labelClass}>City {required && "*"}</label>
        <div className="relative" ref={wrapperRef}>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              onCityChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Start typing…"
            className={inputClass}
            required={required}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            autoComplete="off"
          />

          {open && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-background border border-border shadow-lg"
            >
              {suggestions.map((suggestion, i) => (
                <li key={suggestion} role="option" aria-selected={i === highlighted}>
                  <button
                    type="button"
                    // mousedown fires before the input's blur, so the click isn't
                    // swallowed by the list closing first.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectCity(suggestion);
                    }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      i === highlighted ? "bg-cream text-ink" : "hover:bg-cream/60"
                    }`}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>State {required && "*"}</label>
        <div className="relative">
          <select
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className={`${inputClass} appearance-none pr-7 cursor-pointer ${state ? "" : "text-muted-foreground"}`}
            required={required}
          >
            <option value="">Select state</option>
            {stateOptions.map((s) => (
              <option key={s} value={s} className="text-ink">
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
      </div>
    </>
  );
}
