import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useCart, formatPrice } from "@/lib/cart-context";
import { getProductBySlug, products, categories } from "@/lib/products";
import { Check, ShieldCheck, MapPin, Award, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/menu/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.product.name} — Viśvam Harvest`
          : "Harvest — Viśvam Harvest",
      },
      {
        name: "description",
        content:
          loaderData?.product.description ??
          "Handpicked single-origin dry fruits and premium nuts at Viśvam Harvest.",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.product.name} — Viśvam Harvest` : "Viśvam Harvest",
      },
      {
        property: "og:description",
        content: loaderData?.product.description ?? "Cold-stored, handpicked dry fruits and nuts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuItemPage,
});

function MenuItemPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [active, setActive] = useState(0);
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);
  const categoryLabel =
    categories.find((c) => c.slug === product.category)?.label ?? product.category;

  return (
    <SiteLayout>
      <div className="max-w-[1200px] mx-auto px-6 pt-6">
        <nav className="text-[10px] tracked text-muted-foreground flex gap-2 items-center">
          <Link to="/" className="hover:text-clay">Home</Link>
          <span>/</span>
          <Link to={`/${product.category}` as "/nuts"} className="hover:text-clay">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="max-w-lg mx-auto w-full">
          <div className="bg-cream relative overflow-hidden aspect-square border border-border/40 max-h-[460px] rounded-lg">
            {product.badge && (
              <span
                className={`absolute top-4 left-4 z-10 text-[9px] tracked px-2.5 py-1 font-semibold uppercase rounded-full ${
                  product.isNew || product.badge === "Superfood"
                    ? "bg-ink text-white"
                    : "bg-white/90 backdrop-blur-sm text-ink border border-border"
                }`}
              >
                {product.badge}
              </span>
            )}
            <img
              key={active}
              src={product.images[active]}
              alt={`${product.name} — photo ${active + 1}`}
              width={600}
              height={600}
              className="w-full h-full object-cover animate-fade-in"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2.5 mt-2.5">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`aspect-square overflow-hidden bg-cream border rounded-md transition-colors ${
                    i === active ? "border-ink" : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    width={200}
                    height={200}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-opacity ${
                      i === active ? "opacity-100" : "opacity-70 hover:opacity-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Action */}
        <div className="flex flex-col max-w-lg">
          <p className="text-[9.5px] tracked text-muted-foreground mb-1.5 uppercase tracking-widest">{categoryLabel}</p>
          <h1 className="font-display italic text-3xl lg:text-4xl mb-2 leading-tight">
            {product.name}
          </h1>
          <p className="text-[10.5px] tracked text-muted-foreground mb-4 font-medium">{product.tagline}</p>
          
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl font-display italic tabular-nums text-ink">{formatPrice(product.price)}</span>
            <span className="text-[10.5px] tracked text-muted-foreground">({product.serving})</span>
          </div>

          <div className="grid grid-cols-2 gap-3 border-y border-border/70 py-3.5 mb-5 text-[10.5px] tracked">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-clay" />
              <span>Origin: <strong>{product.origin}</strong></span>
            </div>
            {product.grade && (
              <div className="flex items-center gap-2">
                <Award size={13} className="text-clay" />
                <span>Grade: <strong>{product.grade}</strong></span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-5">
            {product.description}
          </p>

          {product.benefits && product.benefits.length > 0 && (
            <div className="mb-6">
              <h5 className="text-[9.5px] tracked font-semibold text-muted-foreground uppercase mb-2">Key Wellness Benefits</h5>
              <div className="flex flex-wrap gap-1.5">
                {product.benefits.map((b) => (
                  <span key={b} className="text-[10px] bg-sand/60 px-2.5 py-1 text-ink border border-border/50 rounded-full flex items-center gap-1">
                    <Check size={11} className="text-clay" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => add(product)}
            className="group inline-flex items-center gap-3 text-ink text-[12px] font-medium tracked uppercase tracking-widest py-2.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 mb-6 self-start"
          >
            <span>Add to Harvest Bag — {formatPrice(product.price)}</span>
            <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
          </button>

          <ul className="space-y-2 border-t border-border/70 pt-5">
            {[
              "100% Handpicked & Cold-Stored Harvest",
              "Nitrogen-Flushed Airtight Packaging",
              "Free Express Courier Shipping over $50",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 text-[11px] items-center text-muted-foreground">
                <ShieldCheck size={13} className="text-clay shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-14 border-t border-border mt-8">
          <h2 className="font-display italic text-2xl lg:text-3xl mb-8">Pairs perfectly with</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
