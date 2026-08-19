import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Viśvam" },
      {
        name: "description",
        content: "Read Viśvam's Return & Refund Policy. Food hygiene standards, transit damage coverage, 48-hour claim process, and 5-7 day refund timelines.",
      },
      { property: "og:title", content: "Returns & Refund Policy — Viśvam" },
      { property: "og:description", content: "Return policy and claim procedure for Viśvam dry fruits and nuts." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/returns" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
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
              FOOD HYGIENE & RETURN POLICY
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Returns & Refund Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Last Updated: August 2026 &bull; Tej Kripa Private Limited (Viśvam)
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-12 leading-relaxed max-w-3xl">
            This policy applies to orders placed on this website from <strong>Viśvam</strong> (a brand of <strong>Tej Kripa Private Limited</strong>). Our products are consumable foods. For hygiene and food-safety reasons, we are unable to accept returns or offer refunds for change of mind, incorrect ordering, or reasons unrelated to product quality. We do, however, stand fully behind the condition of what we send you.
          </p>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">1. When You&apos;re Covered</h2>
              <p className="text-muted-foreground">
                We offer a <strong>replacement or refund</strong> in the following cases:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>The product arrived <strong>damaged</strong> in transit.</li>
                <li>The product has a <strong>genuine quality issue</strong> (for example, spoiled, stale, or defective on arrival).</li>
                <li>You received the <strong>wrong item</strong> or your order was <strong>missing items</strong>.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">2. When You&apos;re Not Covered</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Change of mind, or no longer wanting the product.</li>
                <li>Ordering the wrong product or quantity by mistake.</li>
                <li>Products that have been opened, used, or partially consumed (other than where opening was necessary to identify a quality issue).</li>
                <li>Issues reported after the 48-hour reporting window.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">3. How To Raise A Claim</h2>
              <div className="p-4 bg-cream/50 rounded-lg border border-border/60 text-xs space-y-2 text-ink">
                <p className="font-semibold">Step-by-Step Claim Procedure:</p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>Contact us at <a href="mailto:care@visvam.in" className="text-clay font-mono underline font-medium">care@visvam.in</a> within <strong>48 hours</strong> of delivery.</li>
                  <li>Include your <strong>order number</strong> and clear <strong>photographs</strong> of the outer packaging, product pouch/jar, and the defect/damage.</li>
                </ol>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">4. Claim Verification & What Happens Next</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>We will acknowledge your claim within <strong>48 hours</strong> and notify you of the outcome after review.</li>
                <li>If your claim is approved, you may choose between a <strong>replacement</strong> (subject to stock availability) or a <strong>refund</strong>.</li>
                <li>We do not ask you to bear return shipping costs for a valid quality or damage claim.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">5. Refund Processing</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Approved refunds are issued back to your <strong>original payment method</strong>.</li>
                <li>Once processed, refunds typically reflect within <strong>5–7 business days</strong> depending on your bank/card issuer.</li>
                <li>Where only part of an order is affected, we refund or replace only the affected items.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">6. Your Statutory Rights</h2>
              <p className="text-muted-foreground">
                Nothing in this policy limits any rights you have under the Consumer Protection Act, 2019 and applicable Indian law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">7. Contact & Grievances</h2>
              <div className="p-4 bg-cream/50 rounded-lg border border-border/60 text-xs font-mono space-y-1 text-ink">
                <p><strong>Grievance Officer</strong></p>
                <p>Tej Kripa Private Limited (Brand: Viśvam)</p>
                <p>Address: GK-1, New Delhi</p>
                <p>Email: <a href="mailto:care@visvam.in" className="text-clay underline font-medium">care@visvam.in</a></p>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                In line with Consumer Protection (E-Commerce) Rules, 2020, we acknowledge complaints within 48 hours and endeavour to resolve them within one month.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
