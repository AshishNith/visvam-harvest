import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import gourmetHero from "@/assets/gourmet-hero.png";
import nutsHero from "@/assets/nuts-hero.png";
import giftingHero from "@/assets/gifting-hero.png";

export const Route = createFileRoute("/temp")({
  head: () => ({
    meta: [
      { title: "10 Unboxed Category Designs — Viśvam Harvest" },
      { name: "description", content: "Explore 10 cardless, box-free category section designs for client approval." },
    ],
  }),
  component: TempDesignsPage,
});

const CATEGORIES = [
  {
    id: "gourmet",
    slug: "gourmet",
    tag: "01 / SELECTION",
    num: "01",
    title: "Gourmet Selections",
    subtitle: "Sun-Dried Afghani Figs, Royal Medjool Dates & Superseed Mixes.",
    description: "Organic Kandahar Dried Figs, Royal Medjool Dates, and 7-in-1 Superseeds harvested at peak natural sweetness.",
    image: gourmetHero,
    itemCount: "12 Products",
  },
  {
    id: "nuts",
    slug: "nuts",
    tag: "02 / SELECTION",
    num: "02",
    title: "Single-Origin Nuts",
    subtitle: "California Jumbo Almonds, W240 Cashews & Kashmiri Walnuts.",
    description: "California Jumbo Almonds, W240 Whole Cashews, and Kashmiri Snow Walnuts cold-stored for maximum crunch.",
    image: nutsHero,
    itemCount: "18 Products",
  },
  {
    id: "gifting",
    slug: "gifting",
    tag: "03 / SELECTION",
    num: "03",
    title: "Royal Gift Hampers",
    subtitle: "Handcrafted Luxury Gift Boxes & Vacuum-Sealed Compartments.",
    description: "Vacuum-sealed festive hampers and handcrafted rigid presentation boxes for corporate and family celebrations.",
    image: giftingHero,
    itemCount: "8 Gift Boxes",
  },
];

