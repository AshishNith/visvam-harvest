import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useCart, formatPrice } from "@/lib/cart-context";
import { products, categories } from "@/lib/products";
import almondsHero from "@/assets/almonds-1.png";
import cashewsHero from "@/assets/cashews-1.png";
import walnutsHero from "@/assets/walnuts-1.png";

const HERO_SLIDES = [
  {
    image: almondsHero,
    alt: "California Jumbo Almonds presented in a handcrafted ceramic bowl",
    caption: "California Jumbo Almonds",
  },
  {
    image: cashewsHero,
    alt: "King W240 Whole Cashews in a carved dark walnut wood bowl",
    caption: "King W240 Whole Cashews",
  },
  {
    image: walnutsHero,
    alt: "Kashmiri Extra-Light Walnuts in a rustic brass dish",
    caption: "Kashmiri Extra-Light Walnuts",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Viśvam Harvest — Premium Dry Fruits & Handpicked Nuts" },
      {
        name: "description",
        content:
          "Viśvam Harvest offers single-origin California Jumbo Almonds, W240 Whole Cashews, Kashmiri Extra-Light Walnuts, Organic Figs, and Medjool Dates delivered in nitrogen-sealed fresh packaging.",
      },
      { property: "og:title", content: "Viśvam Harvest — Premium Dry Fruits & Handpicked Nuts" },
      {
        property: "og:description",
        content: "Cold-stored, single-origin dry fruits and royal gift hampers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 6);
  const { add } = useCart();
  const giftBox = products.find((p) => p.slug === "royal-heritage-gift-box") ?? products[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SiteLayout>
      {/* Hero Slideshow */}
      <section className="relative h-[88vh] overflow-hidden bg-cream">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.caption}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                width={1920}
                height={1280}
                className={`w-full h-full object-cover transform transition-transform duration-[6000ms] ease-out ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center px-6 z-10">
          <h1 className="font-display italic text-white text-5xl md:text-7xl lg:text-[92px] font-normal leading-[0.95] mb-8 animate-fade-up max-w-4xl">
            Harvested for oil maturity.<br />Handpicked for royal crunch.
          </h1>
          <p className="text-white/85 text-sm max-w-md mb-10 animate-fade-up [animation-delay:300ms]">
            Single-origin California almonds, W240 cashews, organic Afghani figs, and Kashmiri snow walnuts delivered in nitrogen-sealed packaging.
          </p>
          <div className="flex flex-wrap justify-center gap-8 animate-fade-up [animation-delay:500ms] mb-10">
            <Link
              to="/nuts"
              className="group inline-flex items-center gap-3 text-white text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-white/80 hover:text-clay hover:border-clay transition-all duration-300"
            >
              <span>Shop All Harvest</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </Link>
            <Link
              to="/combos"
              className="group inline-flex items-center gap-3 text-white text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-white/50 hover:text-clay hover:border-clay transition-all duration-300"
            >
              <span>Gift Collections</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </Link>
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-center gap-3 z-20">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.caption}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.caption}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4 Harvest Pillars */}
      <section className="border-b border-border py-16 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            ["01", "Single-Origin Orchards", "Direct farm sourcing from California, Kashmir & Kandahar."],
            ["02", "Cold-Chain Locked", "Stored at 4°C to preserve natural oils and fresh aroma."],
            ["03", "Zero Preservatives", "100% natural, non-GMO, zero artificial glazing or added oil."],
            ["04", "Nitrogen Flushed", "Airtight sealed pouches for peak crunch upon delivery."],
          ].map(([index, title, body]) => (
            <div key={index} className="space-y-3.5 group">
              <p className="font-display italic text-3xl text-clay group-hover:translate-x-1 transition-transform duration-500">
                {index}
              </p>
              <h5 className="text-[10px] tracked font-semibold uppercase">{title}</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[26ch]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-24 bg-cream/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-end mb-14">
            <div>
              <p className="text-[10px] tracked text-muted-foreground mb-3 uppercase tracking-widest">— Most Cherished Harvest</p>
              <h2 className="font-display italic text-4xl md:text-5xl">The Orchard Bestsellers</h2>
            </div>
            <Link
              to="/nuts"
              className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300"
            >
              <span>Explore Catalog</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {bestsellers.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Menu Category Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-14">
          <h2 className="font-display italic text-4xl md:text-5xl">The Harvest Categories</h2>
          <p className="text-[10.5px] tracked text-muted-foreground max-w-xs hidden md:block">
            Four specialized lines — nuts, dried fruits, exotic seeds, and handcrafted gift hampers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <Link
                key={c.slug}
                to={`/${c.slug}` as "/nuts"}
                className="bg-background aspect-[4/5] p-10 flex flex-col justify-between group relative overflow-hidden hover:bg-cream transition-colors duration-500"
              >
                <span className="text-[10px] tracked text-muted-foreground uppercase">
                  {c.index} / {count} selections
                </span>
                <div>
                  <h3 className="font-display italic text-3xl md:text-4xl group-hover:translate-x-2 transition-transform duration-500 mb-2">
                    {c.label}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{c.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-[10px] tracked text-clay font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-all duration-300 self-end">
                  <span>Browse Collection</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Editorial Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 bg-sand/40">
        <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[640px]">
          <img
            src={cashewsHero}
            alt="Hand-selected jumbo whole cashews"
            width={1200}
            height={1504}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="p-10 lg:p-20 flex flex-col justify-center">
          <p className="text-[10px] tracked text-muted-foreground mb-6 uppercase tracking-widest">— Sourcing Craft</p>
          <h2 className="font-display italic text-4xl md:text-5xl mb-8 leading-tight">
            Direct Orchard Sourcing.<br />No Compromises.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-md mb-10">
            From the sun-drenched almond groves of California to the high mountain terraces of Kandahar, every single kernel in our catalog is handpicked at peak oil maturity, sorted by size and grade, and stored under 4°C cold lock.
          </p>
          <Link
            to="/story"
            className="group inline-flex items-center gap-3 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 self-start"
          >
            <span>Read Our Farm Story</span>
            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
          </Link>
        </div>
      </section>

      {/* Featured Gift Box */}
      <section className="py-24 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="bg-cream aspect-[5/4] relative overflow-hidden group border border-border/40">
            <img
              src={giftBox.images[0]}
              alt={giftBox.name}
              width={1408}
              height={1008}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[900ms]"
            />
            <div className="absolute top-5 left-5 flex flex-col gap-2">
              <span className="bg-ink text-white text-[9px] tracked px-3 py-1 font-semibold uppercase">Royal Edition</span>
              <span className="bg-white text-ink text-[9px] tracked px-3 py-1 font-semibold uppercase">Vacuum Sealed</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] tracked text-muted-foreground mb-6 uppercase tracking-widest">— Featured Gift Hamper</p>
            <h2 className="font-display italic text-4xl md:text-5xl mb-6">{giftBox.name}</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-md">
              An opulent presentation box featuring four vacuum-sealed compartments of California Jumbo Almonds, W240 Cashews, Kashmiri Walnut Halves, and Roasted Pistachios.
            </p>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-[10px] tracked uppercase font-semibold">Box Price</span>
              <span className="font-display italic text-3xl">{formatPrice(giftBox.price)}</span>
              <span className="text-[10px] tracked text-muted-foreground">({giftBox.serving})</span>
            </div>
            <button
              onClick={() => add(giftBox)}
              className="group inline-flex items-center gap-3 text-ink text-[11.5px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300"
            >
              <span>Add Gift Box to Bag</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </button>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-cream py-24 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] tracked text-muted-foreground mb-4 uppercase tracking-widest">— Customer Experiences</p>
            <div className="flex items-baseline justify-center gap-3 mb-3">
              <span className="font-display italic text-6xl">4.9</span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            <p className="text-[10.5px] tracked">★★★★★ &nbsp;·&nbsp; 3,820 Verified Harvest Reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                initials: "AS",
                name: "Ananya S.",
                title: "Incredible crunch & oil richness",
                body: "The Iranian Mamra almonds are genuinely out of this world. You can taste the high oil content immediately. Extremely fresh packaging.",
              },
              {
                initials: "VK",
                name: "Vikram K.",
                title: "Best W240 cashews on the market",
                body: "Every single cashew kernel in the 500g jar was whole, large, and perfectly roasted. Zero broken pieces or stale odor.",
              },
              {
                initials: "PM",
                name: "Priya M.",
                title: "Stunning corporate gift boxes",
                body: "Ordered 25 Royal Heritage boxes for our Diwali executive gifts. The packaging, ribboning, and quality exceeded all expectations.",
              },
            ].map((r) => (
              <article key={r.initials} className="bg-background p-8 border border-border">
                <div className="flex items-center gap-4 mb-5">
                  <div className="size-10 rounded-full bg-sand grid place-items-center text-[11px] font-semibold">
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium">{r.name}</p>
                    <p className="text-[9.5px] tracked text-muted-foreground uppercase">Verified Buyer</p>
                  </div>
                </div>
                <p className="text-[11px] mb-3 text-clay">★★★★★</p>
                <h5 className="font-medium mb-2">{r.title}</h5>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">{r.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
