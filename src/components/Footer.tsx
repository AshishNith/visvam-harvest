import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletterToBackend } from "@/lib/api";
import logoEmblem from "@/assets/Visvam Logo.png";
import logoWordmark from "@/assets/Visvam Logo_Wordmark.png";

const HARVEST_GUARANTEES = [
  { id: "100-natural", name: "100% Handpicked & Natural", detail: "Zero artificial preservatives, colorings or added oil" },
  { id: "nitrogen-fresh", name: "Nitrogen-Flushed Packaging", detail: "Locks in natural oils, aroma and peak fresh crunch" },
  { id: "direct-trade", name: "Direct Harvest Sourcing", detail: "Fair trade partnerships with premier global farms" },
];

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
        toast.success(res.message || "Subscribed to Royal Harvest Circle!");
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
    <footer className="bg-cream pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">
          <div className="max-w-md">
            <h3 className="font-display italic text-3xl mb-6">Join the Harvest Circle.</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Subscribe for exclusive access to seasonal crop drops, festive gift box previews, and 10% off your first order.
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

          <div className="grid grid-cols-3 gap-10">
            <div className="space-y-4">
              <h6 className="text-[10px] tracked font-semibold uppercase">Shop Harvest</h6>
              <ul className="space-y-2.5 text-[11px]">
                <li><Link to="/gourmet" className="hover:text-clay transition">Gourmet</Link></li>
                <li><Link to="/nuts" className="hover:text-clay transition">Nuts & Dried Fruits</Link></li>
                <li><Link to="/gifting" className="hover:text-clay transition">Gifting</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h6 className="text-[10px] tracked font-semibold uppercase">Our Promise</h6>
              <ul className="space-y-2.5 text-[11px]">
                {HARVEST_GUARANTEES.map((l) => (
                  <li key={l.id} className="text-muted-foreground">
                    <span className="text-ink font-medium">{l.name}</span>
                    <br />
                    {l.detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h6 className="text-[10px] tracked font-semibold uppercase">Legal & Support</h6>
              <ul className="space-y-2.5 text-[11px]">
                <li><Link to="/privacy" className="hover:text-clay transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-clay transition">Terms & Conditions</Link></li>
                <li><Link to="/returns" className="hover:text-clay transition">Return & Refund Policy</Link></li>
                <li><Link to="/shipping" className="hover:text-clay transition">Shipping & Delivery</Link></li>
                <li><Link to="/contact" className="hover:text-clay transition">Contact Concierge</Link></li>
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
            © 2026 Viśvam — Cold-stored, single-origin nuts and organic dried fruits.
          </div>
          <div className="flex items-center gap-6 text-[10px] tracked">
            <Link to="/privacy" className="hover:text-clay transition">Privacy</Link>
            <Link to="/terms" className="hover:text-clay transition">Terms</Link>
            <Link to="/contact" className="hover:text-clay transition">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
