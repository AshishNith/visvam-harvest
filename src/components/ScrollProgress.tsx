import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0 && barRef.current) {
          const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
          barRef.current.style.height = `${pct}%`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed top-0 bottom-0 right-0 z-50 w-[4px] bg-sand/20 pointer-events-none">
      <div
        ref={barRef}
        className="w-full bg-clay transition-all duration-150 ease-out"
        style={{ height: "0%" }}
      />
    </div>
  );
}

