import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft, ShieldCheck, CheckCircle2, DollarSign, Layers, FileText, Clock, Server } from "lucide-react";

export const Route = createFileRoute("/proposal-pdf")({
  head: () => ({
    meta: [
      { title: "Client Proposal & SLA Agreement — GoRan AI" },
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
              <h1 className="font-display text-xl text-ink">Development & SLA Contract</h1>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="group inline-flex items-center gap-2 bg-ink text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 hover:bg-clay transition-all duration-300 cursor-pointer shadow-xs"
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
              <h2 className="font-display text-3xl md:text-4xl text-ink mt-0.5">Viśvam E-Commerce & Admin Platform</h2>
            </div>
            <div className="text-left sm:text-right font-mono text-xs text-muted-foreground">
              <p><strong>Proposal Ref:</strong> GORAN-VIS-2026</p>
              <p><strong>Lead Engineer:</strong> Ashish Ranjan</p>
              <p><strong>Agency:</strong> GoRan AI</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            This proposal contract prepared by <strong className="text-ink">GoRan AI</strong> outlines the full scope of deliverables, development timelines, payment schedules, and ongoing monthly maintenance terms for the <strong className="text-ink">Viśvam</strong> store frontend website and admin management panel.
          </p>
        </div>

        {/* Commercial Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cream/60 border-2 border-clay/40 p-5 rounded-xl space-y-2 print:border-black print:bg-white">
            <span className="text-[10px] uppercase font-bold tracking-wider text-clay block">1. Development Charge</span>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl text-ink">Website + Admin</h3>
              <span className="font-display italic text-2xl font-bold text-ink">₹38,000</span>
            </div>
            <p className="text-xs text-muted-foreground">
              One-time fee for full design, frontend store, backend API, admin panel, and live deployment.
            </p>
          </div>

          <div className="bg-cream/60 border-2 border-clay/40 p-5 rounded-xl space-y-2 print:border-black print:bg-white">
            <span className="text-[10px] uppercase font-bold tracking-wider text-clay block">2. Maintenance Retainer</span>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl text-ink">Monthly Retainer</h3>
              <span className="font-display italic text-2xl font-bold text-ink">₹5,000 <span className="text-xs font-normal text-muted-foreground">/ mo</span></span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ongoing monthly retainer for server hosting uptime, daily backups, security patches, and minor edits.
            </p>
          </div>

          <div className="bg-cream/60 border-2 border-clay/40 p-5 rounded-xl space-y-2 print:border-black print:bg-white">
            <span className="text-[10px] uppercase font-bold tracking-wider text-clay block">3. Turnaround Time</span>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl text-ink">Timeline</h3>
              <span className="font-display italic text-xl font-bold text-ink">14–21 Days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated 2 to 3 weeks for full development, testing, and production domain launch.
            </p>
          </div>
        </div>

        {/* Section 1: Scope of Work */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <Layers size={20} className="text-clay" /> 1. Scope of Deliverables (₹38,000 Development Charge)
          </h3>
          <p className="text-xs text-muted-foreground">
            GoRan AI will engineer and deliver two primary software systems: the Customer-Facing Website and the Private Admin Panel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground">
            {/* Website Scope */}
            <div className="space-y-3 bg-cream/30 p-5 border border-border/60 rounded-lg">
              <h4 className="font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-clay" /> Scope A: Customer Storefront Website
              </h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-ink">
                <li><strong>Custom Luxury UI/UX:</strong> Bespoke design tailored for Viśvam dry fruits, nuts, berries & spices.</li>
                <li><strong>Interactive Product Catalog:</strong> Category browsing, search filters, and product detail modals.</li>
                <li><strong>Bestseller Showcase:</strong> High-conversion product grid with smooth GSAP animations.</li>
                <li><strong>Cart & Bag Drawer:</strong> Instant slide-out cart with real-time total calculation.</li>
                <li><strong>Checkout Workflow:</strong> Express order placement & confirmation screen.</li>
                <li><strong>SEO & Speed Optimization:</strong> Fast load times, meta tags, and mobile responsive layout.</li>
              </ul>
            </div>

            {/* Admin Panel Scope */}
            <div className="space-y-3 bg-cream/30 p-5 border border-border/60 rounded-lg">
              <h4 className="font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
                <Server size={16} className="text-clay" /> Scope B: Admin Panel & Infrastructure
              </h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-ink">
                <li><strong>Secure Admin Portal:</strong> Password-protected authentication for store managers.</li>
                <li><strong>Inventory Management:</strong> Add, edit, update prices, and track stock levels in real time.</li>
                <li><strong>Order Processing Pipeline:</strong> View incoming customer orders, manage statuses (Pending, Shipped, Delivered).</li>
                <li><strong>Customer Records:</strong> Store and review customer details and purchase history.</li>
                <li><strong>Database & Backend API:</strong> Cloud database setup with RESTful API integration.</li>
                <li><strong>Domain & SSL Deployment:</strong> Mapping live custom domain with SSL encryption.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Development Timeline & Payment Terms */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <Clock size={20} className="text-clay" /> 2. Delivery Timeline & Payment Terms
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            The standard project completion window is <strong>14 to 21 business days</strong> from initial deposit and content receipt. Payments are structured across two clear milestones:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-border">
              <thead>
                <tr className="bg-cream/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Timeline & Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                <tr>
                  <td className="py-3 px-4 font-bold">1. Advance Deposit</td>
                  <td className="py-3 px-4">50%</td>
                  <td className="py-3 px-4 font-bold">₹19,000</td>
                  <td className="py-3 px-4 text-muted-foreground">Due at contract signing / project kick-off (Day 1)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">2. Completion & Handover</td>
                  <td className="py-3 px-4">50%</td>
                  <td className="py-3 px-4 font-bold">₹19,000</td>
                  <td className="py-3 px-4 text-muted-foreground">Due upon UAT testing approval & before final live domain launch (approx. Day 14–21)</td>
                </tr>
                <tr className="bg-cream/30">
                  <td className="py-3 px-4 font-bold">3. Monthly Maintenance</td>
                  <td className="py-3 px-4">Recurring</td>
                  <td className="py-3 px-4 font-bold">₹5,000 / month</td>
                  <td className="py-3 px-4 text-muted-foreground">Billed monthly starting on launch day (5 days payment window)</td>
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
            Starting immediately upon live domain launch, the <strong>GoRan AI ₹5,000/month Retainer</strong> guarantees server reliability, performance, security, and minor content updates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-border bg-background rounded-lg space-y-2">
              <span className="font-bold text-ink uppercase tracking-wider block text-clay">✓ Included in Monthly Retainer (₹5,000/mo)</span>
              <ul className="space-y-1.5 list-disc list-inside text-muted-foreground leading-relaxed">
                <li><strong>24/7 Server Uptime & Health Monitoring:</strong> Instant intervention on downtime.</li>
                <li><strong>Server Maintenance & Runtime Updates:</strong> Framework and infrastructure updates.</li>
                <li><strong>Daily Automated Backups:</strong> Cloud database snapshots to prevent data loss.</li>
                <li><strong>Minor Content Updates:</strong> Updating product pricing, banners, or text (up to 4 hrs/mo).</li>
                <li><strong>Security & SSL Maintenance:</strong> SSL auto-renewals & security vulnerability patches.</li>
                <li><strong>Performance Audits:</strong> Speed checks, asset compression, and mobile checks.</li>
              </ul>
            </div>

            <div className="p-4 border border-border bg-background rounded-lg space-y-2">
              <span className="font-bold text-ink uppercase tracking-wider block text-amber-700">⚡ Excluded / Out of Scope (Billed Separately)</span>
              <ul className="space-y-1.5 list-disc list-inside text-muted-foreground leading-relaxed">
                <li>Complete website redesign or total brand overhaul.</li>
                <li>New complex feature additions (e.g., custom mobile app, ERP integration).</li>
                <li>Third-party subscription costs (SMS gateway credits, domain renewal fees).</li>
                <li>Product photography or videography production.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Key Terms & SLA Policy */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <FileText size={20} className="text-clay" /> 4. Terms of Agreement & Ownership
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-cream/40 border border-border rounded-lg space-y-1">
              <h5 className="font-bold text-ink">Code & Data Ownership</h5>
              <p className="text-muted-foreground leading-relaxed">
                100% full source code and database rights are transferred to the client upon settlement of the ₹38,000 fee.
              </p>
            </div>

            <div className="p-4 bg-cream/40 border border-border rounded-lg space-y-1">
              <h5 className="font-bold text-ink">Maintenance Requirement</h5>
              <p className="text-muted-foreground leading-relaxed">
                Post-launch ongoing support and server uptime are maintained under the active ₹5,000/mo retainer.
              </p>
            </div>

            <div className="p-4 bg-cream/40 border border-border rounded-lg space-y-1">
              <h5 className="font-bold text-ink">SLA SLA Response Time</h5>
              <p className="text-muted-foreground leading-relaxed">
                Critical downtime issues resolved within 2–4 hours. Minor content edits processed within 24–48 hours.
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

