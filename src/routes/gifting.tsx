import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
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
            "Be among the first to preview our festive gift sets and reserve early allocations prior to public release.",
        },
        {
          name: "keywords",
          content: "luxury dry fruit gifting, bespoke corporate gifts, wedding favors dry fruits, Viśvam gifting, royal dry fruit hampers India",
        },
        { property: "og:title", content: "The Art of Gifting — Viśvam | Unwrapping Soon" },
        { property: "og:description", content: "Be among the first to preview our festive gift sets and reserve early allocations." },
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

  return (
    <SiteLayout>
      <div className="bg-[#fcfaf7] min-h-[80vh] flex flex-col justify-center items-center pt-32 pb-20 px-6 sm:px-8 text-ink">
        <div className="max-w-lg w-full mx-auto text-center space-y-5">
          <h1 className="font-baskerville italic text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight tracking-tight">
            Unwrapping Soon.
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Be among the first to preview our festive gift sets and reserve early allocations prior to public release.
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
              <span>Explore Harvest Collections</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
