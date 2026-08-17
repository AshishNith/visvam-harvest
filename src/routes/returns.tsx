import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy — Viśvam" },
      {
        name: "description",
        content: "Learn about Viśvam's 100% Quality Guarantee and seamless return policy.",
      },
    ],
  }),
  component: ReturnPolicy,
});

function ReturnPolicy() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="mb-16 border-b border-border/40 pb-10">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-3">
              QUALITY GUARANTEE
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Return & Refund Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Effective Date: January 1, 2026 &bull; Last Updated: August 2026
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">1. Our 100% Quality Guarantee</h2>
              <p className="text-muted-foreground">
                We take immense pride in delivering cold-stored, nitrogen-sealed dry fruits and nuts of exceptional crunch and flavor. If your package arrives damaged, broken, or compromised in freshness, we stand by a hassle-free replacement or full refund.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">2. Return Window & Eligibility</h2>
              <p className="text-muted-foreground">
                Given the perishable nature of food items, return requests must be reported within <strong>7 days</strong> of delivery. To be eligible for a return or replacement, items must remain in their original vacuum-sealed packaging with proof of purchase.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">3. Damaged or Compromised Shipments</h2>
              <p className="text-muted-foreground">
                If your parcel suffers transit damage or seal breakage, please capture a photo or short video of the unopened package and share it with our support team at{" "}
                <a href="mailto:Contact@visvam.in" className="text-clay font-medium underline">
                  Contact@visvam.in
                </a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">4. Refund Processing</h2>
              <p className="text-muted-foreground">
                Approved refunds are processed back to your original payment method within 5 to 7 business days. You will receive an email confirmation as soon as the refund transaction is initiated.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
