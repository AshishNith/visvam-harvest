import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Mail, Phone, MapPin, Clock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitContactInquiryToBackend } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => {
    const canonicalUrl = "https://visvam.in/contact";
    const contactSchema = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact & Support — Viśvam",
      "description": "Get in touch with Viśvam for order support, corporate gifting, and bulk inquiries.",
      "url": canonicalUrl,
      "mainEntity": {
        "@type": "Organization",
        "name": "Viśvam",
        "email": "Contact@visvam.in",
        "telephone": "+919217870974",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "F-329, 2nd floor, sector 63",
          "addressLocality": "Noida",
          "postalCode": "201309",
          "addressCountry": "IN"
        }
      }
    };

    return {
      meta: [
        { title: "Contact Us & Support — Viśvam" },
        {
          name: "description",
          content:
            "Contact Viśvam customer support for order tracking, corporate dry fruit gifting, and bulk inquiries. Email Contact@visvam.in or call +91 9217870974.",
        },
        {
          name: "keywords",
          content: "Viśvam contact, Viśvam customer care, corporate dry fruit gifting inquiry, Viśvam email, dry fruit support India",
        },
        { property: "og:title", content: "Contact Us & Support — Viśvam" },
        { property: "og:description", content: "Get in touch with Viśvam for order support, corporate gifting, and inquiries." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Contact Us & Support — Viśvam" },
        { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(contactSchema),
        },
      ],
    };
  },
  component: ContactUs,
});

function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactInquiryToBackend({ name, email, message });
      if (res.success) {
        toast.success(res.message || "Inquiry submitted successfully!");
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error(res.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-16 border-b border-border/40 pb-10">
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Contact & Support
            </h1>
            <p className="text-sm text-muted-foreground mt-4 max-w-lg leading-relaxed">
              Reach out to us in case of any queries about the products, order tracking, corporate gifting, bulk orders. We are there for you.
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
                  <a href="mailto:Contact@visvam.in" className="text-sm text-clay font-medium hover:underline">
                    Contact@visvam.in
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-full bg-sand/50 grid place-items-center shrink-0 text-clay">
                  <Phone size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Phone Helpline</h5>
                  <p className="text-xs text-muted-foreground mb-1">Mon - Sat (9:30 AM - 6:00 PM IST):</p>
                  <a href="tel:+919217870974" className="text-sm text-ink font-medium hover:text-clay transition-colors">
                    +91 9217870974
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-full bg-sand/50 grid place-items-center shrink-0 text-clay">
                  <MapPin size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Viśvam Headquarters</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                    F-329, 2nd floor, sector 63, Noida, 201309
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
              
              {submitted ? (
                <div className="py-8 text-center space-y-4 animate-fade-up">
                  <div className="w-12 h-12 rounded-full bg-clay/10 text-clay grid place-items-center mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="font-display italic text-2xl text-ink">Inquiry Received</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Thank you for reaching out to Viśvam. Our team has logged your request and will respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-block mt-4 text-xs font-mono uppercase tracking-widest text-clay hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist you?"
                      className="w-full px-4 py-3 text-xs bg-background border border-border/60 outline-none focus:border-clay transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-ink text-white text-[11px] font-medium uppercase tracking-widest hover:bg-clay transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
