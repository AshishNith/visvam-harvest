import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useCart, formatPrice } from "@/lib/cart-context";
import { products, type Product } from "@/lib/products";
import { fetchProductsFromBackend } from "@/lib/api";

export const Route = createFileRoute("/combos")({
  head: () => {
    const canonicalUrl = "https://visvam.in/combos";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Gift Boxes & Combos — Viśvam",
      "description": "Handcrafted luxury dry fruit gift boxes, festive celebration collections, and corporate hampers.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Dry Fruit Combos & Gift Boxes — Viśvam | Luxury Hampers" },
        {
          name: "description",
          content:
            "Shop curated dry fruit combo packs, 4-in-1 luxury gift boxes, and festive corporate hampers with California almonds, cashews, and walnuts.",
        },
        {
          name: "keywords",
          content: "dry fruit combos online, dry fruit gift box, festive hampers India, corporate dry fruit box, luxury combos Viśvam",
        },
        { property: "og:title", content: "Gift Boxes & Combos — Viśvam" },
        { property: "og:description", content: "Opulent gift boxes with premium nuts and dried fruits." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Gift Boxes & Combos — Viśvam" },
        { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(collectionSchema),
        },
      ],
    };
  },
  component: Combos,
});

function Combos() {
  const { add } = useCart();
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [bundleItems, setBundleItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    Promise.all([
      fetchProductsFromBackend({ category: "gifting" }),
      fetchProductsFromBackend({ limit: 20 }),
    ]).then(([giftingData, allData]) => {
      if (!isMounted) return;
      if (giftingData) setComboProducts(giftingData);
      if (allData) {
        const bundleSlugs = [
          "california-jumbo-almonds",
          "king-w240-cashews",
          "kashmiri-snow-walnuts",
          "afghani-organic-anjeer",
        ];
        setBundleItems(allData.filter((p) => bundleSlugs.includes(p.slug)));
      }
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  const featuredBox = comboProducts[0];
  const bundleTotal = bundleItems.reduce((s, p) => s + p.price, 0);
  const bundleDiscounted = Math.round(bundleTotal * 0.85 * 100) / 100;

  return (
    <SiteLayout>
      <section className="bg-cream/60">
        <div className="max-w-[1400px] mx-auto px-6 py-20 lg:py-28">
          <h1 className="font-display italic text-6xl lg:text-8xl leading-none animate-fade-up">
            Gift Boxes & Combos
          </h1>
          <p className="mt-6 text-sm text-muted-foreground max-w-lg leading-relaxed">
            Elevate celebrations, corporate milestones, and daily wellness with handcrafted luxury dry fruit gift sets.
          </p>
        </div>
      </section>

      {/* Featured Luxury Gift Set */}
      {featuredBox && (
        <section className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-cream relative overflow-hidden aspect-[4/3] group border border-border/40">
            <img
              src={featuredBox.images[0]}
            alt={featuredBox.name}
            width={1408}
            height={1008}
            loading="eager"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[900ms]"
          />
          <div className="absolute top-5 left-5 flex flex-col gap-2">
            <span className="bg-ink text-white text-[9px] tracked px-3 py-1 font-semibold uppercase">Save 15%</span>
            <span className="bg-white/90 backdrop-blur-sm text-ink text-[9px] tracked px-3 py-1 font-semibold uppercase">Luxury Rigid Box</span>
          </div>
        </div>
        <div className="flex flex-col justify-center py-6">
          <h2 className="font-display italic text-4xl mb-4">{featuredBox.name}</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
            {featuredBox.description}
          </p>
          <div className="space-y-3 mb-8">
            {bundleItems.map((p) => (
              <div
                key={p.slug}
                className="flex justify-between text-[12.5px] border-b border-border pb-3"
              >
                <span>{p.name}</span>
                <span className="text-muted-foreground tabular-nums">{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-[10px] tracked uppercase font-semibold">Special Bundle Price</span>
            <span className="font-display italic text-4xl text-ink">{formatPrice(bundleDiscounted)}</span>
            <span className="text-[12px] text-muted-foreground line-through tabular-nums">
              {formatPrice(bundleTotal)}
            </span>
          </div>
          <button
            onClick={() => bundleItems.forEach((p) => add(p, false))}
            className="group inline-flex items-center gap-3 text-ink text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 self-start"
          >
            <span>Add Bundle to Bag</span>
            <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
          </button>
        </div>
      </section>
      )}

      {/* All Gift Boxes */}
      <section className="max-w-[1400px] mx-auto px-6 py-20 border-t border-border">
        <h2 className="font-display italic text-4xl mb-12">All Luxury Gift Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {comboProducts.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-ink text-white py-20 text-center">
        <h2 className="font-display italic text-4xl md:text-5xl max-w-2xl mx-auto px-6 mb-8">
          Personalized hampers with custom ribboning and brass foil branding.
        </h2>
        <Link
          to="/story"
          className="group inline-flex items-center gap-3 text-white text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-white/80 hover:text-clay hover:border-clay transition-all duration-300"
        >
          <span>Inquire for Corporate Orders</span>
          <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
        </Link>
      </section>
    </SiteLayout>
  );
}
