import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Viśvam Harvest Concierge" },
      {
        name: "description",
        content: "Get in touch with Viśvam Harvest for order support, corporate gifting, and inquiries.",
      },
    ],
  }),
  component: ContactUs,
});

function ContactUs() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-16 border-b border-border/40 pb-10">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-3">
              CLIENT CONCIERGE
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Contact & Support
            </h1>
            <p className="text-sm text-muted-foreground mt-4 max-w-md leading-relaxed">
              Have questions about single-origin crops, order tracking, or corporate gifting? We are here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Details */}
            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="size-10 rounded-full bg-sand/50 grid place-items-center shrink-0 text-clay">
                  <Mail size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Email Inquiries</h5>
                  <p className="text-xs text-muted-foreground mb-1">Customer Support & Orders:</p>
                  <a href="mailto:support@visvamharvest.com" className="text-sm text-clay font-medium hover:underline">
                    support@visvamharvest.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-full bg-sand/50 grid place-items-center shrink-0 text-clay">
                  <Phone size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Phone Helpline</h5>
                  <p className="text-xs text-muted-foreground mb-1">Mon - Sat (9:00 AM - 7:00 PM IST):</p>
                  <p className="text-sm text-ink font-medium">+91 (800) 847-826</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-full bg-sand/50 grid place-items-center shrink-0 text-clay">
                  <MapPin size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Harvest Headquarters</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                    Viśvam Harvest Estates, Orchard Heights, Bengaluru, KA 560001
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-full bg-sand/50 grid place-items-center shrink-0 text-clay">
                  <Clock size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Cold Storage Facility</h5>
                  <p className="text-xs text-muted-foreground">4°C Temperature Controlled Logistics Center</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-cream/40 p-8 sm:p-12 rounded-sm border border-border/40 space-y-6">
              <h3 className="font-display italic text-3xl text-ink">Send a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 text-xs bg-background border border-border/60 outline-none focus:border-clay transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 text-xs bg-background border border-border/60 outline-none focus:border-clay transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
                    Message / Inquiry
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can our concierge assist you?"
                    className="w-full px-4 py-3 text-xs bg-background border border-border/60 outline-none focus:border-clay transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-ink text-white text-[11px] font-medium uppercase tracking-widest hover:bg-clay transition flex items-center justify-center gap-2"
                >
                  <span>Submit Inquiry</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
