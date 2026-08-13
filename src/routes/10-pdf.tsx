import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Download, ArrowUpRight, Plus, Minus, Star, ShieldCheck, Droplets, Layers } from "lucide-react";
import { products } from "@/lib/products";
import { useCart, formatPrice } from "@/lib/cart-context";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const Route = createFileRoute("/10-pdf")({
  head: () => ({
    meta: [
      { title: "10 Bestseller Section Layout Concepts — Viśvam" },
      { name: "description", content: "10 Elevated, vertically centered, left-aligned Bestseller section designs for Viśvam." },
    ],
  }),
  component: TenLayoutsPage,
});

function TenLayoutsPage() {
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 6);
  const [activeLayout, setActiveLayout] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const [activeThumbIndex, setActiveThumbIndex] = useState<number>(0);
  const [bundleItems, setBundleItems] = useState<Record<string, number>>({});
  const [gsapActiveIndex, setGsapActiveIndex] = useState<number>(0);

  const pinnedContainerRef = useRef<HTMLDivElement>(null);

  const { add } = useCart();

  const handlePrint = () => {
    window.print();
  };

  const toggleBundle = (slug: string) => {
    setBundleItems((prev) => {
      const current = prev[slug] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[slug];
        return copy;
      }
      return { ...prev, [slug]: 1 };
    });
  };

  const updateBundleQty = (slug: string, delta: number) => {
    setBundleItems((prev) => {
      const current = prev[slug] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[slug];
        return copy;
      }
      return { ...prev, [slug]: next };
    });
  };

  const bundleTotal = Object.entries(bundleItems).reduce((sum, [slug, qty]) => {
    const p = products.find((item) => item.slug === slug);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const bundleCount = Object.values(bundleItems).reduce((a, b) => a + b, 0);

  // Initialize GSAP ScrollTrigger for Pinned Layout
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Ensure first product (California Jumbo Almonds) is immediately active on load
    setGsapActiveIndex(0);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".gsap-product-trigger");

      cards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 65%",
          end: "bottom 35%",
          onEnter: () => setGsapActiveIndex(index),
          onEnterBack: () => setGsapActiveIndex(index),
        });
      });
    });

    return () => ctx.revert();
  }, [bestsellers.length]);

  const currentGsapProduct = bestsellers[gsapActiveIndex] || bestsellers[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 text-left">
      {/* Sticky Header & Toolbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 py-4 px-6 shadow-xs print:hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracked uppercase font-semibold text-clay bg-clay/10 px-3 py-1 rounded-md">
                Client Concept Review
              </span>
              <h1 className="font-display text-2xl text-ink">10 Bestseller Section Layout Concepts</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 text-left">
              Vertically centered product stage • 100% Left-aligned typography • Stacked images
            </p>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <button
              onClick={handlePrint}
              className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
            >
              <Download size={14} />
              <span>Export PDF</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </button>
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300"
            >
              <span>Back to Home</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Navigation Quick Jump Tabs */}
        <div className="max-w-[1400px] mx-auto mt-4 pt-3 border-t border-border/30 overflow-x-auto no-scrollbar flex items-center gap-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracked shrink-0 mr-1">Jump to:</span>
          {[
            "1. GSAP ScrollTrigger Pinned",
            "2. Heritage Carousel",
            "3. Editorial Spotlight",
            "4. 4-Column Floating Grid",
            "5. Text Filter Grid",
            "6. Boutique Menu List",
            "7. Free-Form Asymmetric",
            "8. Seamless Spotlight",
            "9. Cinematic 16:9 Strip",
            "10. Bundle Multi-Picker",
          ].map((title, idx) => {
            const num = idx + 1;
            const isActive = activeLayout === num;
            return (
              <a
                key={num}
                href={`#layout-${num}`}
                onClick={() => setActiveLayout(num)}
                className={`text-xs py-1 font-medium tracked uppercase border-b-2 transition-all shrink-0 ${
                  isActive
                    ? "text-clay border-clay font-semibold"
                    : "text-muted-foreground border-transparent hover:text-ink hover:border-ink/40"
                }`}
              >
                {title}
              </a>
            );
          })}
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-[1400px] mx-auto px-6 py-12 space-y-32 text-left">

        {/* Intro Solution Banner */}
        <section className="py-6 border-b border-border/40 space-y-3 text-left">
          <div className="flex items-center gap-2 text-clay">
            <Sparkles size={16} />
            <span className="text-xs font-semibold uppercase tracked">Vertically Centered Product Showcase</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight text-left">
            Vertically Centered & Pinned Bestseller Concepts
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed text-left">
            California Jumbo Almonds and all product images are vertically centered (<code className="text-clay">object-center self-center items-center</code>) within their respective layout stages and pinned frames.
          </p>
        </section>

        {/* LAYOUT 1 */}
        <section id="layout-1" className="scroll-mt-32 space-y-8 text-left">
          <div className="border-b border-border/40 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 01 • GSAP Pinned (pin: true)</span>
              <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Pinned Image Stage + Vertical Centering</h3>
            </div>
            <span className="text-xs bg-sand/60 text-ink px-3 py-1 rounded-full font-medium self-start md:self-auto">
              Scroll down to test pin behavior
            </span>
          </div>

          <div ref={pinnedContainerRef} className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-start min-h-[1200px]">
            {/* Left Pinned Image Stage (Always Visible & Vertically Centered) */}
            <div className="lg:col-span-6 sticky top-28 self-start">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-cream border border-border/30 shadow-xs text-left relative flex items-center justify-center">
                <img
                  key={currentGsapProduct.slug}
                  src={currentGsapProduct.images[0]}
                  alt={currentGsapProduct.name}
                  className="w-full h-full object-cover object-center rounded-3xl"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-border/30 flex items-center justify-between text-left">
                  <div>
                    <span className="text-[10px] text-clay uppercase font-bold tracking-wider block text-left">
                      {currentGsapProduct.origin}
                    </span>
                    <h5 className="font-display text-lg text-ink text-left">
                      {currentGsapProduct.name}
                    </h5>
                  </div>
                  <span className="text-base font-bold text-ink">
                    {formatPrice(currentGsapProduct.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Scrolling Text List */}
            <div className="lg:col-span-6 space-y-36 py-4 text-left">
              {bestsellers.slice(0, 4).map((p, idx) => (
                <div
                  key={p.slug}
                  className={`gsap-product-trigger space-y-4 pb-12 border-b border-border/30 text-left flex flex-col justify-center transition-opacity duration-300 ${
                    gsapActiveIndex === idx ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div className="lg:hidden aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-cream flex items-center justify-center">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-center rounded-2xl" />
                  </div>

                  <div className="flex items-center gap-2 text-clay">
                    <Layers size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">0{idx + 1} Harvest Selection • {p.origin}</span>
                  </div>

                  <h4 className="font-display text-4xl text-ink text-left">{p.name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md text-left">{p.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-clay" /> Cold Lock 4°C</span>
                    <span className="inline-flex items-center gap-1.5"><Droplets size={14} className="text-clay" /> Grade A1</span>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-border/40">
                    <div className="text-left">
                      <span className="text-[10px] text-muted-foreground block text-left">{p.serving}</span>
                      <span className="text-2xl font-bold text-ink text-left">{formatPrice(p.price)}</span>
                    </div>
                    <button
                      onClick={() => add(p)}
                      className="group inline-flex items-center gap-2.5 text-ink text-[12px] font-medium tracked uppercase tracking-widest py-1.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                    >
                      <span>Add to Bag</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LAYOUT 2 */}
        <section id="layout-2" className="scroll-mt-32 space-y-8 text-left">
          <div className="flex items-end justify-between border-b border-border/40 pb-4 text-left">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 02</span>
              <h3 className="font-display text-3xl text-ink mt-0.5 text-left">The Orchard Bestsellers Gallery</h3>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSliderIndex((prev) => Math.max(0, prev - 1))}
                className="text-ink hover:text-clay transition-colors cursor-pointer"
                aria-label="Previous items"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setSliderIndex((prev) => Math.min(Math.max(0, bestsellers.length - 4), prev + 1))}
                className="text-ink hover:text-clay transition-colors cursor-pointer"
                aria-label="Next items"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left items-center">
            {bestsellers.slice(sliderIndex, sliderIndex + 4).map((p) => (
              <div key={p.slug} className="flex flex-col justify-between group text-left h-full">
                <div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-cream/60 flex items-center justify-center">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-center rounded-2xl" />
                    <span className="absolute top-3 left-3 bg-ink/90 text-white text-[9px] px-2.5 py-0.5 rounded-full uppercase font-medium tracked">
                      {p.origin}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 text-xs mb-1">
                    <Star size={11} fill="currentColor" />
                    <span className="font-semibold text-ink text-[11px]">4.9</span>
                    <span className="text-muted-foreground text-[10px] ml-1">• High Oil Content</span>
                  </div>
                  <h5 className="font-display text-xl text-ink line-clamp-1 text-left">{p.name}</h5>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 mb-4 text-left">{p.tagline}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between mt-auto">
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground block text-left">{p.serving}</span>
                    <span className="text-base font-bold text-ink text-left">{formatPrice(p.price)}</span>
                  </div>
                  <button
                    onClick={() => add(p)}
                    className="group/btn inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 py-0.5 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={13} className="group-hover/btn:translate-x-1.5 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LAYOUT 3 */}
        <section id="layout-3" className="scroll-mt-32 space-y-8 text-left">
          <div className="border-b border-border/40 pb-4 text-left">
            <span className="text-xs font-semibold text-clay uppercase tracked">Option 03</span>
            <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Editorial Sourcing Spotlight</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            <div className="lg:col-span-5 space-y-5 text-left self-center my-auto">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-cream flex items-center justify-center">
                <img src={bestsellers[0].images[0]} alt={bestsellers[0].name} className="w-full h-full object-cover object-center rounded-2xl" />
                <span className="absolute top-3 left-3 bg-clay text-white text-[10px] px-3 py-1 rounded-full uppercase font-medium tracked">
                  #1 Harvest Selection
                </span>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase tracking-widest text-clay font-semibold block text-left">{bestsellers[0].origin}</span>
                <h4 className="font-display text-3xl text-ink text-left">{bestsellers[0].name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed text-left">{bestsellers[0].description}</p>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-clay" /> Cold Lock 4°C</span>
                <span className="inline-flex items-center gap-1.5"><Droplets size={14} className="text-clay" /> Grade A1</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground block text-left">{bestsellers[0].serving}</span>
                  <span className="text-xl font-bold text-ink text-left">{formatPrice(bestsellers[0].price)}</span>
                </div>
                <button
                  onClick={() => add(bestsellers[0])}
                  className="group inline-flex items-center gap-2.5 text-ink text-[11.5px] font-medium tracked uppercase tracking-widest py-1.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                >
                  <span>Add Hero Item</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-border/40 text-left self-center my-auto">
              {bestsellers.slice(1, 4).map((p) => (
                <div key={p.slug} className="py-5 flex items-center justify-between gap-6 group first:pt-0 text-left">
                  <div className="flex items-center gap-5 text-left">
                    <img src={p.images[0]} alt={p.name} className="w-20 h-20 rounded-2xl object-cover object-center shrink-0 bg-cream" />
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider text-clay font-bold block text-left">{p.origin}</span>
                      <h5 className="font-display text-xl text-ink text-left">{p.name}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 text-left">{p.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-base font-semibold">{formatPrice(p.price)}</span>
                    <button
                      onClick={() => add(p)}
                      className="group/btn inline-flex items-center gap-1.5 text-ink text-[10.5px] font-medium tracked uppercase border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 py-0.5 cursor-pointer"
                    >
                      <span>Add to bag</span>
                      <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300 text-clay" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LAYOUT 4 */}
        <section id="layout-4" className="scroll-mt-32 space-y-8 text-left">
          <div className="border-b border-border/40 pb-4 text-left">
            <span className="text-xs font-semibold text-clay uppercase tracked">Option 04</span>
            <h3 className="font-display text-3xl text-ink mt-0.5 text-left">4-Column Floating Artisanal Grid</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left items-center">
            {bestsellers.slice(0, 4).map((p) => (
              <div key={p.slug} className="flex flex-col justify-between group text-left h-full">
                <div>
                  <div className="w-full aspect-[3/2] rounded-2xl overflow-hidden bg-cream mb-4 relative flex items-center justify-center">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-center rounded-2xl" />
                    <span className="absolute top-2.5 right-2.5 bg-sand/90 text-ink text-[9px] px-2.5 py-0.5 rounded-full font-semibold">
                      {p.serving}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-clay font-bold block text-left">{p.origin}</span>
                  <h5 className="font-display text-lg text-ink line-clamp-1 mt-0.5 text-left">{p.name}</h5>
                  <p className="text-sm font-bold text-ink mt-1 text-left">{formatPrice(p.price)}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-border/30 mt-auto">
                  <button
                    onClick={() => add(p)}
                    className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LAYOUT 5 */}
        <section id="layout-5" className="scroll-mt-32 space-y-8 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-4 text-left">
            <div className="text-left">
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 05</span>
              <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Filterable Minimalist Showcase</h3>
            </div>

            <div className="flex items-center gap-6">
              {[
                { id: "all", label: "All Harvests" },
                { id: "nuts", label: "Almonds & Cashews" },
                { id: "dried", label: "Figs & Dates" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`text-xs py-1 font-medium tracked uppercase border-b-2 transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? "text-clay border-clay font-semibold"
                      : "text-muted-foreground border-transparent hover:text-ink hover:border-ink/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-center">
            {bestsellers
              .filter((p) => {
                if (selectedCategory === "nuts") return p.category === "nuts";
                if (selectedCategory === "dried") return p.slug.includes("fig") || p.slug.includes("date");
                return true;
              })
              .slice(0, 3)
              .map((p) => (
                <div key={p.slug} className="flex flex-col justify-between group text-left h-full">
                  <div>
                    <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-cream mb-4 flex items-center justify-center">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-center rounded-2xl" />
                      <span className="absolute bottom-3 left-3 text-ink text-[10px] px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full font-semibold">
                        ★ 4.9 Harvest Rating
                      </span>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase text-clay font-bold">{p.origin}</span>
                        <span className="text-xs text-muted-foreground">{p.serving}</span>
                      </div>
                      <h5 className="font-display text-xl text-ink text-left">{p.name}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed text-left">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-6 border-t border-border/30 mt-auto">
                    <span className="text-lg font-bold text-ink">{formatPrice(p.price)}</span>
                    <button
                      onClick={() => add(p)}
                      className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                    >
                      <span>Add to Bag</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* LAYOUT 6 */}
        <section id="layout-6" className="scroll-mt-32 space-y-8 text-left">
          <div className="flex items-center justify-between border-b border-border/40 pb-4 text-left">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 06</span>
              <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Boutique Michelin Menu Catalog</h3>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracked">4 Selection Items</span>
          </div>

          <div className="divide-y divide-border/30 text-left">
            {bestsellers.slice(0, 4).map((p) => (
              <div key={p.slug} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group text-left">
                <div className="flex items-center gap-6 text-left">
                  <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-full object-cover object-center bg-cream border border-border/40 shrink-0" />
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <h5 className="font-display text-2xl text-ink text-left">{p.name}</h5>
                      <span className="text-clay text-[10px] uppercase font-semibold tracked">
                        {p.origin}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 text-left">{p.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-10 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">{p.serving}</span>
                    <span className="text-lg font-bold text-ink">{formatPrice(p.price)}</span>
                  </div>
                  <button
                    onClick={() => add(p)}
                    className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LAYOUT 7 */}
        <section id="layout-7" className="scroll-mt-32 space-y-8 text-left">
          <div className="border-b border-border/40 pb-4 text-left">
            <span className="text-xs font-semibold text-clay uppercase tracked">Option 07</span>
            <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Free-Form Asymmetric Layout</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left items-center">
            <div className="md:col-span-2 space-y-5 text-left self-center my-auto">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-cream relative flex items-center justify-center">
                <img src={bestsellers[0].images[0]} alt={bestsellers[0].name} className="w-full h-full object-cover object-center rounded-2xl" />
                <span className="absolute top-4 left-4 bg-clay text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                  Featured Reserve
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 text-left">
                <div className="text-left">
                  <span className="text-[10px] uppercase text-clay font-bold block text-left">{bestsellers[0].origin}</span>
                  <h4 className="font-display text-3xl text-ink text-left">{bestsellers[0].name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md text-left">{bestsellers[0].tagline}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-bold text-ink">{formatPrice(bestsellers[0].price)}</span>
                  <button
                    onClick={() => add(bestsellers[0])}
                    className="group inline-flex items-center gap-2.5 text-ink text-[11.5px] font-medium tracked uppercase tracking-widest py-1.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                  >
                    <span>Explore & Add</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border/40 text-left self-center my-auto">
              {bestsellers.slice(1, 3).map((p) => (
                <div key={p.slug} className="py-6 first:pt-0 space-y-3 group text-left">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-cream flex items-center justify-center">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-center rounded-2xl" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-display text-xl text-ink text-left">{p.name}</h5>
                    <span className="text-xs font-bold text-ink block mt-0.5 text-left">{formatPrice(p.price)}</span>
                  </div>
                  <button
                    onClick={() => add(p)}
                    className="group/btn inline-flex items-center gap-1.5 text-ink text-[10.5px] font-medium tracked uppercase border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 py-0.5 cursor-pointer"
                  >
                    <span>Add to bag</span>
                    <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LAYOUT 8 */}
        <section id="layout-8" className="scroll-mt-32 space-y-8 text-left">
          <div className="border-b border-border/40 pb-4 text-left">
            <span className="text-xs font-semibold text-clay uppercase tracked">Option 08</span>
            <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Seamless Spotlight Showcase</h3>
          </div>

          <div className="space-y-8 text-left">
            {(() => {
              const activeProd = bestsellers[activeThumbIndex] || bestsellers[0];
              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center text-left">
                  <div className="md:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-cream flex items-center justify-center">
                    <img src={activeProd.images[0]} alt={activeProd.name} className="w-full h-full object-cover object-center rounded-2xl" />
                  </div>
                  <div className="md:col-span-7 space-y-4 text-left self-center my-auto">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-clay font-bold text-[10px] uppercase tracking-wider">
                        {activeProd.origin}
                      </span>
                      <span className="text-xs text-muted-foreground">• {activeProd.serving}</span>
                    </div>
                    <h4 className="font-display text-4xl text-ink text-left">{activeProd.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xl text-left">{activeProd.description}</p>
                    <div className="flex items-center gap-8 pt-4">
                      <span className="text-3xl font-bold text-ink">{formatPrice(activeProd.price)}</span>
                      <button
                        onClick={() => add(activeProd)}
                        className="group inline-flex items-center gap-2.5 text-ink text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                      >
                        <span>Add Active Item</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-start gap-8 border-t border-border/40 pt-6">
              {bestsellers.slice(0, 4).map((p, idx) => (
                <button
                  key={p.slug}
                  onClick={() => setActiveThumbIndex(idx)}
                  className={`flex items-center gap-3 py-1 border-b-2 transition-all cursor-pointer ${
                    activeThumbIndex === idx
                      ? "text-clay border-clay font-semibold"
                      : "text-muted-foreground border-transparent hover:text-ink hover:border-ink/40"
                  }`}
                >
                  <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-full object-cover object-center" />
                  <span className="text-xs font-medium tracked uppercase">{p.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* LAYOUT 9 */}
        <section id="layout-9" className="scroll-mt-32 space-y-8 text-left">
          <div className="border-b border-border/40 pb-4 text-left">
            <span className="text-xs font-semibold text-clay uppercase tracked">Option 09</span>
            <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Circular Reserve Vault</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left items-center">
            {bestsellers.slice(0, 3).map((p) => (
              <div key={p.slug} className="text-left space-y-4 group h-full flex flex-col justify-between">
                <div className="space-y-4 text-left">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-clay/30 p-1.5 bg-cream flex items-center justify-center">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-center rounded-full" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-clay uppercase font-bold tracking-wider block text-left">{p.origin}</span>
                    <h5 className="font-display text-2xl text-ink mt-0.5 text-left">{p.name}</h5>
                    <span className="text-base font-bold text-ink block mt-1 text-left">{formatPrice(p.price)}</span>
                  </div>
                </div>
                <div className="pt-1 text-left mt-auto">
                  <button
                    onClick={() => add(p)}
                    className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LAYOUT 10 */}
        <section id="layout-10" className="scroll-mt-32 space-y-8 text-left">
          <div className="flex items-center justify-between border-b border-border/40 pb-4 text-left">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 10</span>
              <h3 className="font-display text-3xl text-ink mt-0.5 text-left">Build Your Harvest Bundle Multi-Picker</h3>
            </div>
            {bundleCount > 0 && (
              <span className="text-xs font-semibold text-clay uppercase tracked">
                {bundleCount} {bundleCount === 1 ? "Item" : "Items"} Selected
              </span>
            )}
          </div>

          <div className="space-y-8 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left items-center">
              {bestsellers.slice(0, 3).map((p) => {
                const qty = bundleItems[p.slug] || 0;
                const isSelected = qty > 0;
                return (
                  <div key={p.slug} className="flex flex-col justify-between text-left h-full">
                    <div className="text-left">
                      <img src={p.images[0]} alt={p.name} className="w-full h-40 rounded-2xl object-cover object-center bg-cream mb-4" />
                      <h5 className="font-display text-xl text-ink line-clamp-1 text-left">{p.name}</h5>
                      <p className="text-xs text-muted-foreground mb-4 text-left">{formatPrice(p.price)} / {p.serving}</p>

                      {isSelected ? (
                        <div className="flex items-center justify-between py-1 border-b-2 border-clay max-w-[140px]">
                          <button
                            onClick={() => updateBundleQty(p.slug, -1)}
                            className="text-ink hover:text-clay cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold">{qty}</span>
                          <button
                            onClick={() => updateBundleQty(p.slug, 1)}
                            className="text-ink hover:text-clay cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleBundle(p.slug)}
                          className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                        >
                          <span>+ Add to Bundle</span>
                          <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {bundleCount > 0 && (
              <div className="bg-ink text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-clay grid place-items-center font-bold text-xs">
                    {bundleCount}
                  </div>
                  <div>
                    <span className="text-xs text-white/70 block">Bundle Total</span>
                    <span className="text-xl font-bold">{formatPrice(bundleTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    Object.entries(bundleItems).forEach(([slug, qty]) => {
                      const item = products.find((p) => p.slug === slug);
                      if (item) {
                        for (let i = 0; i < qty; i++) add(item, false);
                      }
                    });
                  }}
                  className="group inline-flex items-center gap-2.5 text-white text-[11.5px] font-medium tracked uppercase tracking-widest py-1.5 border-b-2 border-white hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                >
                  <span>Add Custom Bundle to Bag</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-white" />
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
