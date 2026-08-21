import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Viśvam | Data Protection & DPDP Compliance" },
      {
        name: "description",
        content:
          "Learn how Viśvam (Tej Kripa Private Limited) collects, uses, shares, and protects your personal data under the DPDP Act, 2023.",
      },
      { property: "og:title", content: "Privacy Policy — Viśvam" },
      {
        property: "og:description",
        content:
          "Privacy Policy for Viśvam (Tej Kripa Private Limited) compliant with the Digital Personal Data Protection Act, 2023.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/privacy" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy — Viśvam" },
      { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
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
              LEGAL & DATA PROTECTION
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Last updated: 18-08-2026 &bull; Tej Kripa Private Limited (Brand: Viśvam)
            </p>
          </div>

          <div className="text-sm text-muted-foreground mb-12 leading-relaxed max-w-3xl space-y-4">
            <p>
              This Privacy Policy explains how <strong>Tej Kripa Private Limited</strong>, operating the brand <strong>Viśvam</strong>, collects, uses, shares, and protects your personal data when you visit this website or place an order. It is written to align with the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025 (together, &quot;DPDP&quot;), the Information Technology Act, 2000 and its rules, and the Consumer Protection (E-Commerce) Rules, 2020.
            </p>
            <p>
              By using this website or providing your personal data to us, you consent to the practices described here.
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">1. Who we are</h2>
              <p className="text-muted-foreground">
                The data fiduciary responsible for your personal data is:
              </p>
              <div className="p-5 bg-cream/50 rounded-xl border border-border/60 text-xs font-mono space-y-1.5 text-ink">
                <p className="font-bold text-sm">Tej Kripa Private Limited <span className="font-normal text-muted-foreground">(brand: Viśvam)</span></p>
                <p>Address: F-329, 2nd Floor, F Block, Sector-63, Noida, Uttar Pradesh 201309</p>
                <p>CIN: U46301UW2026PTC254347 &nbsp;&bull;&nbsp; GSTIN: AANCT2392L</p>
                <p>Contact for privacy matters: <a href="mailto:contact@visvam.in" className="text-clay underline font-medium">contact@visvam.in</a></p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">2. The personal data we collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <p className="font-semibold text-ink mb-1.5">Information you give us directly</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Name, delivery and billing address, email address, phone number</li>
                    <li>Order and purchase history</li>
                    <li>Communications you send us (support queries, feedback, reviews)</li>
                    <li>Any information you provide when subscribing to updates or creating an account</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-ink mb-1.5">Information collected automatically when you use the site</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Device and browser information, IP address, and general location</li>
                    <li>Pages viewed, items browsed, and how you interact with the site</li>
                    <li>Cookies and similar technologies, including the Meta Pixel, where you have consented</li>
                  </ul>
                </div>

                <div className="pt-1 space-y-2">
                  <p>
                    <strong className="text-ink">We do not store your full payment card details:</strong> Payments are processed by our third-party payment gateway, which handles card and banking information under its own security standards and privacy policy. We receive only confirmation of payment and limited transaction details.
                  </p>
                  <p>
                    We do not knowingly collect sensitive personal data beyond what is necessary to fulfil your order.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">3. How we use your personal data</h2>
              <p className="text-muted-foreground">We use your personal data to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Process, fulfil, and deliver your orders, and handle payments and invoicing</li>
                <li>Communicate order confirmations, dispatch updates, and delivery information</li>
                <li>Provide customer support and respond to your queries</li>
                <li>Send marketing communications about Viśvam products and updates — only where you have consented, and you can withdraw consent at any time</li>
                <li>Measure and improve our advertising on Meta platforms and elsewhere, where you have consented to advertising cookies</li>
                <li>Understand how our site is used and improve our products and experience</li>
                <li>Detect and prevent fraud, and ensure the security of our site</li>
                <li>Comply with our legal and regulatory obligations</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">4. The basis on which we process your data</h2>
              <p className="text-muted-foreground">
                We process your personal data on the basis of your consent, and, where permitted, for certain legitimate uses recognised under DPDP — such as fulfilling an order you have voluntarily placed. Where we rely on consent, that consent is free, specific, informed, unconditional, and unambiguous, and you may withdraw it at any time (see Section 10). Withdrawing consent will not affect processing carried out before withdrawal.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">5. Who we share your data with</h2>
              <p className="text-muted-foreground">
                We share personal data only as needed to run our business, and never sell it. Recipients may include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong>Logistics and courier partners</strong>, to deliver your order (name, address, phone number)</li>
                <li><strong>Payment gateway providers</strong>, to process payments</li>
                <li><strong>Technology and platform providers</strong>, and our email/communication tools, acting as our data processors</li>
                <li><strong>Meta Platforms Inc. and its affiliates</strong> (Facebook, Instagram, Pixel), where you have consented to advertising cookies, for measurement and advertising as described in Section 8</li>
                <li><strong>Analytics providers</strong>, such as Google Analytics, where you have consented to analytics cookies</li>
                <li><strong>Government or law-enforcement authorities</strong>, where required by law</li>
              </ul>
              <p className="text-muted-foreground pt-1">
                Where we engage processors, we require them to protect your data and use it only for the purposes we specify.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">6. International transfers</h2>
              <p className="text-muted-foreground">
                Some of our service providers (for example, our website host, communication tools, and advertising partners) may store or process data on servers located outside India. Where this occurs, we take reasonable steps to ensure your data continues to be protected consistent with this policy and applicable law, and we do not transfer data to any territory restricted by the Government of India for such transfers.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">7. Cookies and tracking technologies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to keep the site working (strictly necessary cookies), to remember your preferences, to understand site usage (analytics cookies), and — with your consent — to measure and improve our advertising, including through the Meta Pixel (advertising cookies).
              </p>
              <p className="text-muted-foreground">
                You can accept or decline non-essential cookies through our cookie banner, and you can change your choice at any time via the &quot;Cookie Notice&quot; / &quot;Cookie settings&quot; link in our website footer. You can also manage or delete cookies in your browser settings. Declining non-essential cookies will not affect your ability to shop with us. For more detail, see our Cookie Notice.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">8. Advertising, the Meta Pixel, and Meta ads</h2>
              <p className="text-muted-foreground">
                We advertise Viśvam on Meta platforms — Facebook and Instagram — and we use the Meta Pixel and related Meta advertising tools on this website.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-ink">What this means:</strong> When you consent to advertising cookies, the Meta Pixel records certain actions you take on our site — for example, pages you view, products you look at, items added to cart, and purchases. This information, together with identifiers such as your IP address and cookie data (and, where applicable, limited contact identifiers shared in hashed form), may be shared with Meta.
                </p>
                <p>
                  <strong className="text-ink">Why we use it:</strong> We use these tools to measure how our ads perform, to understand which products interest visitors, to show you and people like you more relevant Viśvam ads on Meta platforms, and to build audiences for our campaigns (including reminding you of items you viewed).
                </p>
                <p>
                  <strong className="text-ink">Your control:</strong> These tools operate only where you have consented to advertising cookies. You can withdraw that consent at any time through our cookie settings. You can also control how Meta shows you ads through the ad preferences and settings within your Facebook and Instagram accounts. Meta processes data received through these tools in accordance with its own privacy policy, available at <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-clay underline">https://www.facebook.com/privacy/policy</a>.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">9. How long we keep your data</h2>
              <p className="text-muted-foreground">
                We retain personal data only for as long as necessary for the purposes described in this policy, or as required to meet legal, tax, accounting, and regulatory obligations. When data is no longer needed, we securely delete or anonymise it.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">10. Your rights</h2>
              <p className="text-muted-foreground">Under the DPDP framework, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong>Access</strong> a summary of the personal data we hold about you and how we process it</li>
                <li><strong>Correct, complete, or update</strong> inaccurate or incomplete data</li>
                <li><strong>Erase</strong> your personal data where it is no longer required and there is no legal reason to retain it</li>
                <li><strong>Withdraw consent</strong> at any time, as easily as you gave it</li>
                <li><strong>Nominate</strong> another individual to exercise your rights in the event of your death or incapacity</li>
                <li><strong>Grievance redressal:</strong> Raise a complaint with us about how we handle your data</li>
              </ul>
              <p className="text-muted-foreground pt-1">
                To exercise any of these rights, contact us at <a href="mailto:contact@visvam.in" className="text-clay font-medium underline">contact@visvam.in</a>. We may need to verify your identity before acting on a request. We will respond within the timelines required by law. If you are not satisfied with our response, you may escalate to the <strong>Data Protection Board of India</strong>.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">11. How we protect your data</h2>
              <p className="text-muted-foreground">
                We use reasonable technical and organisational safeguards to protect your personal data against unauthorised access, disclosure, alteration, or loss. This includes encrypted connections (HTTPS), restricted access to data on a need-to-know basis, and reliance on reputable platforms and payment providers. No method of transmission or storage is completely secure, but we work to protect your data and to notify you and the relevant authority of any personal data breach as required by law.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">12. Children&apos;s data</h2>
              <p className="text-muted-foreground">
                Our website and products are intended for adults. We do not knowingly collect personal data from anyone under the age of 18 without verifiable consent from a parent or lawful guardian, as required under DPDP. If you believe a minor has provided us with personal data, please contact us and we will take appropriate steps to delete it.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">13. Third-party links</h2>
              <p className="text-muted-foreground">
                Our site may contain links to third-party websites or platforms (for example, our social media pages or payment provider). We are not responsible for the privacy practices of those third parties, and we encourage you to review their policies.
              </p>
            </section>

            {/* Section 14 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">14. Changes to this policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. The &quot;last updated&quot; date at the top reflects the latest version. Where changes are material, we will take reasonable steps to notify you.
              </p>
            </section>

            {/* Section 15 */}
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">15. Contact and grievances</h2>
              <p className="text-muted-foreground">
                For any question about this policy or your personal data, or to raise a grievance, contact:
              </p>
              <div className="p-5 bg-cream/50 rounded-xl border border-border/60 text-xs font-mono space-y-1.5 text-ink">
                <p className="font-bold text-sm">Tej Kripa Private Limited <span className="font-normal text-muted-foreground">(Viśvam)</span></p>
                <p>Address: F-329, 2nd Floor, F Block, Sector-63, Noida, Uttar Pradesh 201309</p>
                <p>Email: <a href="mailto:contact@visvam.in" className="text-clay underline font-medium">contact@visvam.in</a> &nbsp;&bull;&nbsp; Phone: <a href="tel:+919217870974" className="text-clay underline font-medium">+91 9217870974</a></p>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                We will acknowledge your grievance within 48 hours and endeavour to resolve it within the timelines prescribed under applicable law.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
