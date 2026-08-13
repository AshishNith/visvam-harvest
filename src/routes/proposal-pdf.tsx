import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft, ShieldCheck, CheckCircle2, DollarSign, Layers, FileText } from "lucide-react";

export const Route = createFileRoute("/proposal-pdf")({
  head: () => ({
    meta: [
      { title: "Client Proposal & SLA — GoRan AI" },
      { name: "description", content: "Official Website Development & Maintenance Agreement by GoRan AI for Viśvam." },
    ],
  }),
  component: ProposalPage,
});

function ProposalPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 print:bg-white print:text-black">
      {/* Top Action Bar (Hidden on Print) */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 py-4 px-6 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-ink transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-clay">GoRan AI Official Proposal</span>
              <h1 className="font-display text-xl text-ink">Development & Maintenance SLA Agreement</h1>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="group inline-flex items-center gap-2 bg-ink text-white text-xs font-semibold tracked uppercase tracking-widest px-5 py-2.5 hover:bg-clay transition-all duration-300 cursor-pointer shadow-xs"
          >
            <Download size={14} />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </header>

      {/* Main Proposal Document */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10 text-left print:p-0 print:space-y-6">

        {/* Proposal Header Banner */}
        <div className="border-b border-border pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-clay">Prepared by GoRan AI</span>
              <h2 className="font-display text-3xl md:text-4xl text-ink mt-0.5">Viśvam E-Commerce Platform</h2>
            </div>
            <div className="text-left sm:text-right font-mono text-xs text-muted-foreground">
              <p><strong>Proposal Ref:</strong> GORAN-VIS-2026</p>
              <p><strong>Lead Engineer:</strong> Ashish Ranjan</p>
              <p><strong>Agency:</strong> GoRan AI</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            This agreement prepared by <strong className="text-ink">GoRan AI</strong> outlines the complete scope of work, financial milestones, and ongoing service level agreement (SLA) for the design, custom engineering, and monthly maintenance of the <strong className="text-ink">Viśvam Harvest</strong> web application and management dashboard.
          </p>
        </div>

        {/* Commercial Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cream/60 border-2 border-clay/40 p-6 rounded-xl space-y-3 print:border-black print:bg-white">
            <span className="text-[10px] uppercase font-bold tracking-wider text-clay block">Phase 1 • Development Fee</span>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl text-ink">One-Time Project</h3>
              <span className="font-display italic text-3xl font-bold text-ink">₹38,000</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Covers complete bespoke frontend website engineering, admin management panel, database schema, and live domain launch.
            </p>
          </div>

          <div className="bg-cream/60 border-2 border-clay/40 p-6 rounded-xl space-y-3 print:border-black print:bg-white">
            <span className="text-[10px] uppercase font-bold tracking-wider text-clay block">Phase 2 • Monthly Maintenance Retainer</span>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl text-ink">Active Retainer</h3>
              <span className="font-display italic text-3xl font-bold text-ink">₹5,000 <span className="text-xs font-normal text-muted-foreground">/ month</span></span>
            </div>
            <p className="text-xs text-muted-foreground">
              Required monthly retainer commencing on launch day. Covers 24/7 uptime monitoring, server updates, security patches, daily backups, and minor content updates.
            </p>
          </div>
        </div>

        {/* Section 1: Scope of Work */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <Layers size={20} className="text-clay" /> 1. Development Scope Billed at ₹38,000
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground">
            <div className="space-y-3 bg-cream/30 p-5 border border-border/60 rounded-lg">
              <h4 className="font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-clay" /> E-Commerce Storefront Website
              </h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-ink">
                <li>Custom luxury responsive UI design (zero boxy containers).</li>
                <li>Product catalog for dry fruits, nuts, berries, and gift boxes.</li>
                <li>Interactive Bestseller showcase with GSAP pinned animations.</li>
                <li>Shopping bag drawer, quick view modal, and live search filter.</li>
                <li>Express Checkout flow with order confirmation screen.</li>
                <li>SEO meta tags, OpenGraph sharing, and fast web speed.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-cream/30 p-5 border border-border/60 rounded-lg">
              <h4 className="font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-clay" /> Admin Panel & Infrastructure
              </h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-ink">
                <li>Secure admin authentication & dashboard controls.</li>
                <li>Inventory management (add/edit products, stock, pricing).</li>
                <li>Order processing pipeline (view orders, update delivery status).</li>
                <li>Customer management & analytics review.</li>
                <li>Database configuration & backend API integration.</li>
                <li>Custom domain mapping (<code className="text-clay">visvam.in</code>) with SSL security.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Payment Terms & Milestones */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <DollarSign size={20} className="text-clay" /> 2. Payment Schedule & Milestones
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-border">
              <thead>
                <tr className="bg-cream/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Trigger Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                <tr>
                  <td className="py-3 px-4 font-bold">Initial Advance Deposit</td>
                  <td className="py-3 px-4">50%</td>
                  <td className="py-3 px-4 font-bold">₹19,000</td>
                  <td className="py-3 px-4 text-muted-foreground">Upon contract signing & project kick-off</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Final Handover & Deployment</td>
                  <td className="py-3 px-4">50%</td>
                  <td className="py-3 px-4 font-bold">₹19,000</td>
                  <td className="py-3 px-4 text-muted-foreground">Upon completion of UAT testing & domain launch</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Monthly Maintenance Agreement */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <ShieldCheck size={20} className="text-clay" /> 3. Monthly Maintenance Retainer & SLA (₹5,000 / month)
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Ongoing server maintenance, uptime monitoring, security updates, and content modifications commence immediately upon project launch under the active <strong>GoRan AI ₹5,000/month Maintenance Retainer</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-border bg-background rounded-lg space-y-2">
              <span className="font-bold text-ink uppercase tracking-wider block text-clay">✓ Included in Monthly Maintenance (₹5,000/mo)</span>
              <ul className="space-y-1.5 list-disc list-inside text-muted-foreground leading-relaxed">
                <li><strong>24/7 Server & Uptime Monitoring:</strong> Immediate response if website experiences downtime.</li>
                <li><strong>Server Maintenance:</strong> Hosting configuration, framework updates, Node runtime maintenance.</li>
                <li><strong>Database Health & Backups:</strong> Automated daily database backups & index optimization.</li>
                <li><strong>Minor Content Updates:</strong> Price modifications, hero banner updates, content adjustments (up to 4 hours/month).</li>
                <li><strong>Security & SSL Maintenance:</strong> SSL certificate auto-renewals & security patch application.</li>
                <li><strong>Monthly Performance Audits:</strong> Speed checks, image compression, and mobile responsiveness checks.</li>
              </ul>
            </div>

            <div className="p-4 border border-border bg-background rounded-lg space-y-2">
              <span className="font-bold text-ink uppercase tracking-wider block text-amber-700">⚡ Excluded / Out of Scope (Billed Separately)</span>
              <ul className="space-y-1.5 list-disc list-inside text-muted-foreground leading-relaxed">
                <li>Major full-page website redesigns or total brand re-engineering.</li>
                <li>New complex feature modules (e.g. mobile app, ERP integration, multi-currency gateway).</li>
                <li>Third-party API subscription costs (e.g. SMS credits, domain renewal fees).</li>
                <li>Product photography creation or video production.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Key Terms & Protections */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <FileText size={20} className="text-clay" /> 4. Terms of Agreement & SLA Policy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-cream/40 border border-border rounded-lg space-y-1">
              <h5 className="font-bold text-ink">Maintenance Policy</h5>
              <p className="text-muted-foreground leading-relaxed">
                All post-launch server support, bug fixes, and updates are governed strictly under the ₹5,000/mo retainer starting on launch day.
              </p>
            </div>

            <div className="p-4 bg-cream/40 border border-border rounded-lg space-y-1">
              <h5 className="font-bold text-ink">IP & Code Ownership</h5>
              <p className="text-muted-foreground leading-relaxed">
                100% full source code and database ownership is transferred to the client upon full payment of ₹38,000.
              </p>
            </div>

            <div className="p-4 bg-cream/40 border border-border rounded-lg space-y-1">
              <h5 className="font-bold text-ink">SLA Response Times</h5>
              <p className="text-muted-foreground leading-relaxed">
                Critical downtime: Resolution within 2–4 hours. Minor content edits: Completed within 24–48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Sign-off Box */}
        <div className="border-t-2 border-border pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="space-y-6">
            <p className="font-bold text-ink uppercase tracking-wider">Accepted By (Client):</p>
            <div className="h-12 border-b border-border" />
            <div className="space-y-1 text-muted-foreground">
              <p><strong>Name:</strong> ___________________________</p>
              <p><strong>Title:</strong> Viśvam Representative</p>
              <p><strong>Date:</strong> ___________________________</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-bold text-ink uppercase tracking-wider">Prepared By (Agency):</p>
            <div className="h-12 border-b border-border" />
            <div className="space-y-1 text-muted-foreground">
              <p><strong>Ashish Ranjan</strong></p>
              <p><strong>Agency:</strong> GoRan AI</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
