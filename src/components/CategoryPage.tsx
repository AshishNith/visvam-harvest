import { useState, useEffect } from "react";
import { SiteLayout } from "./SiteLayout";
import { ProductCard } from "./ProductCard";
import { getProductsByCategory, type Category, type Product } from "@/lib/products";
import { fetchProductsFromBackend } from "@/lib/api";

const META: Record<Category, { index: string; title: string; intro: string }> = {
  gourmet: {
    index: "01",
    title: "Gourmet Selection",
    intro:
      "Organic Kandahar Dried Figs (Anjeer), Royal Medjool King Dates, Long Green Kishmish, Wild Berry Mixes, Queensland Macadamia Nuts, and 7-in-1 Roasted Superseeds. Sun-dried naturally with zero added sugar or preservatives.",
  },
  nuts: {
    index: "02",
    title: "Nuts & Dried Fruits",
    intro:
      "Handpicked California Jumbo Almonds, W240 Whole Cashews, Kashmiri Extra-Light Walnuts, Roasted Pistachios, and Royal Iranian Mamra Almonds. Cold-stored at 4°C to lock in natural oils and fresh crunch.",
  },
  gifting: {
    index: "03",
    title: "Gifting",
    intro:
      "Handcrafted luxury presentation boxes and celebratory dry fruit hampers featuring vacuum-sealed compartments of our finest single-origin nuts and gourmet selections.",
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
      <section className="bg-cream/60 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-end">
          <div className="animate-fade-up">
            <h1 className="font-display italic text-6xl lg:text-8xl leading-none">
              {meta.title}
            </h1>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-2xl animate-fade-up [animation-delay:150ms]">
            {meta.intro}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex justify-between items-center mb-12 pb-5">
          <p className="text-[10.5px] tracked font-semibold uppercase">
            {products.length} Selection{products.length > 1 ? "s" : ""}
          </p>
          <p className="text-[10.5px] tracked text-muted-foreground uppercase">
            100% Nitrogen-Flushed Sealed Packaging
          </p>
        </div>
        {loading ? (
          <p className="font-display italic text-2xl text-center py-20 text-muted-foreground animate-pulse">Loading single-origin collection...</p>
        ) : products.length === 0 ? (
          <p className="font-display italic text-3xl text-center py-20">Fresh collection coming soon.</p>
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
