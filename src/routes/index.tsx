import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { ScrollStackCategories } from "@/components/ScrollStackCategories";
import { useCart, formatPrice } from "@/lib/cart-context";
import { products, categories } from "@/lib/products";
import cashewsHero from "@/assets/cashews-1.png";
import heroVideo from "@/assets/Dry_fruit_craftsmanship_montage_202608061931.mp4";

const HERO_SLIDES = [
  {
    line1: "HANDPICKED FOR",
    line2: "ROYAL CRUNCH",
  },
  {
    line1: "HARVESTED AT",
    line2: "PEAK OIL MATURITY",
  },
  {
    line1: "SINGLE ORIGIN",
    line2: "KASHMIRI SNOW WALNUTS",
  },
  {
    line1: "COLD CHAIN LOCKED",
    line2: "FOR PEAK FRESHNESS",
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
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <SiteLayout>
      {/* Hero Video Background */}
      <section className="relative min-h-screen lg:h-screen overflow-hidden bg-cream">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/65 via-ink/20 to-ink/75 pointer-events-none" />

        {/* Clean Centered Dynamic Sentence - Reference Stacked Uppercase Layout */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-6 z-10 pointer-events-none">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <h1
                key={slide.line1}
                className={`font-display text-white uppercase text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal leading-[0.95] tracking-tight max-w-2xl transition-all duration-1000 ease-in-out absolute flex flex-col items-center justify-center ${
                  isActive
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-6 scale-95 pointer-events-none"
                }`}
              >
                <span>{slide.line1}</span>
                <span>{slide.line2}</span>
              </h1>
            );
          })}
        </div>
      </section>



      {/* Bestsellers */}
      <section className="py-24 bg-cream/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-end mb-14">
            <div>
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

      {/* Interactive Scroll Stack Category Section */}
      <ScrollStackCategories />

      {/* Editorial Split - Commented out per client request
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
      */}

      {/* Featured Gift Box - Commented out per client request
      <section className="py-24 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="bg-cream aspect-[5/4] relative overflow-hidden group">
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
      */}

      {/* Customer Testimonials */}
      <section className="bg-cream py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
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
              <article key={r.initials} className="bg-background p-8 rounded-sm shadow-xs">
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
