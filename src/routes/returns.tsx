import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Viśvam | Tej Kripa Private Limited" },
      {
        name: "description",
        content:
          "Read Viśvam's Returns & Refund Policy. Food hygiene standards, transit damage coverage, 48-hour claim process, and 5-7 business day refund timelines.",
      },
      { property: "og:title", content: "Returns & Refund Policy — Viśvam" },
      {
        property: "og:description",
        content:
          "Returns & Refund Policy for Viśvam (Tej Kripa Private Limited). 48-hour claim window for transit damage, quality issues, or incorrect items.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/returns" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Returns & Refund Policy — Viśvam" },
      { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visvam.in/returns" }],
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
              FOOD SAFETY & CUSTOMER ASSURANCE
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Returns & Refund Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Last updated: 18-08-2026 &bull; Tej Kripa Private Limited (Brand: Viśvam)
            </p>
          </div>

          <div className="text-sm text-muted-foreground mb-12 leading-relaxed max-w-3xl space-y-4">
            <p>
              This policy applies to orders placed on this website from <strong>Viśvam</strong> (a brand of <strong>Tej Kripa Private Limited</strong>).
            </p>
            <p>
              Our products are consumable foods. For hygiene and food-safety reasons, we are unable to accept returns or offer refunds for change of mind or incorrect ordering, or reasons unrelated to product quality. We do, however, stand fully behind the condition of what we send you.
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">When you&apos;re covered</h2>
              <p className="text-muted-foreground">
                We offer a replacement or refund in the following cases:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>The product arrived damaged in transit.</li>
                <li>The product has a genuine quality issue (for example, it is spoiled, stale, or defective on arrival).</li>
                <li>You received the wrong item or your order was missing items.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">When you&apos;re not covered</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Change of mind, or no longer wanting the product.</li>
                <li>Ordering the wrong product or quantity by mistake.</li>
                <li>Products that have been opened, used, or partially consumed, other than where opening was necessary to identify a genuine quality issue.</li>
                <li>Issues reported after the reporting window below.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">How to raise a claim</h2>
              <div className="p-5 bg-cream/50 rounded-xl border border-border/60 text-xs space-y-3 text-ink">
                <p className="font-semibold text-sm">Step-by-Step Claim Procedure:</p>
                <ol className="list-decimal pl-5 space-y-2 text-muted-foreground text-xs leading-relaxed">
                  <li>
                    Contact us on our WhatsApp <a href="https://wa.me/919217870974" target="_blank" rel="noopener noreferrer" className="text-clay font-mono underline font-medium">+91 9217870974</a> within <strong>48 hours of delivery</strong>.
                  </li>
                  <li>
                    Include your <strong>order number</strong> and <strong>clear pictures</strong> of the outer packaging with visible batch number, the product, and the issue.
                  </li>
                </ol>
                <p className="text-[11px] text-muted-foreground/90 pt-1">
                  This helps us verify the claim quickly and improve our packing and quality checks.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">What happens next</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>We will acknowledge your claim within 48 hours and let you know the outcome after review.</li>
                <li>If your claim is approved, you may choose a replacement (subject to availability) or a refund.</li>
                <li>We may, at our discretion, ask you to return or dispose of the affected product, and we will not ask you to bear return shipping costs for a valid quality or damage claim.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">Refunds</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Approved refunds are issued to your original payment method.</li>
                <li>Once processed, refunds typically reflect within 5–7 business days, depending on your bank or payment provider.</li>
                <li>Where only part of an order is affected, we refund or replace only the affected items.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">Your statutory rights</h2>
              <p className="text-muted-foreground">
                Nothing in this policy limits any rights you have under the Consumer Protection Act, 2019 and applicable Indian law.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">Contact</h2>
              <div className="p-5 bg-cream/50 rounded-xl border border-border/60 text-xs font-mono space-y-1.5 text-ink">
                <p className="font-bold text-sm">Tej Kripa Private Limited <span className="font-normal text-muted-foreground">(Viśvam)</span></p>
                <p>Address: F-329, 2nd Floor, F Block, Sector-63, Noida, Uttar Pradesh 201309</p>
                <p>Email: <a href="mailto:contact@visvam.in" className="text-clay underline font-medium">contact@visvam.in</a> &nbsp;&bull;&nbsp; Phone / WhatsApp: <a href="https://wa.me/919217870974" target="_blank" rel="noopener noreferrer" className="text-clay underline font-medium">+91 9217870974</a></p>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                In line with the Consumer Protection (E-Commerce) Rules, 2020, we acknowledge complaints within 48 hours and endeavour to resolve them within one month.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
