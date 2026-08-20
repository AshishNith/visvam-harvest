import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Search, User, MapPin, Menu, X, ChevronDown, Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { SearchModal } from "./SearchModal";
import { UserAccountModal } from "./UserAccountModal";
import logoWordmark from "@/assets/Visvam Logo_Wordmark.png";
import logoEmblem from "@/assets/Visvam Logo.png";
import { products } from "@/lib/products";

const leftLinks = [
  { to: "/nuts", label: "Nuts & Dried Fruits", category: "nuts" },
  { to: "/gourmet", label: "Gourmet", category: "gourmet" },
  { to: "/gifting", label: "Gifting", category: "gifting" },
] as const;

const rightLinks = [
  { to: "/story", label: "Our Story" },
] as const;

export function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isDarkHeroPage = location.pathname === "/" || location.pathname === "/nuts" || location.pathname === "/gourmet";
  const { count, openCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Add scroll listener for elevation (throttled with rAF to avoid 60+ re-renders/sec)
  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const textColorClass = isScrolled
    ? "text-ink"
    : isDarkHeroPage
    ? "text-white drop-shadow-sm"
    : "text-ink";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-sm shadow-md py-0"
            : isDarkHeroPage
            ? "bg-gradient-to-b from-black/50 via-black/20 to-transparent shadow-none border-none py-0"
            : "bg-transparent shadow-none border-none py-0"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-20 gap-4 lg:gap-6">
          
          {/* Left Mobile Menu Toggle + Mobile Logo + Desktop Left Nav */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 hover:text-clay transition-colors rounded-xs ${textColorClass}`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Logo (Left-aligned) */}
            <Link to="/" className="lg:hidden flex items-center py-2 rounded-none">
              {isScrolled ? (
                <img
                  src={logoEmblem}
                  alt="Viśvam — Royal Dry Fruits & Nuts"
                  className="h-8 sm:h-9 w-auto object-contain transition-all duration-300 rounded-none logo"
                />
              ) : (
                <img
                  src={logoWordmark}
                  alt="Viśvam — Royal Dry Fruits & Nuts"
                  className={`h-7 sm:h-8 w-auto object-contain transition-all duration-300 rounded-none logo ${
                    isDarkHeroPage ? "brightness-0 invert drop-shadow-md" : ""
                  }`}
                />
              )}
            </Link>

            {/* Desktop Left Nav */}
            <nav className={`hidden lg:flex items-center gap-8 text-[10.5px] font-medium tracked ${textColorClass}`}>
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
                    activeProps={{ className: isScrolled || !isDarkHeroPage ? "text-clay font-semibold after:w-full" : "text-white font-semibold after:w-full after:bg-white" }}
                  >
                    {l.label}
                    <ChevronDown size={11} className="text-current opacity-70 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {activeCategoryHover === l.category && (
                    <div className={`absolute top-full left-0 bg-background/98 backdrop-blur-md shadow-lg p-3 animate-fade-up z-50 rounded-sm text-ink border border-border/40 ${
                      l.category === "gifting" || l.category === "gourmet" ? "w-48" : "w-72"
                    }`}>
                      {l.category === "gifting" ? (
                        <p className="text-xs text-muted-foreground text-center py-2 font-sans font-medium whitespace-nowrap px-3">
                          Coming soon
                        </p>
                      ) : l.category === "gourmet" ? (
                        <p className="text-xs text-muted-foreground text-center py-2 font-sans font-medium whitespace-nowrap px-3">
                          Curating for you
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/30">
                            <span className="text-[9px] tracked text-muted-foreground uppercase font-medium">
                              Featured in {l.label}
                            </span>
                            <Link
                              to={l.to}
                              className="text-[9px] text-clay hover:underline flex items-center gap-1 font-sans capitalize"
                            >
                              View All <ArrowRight size={10} />
                            </Link>
                          </div>
                          <div className="space-y-2 pt-1">
                            {products
                              .filter((p) => p.category === l.category)
                              .slice(0, 2)
                              .map((p) => (
                                <Link
                                  key={p.slug}
                                  to="/menu/$slug"
                                  params={{ slug: p.slug }}
                                  className="flex items-center gap-3 p-2 hover:bg-cream/60 transition-colors"
                                >
                                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-md" />
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-medium text-ink truncate">{p.name}</h5>
                                    <p className="text-[10px] text-clay font-semibold">{formatPrice(p.price)}</p>
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Desktop Center Brand Logo */}
          <Link to="/" className="hidden lg:flex flex-col items-center justify-center group py-2 text-center rounded-none">
            {isScrolled ? (
              <img
                src={logoEmblem}
                alt="Viśvam — Royal Dry Fruits & Nuts"
                width={52}
                height={52}
                className="h-10 sm:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105 rounded-none logo"
              />
            ) : (
              <div className="flex flex-col items-center justify-center transition-all duration-300">
                <img
                  src={logoWordmark}
                  alt="Viśvam — Royal Dry Fruits & Nuts"
                  width={140}
                  height={48}
                  className={`h-9 sm:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105 rounded-none logo ${
                    isDarkHeroPage ? "brightness-0 invert drop-shadow-md" : ""
                  }`}
                />
              </div>
            )}
          </Link>

          {/* Right Navigation & Utility Actions */}
          <div className="flex items-center justify-end gap-3 sm:gap-5">
            {/* Desktop Right Links */}
            <nav className={`hidden lg:flex items-center gap-8 text-[10.5px] font-medium tracked mr-1 ${textColorClass}`}>
              {rightLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="hover:text-clay transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-clay hover:after:w-full after:transition-all after:duration-300"
                  activeProps={{ className: isScrolled || !isDarkHeroPage ? "text-clay font-semibold after:w-full" : "text-white font-semibold after:w-full after:bg-white" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Interactive Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search collection"
              className={`p-2 hover:text-clay transition-all rounded-xs ${
                isScrolled ? "hover:bg-cream/60" : "hover:bg-white/10"
              } ${textColorClass}`}
              title="Search products"
            >
              <Search size={18} strokeWidth={1.4} />
            </button>

            {/* User Account / Profile Button */}
            <button
              onClick={() => setIsAccountOpen(true)}
              aria-label="Account Portal"
              className={`p-2 hover:text-clay transition-all rounded-xs flex items-center gap-1.5 ${
                isScrolled ? "hover:bg-cream/60" : "hover:bg-white/10"
              } ${textColorClass}`}
              title={isAuthenticated ? `Logged in as ${user?.name}` : "Account & Orders"}
            >
              {isAuthenticated && user ? (
                user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-clay/40"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-clay text-white text-[10px] font-bold flex items-center justify-center font-display italic">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )
              ) : (
                <User size={18} strokeWidth={1.4} />
              )}
            </button>

            {/* Bag Icon Button with Dynamic Count Badge */}
            <button
              onClick={openCart}
              aria-label="Shopping Bag"
              className={`p-2 hover:text-clay transition-all rounded-xs relative group ${
                isScrolled ? "hover:bg-cream/60" : "hover:bg-white/10"
              } ${textColorClass}`}
              title="Shopping Bag"
            >
              <ShoppingBag size={18} strokeWidth={1.4} className="group-hover:scale-105 transition-transform" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-clay text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-20 bg-black/50 backdrop-blur-xs z-30 lg:hidden animate-overlay-in"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu backdrop"
            />
            <div className="relative z-40 lg:hidden bg-background border-b border-border shadow-2xl animate-fade-up text-ink max-h-[calc(100dvh-5rem)] overflow-y-auto">
              <div className="px-5 py-5 space-y-4">
                <div className="flex items-center justify-center py-1">
                  <img src={logoEmblem} alt="Viśvam Emblem" className="h-9 w-auto object-contain" />
                </div>
                {/* Quick Search Bar inside Mobile Menu */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-cream/70 border border-border/60 text-xs text-muted-foreground text-left rounded-xl"
                >
                  <Search size={15} className="text-clay" />
                  <span>Search almonds, cashews, figs...</span>
                </button>

                {/* Mobile Links */}
                <div className="flex flex-col space-y-2 pt-1 divide-y divide-border/30">
                  <Link
                    to="/nuts"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-medium tracked uppercase py-3 hover:text-clay flex items-center justify-between"
                  >
                    <span>Nuts & Dried Fruits</span>
                    <ArrowRight size={14} className="text-clay" />
                  </Link>

                  <Link
                    to="/gourmet"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-medium tracked uppercase py-3 hover:text-clay flex items-center justify-between"
                  >
                    <span>Gourmet</span>
                    <ArrowRight size={14} className="text-clay" />
                  </Link>

                  <Link
                    to="/gifting"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-medium tracked uppercase py-3 hover:text-clay flex items-center justify-between text-clay font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={13} /> Gifting & Hampers
                    </span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    to="/story"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-medium tracked uppercase py-3 hover:text-clay flex items-center justify-between"
                  >
                    <span>Our Sourcing Story</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Mobile Footer Info */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-clay" /> Single-Origin Sourcing
                  </span>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAccountOpen(true);
                    }}
                    className="text-clay font-semibold underline uppercase tracking-wider p-1"
                  >
                    {isAuthenticated ? "My Account" : "Sign In"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Interactive Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* User Account Portal Modal */}
      <UserAccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  );
}
