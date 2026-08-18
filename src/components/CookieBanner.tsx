import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, ShieldCheck, Settings } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
}

const STORAGE_KEY = "visvam_cookie_consent_v1";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (!savedConsent) {
      // Show banner after short delay for smooth fade-in
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(savedConsent));
      } catch (e) {
        setIsVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    // Listen for custom event triggered from footer "Cookie Settings" link
    const handleOpenSettings = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };
    window.addEventListener("visvam-open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("visvam-open-cookie-settings", handleOpenSettings);
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    setPreferences(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, advertising: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ necessary: true, analytics: false, advertising: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-cream/95 backdrop-blur-md border border-ink/10 rounded-2xl shadow-2xl p-6 text-ink">
        {!showPreferences ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-clay" />
                <h4 className="font-display italic text-lg font-semibold text-ink">We use cookies</h4>
              </div>
              <button
                onClick={handleRejectNonEssential}
                aria-label="Close cookie banner"
                className="text-muted-foreground hover:text-ink transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-5">
              We use cookies to run this site, understand how it&apos;s used, and — with your permission — to measure our advertising on Meta and elsewhere. You can accept all, reject non-essential, or choose what you&apos;re comfortable with.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 text-[11px] font-medium uppercase tracking-wider">
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2.5 px-4 bg-ink text-cream rounded-lg hover:bg-ink/90 transition text-center font-semibold"
              >
                Accept all
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 py-2.5 px-4 bg-background border border-border text-foreground rounded-lg hover:bg-cream transition text-center font-medium"
              >
                Reject non-essential
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="py-2.5 px-3 border border-border/60 text-muted-foreground rounded-lg hover:text-ink hover:border-ink transition text-center flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Preferences</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <Link to="/cookies" className="text-[10px] text-muted-foreground hover:text-clay underline">
                Read Cookie Notice
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
              <h4 className="font-display italic text-lg font-semibold text-ink">Manage Cookie Preferences</h4>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-xs text-muted-foreground hover:text-ink underline"
              >
                Back
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary */}
              <div className="flex items-start justify-between gap-4 p-3 bg-background/60 rounded-lg border border-border/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-ink">Strictly Necessary</span>
                    <span className="text-[9px] bg-clay/10 text-clay px-2 py-0.5 rounded font-mono uppercase">Always On</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Needed for the site and checkout to work securely.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 p-3 bg-background/60 rounded-lg border border-border/40">
                <div>
                  <span className="font-semibold text-xs text-ink">Analytics Cookies</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Helps us understand site usage and page traffic patterns.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-clay"></div>
                </label>
              </div>

              {/* Advertising */}
              <div className="flex items-start justify-between gap-4 p-3 bg-background/60 rounded-lg border border-border/40">
                <div>
                  <span className="font-semibold text-xs text-ink">Advertising & Meta Pixel</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Enables Meta Pixel to measure ad campaign performance on Meta.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={preferences.advertising}
                    onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-clay"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-2 text-[11px] font-medium uppercase tracking-wider">
              <button
                onClick={handleSavePreferences}
                className="flex-1 py-2.5 px-4 bg-ink text-cream rounded-lg hover:bg-ink/90 transition text-center font-semibold"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
