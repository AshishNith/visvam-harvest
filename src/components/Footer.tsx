import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletterToBackend } from "@/lib/api";
import logoEmblem from "@/assets/Visvam Logo.png";
import logoWordmark from "@/assets/Visvam Logo_Wordmark.png";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await subscribeNewsletterToBackend(email);
      if (res.success) {
        toast.success(res.message || "Subscribed to Letters from Viśvam!");
        setEmail("");
      } else {
        toast.error(res.message || "Failed to subscribe.");
      }
    } catch (err: any) {
      toast.error("Subscription error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-cream pt-14 sm:pt-24 pb-10 sm:pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 mb-12 sm:mb-20">
          <div className="max-w-md">
            <h3 className="font-display italic text-2xl sm:text-3xl mb-4 sm:mb-6">Letters from Viśvam.</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Be the first to hear about new arrivals, seasonal releases, and first word on anything worth knowing.
            </p>
            <form className="flex border-b border-ink" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 py-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center gap-2 text-[10.5px] tracked font-medium text-ink hover:text-clay transition uppercase disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={12} className="animate-spin text-clay" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="flex flex-row gap-10 sm:gap-14 lg:gap-16 justify-start lg:justify-end">
            <div className="space-y-4 min-w-[130px]">
              <h6 className="text-[10px] tracked font-semibold uppercase">Shop Now</h6>
              <ul className="space-y-2.5 text-[11px]">
                <li><Link to="/nuts" className="hover:text-clay transition">Nuts & Dried Fruits</Link></li>
                <li><Link to="/gourmet" className="hover:text-clay transition">Gourmet</Link></li>
                <li><Link to="/gifting" className="hover:text-clay transition">Gifting</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h6 className="text-[10px] tracked font-semibold uppercase">Legal & Support</h6>
              <ul className="space-y-2.5 text-[11px]">
                <li><Link to="/privacy" className="hover:text-clay transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-clay transition">Terms & Conditions</Link></li>
                <li><Link to="/returns" className="hover:text-clay transition">Return & Refund Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-clay transition">Cookie Policy</Link></li>
                <li><Link to="/shipping" className="hover:text-clay transition">Shipping & Delivery</Link></li>
                <li><Link to="/contact" className="hover:text-clay transition">Contact Support</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoEmblem}
              alt="Viśvam Emblem"
              width={48}
              height={48}
              loading="eager"
              decoding="async"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <img
              src={logoWordmark}
              alt="Viśvam"
              width={120}
              height={40}
              loading="eager"
              decoding="async"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="text-[9px] tracked text-muted-foreground text-center">
            © 2026 Viśvam
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] tracked">
            <Link to="/privacy" className="hover:text-clay transition">Privacy</Link>
            <Link to="/terms" className="hover:text-clay transition">Terms</Link>
            <Link to="/cookies" className="hover:text-clay transition">Cookie Notice</Link>
            <Link to="/contact" className="hover:text-clay transition">Contact Us</Link>
            <a
              href="https://www.instagram.com/visvam.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Viśvam on Instagram"
              className="hover:text-clay transition"
            >
              <Instagram size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
