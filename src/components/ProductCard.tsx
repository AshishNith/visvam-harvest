import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <article className="group flex flex-col">
      <Link
        to="/menu/$slug"
        params={{ slug: product.slug }}
        className="block relative aspect-[3/4] mb-5 overflow-hidden bg-cream/70"
      >
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`text-[9px] tracked px-2.5 py-1 font-semibold uppercase ${
                product.isNew || product.badge === "Superfood" || product.badge === "Organic"
                  ? "bg-ink text-white"
                  : "bg-white/90 backdrop-blur-sm text-ink"
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 tracked">
          {product.serving}
        </div>
        <img
          src={product.images[0]}
          alt={product.name}
          width={912}
          height={1200}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-[900ms] ease-out group-hover:opacity-0 group-hover:scale-[1.04]"
        />
        <img
          src={product.images[1] ?? product.images[0]}
          alt={`${product.name} detail`}
          width={912}
          height={1200}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.06] transition-all duration-[900ms] ease-out group-hover:opacity-100 group-hover:scale-100"
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-ink text-white py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-[9.5px] tracked text-white/70">{product.origin}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              add(product);
            }}
            className="group/btn inline-flex items-center gap-1.5 text-[10px] tracked font-medium uppercase text-white hover:text-clay transition-all duration-300"
          >
            <span>Add to bag</span>
            <ArrowRight size={11} className="group-hover/btn:translate-x-1 transition-transform duration-300 text-clay" />
          </button>
        </div>
      </Link>
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-medium leading-snug">
            <Link to="/menu/$slug" params={{ slug: product.slug }} className="hover:text-clay transition-colors">
              {product.name}
            </Link>
          </h4>
          <p className="text-[10.5px] text-muted-foreground tracked mt-1 line-clamp-1">{product.tagline}</p>
        </div>
        <div className="pt-2 flex justify-between items-baseline mt-2">
          <span className="text-sm font-semibold tabular-nums">{formatPrice(product.price)}</span>
          <span className="text-[9px] tracked text-muted-foreground">{product.serving}</span>
        </div>
      </div>
    </article>
  );
}
