import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Viśvam Legal Terms" },
      {
        name: "description",
        content: "Review the Terms & Conditions governing single-origin dry fruit purchases, delivery, and website usage at Viśvam.",
      },
      { property: "og:title", content: "Terms & Conditions — Viśvam" },
      { property: "og:description", content: "Terms and conditions governing purchases and website usage at Viśvam." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/terms" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://visvam.in/terms" }],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="mb-16 border-b border-border/40 pb-10">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-3">
              LEGAL AGREEMENT
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Terms & Conditions
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Effective Date: January 1, 2026 &bull; Last Updated: August 2026
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or purchasing from Viśvam, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">2. Product Quality & Sourcing</h2>
              <p className="text-muted-foreground">
                We take extreme care to source single-origin jumbo almonds, W240 cashews, Kashmiri walnuts, and organic dried fruits. As natural agricultural products, minor natural variations in size, shade, and texture may occur between seasonal crop batches.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">3. Pricing & Orders</h2>
              <p className="text-muted-foreground">
                All prices listed on the website are in local currency inclusive of applicable taxes unless stated otherwise. We reserve the right to accept or decline any order, or adjust product pricing and availability due to harvest supply fluctuations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">4. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on this website, including logos, wordmarks, custom photography, brand copy, and editorial designs, is the exclusive intellectual property of Viśvam and protected by applicable copyright and trademark laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">5. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms are governed by and construed in accordance with applicable laws. Any disputes arising out of or relating to your purchase shall be subject to exclusive jurisdiction of competent courts.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
