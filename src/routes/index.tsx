import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Layers, ShieldCheck, Droplets } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { ScrollStackCategories } from "@/components/ScrollStackCategories";
import { useCart, formatPrice } from "@/lib/cart-context";
import { fetchProductsFromBackend } from "@/lib/api";
import { products, categories, type Product } from "@/lib/products";
import heroVideoMp4 from "@/assets/timeline-hero.mp4";
import heroVideoMov from "@/assets/Timeline 1.mov";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


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
      { title: "Viśvam — Premium Dry Fruits & Handpicked Nuts" },
      {
        name: "description",
        content:
          "Viśvam offers single-origin California Jumbo Almonds, W240 Whole Cashews, Kashmiri Extra-Light Walnuts, Organic Figs, and Medjool Dates delivered in nitrogen-sealed fresh packaging.",
      },
      { property: "og:title", content: "Viśvam — Premium Dry Fruits & Handpicked Nuts" },
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
  const [bestsellers, setBestsellers] = useState<Product[]>(() =>
    products.filter((p) => p.category === "nuts" && p.bestseller).slice(0, 4)
  );
  const [giftBox, setGiftBox] = useState<Product | null>(null);
  const [gsapActiveIndex, setGsapActiveIndex] = useState<number>(0);
  const pinnedContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { add } = useCart();

  useEffect(() => {
    fetchProductsFromBackend({ category: "nuts", bestseller: true, limit: 6 }).then((data) => {
      if (data && data.length > 0) {
        const priorityOrder = [
          "california-jumbo-almonds",
          "king-w240-cashews",
          "kashmiri-snow-walnuts",
          "roasted-salted-pistachios",
        ];
        const sorted = [...data].sort((a, b) => {
          const idxA = priorityOrder.indexOf(a.slug);
          const idxB = priorityOrder.indexOf(b.slug);
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });
        setBestsellers(sorted);
      }
    });

    fetchProductsFromBackend({ category: "gifting", limit: 1 }).then((data) => {
      if (data && data.length > 0) {
        setGiftBox(data[0]);
      }
    });

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.defaultMuted = true;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    };

    const handlePreloaderDone = () => {
      playVideo();
    };

    window.addEventListener("preloaderDone", handlePreloaderDone);
    playVideo();

    return () => {
      clearInterval(timer);
      window.removeEventListener("preloaderDone", handlePreloaderDone);
    };
  }, []);

  // Initialize GSAP ScrollTrigger for Pinned Layout on desktop
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    setGsapActiveIndex(0);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
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

    return () => mm.revert();
  }, [bestsellers]);

  const currentGsapProduct = bestsellers[gsapActiveIndex] || bestsellers[0];

  return (
    <SiteLayout>
      {/* Hero Video Background */}
      <section className="relative min-h-screen lg:h-screen overflow-hidden bg-cream">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          }}
          className="absolute inset-0 w-full h-full object-cover rounded-none hero-video"
        >
          <source src={heroVideoMp4} type="video/mp4" />
          <source src={heroVideoMov} type="video/quicktime" />
          <source src={heroVideoMov} type="video/mp4" />
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

      {/* The Orchard Bestsellers - Pinned Image Stage + Vertical Centering */}
      <section className="py-14 sm:py-20 lg:py-24 bg-cream/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-14 border-b border-border/40 pb-5 sm:pb-6 gap-4">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-clay uppercase tracked block mb-1">
                Curated Single-Origin Harvest
              </span>
              <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl">The Orchard Bestsellers</h2>
            </div>
            <Link
              to="/nuts"
              className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 self-start sm:self-auto"
            >
              <span>Explore Catalog</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </Link>
          </div>

          {currentGsapProduct && (
            <div ref={pinnedContainerRef} className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:min-h-[1200px]">
              {/* Left Pinned Image Stage (Visible only on desktop lg screens & Sticky Centered) */}
              <div className="hidden lg:block lg:col-span-6 sticky top-28 self-start">
                <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-cream border border-border/30 shadow-xs text-left relative flex items-center justify-center">
                  <img
                    key={currentGsapProduct.slug}
                    src={currentGsapProduct.images[0]}
                    alt={currentGsapProduct.name}
                    className="w-full h-full object-cover object-center rounded-3xl transition-all duration-500"
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

              {/* Right Scrolling Text / Card List */}
              <div className="lg:col-span-6 space-y-12 sm:space-y-20 lg:space-y-36 py-2 lg:py-4 text-left">
                {bestsellers.slice(0, 4).map((p, idx) => (
                  <div
                    key={p.slug}
                    className={`gsap-product-trigger space-y-4 pb-8 sm:pb-12 border-b border-border/30 text-left flex flex-col justify-center transition-opacity duration-300 ${
                      gsapActiveIndex === idx ? "opacity-100" : "opacity-100 lg:opacity-40"
                    }`}
                  >
                    {/* Inline Image for Mobile Screens */}
                    <div className="lg:hidden relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-cream flex items-center justify-center border border-border/30 shadow-xs">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-center rounded-2xl" />
                      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/30">
                        <span className="text-[10px] text-clay font-bold uppercase tracking-wider block">
                          {p.origin}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-clay">
                      <Layers size={13} />
                      <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                        0{idx + 1} Harvest Selection • {p.origin}
                      </span>
                    </div>

                    <h4 className="font-display text-2xl sm:text-3xl lg:text-4xl text-ink text-left leading-tight">{p.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md text-left">{p.description}</p>

                    <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground pt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 bg-sand/40 px-2 py-0.5 rounded-sm">
                        <ShieldCheck size={13} className="text-clay" /> Cold Lock 4°C
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-sand/40 px-2 py-0.5 rounded-sm">
                        <Droplets size={13} className="text-clay" /> Grade A1
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-border/40">
                      <div className="text-left">
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground block text-left">{p.serving}</span>
                        <span className="text-xl sm:text-2xl font-bold text-ink text-left">{formatPrice(p.price)}</span>
                      </div>
                      <button
                        onClick={() => add(p)}
                        className="group inline-flex items-center gap-2 text-ink text-[11px] sm:text-[12px] font-medium tracked uppercase tracking-widest py-1.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                      >
                        <span>Add to Bag</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            loading="eager"
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
              loading="eager"
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
