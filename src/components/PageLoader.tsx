import { useEffect, useState } from "react";

export function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(35), 80);
    const timer2 = setTimeout(() => setProgress(70), 220);
    const timer3 = setTimeout(() => setProgress(100), 450);

    const fadeTimer = setTimeout(() => setIsVisible(false), 700);
    const removeTimer = setTimeout(() => setShouldRender(false), 1200);

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
      className={`fixed inset-0 z-[100] bg-[#FDFAF5] flex flex-col justify-between p-8 sm:p-16 transition-opacity duration-700 ease-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Top Header Label */}
      <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-clay uppercase">
        <span>VIŚVAM HARVEST</span>
        <span>COLD LOCK ORCHARDS</span>
      </div>

      {/* Center Brand Title */}
      <div className="text-center my-auto space-y-4">
        <h1 className="font-display italic text-5xl sm:text-7xl lg:text-8xl text-ink tracking-tight">
          Viśvam Harvest
        </h1>
        <p className="text-[11px] font-sans tracking-[0.25em] text-muted-foreground uppercase font-medium">
          SINGLE-ORIGIN &bull; COLD-STORED &bull; NATURAL OILS
        </p>
      </div>

      {/* Bottom Progress Bar & Counter */}
      <div className="space-y-4 max-w-md mx-auto w-full">
        <div className="flex justify-between items-baseline text-[11px] font-mono text-ink">
          <span className="text-muted-foreground uppercase text-[9.5px] tracking-widest">Harvest Loading</span>
          <span className="tabular-nums font-semibold">{String(progress).padStart(2, "0")}%</span>
        </div>
        {/* Razor thin 1.5px progress track */}
        <div className="w-full h-[1.5px] bg-ink/10 overflow-hidden relative">
          <div
            className="h-full bg-clay transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function RoutePendingLoader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-ink/10 overflow-hidden">
      <div className="h-full bg-clay animate-pulse w-full origin-left transition-all duration-300" />
    </div>
  );
}
