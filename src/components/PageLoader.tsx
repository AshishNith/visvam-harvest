import { useEffect, useState } from "react";
import visvamLogo from "@/assets/visvam-logo-dark.png";

export function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(35), 100);
    const timer2 = setTimeout(() => setProgress(70), 300);
    const timer3 = setTimeout(() => setProgress(100), 600);

    const fadeTimer = setTimeout(() => setIsVisible(false), 950);
    const removeTimer = setTimeout(() => setShouldRender(false), 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#FAF5EE] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
      }`}
    >
      {/* Animated Image Logo Only */}
      <div className="relative flex flex-col items-center justify-center space-y-8">
        <div className="w-32 sm:w-44 aspect-square flex items-center justify-center">
          <img
            src={visvamLogo}
            alt="Viśvam Logo"
            className="w-full h-full object-contain drop-shadow-sm transition-all duration-1000 ease-out animate-reveal-up scale-100 hover:scale-105"
          />
        </div>

        {/* Minimal Progress Line Under Logo */}
        <div className="w-36 sm:w-48 h-[2px] bg-sand/60 overflow-hidden relative rounded-full">
          <div
            className="h-full bg-clay transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function RoutePendingLoader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-sand/50 overflow-hidden">
      <div className="h-full bg-clay animate-pulse w-full origin-left transition-all duration-300" />
    </div>
  );
}
