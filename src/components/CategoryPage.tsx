import { SiteLayout } from "./SiteLayout";
import { ProductCard } from "./ProductCard";
import { getProductsByCategory, type Category } from "@/lib/products";

const META: Record<Category, { index: string; title: string; intro: string }> = {
  nuts: {
    index: "01",
    title: "Nuts & Kernels",
    intro:
      "Handpicked California Jumbo Almonds, W240 Whole Cashews, Kashmiri Extra-Light Walnuts, and Roasted Pistachios. Cold-stored at 4°C to lock in natural oils and orchard crunch.",
  },
  "dried-fruits": {
    index: "02",
    title: "Dried Fruits & Dates",
    intro:
      "Organic Kandahar Dried Figs (Anjeer), Royal Medjool King Dates, Long Green Kishmish, and Wild Berry Mixes. Sun and shade-dried naturally with zero added sugar or preservatives.",
  },
  "exotic-seeds": {
    index: "03",
    title: "Exotic Seeds & Mixes",
    intro:
      "Raw Queensland Macadamia Nuts and 7-in-1 Roasted Superseeds Wellness Mix. Rich in monounsaturated healthy fats, plant protein, magnesium, and dietary fiber.",
  },
  combos: {
    index: "04",
    title: "Gift Boxes & Combos",
    intro:
      "Handcrafted luxury presentation boxes and celebratory dry fruit hampers featuring vacuum-sealed compartments of our finest single-origin nuts and dried fruits.",
  },
};

export function CategoryPage({ category }: { category: Category }) {
  const products = getProductsByCategory(category);
  const meta = META[category] ?? META.nuts;
  return (
    <SiteLayout>
      <section className="border-b border-border bg-cream/60">
        <div className="max-w-[1400px] mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-end">
          <div className="animate-fade-up">
            <p className="text-[10px] tracked text-muted-foreground mb-4 uppercase tracking-widest">
              {meta.index} — Harvest Selection
            </p>
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
        <div className="flex justify-between items-center mb-12 pb-5 border-b border-border">
          <p className="text-[10.5px] tracked font-semibold uppercase">
            {products.length} Selection{products.length > 1 ? "s" : ""}
          </p>
          <p className="text-[10.5px] tracked text-muted-foreground uppercase">
            100% Nitrogen-Flushed Sealed Packaging
          </p>
        </div>
        {products.length === 0 ? (
          <p className="font-display italic text-3xl text-center py-20">Fresh harvest coming soon.</p>
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
