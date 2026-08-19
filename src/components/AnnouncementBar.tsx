import { useState } from "react";
import { Sparkles, PhoneCall, X, ShieldCheck } from "lucide-react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-ink text-cream text-[10.5px] py-2 px-4 border-b border-border/20 transition-all relative overflow-hidden z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="hidden md:flex items-center gap-2 text-ember font-medium tracked text-[9.5px]">
          <ShieldCheck size={13} className="text-clay shrink-0" />
          <span>Single-Origin Sourced</span>
        </div>

        {/* Center Ticker / Message */}
        <div className="flex-1 flex items-center justify-center gap-2 text-center text-[10px] sm:text-[10.5px] font-sans font-normal tracking-wide text-sand/90">
          <Sparkles size={12} className="text-ember shrink-0 hidden sm:inline" />
          <span>
            Complimentary Express Shipping on orders over <strong className="text-white font-medium">₹3,499</strong> — Code:{" "}
            <span className="bg-clay/40 px-1.5 py-0.5 text-white font-mono text-[10px] tracking-widest border border-clay/60">
              ROYAL10
            </span>
          </span>
        </div>

        {/* Right Contact / Dismiss */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="tel:+15550192834"
            className="hidden lg:flex items-center gap-1.5 text-sand/80 hover:text-white transition-colors text-[10px]"
          >
            <PhoneCall size={11} className="text-ember" />
            +1 (555) 019-2834
          </a>

          <button
            onClick={() => setIsVisible(false)}
            className="text-sand/60 hover:text-white p-0.5 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
