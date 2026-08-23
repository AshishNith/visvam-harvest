import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitContactInquiryToBackend } from "@/lib/api";
import gourmetHeroBg from "@/assets/gourmet-hero-bg.jpg";

export const Route = createFileRoute("/gourmet")({
  head: () => {
    const canonicalUrl = "https://visvam.in/gourmet";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Gourmet Selections — Viśvam Atelier",
      description:
        "A little sweetness, a little savoury, and plenty of reasons to indulge. Handcrafted gourmet dry fruits, infused berries, and artisanal selections. Unveiling soon.",
      url: canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: "Viśvam",
      },
    };

    return {
      meta: [
        { title: "Gourmet Selections — Viśvam | Unveiling Soon" },
        {
          name: "description",
          content:
            "Be among the first to preview our handcrafted gourmet dry fruits, berries, and artisanal selections.",
        },
        {
          name: "keywords",
          content:
            "gourmet dry fruits, figs, Medjool dates, green kishmish, dried berries, superseeds, Viśvam",
        },
        { property: "og:title", content: "Gourmet Selections — Viśvam | Unveiling Soon" },
        {
          property: "og:description",
          content:
            "Be among the first to preview our upcoming gourmet dry fruits and artisanal selections.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Gourmet Selections — Viśvam" },
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
  component: GourmetPage,
});

function GourmetPage() {
  const [email, setEmail] = useState("");
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
        message: "[Gourmet - Early Lookbook Notification Request]",
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

  return (
    <SiteLayout>
      <section className="relative overflow-hidden min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center justify-center pt-32 pb-20 sm:pt-40 sm:pb-28 border-b border-border/40">
        <div className="absolute inset-0 z-0">
          <img
            src={gourmetHeroBg}
            alt="Gourmet"
            className="w-full h-full object-cover object-center blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/25 to-ink/65" />
        </div>

        <div className="relative z-10 max-w-[1100px] mx-auto px-6 text-center text-white">
          <h1 className="font-display italic text-5xl sm:text-7xl lg:text-8xl text-white leading-[1.02] tracking-tight mb-6 animate-fade-up drop-shadow-md">
            Gourmet
          </h1>

          <div className="w-12 h-px bg-sand/80 mx-auto my-6 animate-fade-up shadow-sm" />

          <p className="font-baskerville italic text-lg sm:text-2xl text-cream leading-relaxed max-w-2xl mx-auto animate-fade-up [animation-delay:150ms] drop-shadow-md">
            A little sweetness, a little savoury, and plenty of reasons to indulge. Carefully curated for you to discover, savour and share.
          </p>
        </div>
      </section>

      <div className="bg-[#fcfaf7] flex flex-col justify-center items-center py-20 px-6 sm:px-8 text-ink">
        <div className="max-w-lg w-full mx-auto text-center space-y-5">
          <h2 className="font-baskerville italic text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight tracking-tight">
            Unveiling Soon.
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Be among the first to preview our upcoming gourmet dry fruits, artisanal confections, and curated selections.
          </p>

          {submitted ? (
            <div className="p-6 bg-white/90 border border-ink/15 shadow-xs space-y-3 animate-fade-up">
              <div className="size-10 rounded-full border border-clay/40 text-clay flex items-center justify-center mx-auto">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-xs text-ink font-medium">
                Thank you! We will notify you upon unveiling.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 text-xs bg-white border border-ink/20 focus:border-ink outline-none rounded-none placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-ink text-white text-[11px] font-mono uppercase tracking-[0.2em] hover:bg-clay transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
            </form>
          )}

          <div className="pt-8">
            <Link
              to="/nuts"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-ink border-b border-ink/20 hover:border-ink pb-1 transition-all"
            >
              <span>Explore Viśvam Collections</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