function TempDesignsPage() {
  const [opt2Active, setOpt2Active] = useState(CATEGORIES[0]);
  const [opt7Active, setOpt7Active] = useState(CATEGORIES[0].id);
  const [opt10Hovered, setOpt10Hovered] = useState<string | null>(CATEGORIES[0].id);

  return (
    <SiteLayout>
      {/* Header Banner */}
      <section className="bg-ink text-white pt-32 pb-16 px-6">
        <div className="max-w-[1400px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase font-mono text-sand">
            <Sparkles size={14} className="text-ember" />
            <span>Cardless & Box-Free Layouts</span>
          </div>
          <h1 className="font-display italic text-4xl sm:text-6xl lg:text-7xl">10 Unboxed Category Designs</h1>
          <p className="text-sm text-white/70 max-w-2xl mx-auto leading-relaxed">
            Updated with high-definition, studio food photography for all 10 cardless category section concepts.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <a
                key={i}
                href={`#design-${i + 1}`}
                className="text-[11px] font-mono bg-white/5 hover:bg-white/20 border border-white/10 px-3 py-1 rounded-sm text-sand transition-colors"
              >
                Option {String(i + 1).padStart(2, "0")}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* OPTION 01 — SEAMLESS EDITORIAL STAGGER (NO CARDS/BOXES) */}
      <section id="design-1" className="py-24 bg-background border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 01 — SEAMLESS EDITORIAL STAGGER (CARDLESS)
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="space-y-24">
            {CATEGORIES.map((cat, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={cat.id} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className={`lg:col-span-7 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <img src={cat.image} alt={cat.title} className="w-full aspect-[16/10] object-cover hover:opacity-95 transition-opacity rounded-xs shadow-xs" />
                  </div>
                  <div className={`lg:col-span-5 space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    <span className="text-3xl font-display italic text-clay block">{cat.num}</span>
                    <h3 className="font-display italic text-4xl lg:text-5xl text-ink leading-tight">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{cat.description}</p>
                    <Link
                      to={`/${cat.slug}`}
                      className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-ink hover:text-clay border-b border-ink pb-1 transition-colors"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OPTION 02 — UNBOXED TABBED SPLIT */}
      <section id="design-2" className="py-24 bg-cream/30 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 02 — UNBOXED TABBED EDITORIAL
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-8">
              {CATEGORIES.map((cat) => {
                const isSelected = opt2Active.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setOpt2Active(cat)}
                    className="cursor-pointer space-y-2 border-b border-border/60 pb-6 group"
                  >
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-display italic text-3xl transition-colors ${isSelected ? "text-ink font-semibold" : "text-muted-foreground group-hover:text-ink"}`}>
                        {cat.title}
                      </h3>
                      <span className="text-xs font-mono text-clay">{cat.num}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{cat.subtitle}</p>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <img src={opt2Active.image} alt={opt2Active.title} className="w-full aspect-[16/10] object-cover rounded-xs shadow-xs" />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{opt2Active.description}</p>
                <Link to={`/${opt2Active.slug}`} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink hover:text-clay shrink-0">
                  <span>View Line</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPTION 03 — OPEN 3-COLUMN EDITORIAL (NO CARDS) */}
      <section id="design-3" className="py-24 bg-background border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 03 — OPEN 3-COLUMN EDITORIAL
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-6 group">
                <div className="aspect-[4/5] overflow-hidden rounded-xs shadow-xs">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-mono text-clay uppercase">{cat.num} — {cat.itemCount}</span>
                  <h3 className="font-display italic text-3xl text-ink">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                  <Link to={`/${cat.slug}`} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink group-hover:text-clay pt-2">
                    <span>Explore Line</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPTION 04 — HORIZONTAL STRIP (NO BOXES) */}
      <section id="design-4" className="py-24 bg-cream/20 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 04 — FRAMELESS HORIZONTAL STRIP
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-4">
                <div className="aspect-[16/10] overflow-hidden rounded-xs shadow-xs">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <h3 className="font-display italic text-2xl text-ink">{cat.title}</h3>
                  <span className="text-xs font-mono text-clay">{cat.num}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.subtitle}</p>
                <Link to={`/${cat.slug}`} className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-ink hover:text-clay pt-1">
                  <span>Discover</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPTION 05 — FULL-WIDTH EDGE-TO-EDGE BANNERS */}
      <section id="design-5" className="py-24 bg-background border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 05 — FULL-WIDTH OVERLAY BANNERS
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="space-y-8">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="relative aspect-[21/9] sm:aspect-[24/9] overflow-hidden group rounded-xs shadow-sm">
                <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-8 sm:p-16 text-white space-y-4">
                  <span className="text-xs font-mono text-sand uppercase">{cat.tag}</span>
                  <h3 className="font-display italic text-3xl sm:text-5xl lg:text-6xl">{cat.title}</h3>
                  <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed hidden sm:block">{cat.subtitle}</p>
                  <Link to={`/${cat.slug}`} className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-white hover:text-sand border-b border-white/60 pb-1 self-start">
                    <span>Explore Line</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPTION 06 — GIANT NUMBERED LIST */}
      <section id="design-6" className="py-24 bg-cream/40 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 06 — GIANT NUMBERED LIST (UNBOXED)
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="space-y-16">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-border/60 pb-16">
                <div className="lg:col-span-2 text-6xl lg:text-8xl font-display italic text-clay/40 font-light">
                  {cat.num}
                </div>
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="font-display italic text-4xl text-ink">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                  <Link to={`/${cat.slug}`} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink hover:text-clay pt-2">
                    <span>Explore</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="lg:col-span-5">
                  <img src={cat.image} alt={cat.title} className="w-full aspect-[16/10] object-cover rounded-xs shadow-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPTION 07 — MINIMAL UNBOXED ACCORDION */}
      <section id="design-7" className="py-24 bg-background border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 07 — MINIMAL UNBOXED ACCORDION
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => {
              const isOpen = opt7Active === cat.id;
              return (
                <div key={cat.id} className="border-b border-border pb-6">
                  <button onClick={() => setOpt7Active(isOpen ? "" : cat.id)} className="w-full flex justify-between items-center text-left py-4">
                    <div className="flex items-center gap-6">
                      <span className="font-mono text-clay font-bold text-lg">{cat.num}</span>
                      <h3 className="font-display italic text-3xl sm:text-4xl text-ink">{cat.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground uppercase">{isOpen ? "— CLOSE" : "+ EXPAND"}</span>
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center pt-6">
                      <div className="sm:col-span-6">
                        <img src={cat.image} alt={cat.title} className="w-full aspect-[16/10] object-cover rounded-xs shadow-xs" />
                      </div>
                      <div className="sm:col-span-6 space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                        <Link to={`/${cat.slug}`} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink hover:text-clay">
                          <span>View Collection</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OPTION 08 — CENTERED LUXURY SPREAD */}
      <section id="design-8" className="py-24 bg-cream/30 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 08 — CENTERED LUXURY SPREAD
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-6 flex flex-col items-center">
                <img src={cat.image} alt={cat.title} className="w-full aspect-[4/5] object-cover rounded-xs shadow-xs" />
                <span className="text-xs font-mono text-clay uppercase">{cat.tag}</span>
                <h3 className="font-display italic text-3xl text-ink">{cat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{cat.subtitle}</p>
                <Link to={`/${cat.slug}`} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink hover:text-clay border-b border-ink pb-0.5">
                  <span>Explore</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPTION 09 — MINIMAL CIRCULAR BADGES (CARDLESS) */}
      <section id="design-9" className="py-24 bg-background border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 09 — MINIMAL CIRCULAR SHOWCASE
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={`/${cat.slug}`} className="group flex flex-col items-center space-y-6">
                <div className="w-44 h-44 rounded-full overflow-hidden shadow-xs">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono text-clay uppercase block">{cat.tag}</span>
                  <h3 className="font-display italic text-3xl text-ink group-hover:text-clay transition-colors">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{cat.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OPTION 10 — TYPOGRAPHIC LIST WITH FRAMELESS HOVER */}
      <section id="design-10" className="py-24 bg-cream/30">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-2">
              OPTION 10 — TYPOGRAPHIC LIST WITH HOVER SNAPSHOT
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-ink">The Harvest Categories</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              {CATEGORIES.map((cat) => {
                const isHovered = opt10Hovered === cat.id;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setOpt10Hovered(cat.id)}
                    className={`py-8 border-b border-border/60 transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                      isHovered ? "pl-6 border-ink" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-clay uppercase tracking-widest font-semibold block mb-1">{cat.num} — {cat.itemCount}</span>
                      <h3 className="font-display italic text-4xl lg:text-5xl text-ink group-hover:text-clay transition-colors">{cat.title}</h3>
                    </div>
                    <Link to={`/${cat.slug}`} className="text-ink group-hover:text-clay">
                      <ArrowUpRight size={24} />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-5 space-y-4">
              {CATEGORIES.map((cat) => {
                if (cat.id !== opt10Hovered) return null;
                return (
                  <div key={cat.id} className="space-y-4 animate-fade-in">
                    <img src={cat.image} alt={cat.title} className="w-full aspect-[4/3] object-cover rounded-xs shadow-xs" />
                    <h4 className="font-display italic text-2xl text-ink">{cat.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
