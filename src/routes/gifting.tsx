import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { submitContactInquiryToBackend } from "@/lib/api";

export const Route = createFileRoute("/gifting")({
  head: () => {
    const canonicalUrl = "https://visvam.in/gifting";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "The Art of Gifting — Viśvam Atelier",
      description: "Handcrafted luxury dry fruit presentation caskets and bespoke ceremonial gifting. Unwrapping soon.",
      url: canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: "Viśvam",
      },
    };

    return {
      meta: [
        { title: "The Art of Gifting — Viśvam | Unwrapping Soon" },
        {
          name: "description",
          content:
            "A curated repertoire of handcrafted keepsake caskets, ceremonial presentation boxes, and single-estate harvests. Unwrapping soon for corporate gifting, wedding favors, and festive celebrations.",
        },
        {
          name: "keywords",
          content: "luxury dry fruit gifting, bespoke corporate gifts, wedding favors dry fruits, Viśvam gifting, royal dry fruit hampers India",
        },
        { property: "og:title", content: "The Art of Gifting — Viśvam | Unwrapping Soon" },
        { property: "og:description", content: "Handcrafted presentation caskets and single-estate harvests. Unwrapping soon." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "The Art of Gifting — Viśvam" },
        { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(collectionSchema),
        },
      ],
    };
  },
  component: GiftingPage,
});

