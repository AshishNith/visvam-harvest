import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Download, ArrowUpRight, Plus, Minus } from "lucide-react";
import { products } from "@/lib/products";
import { useCart, formatPrice } from "@/lib/cart-context";

export const Route = createFileRoute("/10-pdf")({
  head: () => ({
    meta: [
      { title: "10 Bestseller Section Layout Concepts — Viśvam" },
      { name: "description", content: "10 Unique, compact, and luxury Bestseller section designs tailored for Viśvam brand identity." },
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Sticky Header & Toolbar */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-border/40 py-4 px-6 shadow-sm print:hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-clay text-white text-[10px] tracked px-2.5 py-0.5 rounded-full uppercase font-semibold">
                Client Concept Review
              </span>
              <h1 className="font-display text-2xl text-ink">10 Bestseller Section Layout Options</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Custom non-bulk image layouts • Smooth organic corners • Authentic Viśvam button designs
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-full text-xs font-medium tracked uppercase hover:bg-clay transition-all duration-300 cursor-pointer"
            >
              <Download size={14} />
              <span>Export PDF</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
            </button>
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 px-4 py-2 bg-sand/60 text-ink rounded-full text-xs font-medium tracked uppercase hover:bg-sand transition-all duration-300"
            >
              <span>Back to Home</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Concept Quick Jump Pill Nav */}
        <div className="max-w-[1400px] mx-auto mt-4 pt-3 border-t border-border/30 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracked shrink-0 mr-2">Jump to:</span>
          {[
            "1. Carousel Strip",
            "2. Editorial Spotlight",
            "3. 4-Column Grid",
            "4. Filterable Tabs",
            "5. Boutique Menu List",
            "6. Asymmetric Bento",
            "7. Interactive Slider",
            "8. Landscape 16:9 Grid",
            "9. Card-in-Card Reserve",
            "10. Bundle Multi-Picker",
          ].map((title, idx) => {
            const num = idx + 1;
            const isActive = activeLayout === num;
            return (
              <a
                key={num}
                href={`#layout-${num}`}
                onClick={() => setActiveLayout(num)}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all shrink-0 font-medium tracked uppercase ${
                  isActive
                    ? "bg-clay text-white shadow-xs"
                    : "bg-cream text-ink hover:bg-sand border border-border/30"
                }`}
              >
                {title}
              </a>
            );
          })}
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-[1400px] mx-auto px-6 py-12 space-y-24">

        {/* Intro Banner */}
        <section className="bg-cream/60 border border-border/50 rounded-3xl p-8 md:p-10 space-y-4">
          <div className="flex items-center gap-2 text-clay">
            <Sparkles size={18} />
            <span className="text-xs font-semibold uppercase tracked">Client Specific Solution</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            Addressing Image Scale & Layout Preference
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            To replace the tall 3/4 aspect ratio grid cards, we have created <strong>10 distinct, production-ready design variations</strong>. All options utilize Viśvam's signature tracked button typography, hover animations, and smooth rounded corners.
          </p>
        </section>

        {/* ==========================================
            LAYOUT 1: Compact Horizontal Carousel Strip
           ========================================== */}
        <section id="layout-1" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 01</span>
              <h3 className="font-display text-2xl text-ink">Compact Horizontal Carousel Strip</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Uses space-efficient 4:3 landscape thumbnails inside a smooth scroll container. Reduces vertical height by 55%.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] tracked text-muted-foreground uppercase tracking-widest mb-1">— Harvest Staples</p>
                <h4 className="font-display text-3xl text-ink">The Orchard Bestsellers</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSliderIndex((prev) => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-full border border-ink/20 flex items-center justify-center hover:bg-sand transition-colors cursor-pointer"
                  aria-label="Previous items"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setSliderIndex((prev) => Math.min(Math.max(0, bestsellers.length - 4), prev + 1))}
                  className="w-10 h-10 rounded-full border border-ink/20 flex items-center justify-center hover:bg-sand transition-colors cursor-pointer"
                  aria-label="Next items"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers.slice(sliderIndex, sliderIndex + 4).map((p) => (
                <div key={p.slug} className="bg-background rounded-2xl p-4 border border-border/40 shadow-xs flex flex-col justify-between group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-cream">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl" />
                    <span className="absolute top-2 left-2 bg-ink/80 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-medium">
                      {p.origin}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-display text-base text-ink line-clamp-1">{p.name}</h5>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mb-3">{p.tagline}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                      <button
                        onClick={() => add(p)}
                        className="group/btn inline-flex items-center gap-1.5 text-ink text-[10px] font-medium tracked uppercase border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 py-0.5 cursor-pointer"
                      >
                        <span>Add to bag</span>
                        <ArrowRight size={11} className="group-hover/btn:translate-x-1 transition-transform duration-300 text-clay" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            LAYOUT 2: Editorial Spotlight Hero + Sidebar Stack
           ========================================== */}
        <section id="layout-2" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 02</span>
              <h3 className="font-display text-2xl text-ink">Editorial Spotlight + Compact Sidebar Stack</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Combines one hero highlight on the left with ultra-compact horizontal list rows on the right. Zero vertical clutter.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Card */}
            <div className="lg:col-span-5 bg-background rounded-2xl p-6 border border-border/40 shadow-xs space-y-4">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-cream">
                <img src={bestsellers[0].images[0]} alt={bestsellers[0].name} className="w-full h-full object-cover rounded-xl" />
                <span className="absolute top-3 left-3 bg-clay text-white text-[10px] px-3 py-1 rounded-full uppercase font-medium">
                  #1 Top Choice
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">{bestsellers[0].origin}</span>
                <h4 className="font-display text-2xl text-ink">{bestsellers[0].name}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{bestsellers[0].description.slice(0, 110)}...</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Pack size: {bestsellers[0].serving}</span>
                  <span className="text-lg font-bold text-ink">{formatPrice(bestsellers[0].price)}</span>
                </div>
                <button
                  onClick={() => add(bestsellers[0])}
                  className="group inline-flex items-center gap-2 bg-ink text-white hover:bg-clay text-[10.5px] font-medium tracked uppercase tracking-widest py-2.5 px-5 rounded-full transition-all duration-300 cursor-pointer"
                >
                  <span>Add Hero Item</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                </button>
              </div>
            </div>

            {/* Right Compact Stack */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracked">More Harvest Bestsellers</h4>
              {bestsellers.slice(1, 4).map((p) => (
                <div key={p.slug} className="bg-background rounded-2xl p-4 border border-border/40 flex items-center justify-between gap-4 hover:border-clay/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={p.images[0]} alt={p.name} className="w-20 h-20 rounded-xl object-cover shrink-0 bg-cream" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-clay font-bold">{p.origin}</span>
                      <h5 className="font-display text-lg text-ink">{p.name}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                    <button
                      onClick={() => add(p)}
                      className="group/btn inline-flex items-center gap-1.5 text-ink text-[10px] font-medium tracked uppercase border-b border-ink hover:text-clay hover:border-clay transition-all duration-300 py-1 cursor-pointer"
                    >
                      <span>Add to bag</span>
                      <ArrowRight size={11} className="group-hover/btn:translate-x-1 transition-transform duration-300 text-clay" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            LAYOUT 3: 4-Column Artisanal Grid (Compact 1:1 Images)
           ========================================== */}
        <section id="layout-3" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 03</span>
              <h3 className="font-display text-2xl text-ink">4-Column Artisanal Grid (1:1 Aspect Ratio)</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Replaces 3 tall cards with 4 compact square cards per row. Balanced visual weight and quick browsing.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40">
            <div className="text-center max-w-md mx-auto mb-10">
              <span className="text-[10px] tracked text-muted-foreground uppercase font-semibold">Handpicked Selection</span>
              <h4 className="font-display text-3xl text-ink mt-1">Our Favorite Harvests</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers.slice(0, 4).map((p) => (
                <div key={p.slug} className="bg-background rounded-2xl p-4 border border-border/30 text-center flex flex-col items-center justify-between group">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-cream mb-4 relative">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl" />
                    <span className="absolute top-2 right-2 bg-sand/80 text-ink text-[9px] px-2 py-0.5 rounded-full font-semibold">
                      {p.serving}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-clay font-bold">{p.origin}</span>
                    <h5 className="font-display text-base text-ink line-clamp-1">{p.name}</h5>
                    <p className="text-xs font-semibold text-ink">{formatPrice(p.price)}</p>
                  </div>
                  <button
                    onClick={() => add(p)}
                    className="w-full mt-4 group inline-flex items-center justify-center gap-2 bg-cream hover:bg-clay hover:text-white text-ink text-[10.5px] font-medium tracked uppercase py-2.5 rounded-full transition-all duration-300 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            LAYOUT 4: Category-Filtered Glassmorphic Tabs Grid
           ========================================== */}
        <section id="layout-4" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 04</span>
              <h3 className="font-display text-2xl text-ink">Category-Filtered Interactive Grid</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Features top category filter tabs to prevent visual overload and let customers explore by preference.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-3xl text-ink">Curated Bestsellers</h4>
                <p className="text-xs text-muted-foreground">Select a category to filter top performers</p>
              </div>

              <div className="flex items-center gap-2 bg-background p-1.5 rounded-full border border-border/40 self-start">
                {[
                  { id: "all", label: "All Items" },
                  { id: "nuts", label: "Almonds & Cashews" },
                  { id: "dried", label: "Figs & Dates" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`text-xs px-4 py-1.5 rounded-full font-medium tracked uppercase transition-all cursor-pointer ${
                      selectedCategory === tab.id
                        ? "bg-clay text-white shadow-xs"
                        : "text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bestsellers
                .filter((p) => {
                  if (selectedCategory === "nuts") return p.category === "nuts";
                  if (selectedCategory === "dried") return p.slug.includes("fig") || p.slug.includes("date");
                  return true;
                })
                .slice(0, 3)
                .map((p) => (
                  <div key={p.slug} className="bg-background/80 backdrop-blur-sm rounded-3xl p-6 border border-border/40 shadow-sm flex flex-col justify-between group">
                    <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-cream mb-4">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
                      <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-ink text-[10px] px-3 py-1 rounded-full font-semibold border border-border/30">
                        ★ 4.9 Harvest Rating
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase text-clay font-bold">{p.origin}</span>
                        <span className="text-xs text-muted-foreground">{p.serving}</span>
                      </div>
                      <h5 className="font-display text-xl text-ink">{p.name}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/30">
                      <span className="text-lg font-bold text-ink">{formatPrice(p.price)}</span>
                      <button
                        onClick={() => add(p)}
                        className="group inline-flex items-center gap-2 bg-ink text-white hover:bg-clay text-[10.5px] font-medium tracked uppercase py-2 px-4 rounded-full transition-all duration-300 cursor-pointer"
                      >
                        <span>Add to Bag</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            LAYOUT 5: Luxury Boutique Menu / Row List Showcase
           ========================================== */}
        <section id="layout-5" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 05</span>
              <h3 className="font-display text-2xl text-ink">Luxury Boutique Menu / Horizontal List View</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Michelin-star restaurant style text-first menu list. Completely removes image overload and focuses on quality details.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 space-y-6">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <h4 className="font-display text-3xl text-ink">Signature Selection</h4>
              <span className="text-xs text-muted-foreground">4 Products Available</span>
            </div>

            <div className="divide-y divide-border/30">
              {bestsellers.slice(0, 4).map((p) => (
                <div key={p.slug} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4">
                    <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-full object-cover bg-cream border border-border/40 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-display text-xl text-ink group-hover:text-clay transition-colors">{p.name}</h5>
                        <span className="bg-sand/60 text-ink text-[9px] px-2 py-0.5 rounded-full uppercase font-medium">
                          {p.origin}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">{p.serving}</span>
                      <span className="text-base font-semibold text-ink">{formatPrice(p.price)}</span>
                    </div>
                    <button
                      onClick={() => add(p)}
                      className="group inline-flex items-center gap-1.5 text-ink hover:text-clay text-[10.5px] font-medium tracked uppercase border-b-2 border-ink hover:border-clay transition-all duration-300 py-1 cursor-pointer"
                    >
                      <span>Add to Bag</span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            LAYOUT 6: Asymmetric Bento Grid
           ========================================== */}
        <section id="layout-6" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 06</span>
              <h3 className="font-display text-2xl text-ink">Asymmetric Bento Grid Layout</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Modern magazine bento layout with varied card sizes for strong visual hierarchy.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-background rounded-3xl p-8 border border-border/40 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden hidden sm:block">
                <img src={bestsellers[0].images[0]} alt={bestsellers[0].name} className="w-full h-full object-cover rounded-l-3xl group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="max-w-xs space-y-3 z-10">
                <span className="bg-clay text-white text-[9px] px-2.5 py-1 rounded-full uppercase font-bold">
                  Bento Hero
                </span>
                <h4 className="font-display text-3xl text-ink">{bestsellers[0].name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{bestsellers[0].tagline}</p>
                <div className="pt-2">
                  <span className="text-xl font-bold text-ink block mb-3">{formatPrice(bestsellers[0].price)}</span>
                  <button
                    onClick={() => add(bestsellers[0])}
                    className="group inline-flex items-center gap-2 bg-ink text-white hover:bg-clay text-[10.5px] font-medium tracked uppercase py-2.5 px-5 rounded-full transition-all duration-300 cursor-pointer"
                  >
                    <span>Explore & Add</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {bestsellers.slice(1, 3).map((p) => (
                <div key={p.slug} className="bg-background rounded-3xl p-5 border border-border/40 flex items-center gap-4 group">
                  <img src={p.images[0]} alt={p.name} className="w-20 h-20 rounded-2xl object-cover bg-cream shrink-0" />
                  <div className="flex-1 space-y-1">
                    <h5 className="font-display text-base text-ink line-clamp-1">{p.name}</h5>
                    <span className="text-xs font-semibold text-ink block">{formatPrice(p.price)}</span>
                    <button
                      onClick={() => add(p)}
                      className="group/btn inline-flex items-center gap-1 text-[10.5px] text-clay font-medium tracked uppercase hover:underline cursor-pointer"
                    >
                      <span>+ Quick Add</span>
                      <ArrowRight size={11} className="group-hover/btn:translate-x-1 transition-transform duration-300 text-clay" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            LAYOUT 7: Interactive Product Slider with Thumbnail Selector
           ========================================== */}
        <section id="layout-7" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 07</span>
              <h3 className="font-display text-2xl text-ink">Single Spotlight Showcase + Mini Selector</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Displays one focused product at a time with a quick thumbnail switcher below. Minimal screen footprint.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 space-y-6">
            {(() => {
              const activeProd = bestsellers[activeThumbIndex] || bestsellers[0];
              return (
                <div className="bg-background rounded-3xl p-8 border border-border/40 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-cream">
                    <img src={activeProd.images[0]} alt={activeProd.name} className="w-full h-full object-cover rounded-2xl" />
                  </div>
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-sand text-ink text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase">
                        {activeProd.origin}
                      </span>
                      <span className="text-xs text-muted-foreground">{activeProd.serving}</span>
                    </div>
                    <h4 className="font-display text-3xl text-ink">{activeProd.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{activeProd.description}</p>
                    <div className="flex items-center gap-6 pt-2">
                      <span className="text-2xl font-bold text-ink">{formatPrice(activeProd.price)}</span>
                      <button
                        onClick={() => add(activeProd)}
                        className="group inline-flex items-center gap-2.5 bg-ink text-white hover:bg-clay text-[11px] font-medium tracked uppercase tracking-widest py-3 px-6 rounded-full transition-all duration-300 cursor-pointer"
                      >
                        <span>Add Active Item</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-center gap-4 overflow-x-auto py-2">
              {bestsellers.slice(0, 4).map((p, idx) => (
                <button
                  key={p.slug}
                  onClick={() => setActiveThumbIndex(idx)}
                  className={`flex items-center gap-3 p-2 pr-4 rounded-full border transition-all cursor-pointer ${
                    activeThumbIndex === idx
                      ? "bg-clay text-white border-clay shadow-xs"
                      : "bg-background text-ink border-border/40 hover:bg-sand"
                  }`}
                >
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className="text-xs font-medium">{p.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            LAYOUT 8: Landscape Dual-Card Row (16:9 Aspect Ratio)
           ========================================== */}
        <section id="layout-8" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 08</span>
              <h3 className="font-display text-2xl text-ink">Landscape 16:9 Compact Grid</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Uses wide 16:9 banner images instead of vertical images, giving a rich Cinematic look.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
            {bestsellers.slice(0, 3).map((p) => (
              <div key={p.slug} className="bg-background rounded-3xl p-5 border border-border/40 flex flex-col justify-between group">
                <div>
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-cream mb-4 relative">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
                    <span className="absolute top-2 left-2 bg-ink/80 text-white text-[9px] px-2 py-0.5 rounded-full uppercase">
                      {p.origin}
                    </span>
                  </div>
                  <h5 className="font-display text-lg text-ink">{p.name}</h5>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.tagline}</p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/30">
                  <span className="text-base font-bold text-ink">{formatPrice(p.price)}</span>
                  <button
                    onClick={() => add(p)}
                    className="group inline-flex items-center gap-1.5 border-b-2 border-ink text-ink hover:text-clay hover:border-clay text-[10.5px] font-medium tracked uppercase py-1 transition-all duration-300 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            LAYOUT 9: Card-in-Card Layered Reserve Stack
           ========================================== */}
        <section id="layout-9" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 09</span>
              <h3 className="font-display text-2xl text-ink">Card-in-Card Layered Reserve Stack</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Sophisticated dual-layer card design with oval cropped image frames.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
            {bestsellers.slice(0, 3).map((p) => (
              <div key={p.slug} className="bg-cream border border-border/60 rounded-3xl p-6 shadow-xs text-center space-y-4">
                <div className="bg-background rounded-2xl p-4 border border-border/30">
                  <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-clay/30 p-1 bg-cream">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <h5 className="font-display text-xl text-ink mt-3">{p.name}</h5>
                  <span className="text-[10px] text-clay uppercase font-bold tracked">{p.origin}</span>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-bold text-ink">{formatPrice(p.price)}</span>
                  <button
                    onClick={() => add(p)}
                    className="group inline-flex items-center gap-2 bg-ink text-white hover:bg-clay text-[10.5px] font-medium tracked uppercase py-2 px-4 rounded-full transition-all duration-300 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            LAYOUT 10: "Build Your Bundle" Interactive Multi-Picker
           ========================================== */}
        <section id="layout-10" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-semibold text-clay uppercase tracked">Option 10</span>
              <h3 className="font-display text-2xl text-ink">Build Your Harvest Bundle (Interactive Multi-Picker)</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Allows customers to pick and bundle multiple items directly with live discount calculation bar.
            </p>
          </div>

          <div className="bg-cream/40 p-8 rounded-3xl border border-border/40 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-3xl text-ink">Custom Bestseller Box</h4>
                <p className="text-xs text-muted-foreground">Pick any 2 or more items to build your custom harvest box</p>
              </div>
              {bundleCount > 0 && (
                <div className="bg-sand/80 px-4 py-1.5 rounded-full text-xs font-semibold text-ink">
                  {bundleCount} {bundleCount === 1 ? "Item" : "Items"} Selected
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {bestsellers.slice(0, 3).map((p) => {
                const qty = bundleItems[p.slug] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={p.slug}
                    className={`bg-background rounded-3xl p-5 border transition-all ${
                      isSelected ? "border-clay ring-2 ring-clay/20 shadow-md" : "border-border/40"
                    }`}
                  >
                    <img src={p.images[0]} alt={p.name} className="w-full h-32 rounded-2xl object-cover bg-cream mb-4" />
                    <h5 className="font-display text-lg text-ink line-clamp-1">{p.name}</h5>
                    <p className="text-xs text-muted-foreground mb-3">{formatPrice(p.price)} / {p.serving}</p>

                    {isSelected ? (
                      <div className="flex items-center justify-between bg-cream p-1.5 rounded-full border border-clay/30">
                        <button
                          onClick={() => updateBundleQty(p.slug, -1)}
                          className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-ink hover:bg-sand cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold px-2">{qty}</span>
                        <button
                          onClick={() => updateBundleQty(p.slug, 1)}
                          className="w-7 h-7 rounded-full bg-clay text-white flex items-center justify-center hover:bg-ink cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleBundle(p.slug)}
                        className="w-full group inline-flex items-center justify-center gap-2 bg-sand/60 hover:bg-clay hover:text-white text-ink text-[10.5px] font-medium tracked uppercase py-2 rounded-full transition-all duration-300 cursor-pointer"
                      >
                        <span>+ Add to Bundle</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {bundleCount > 0 && (
              <div className="bg-ink text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-clay grid place-items-center font-bold text-xs">
                    {bundleCount}
                  </div>
                  <div>
                    <span className="text-xs text-white/70 block">Bundle Total</span>
                    <span className="text-lg font-bold">{formatPrice(bundleTotal)}</span>
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
                  className="group inline-flex items-center gap-2.5 bg-clay hover:bg-ember text-white text-[11px] font-medium tracked uppercase tracking-widest py-3 px-7 rounded-full transition-all duration-300 cursor-pointer"
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
