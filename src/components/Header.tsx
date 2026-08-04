import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, User, MapPin, Menu, X, ChevronDown, Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-context";
import { SearchModal } from "./SearchModal";
import { UserAccountModal } from "./UserAccountModal";
import logoWordmark from "@/assets/Visvam Logo_Wordmark.png";
import logoEmblem from "@/assets/Visvam Logo.png";
import { products } from "@/lib/products";

const leftLinks = [
  { to: "/nuts", label: "Nuts & Kernels", category: "nuts" },
  { to: "/dried-fruits", label: "Dried Fruits", category: "dried-fruits" },
  { to: "/exotic-seeds", label: "Exotic Seeds", category: "exotic-seeds" },
] as const;

const rightLinks = [
  { to: "/combos", label: "Gift Boxes", category: "combos" },
  { to: "/story", label: "Our Story" },
] as const;

export function Header() {
  const { count, subtotal, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);

  // Add scroll listener for elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`bg-background/95 backdrop-blur-md border-b border-border/70 sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? "shadow-md bg-background/98 py-0" : "shadow-xs"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center h-20 gap-4 lg:gap-6">
          
          {/* Left Mobile Menu Toggle + Desktop Left Nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-ink hover:text-clay transition-colors rounded-xs border border-border/60"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Left Nav */}
            <nav className="hidden lg:flex items-center gap-8 text-[10.5px] font-medium tracked">
              {leftLinks.map((l) => (
                <div
                  key={l.to}
                  className="relative group py-6"
                  onMouseEnter={() => setActiveCategoryHover(l.category)}
                  onMouseLeave={() => setActiveCategoryHover(null)}
                >
                  <Link
                    to={l.to}
                    className="flex items-center gap-1 hover:text-clay transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-clay hover:after:w-full after:transition-all after:duration-300"
                    activeProps={{ className: "text-clay font-semibold after:w-full" }}
                  >
                    {l.label}
                    <ChevronDown size={11} className="text-muted-foreground transition-transform duration-200 group-hover:rotate-180" />
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {activeCategoryHover === l.category && (
                    <div className="absolute top-full left-0 w-80 bg-background border border-border shadow-xl p-4 animate-fade-up z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                        <span className="text-[9px] tracked text-muted-foreground uppercase font-semibold">
                          Featured in {l.label}
                        </span>
                        <Link
                          to={l.to}
                          className="text-[9px] text-clay hover:underline flex items-center gap-1 font-sans capitalize"
                        >
                          View All <ArrowRight size={10} />
                        </Link>
                      </div>
                      <div className="space-y-2">
                        {products
                          .filter((p) => p.category === l.category)
                          .slice(0, 2)
                          .map((p) => (
                            <Link
                              key={p.slug}
                              to="/menu/$slug"
                              params={{ slug: p.slug }}
                              className="flex items-center gap-3 p-2 hover:bg-cream/60 transition-colors border border-transparent hover:border-border/50"
                            >
                              <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover border" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-medium text-ink truncate">{p.name}</h5>
                                <p className="text-[10px] text-clay font-semibold">{formatPrice(p.price)}</p>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Center Brand Logo */}
          <Link to="/" className="flex flex-col items-center justify-center group py-2 text-center">
            <img
              src={logoWordmark}
              alt="Viśvam — Royal Dry Fruits & Nuts"
              width={165}
              height={64}
              className="h-11 sm:h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-[8px] tracked text-clay font-semibold opacity-90 hidden sm:block mt-0.5">
              ROYAL DRY FRUITS & NUTS
            </span>
          </Link>

          {/* Right Navigation & Utility Actions */}
          <div className="flex items-center justify-end gap-3 sm:gap-5">
            {/* Desktop Right Links */}
            <nav className="hidden lg:flex items-center gap-8 text-[10.5px] font-medium tracked mr-1">
              {rightLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="hover:text-clay transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-clay hover:after:w-full after:transition-all after:duration-300"
                  activeProps={{ className: "text-clay font-semibold after:w-full" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>



            {/* Interactive Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search harvest catalog"
              className="p-2 hover:text-clay hover:bg-cream/60 transition-all rounded-xs text-ink/80"
              title="Search harvest"
            >
              <Search size={18} strokeWidth={1.4} />
            </button>

            {/* User Account / Sign In Button */}
            <button
              onClick={() => setIsAccountOpen(true)}
              aria-label="Account Portal"
              className="p-2 hover:text-clay hover:bg-cream/60 transition-all rounded-xs text-ink/80"
              title="Account & Orders"
            >
              <User size={18} strokeWidth={1.4} />
            </button>

            {/* Bag Button with Dynamic Count & Hover Tooltip */}
            <button
              onClick={openCart}
              className="text-[10.5px] tracked font-medium relative group bg-ink text-white px-3.5 sm:px-4 py-2 hover:bg-clay transition-all duration-300 flex items-center gap-2 shadow-xs"
            >
              <ShoppingBag size={14} className="text-sand group-hover:scale-110 transition-transform" />
              <span>Bag ({count})</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-ember text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background animate-fade-up">
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-center py-2">
                <img src={logoEmblem} alt="Viśvam Harvest Emblem" className="h-10 w-auto object-contain" />
              </div>
              {/* Quick Search Bar inside Mobile Menu */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-cream/50 border border-border text-xs text-muted-foreground text-left"
              >
                <Search size={14} className="text-clay" />
                <span>Search almonds, cashews, figs...</span>
              </button>

              {/* Mobile Links */}
              <div className="flex flex-col space-y-3 pt-2">
                <Link
                  to="/nuts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-medium tracked uppercase py-2 border-b border-border/40 hover:text-clay flex items-center justify-between"
                >
                  <span>Nuts & Kernels</span>
                  <ArrowRight size={14} className="text-clay" />
                </Link>

                <Link
                  to="/dried-fruits"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-medium tracked uppercase py-2 border-b border-border/40 hover:text-clay flex items-center justify-between"
                >
                  <span>Dried Fruits & Dates</span>
                  <ArrowRight size={14} className="text-clay" />
                </Link>

                <Link
                  to="/exotic-seeds"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-medium tracked uppercase py-2 border-b border-border/40 hover:text-clay flex items-center justify-between"
                >
                  <span>Exotic Seeds & Mixes</span>
                  <ArrowRight size={14} className="text-clay" />
                </Link>

                <Link
                  to="/combos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-medium tracked uppercase py-2 border-b border-border/40 hover:text-clay flex items-center justify-between text-clay font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={13} /> Gift Boxes & Combos
                  </span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/story"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-medium tracked uppercase py-2 hover:text-clay flex items-center justify-between"
                >
                  <span>Our Sourcing Story</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Mobile Footer Info */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-clay" /> 100% Handpicked Sourcing
                </span>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAccountOpen(true);
                  }}
                  className="text-clay font-semibold underline uppercase tracking-wider"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Interactive Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* User Account Portal Modal */}
      <UserAccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  );
}
