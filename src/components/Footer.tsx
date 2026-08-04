import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import logoEmblem from "@/assets/Visvam Logo.png";
import logoWordmark from "@/assets/Visvam Logo_Wordmark.png";

const HARVEST_GUARANTEES = [
  { id: "100-natural", name: "100% Handpicked & Natural", detail: "Zero artificial preservatives, colorings or added oil" },
  { id: "nitrogen-fresh", name: "Nitrogen-Flushed Packaging", detail: "Locks in natural oils, aroma and peak orchard crunch" },
  { id: "direct-trade", name: "Direct Orchard Sourcing", detail: "Fair trade partnerships with premier global farms" },
];

export function Footer() {
  return (
    <footer className="bg-cream pt-24 pb-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">
          <div className="max-w-md">
            <h3 className="font-display italic text-3xl mb-6">Join the Harvest Circle.</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Subscribe for exclusive access to seasonal crop drops, festive gift box previews, and 10% off your first order.
            </p>
            <form className="flex border-b border-ink" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="flex-1 py-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <button className="group inline-flex items-center gap-2 text-[10.5px] tracked font-medium text-ink hover:text-clay transition uppercase">
                <span>Subscribe</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 text-clay" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-10">
            <div className="space-y-4">
              <h6 className="text-[10px] tracked font-semibold uppercase">Shop Harvest</h6>
              <ul className="space-y-2.5 text-[11px]">
                <li><Link to="/nuts" className="hover:text-clay transition">Nuts & Kernels</Link></li>
                <li><Link to="/dried-fruits" className="hover:text-clay transition">Dried Fruits & Dates</Link></li>
                <li><Link to="/exotic-seeds" className="hover:text-clay transition">Exotic Seeds & Mixes</Link></li>
                <li><Link to="/combos" className="hover:text-clay transition">Gift Boxes & Combos</Link></li>
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
              <h6 className="text-[10px] tracked font-semibold uppercase">Information</h6>
              <ul className="space-y-2.5 text-[11px]">
                <li><Link to="/story" className="hover:text-clay transition">Our Farm Story</Link></li>
                <li><a className="hover:text-clay transition" href="#">Nutritional Guide</a></li>
                <li><a className="hover:text-clay transition" href="#">Corporate Gifting</a></li>
                <li><a className="hover:text-clay transition" href="#">Quality & Storage</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoEmblem}
              alt="Viśvam Emblem"
              width={48}
              height={48}
              loading="lazy"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <img
              src={logoWordmark}
              alt="Viśvam Harvest"
              width={120}
              height={40}
              loading="lazy"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="text-[9px] tracked text-muted-foreground text-center">
            © 2026 Viśvam Harvest — Cold-stored, single-origin nuts and organic dried fruits.
          </div>
          <div className="flex items-center gap-6 text-[10px] tracked">
            <a href="#" className="hover:text-clay transition">Instagram</a>
            <a href="#" className="hover:text-clay transition">LinkedIn</a>
            <a href="#" className="hover:text-clay transition">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
