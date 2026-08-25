import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, ArrowRight } from "lucide-react";
import { type Product } from "@/lib/products";
import { formatPrice } from "@/lib/cart-context";
import { fetchProductsFromBackend } from "@/lib/api";
import { searchProducts } from "@/lib/search";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingProducts(true);
      fetchProductsFromBackend().then((backendProducts) => {
        setAllProducts(backendProducts || []);
        setLoadingProducts(false);
      });
    }
  }, [isOpen]);

  const results = useMemo(() => searchProducts(allProducts, query), [query, allProducts]);
  const VISIBLE_LIMIT = 6;
  const visibleResults = results.slice(0, VISIBLE_LIMIT);

  const goToFullResults = () => {
    if (!query.trim()) return;
    navigate({ to: "/search", search: { q: query.trim() } });
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div
        className="relative w-full max-w-2xl bg-background border border-border shadow-2xl z-10 overflow-hidden animate-fade-up overscroll-contain"
      >
        {/* Header Bar */}
        <div className="flex items-center px-6 py-4 border-b border-border bg-cream/40 gap-3">
          <Search size={20} className="text-clay shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToFullResults();
            }}
            placeholder="Search almonds, cashews, figs, medjool dates, gift sets..."
            className="w-full bg-transparent text-sm md:text-base outline-none text-ink placeholder:text-muted-foreground/60 font-sans"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground hover:text-ink px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:text-clay transition-colors rounded-full hover:bg-sand/40"
            aria-label="Close search"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto overscroll-contain">
          {!query.trim() ? (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] tracked text-muted-foreground mb-3">Featured Collections</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allProducts.slice(0, 4).map((p) => (
                    <Link
                      key={p.slug}
                      to="/menu/$slug"
                      params={{ slug: p.slug }}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2.5 border border-border/60 hover:border-clay bg-cream/20 hover:bg-cream/60 transition-all group"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 object-cover shrink-0 rounded-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-medium text-ink truncate group-hover:text-clay transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs font-semibold text-clay mt-0.5">{formatPrice(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : loadingProducts ? (
            <div className="text-center py-10">
              <p className="font-display italic text-lg text-muted-foreground animate-pulse">Searching our collection...</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 gap-3">
                <p className="text-[10px] tracked text-muted-foreground">
                  Found {results.length} item{results.length > 1 ? "s" : ""} matching "{query}"
                </p>
                {results.length > VISIBLE_LIMIT && (
                  <button
                    onClick={goToFullResults}
                    className="text-[10px] tracked font-medium text-clay hover:underline shrink-0"
                  >
                    View all {results.length}
                  </button>
                )}
              </div>
              <div className="divide-y divide-border/40">
                {visibleResults.map((p) => (
                  <Link
                    key={p.slug}
                    to="/menu/$slug"
                    params={{ slug: p.slug }}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3.5 px-2 hover:bg-cream/40 transition-colors group"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-14 h-14 object-cover shrink-0 border border-border/50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] tracked px-1.5 py-0.5 bg-sand/50 text-ink/80 uppercase">
                          {p.category.replace("-", " ")}
                        </span>
                        {p.badge && (
                          <span className="text-[9px] text-clay font-medium">{p.badge}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-ink group-hover:text-clay transition-colors truncate mt-0.5">
                        {p.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.tagline}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold text-ink">{formatPrice(p.price)}</span>
                      <ArrowRight size={14} className="text-clay ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="font-display italic text-lg text-ink">No items found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for "Almonds", "Figs", "Cashews", or "Gift Boxes".
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-cream/80 border-t border-border text-[10px] text-muted-foreground flex justify-between items-center">
          <span>Press ESC or click outside to close</span>
          <span className="text-clay font-medium">Single-Origin Handpicked Sourcing</span>
        </div>
      </div>
    </div>
  );
}
