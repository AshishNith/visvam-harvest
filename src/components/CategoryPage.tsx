import { useState, useEffect } from "react";
import { SiteLayout } from "./SiteLayout";
import { ProductCard } from "./ProductCard";
import { getProductsByCategory, type Category, type Product, cImg } from "@/lib/products";
import { fetchProductsFromBackend } from "@/lib/api";
import nutsHeroBg from "@/assets/nuts-hero-bg.jpg";

// Use Cloudinary CDN with auto-format & quality instead of raw 57 MB local files
const META: Record<Category, { index: string; title: string; intro: string; image: string; blurBg?: boolean }> = {
  gourmet: {
    index: "01",
    title: "Gourmet",
    intro:
      "A little sweetness, a little savoury, and plenty of reasons to indulge. Carefully curated for you to discover, savour and share.",
    image: cImg("05_Dates_Khajoor/DSC00525.jpg"),
  },
  nuts: {
    index: "02",
    title: "Nuts & Dried Fruits",
    intro:
      "Discover thoughtfully sourced dry fruits and nuts, designed for moments of calm, clarity, and understated indulgence.",
    image: nutsHeroBg,
    blurBg: true,
  },
  gifting: {
    index: "03",
    title: "Gifting",
    intro:
      "Handcrafted luxury presentation boxes and celebratory dry fruit hampers featuring distinct compartments of our finest single-origin nuts and gourmet selections.",
    image: cImg("08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg"),
  },
};

export function CategoryPage({ category }: { category: Category }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchProductsFromBackend({ category }).then((data) => {
      if (isMounted) {
        setProducts(data || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [category]);

  const meta = META[category] ?? META.gourmet;
  return (
    <SiteLayout>
      <section className="relative overflow-hidden min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center justify-center pt-32 pb-20 sm:pt-40 sm:pb-28 border-b border-border/40">
        {/* Crisp Background Image with Subtle Elegant Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={meta.image}
            alt={meta.title}
            className={`w-full h-full object-cover object-center ${meta.blurBg ? "blur-[2px]" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/25 to-ink/65" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 text-center text-white">
          <h1 className="font-display italic text-5xl sm:text-7xl lg:text-8xl text-white leading-[1.02] tracking-tight mb-6 animate-fade-up drop-shadow-md">
            {meta.title}
          </h1>

          <div className="w-12 h-px bg-sand/80 mx-auto my-6 animate-fade-up shadow-sm" />

          <p className="font-baskerville italic text-lg sm:text-2xl text-cream leading-relaxed max-w-2xl mx-auto animate-fade-up [animation-delay:150ms] drop-shadow-md">
            {meta.intro}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex justify-between items-center mb-12 pb-5">
          <p className="text-[10.5px] tracked font-semibold uppercase text-muted-foreground">
            {products.length} Selection{products.length > 1 ? "s" : ""}
          </p>
        </div>
        {loading ? (
          <p className="font-display italic text-2xl text-center py-20 text-muted-foreground animate-pulse">Loading single-origin collection...</p>
        ) : products.length === 0 ? (
          <p className="font-display italic text-3xl text-center py-20">Curating for you.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
