import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { type Product } from "@/lib/products";
import { fetchProductsFromBackend } from "@/lib/api";
import { searchProducts } from "@/lib/search";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
    };
  },
  head: () => ({
    meta: [
      { title: "Search — Viśvam" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = useSearch({ from: "/search" });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchProductsFromBackend().then((backendProducts) => {
      if (!isMounted) return;
      setAllProducts(backendProducts || []);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const results = useMemo(() => searchProducts(allProducts, q), [allProducts, q]);

  return (
    <SiteLayout>
      <section className="max-w-[1400px] mx-auto px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <p className="text-[10.5px] tracked font-semibold uppercase text-muted-foreground mb-3">
          Search
        </p>
        <h1 className="font-display italic text-4xl sm:text-5xl text-ink mb-4">
          {q ? `Results for "${q}"` : "Search our collection"}
        </h1>
        {!loading && (
          <p className="text-sm text-muted-foreground mb-12">
            {q
              ? `${results.length} item${results.length !== 1 ? "s" : ""} found`
              : "Enter a search term to find products."}
          </p>
        )}

        {loading ? (
          <p className="font-display italic text-2xl text-center py-20 text-muted-foreground animate-pulse">
            Searching our collection...
          </p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : q ? (
          <div className="text-center py-20 space-y-4">
            <p className="font-display italic text-3xl text-ink">No items found</p>
            <p className="text-sm text-muted-foreground">
              Try searching for "Almonds", "Figs", "Cashews", or "Gift Boxes".
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-ink text-white px-8 py-3.5 text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay transition-colors mt-4"
            >
              Back to Home
            </Link>
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