function GiftingPage() {
  const [activeTab, setActiveTab] = useState<"notify" | "concierge">("notify");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("Corporate Gifting");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await submitContactInquiryToBackend({
        name: "Early Access Subscriber",
        email,
        message: "[Gifting - Early Lookbook Notification Request]",
      });
      if (res.success) {
        toast.success("You are on the private list. We will notify you upon unveiling.");
        setSubmitted(true);
        setEmail("");
      } else {
        toast.error(res.message || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Unable to submit. Please write to Contact@visvam.in directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleConciergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please provide your name and email.");
      return;
    }
    setLoading(true);
    try {
      const fullMessage = `[Gifting Atelier - Bespoke Commission Inquiry]\nOccasion: ${occasion}\nPhone: ${phone || "N/A"}\nNotes: ${message || "Interested in bespoke gifting allocation."}`;
      const res = await submitContactInquiryToBackend({
        name,
        email,
        message: fullMessage,
      });
      if (res.success) {
        toast.success("Inquiry received. Our private gifting concierge will reach out within 24 hours.");
        setSubmitted(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        toast.error(res.message || "Failed to submit inquiry.");
      }
    } catch {
      toast.error("Unable to submit. Please write to Contact@visvam.in directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="bg-[#fcfaf7] min-h-screen text-ink">
        {/* Editorial Frame Header */}
        <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 border-b border-ink/10">
          <div className="max-w-[1100px] mx-auto px-6 sm:px-8">
            
            {/* Typography Centerpiece */}
            <div className="text-center max-w-4xl mx-auto space-y-6">

              <h1 className="font-baskerville italic text-6xl sm:text-8xl lg:text-9xl text-ink leading-[0.95] tracking-tight">
                Unwrapping Soon.
              </h1>

              <div className="w-12 h-px bg-clay/60 mx-auto my-6" />

              <p className="font-baskerville italic text-xl sm:text-2xl lg:text-3xl text-muted-foreground leading-relaxed font-normal max-w-2xl mx-auto">
                “Some gifts are remembered not merely for the celebration, but for the quiet poise and elegance with which they are presented.”
              </p>

              <p className="font-baskerville italic text-base sm:text-lg text-muted-foreground/90 max-w-xl mx-auto leading-relaxed pt-2">
                A forthcoming repertoire of handcrafted presentation caskets, gold-stamped wax seals, and cold-vault single-origin harvests from the terraces of Kashmir and California.
              </p>
            </div>
          </div>
        </section>


        {/* Private Access & Concierge Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[760px] mx-auto px-6 sm:px-8">
            <div className="border border-ink/15 rounded-none p-8 sm:p-12 bg-white/80 backdrop-blur-xs shadow-xs">
              
              {/* Tab Selector */}
              <div className="flex border-b border-ink/10 pb-4 mb-8 justify-center gap-8 text-xs font-mono uppercase tracking-[0.2em]">
                <button
                  type="button"
                  onClick={() => { setActiveTab("notify"); setSubmitted(false); }}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === "notify"
                      ? "border-ink text-ink font-semibold"
                      : "border-transparent text-muted-foreground hover:text-ink"
                  }`}
                >
                  Priority Lookbook
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("concierge"); setSubmitted(false); }}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === "concierge"
                      ? "border-ink text-ink font-semibold"
                      : "border-transparent text-muted-foreground hover:text-ink"
                  }`}
                >
                  Bespoke Commission
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="size-12 rounded-full border border-clay/40 text-clay flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-baskerville italic text-3xl text-ink">
                    Your Reservation is Recorded
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Thank you. We will extend a private lookbook link and personal allocation schedule directly to your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-[11px] font-mono tracking-widest text-clay uppercase underline pt-3 cursor-pointer block mx-auto"
                  >
                    Submit another request
                  </button>
                </div>
              ) : activeTab === "notify" ? (
                /* Tab 1: Direct Editorial Notification */
                <form onSubmit={handleNotifySubmit} className="space-y-6">
                  <div className="text-center max-w-md mx-auto mb-6">
                    <h3 className="font-baskerville italic text-3xl text-ink mb-2">
                      Receive the Private Lookbook
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Be among the first to preview our festive gift caskets and reserve early allocations prior to public release.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3.5 text-xs bg-[#fcfaf7] border border-ink/20 focus:border-ink outline-none rounded-none placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3.5 bg-ink text-white text-[11px] font-mono uppercase tracking-[0.2em] hover:bg-clay transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <span>Notify Me</span>
                          <ArrowRight size={12} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Tab 2: Bespoke Consultation */
                <form onSubmit={handleConciergeSubmit} className="space-y-4">
                  <div className="text-center max-w-md mx-auto mb-6">
                    <h3 className="font-baskerville italic text-3xl text-ink mb-2">
                      Commission an Order
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      For corporate orders, wedding favors, or bespoke custom branding, our private concierge is at your service.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Radhika Mehta"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#fcfaf7] border border-ink/20 focus:border-ink outline-none rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="radhika@company.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#fcfaf7] border border-ink/20 focus:border-ink outline-none rounded-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#fcfaf7] border border-ink/20 focus:border-ink outline-none rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        Celebration Type
                      </label>
                      <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#fcfaf7] border border-ink/20 focus:border-ink outline-none rounded-none"
                      >
                        <option value="Corporate Gifting">Corporate & Executive Gifting</option>
                        <option value="Wedding Favors">Wedding & Ceremonial Favors</option>
                        <option value="Festive Suites">Festive Celebration Suites</option>
                        <option value="Personal Gifting">Personal Luxury Keepsake</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Estimated Quantity & Details (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. 150 caskets with customized company sleeve and wax seal"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#fcfaf7] border border-ink/20 focus:border-ink outline-none rounded-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-ink text-white text-[11px] font-mono uppercase tracking-[0.2em] hover:bg-clay transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <span>Submit Commission Request</span>
                        <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Concierge Direct Contacts */}
              <div className="mt-8 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-muted-foreground gap-3">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-clay" />
                  <a href="mailto:Contact@visvam.in" className="hover:text-ink transition underline">
                    Contact@visvam.in
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-clay" />
                  <a href="tel:+919217870974" className="hover:text-ink transition">
                    +91 92178 70974
                  </a>
                </div>
              </div>

            </div>

            {/* Back to active collections */}
            <div className="text-center mt-12">
              <Link
                to="/nuts"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-ink hover:text-clay border-b border-ink/30 hover:border-clay pb-1 transition-all"
              >
                <span>Explore Harvest Collections</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
