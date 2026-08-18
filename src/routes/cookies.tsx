import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Notice — Viśvam Data & Cookie Usage" },
      {
        name: "description",
        content: "Learn how Viśvam (Tej Kripa Private Limited) uses essential, analytics, and advertising cookies including the Meta Pixel.",
      },
      { property: "og:title", content: "Cookie Notice — Viśvam" },
      { property: "og:description", content: "Cookie Notice and consent management for Viśvam customers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/cookies" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://visvam.in/cookies" }],
  }),
  component: CookieNotice,
});

function CookieNotice() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="mb-16 border-b border-border/40 pb-10">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-3">
              LEGAL & TRANSPARENCY
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Cookie Notice
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Last Updated: August 2026 &bull; Tej Kripa Private Limited (Viśvam)
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-12 leading-relaxed max-w-3xl">
            This Cookie Notice explains how <strong>Viśvam</strong> (a brand of <strong>Tej Kripa Private Limited</strong>) uses cookies and similar tracking technologies on this website. It should be read alongside our Privacy Policy.
          </p>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">What Cookies Are</h2>
              <p className="text-muted-foreground">
                Cookies are small text files stored on your device when you visit a website. They help the site function, remember your choices, and — where you allow it — help us understand usage and measure advertising effectiveness. We also use similar technologies such as pixels and tags, including the <strong>Meta Pixel</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">The Cookies We Use</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-cream/50 rounded-lg border border-border/60">
                  <h3 className="font-semibold text-ink text-base mb-1">1. Strictly Necessary Cookies (Always Active)</h3>
                  <p className="text-xs text-muted-foreground">
                    These keep the site working — enabling navigation, cart management, checkout, and security. The site cannot function properly without them, so they do not require consent and cannot be switched off.
                  </p>
                </div>

                <div className="p-4 bg-cream/50 rounded-lg border border-border/60">
                  <h3 className="font-semibold text-ink text-base mb-1">2. Analytics Cookies (Consent Required)</h3>
                  <p className="text-xs text-muted-foreground">
                    These help us understand how visitors interact with the site — which pages are viewed and how people move through the store — so we can continuously improve the shopping experience. These load only if you explicitly consent.
                  </p>
                </div>

                <div className="p-4 bg-cream/50 rounded-lg border border-border/60">
                  <h3 className="font-semibold text-ink text-base mb-1">3. Advertising Cookies & Meta Pixel (Consent Required)</h3>
                  <p className="text-xs text-muted-foreground">
                    These power the <strong>Meta Pixel</strong> and related Meta advertising tools. They let us measure how our Facebook and Instagram ads perform, understand which products interest visitors, and show relevant Viśvam ads on social platforms. These load only if you give consent.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">Your Choices & Control</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>On your first visit, our cookie banner lets you <strong>accept all</strong>, <strong>reject non-essential</strong>, or <strong>choose by category</strong>.</li>
                <li>You can change your choice at any time using the <strong>Cookie Settings</strong> link in our footer.</li>
                <li>You can also manage or delete cookies through your web browser settings.</li>
                <li>For Meta ads specifically, you can adjust your ad preferences within your Facebook and Instagram account settings.</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                Declining analytics or advertising cookies will not affect your ability to browse or place an order.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">Contact & Privacy Questions</h2>
              <div className="p-4 bg-cream/50 rounded-lg border border-border/60 text-xs font-mono space-y-1 text-ink">
                <p><strong>Data Protection Officer</strong></p>
                <p>Tej Kripa Private Limited (Brand: Viśvam)</p>
                <p>Address: GK-1, New Delhi</p>
                <p>Email: <a href="mailto:dpo@visvam.in" className="text-clay underline font-medium">dpo@visvam.in</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
