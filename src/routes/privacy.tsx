import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Viśvam" },
      {
        name: "description",
        content: "Learn how Viśvam protects your personal data, order details, and privacy.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="mb-16 border-b border-border/40 pb-10">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-3">
              LEGAL & PRIVACY
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Effective Date: January 1, 2026 &bull; Last Updated: August 2026
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                At Viśvam, we respect your privacy. When you visit our website, place an order for our single-origin dry fruits, or subscribe to our Harvest Circle, we collect necessary personal information including your full name, shipping address, contact phone number, email address, and payment transaction tokens.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                Your data is strictly utilized to process and fulfill your orders, manage cold-chain logistics and delivery, communicate order status updates, provide customer support, and, with your consent, share news about seasonal crop harvests and exclusive gift box drops.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">3. Data Security & Cold-Chain Logistics</h2>
              <p className="text-muted-foreground">
                We implement industry-standard 256-bit SSL encryption to safeguard your data. Payment details are handled by PCI-DSS compliant payment gateways. We never sell, rent, or trade your personal information to third parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">4. Cookies & Analytics</h2>
              <p className="text-muted-foreground">
                Our site uses essential cookies to manage your shopping cart state and session preferences. We also utilize privacy-centric web analytics to monitor site performance and enhance your user experience.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">5. Your Rights & Contact</h2>
              <p className="text-muted-foreground">
                You hold the right to access, update, or request the deletion of your personal data at any time. For privacy requests or inquiries, please contact our privacy concierge at{" "}
                <a href="mailto:Contact@visvam.in" className="text-clay font-medium underline">
                  Contact@visvam.in
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
