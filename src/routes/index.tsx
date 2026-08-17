import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Layers, ShieldCheck, Droplets } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { ScrollStackCategories } from "@/components/ScrollStackCategories";
import { ReelsSection } from "@/components/ReelsSection";
import { useCart, formatPrice } from "@/lib/cart-context";
import { fetchProductsFromBackend } from "@/lib/api";
import { products, categories, type Product } from "@/lib/products";
import heroVideoMp4 from "@/assets/timeline-hero.mp4";
import heroVideoMov from "@/assets/Timeline 1.mov";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Viśvam — Premium Dry Fruits & Handpicked Nuts | Buy Online India" },
      {
        name: "description",
        content:
          "Buy cold-stored, single-origin California Jumbo Almonds, W240 Whole Cashews, Kashmiri Extra-Light Walnuts, Organic Figs, and Medjool Dates delivered nationwide in nitrogen-sealed fresh packaging.",
      },
      {
        name: "keywords",
        content:
          "buy dry fruits online, premium almonds India, W240 cashews online, Kashmiri walnuts, dry fruit gift boxes, fresh dates online, Viśvam harvest",
      },
      { property: "og:title", content: "Viśvam — Premium Dry Fruits & Handpicked Nuts" },
      {
        property: "og:description",
        content: "Cold-stored, single-origin dry fruits, jumbo nuts, and handcrafted royal gift hampers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Viśvam — Premium Dry Fruits & Handpicked Nuts" },
      { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visvam.in/" }],
  }),
  component: Home,
});

function Home() {
  const [bestsellers, setBestsellers] = useState<Product[]>(() =>
    products.filter((p) => p.category === "nuts" && p.bestseller).slice(0, 4)
  );
  const [giftBox, setGiftBox] = useState<Product | null>(null);
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
      window.removeEventListener("preloaderDone", handlePreloaderDone);
    };
  }, []);

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
          <source src={heroVideoMov} type="video/mp4" />
          <source src={heroVideoMov} type="video/quicktime" />
          <source src={heroVideoMp4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/40 pointer-events-none" />
      </section>

      {/* The Viśvam Bestsellers - Simple Card Grid */}
      <section className="py-14 sm:py-20 bg-cream/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-border/40 pb-5 gap-4">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-clay uppercase tracked block mb-1">
                Curated Single-Origin Harvest
              </span>
              <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl">The Viśvam Bestsellers</h2>
            </div>
            <Link
              to="/nuts"
              className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 self-start sm:self-auto"
            >
              <span>Explore Catalog</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {bestsellers.slice(0, 3).map((p) => (
              <div key={p.slug} className="group flex flex-col justify-between">
                <div>
                  {/* Small Image with Rounded Corners */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-cream flex items-center justify-center">
                    <Link to="/menu/$slug" params={{ slug: p.slug }} className="w-full h-full block">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover object-center rounded-2xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                  </div>

                  {/* Details Below */}
                  <h4 className="font-display text-lg text-ink font-medium leading-snug mb-1 line-clamp-1 group-hover:text-clay transition-colors">
                    <Link to="/menu/$slug" params={{ slug: p.slug }}>
                      {p.name}
                    </Link>
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {p.tagline || p.description}
                  </p>
                </div>

                {/* Price & Standard Website Button */}
                <div className="pt-3 border-t border-border/30 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{p.serving}</span>
                    <span className="text-base font-bold text-ink">{formatPrice(p.price)}</span>
                  </div>
                  <button
                    onClick={() => add(p)}
                    className="group/btn inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 cursor-pointer"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform duration-300 text-clay" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Scroll Stack Category Section */}
      <ScrollStackCategories />

      {/* Instagram Reels Preview Section - Hidden for now per client request
      <ReelsSection />
      */}

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
