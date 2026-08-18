import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Viśvam Data Protection" },
      {
        name: "description",
        content: "Learn how Viśvam (Tej Kripa Private Limited) collects, uses, protects, and handles your personal data in accordance with DPDP Act 2023.",
      },
      { property: "og:title", content: "Privacy Policy — Viśvam" },
      { property: "og:description", content: "Data protection and privacy guidelines for Viśvam customers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/privacy" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://visvam.in/privacy" }],
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
              Last Updated: August 2026 &bull; Tej Kripa Private Limited (Viśvam)
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-12 leading-relaxed max-w-3xl">
            This Privacy Policy explains how <strong>Tej Kripa Private Limited</strong>, operating the brand <strong>Viśvam</strong> (&quot;Viśvam&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), collects, uses, shares, and protects your personal data when you visit this website or place an order. It is written to align with the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025 (together, &quot;DPDP&quot;), the Information Technology Act, 2000 and its rules, and the Consumer Protection (E-Commerce) Rules, 2020.
            <br /><br />
            By using this website or providing your personal data to us, you consent to the practices described here.
          </p>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">1. Who We Are</h2>
              <p className="text-muted-foreground">
                The data fiduciary responsible for your personal data is:
              </p>
              <div className="p-4 bg-cream/50 rounded-lg border border-border/60 text-xs font-mono space-y-1 text-ink">
                <p><strong>Tej Kripa Private Limited</strong> (Brand: Viśvam)</p>
                <p>Operating Address: GK-1, New Delhi</p>
                <p>Contact for privacy matters: <a href="mailto:dpo@visvam.in" className="text-clay underline font-medium">dpo@visvam.in</a></p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">2. The Personal Data We Collect</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Information you give us directly:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name, delivery and billing address, email address, phone number</li>
                  <li>Order and purchase history</li>
                  <li>Communications you send us (support queries, feedback, reviews)</li>
                  <li>Any information provided when subscribing to updates or creating an account</li>
                </ul>

                <p className="pt-2"><strong>Information collected automatically when you use the site:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Device and browser information, IP address, and general location</li>
                  <li>Pages viewed, items browsed, and how you interact with the site</li>
                  <li>Cookies and similar technologies, including the Meta Pixel, where you have consented</li>
                </ul>

                <p className="pt-2">
                  <strong>We do not store your full payment card details.</strong> Payments are processed by our trusted third-party payment gateway partners, which handle card and banking information under their own security standards and privacy policy. We receive only confirmation of payment and limited transaction details.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">3. How We Use Your Personal Data</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Process, fulfil, and deliver your orders, and handle payments and invoicing</li>
                <li>Communicate order confirmations, dispatch updates, and delivery information</li>
                <li>Provide customer support and respond to your queries</li>
                <li>Send marketing communications about Viśvam products and updates — <strong>only where you have consented</strong> (withdraw anytime)</li>
                <li>Measure and improve our advertising on Meta platforms and elsewhere, where you have consented to advertising cookies</li>
                <li>Understand how our site is used and improve our products and experience</li>
                <li>Detect and prevent fraud, and ensure the security of our site</li>
                <li>Comply with our legal and regulatory obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">4. The Basis On Which We Process Your Data</h2>
              <p className="text-muted-foreground">
                We process your personal data on the basis of your <strong>consent</strong>, and, where permitted, for certain <strong>legitimate uses</strong> recognised under DPDP — such as fulfilling an order you have voluntarily placed. Where we rely on consent, that consent is free, specific, informed, unconditional, and unambiguous, and you may withdraw it at any time.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">5. Who We Share Your Data With</h2>
              <p className="text-muted-foreground">
                We share personal data only as needed to run our business, and never sell it. Recipients may include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong>Logistics and courier partners</strong>, to deliver your order (name, address, phone number)</li>
                <li><strong>Payment gateway providers</strong>, to process payments</li>
                <li><strong>Technology and platform providers</strong>, acting as our data processors</li>
                <li><strong>Meta Platforms, Inc. and its affiliates</strong> (Facebook, Instagram), where you have consented to advertising cookies</li>
                <li><strong>Analytics providers</strong>, where you have consented to analytics cookies</li>
                <li><strong>Government or law-enforcement authorities</strong>, where required by law</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">6. International Transfers</h2>
              <p className="text-muted-foreground">
                Some of our service providers may store or process data on servers located outside India. Where this occurs, we take reasonable steps to ensure your data continues to be protected consistent with this policy and applicable law, and we do not transfer data to any territory restricted by the Government of India.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">7. Cookies & Tracking Technologies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to keep the site working (strictly necessary cookies), to remember your preferences, to understand site usage (analytics cookies), and — with your consent — to measure and improve our advertising (Meta Pixel). You can manage or decline non-essential cookies via our cookie banner or footer Cookie Settings link.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">8. Advertising & Meta Pixel</h2>
              <p className="text-muted-foreground">
                We advertise Viśvam on Meta platforms — Facebook and Instagram — and we use the <strong>Meta Pixel</strong> on this website. When you consent to advertising cookies, the Meta Pixel records actions taken on our site (such as items added to cart or viewed) to help measure ad performance and deliver relevant Viśvam ads to you. You can withdraw consent at any time via cookie settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">9. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain personal data only for as long as necessary for the purposes described in this policy, or as required to meet legal, tax, accounting, and regulatory obligations. When data is no longer needed, we securely delete or anonymise it.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">10. Your Rights Under DPDP</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Access</strong> a summary of the personal data we hold about you</li>
                <li><strong>Correct, complete, or update</strong> inaccurate data</li>
                <li><strong>Erase</strong> personal data where it is no longer required</li>
                <li><strong>Withdraw consent</strong> at any time</li>
                <li><strong>Nominate</strong> another individual to exercise your rights</li>
                <li><strong>Grievance redressal</strong> — raise a complaint with our Data Protection Officer</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                To exercise your rights, email us at <a href="mailto:dpo@visvam.in" className="text-clay font-medium underline">dpo@visvam.in</a>. If dissatisfied, you may escalate to the <strong>Data Protection Board of India</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">11. Security & Protection</h2>
              <p className="text-muted-foreground">
                We use HTTPS 256-bit SSL encryption and strict technical and organizational safeguards to protect your personal data against unauthorized access, disclosure, alteration, or loss.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">12. Children&apos;s Data</h2>
              <p className="text-muted-foreground">
                Our website is intended for adults. We do not knowingly collect personal data from anyone under 18 without verifiable parental/legal guardian consent as required under DPDP.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">13. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our site may contain links to third-party platforms. We are not responsible for the privacy practices of third parties and recommend reviewing their respective privacy policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">14. Changes To This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. The &quot;Last Updated&quot; date at the top of this page indicates when the latest version took effect.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">15. Contact & Grievance Redressal</h2>
              <div className="p-4 bg-cream/50 rounded-lg border border-border/60 text-xs font-mono space-y-1 text-ink">
                <p><strong>Grievance / Data Protection Officer</strong></p>
                <p>Tej Kripa Private Limited (Brand: Viśvam)</p>
                <p>Address: GK-1, New Delhi</p>
                <p>Email: <a href="mailto:dpo@visvam.in" className="text-clay underline font-medium">dpo@visvam.in</a></p>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                We acknowledge grievances within 48 hours and endeavour to resolve them within the timelines prescribed under applicable law.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
