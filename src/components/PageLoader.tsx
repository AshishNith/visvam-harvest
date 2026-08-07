import { useEffect, useState } from "react";
import logoEmblem from "@/assets/Visvam Logo.png";
import logoWordmark from "@/assets/Visvam Logo_Wordmark.png";

export function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(35), 80);
    const timer2 = setTimeout(() => setProgress(70), 220);
    const timer3 = setTimeout(() => setProgress(100), 450);

    const slideTimer = setTimeout(() => {
      setIsSlidingUp(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("preloaderDone"));
      }
    }, 700);

    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(slideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#FAF5EE] flex flex-col items-center justify-center transition-transform duration-800 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isSlidingUp ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center space-y-6 max-w-xs px-4">
        {/* Emblem Logo with smooth scale & reveal animation */}
        <div className="w-20 sm:w-28 aspect-square flex items-center justify-center animate-reveal-up">
          <img
            src={logoEmblem}
            alt="Viśvam Emblem"
            className="w-full h-full object-contain drop-shadow-xs transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Wordmark Logo with delayed fade-up slide animation */}
        <div className="animate-fade-up [animation-delay:200ms]">
          <img
            src={logoWordmark}
            alt="Viśvam Wordmark"
            className="h-6 sm:h-8 w-auto object-contain opacity-90"
          />
        </div>

        {/* Minimal 1.5px warm clay progress track */}
        <div className="w-32 sm:w-44 h-[1.5px] bg-sand/60 overflow-hidden relative rounded-full mt-2">
          <div
            className="h-full bg-clay transition-all duration-300 ease-out rounded-full"
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
