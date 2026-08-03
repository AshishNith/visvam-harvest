import { Link } from "@tanstack/react-router";
import { Search, User, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import logo from "@/assets/visvam-logo.png";

const links = [
  { to: "/nuts", label: "Nuts & Kernels" },
  { to: "/dried-fruits", label: "Dried Fruits" },
  { to: "/exotic-seeds", label: "Exotic Seeds" },
] as const;

const rightLinks = [
  { to: "/combos", label: "Gift Boxes" },
  { to: "/story", label: "Our Story" },
] as const;

export function Header() {
  const { count, openCart } = useCart();
  return (
    <header className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-[1fr_auto_1fr] items-center h-20 gap-6">
        <nav className="hidden lg:flex items-center gap-8 text-[10.5px] font-medium tracked">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-clay transition-colors"
              activeProps={{ className: "text-clay font-semibold" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="flex items-center gap-3 justify-center group py-2">
          <img
            src={logo}
            alt="Viśvam — Royal Dry Fruits & Nuts"
            width={160}
            height={64}
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="flex items-center justify-end gap-6">
          <nav className="hidden lg:flex items-center gap-8 text-[10.5px] font-medium tracked mr-2">
            {rightLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-clay transition-colors"
                activeProps={{ className: "text-clay font-semibold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] tracked border border-border px-3 py-1 bg-cream/50">
            <MapPin size={11} strokeWidth={1.5} className="text-clay" />
            100% Handpicked Sourcing
          </div>
          <button aria-label="Search harvest" className="p-1 hover:text-clay transition-colors">
            <Search size={16} strokeWidth={1.25} />
          </button>
          <button aria-label="Account" className="p-1 hover:text-clay transition-colors">
            <User size={16} strokeWidth={1.25} />
          </button>
          <button
            onClick={openCart}
            className="text-[10.5px] tracked font-medium relative group pl-1 bg-ink text-white px-4 py-2 hover:bg-clay transition-colors"
          >
            Bag ({count})
          </button>
        </div>
      </div>
    </header>
  );
}
