import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft, Globe, ShieldCheck, CheckCircle2, Copy, ExternalLink, Server, Key, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/domain-guide")({
  head: () => ({
    meta: [
      { title: "Domain Setup & DNS Guide — visvam.in" },
      { name: "description", content: "Step-by-step guide to connect visvam.in domain via Spaceship.com DNS settings." },
    ],
  }),
  component: DomainGuidePage,
});

function DomainGuidePage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
              <span className="text-[10px] uppercase font-bold tracking-wider text-clay">Documentation</span>
              <h1 className="font-display text-xl text-ink">Spaceship DNS Configuration Guide</h1>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="group inline-flex items-center gap-2 bg-ink text-white text-xs font-semibold tracked uppercase tracking-widest px-5 py-2.5 hover:bg-clay transition-all duration-300 cursor-pointer shadow-xs"
          >
            <Download size={14} />
            <span>Download PDF Guide</span>
          </button>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10 text-left print:p-0 print:space-y-6">

        {/* Document Header */}
        <div className="border-b border-border pb-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-clay">
              <Globe size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Custom Domain Setup Protocol</span>
            </div>
            <span className="text-xs font-mono bg-cream px-3 py-1 rounded-md border border-border text-ink">
              Target Domain: <strong>visvam.in</strong> / <strong>www.visvam.in</strong>
            </span>
          </div>

          <h2 className="font-display italic text-3xl md:text-4xl text-ink">
            Connecting visvam.in Domain on Spaceship.com
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            This step-by-step documentation details the exact DNS records (A Record and CNAME Record) required to connect the custom domain <strong className="text-ink">visvam.in</strong> to your Viśvam Harvest web application server.
          </p>
        </div>

        {/* Quick Reference Box */}
        <div className="bg-cream/60 border-2 border-clay/40 p-6 space-y-4 rounded-xl print:border-black print:bg-white">
          <div className="flex items-center gap-2 text-clay font-bold text-xs uppercase tracking-wider">
            <Server size={16} />
            <span>DNS Quick Reference Table (Copy-Paste for Spaceship)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Record Type</th>
                  <th className="py-2.5 px-3">Host / Name</th>
                  <th className="py-2.5 px-3">Value / Target IP</th>
                  <th className="py-2.5 px-3">TTL</th>
                  <th className="py-2.5 px-3 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-ink">
                {/* A Record */}
                <tr className="hover:bg-background/50">
                  <td className="py-3 px-3 font-bold text-clay">A</td>
                  <td className="py-3 px-3 font-semibold">@ <span className="text-[10px] text-muted-foreground font-sans">(or leave blank for root)</span></td>
                  <td className="py-3 px-3 font-bold text-base">76.76.21.21</td>
                  <td className="py-3 px-3 text-muted-foreground">Automatic / 300s</td>
                  <td className="py-3 px-3 text-right print:hidden">
                    <button
                      onClick={() => handleCopy("76.76.21.21", "A Record")}
                      className="inline-flex items-center gap-1 text-[11px] text-clay hover:text-ink font-sans uppercase font-bold cursor-pointer"
                    >
                      <Copy size={12} />
                      <span>{copiedField === "A Record" ? "Copied!" : "Copy IP"}</span>
                    </button>
                  </td>
                </tr>

                {/* CNAME Record */}
                <tr className="hover:bg-background/50">
                  <td className="py-3 px-3 font-bold text-clay">CNAME</td>
                  <td className="py-3 px-3 font-semibold">www</td>
                  <td className="py-3 px-3 font-bold">cname.vercel-dns.com</td>
                  <td className="py-3 px-3 text-muted-foreground">Automatic / 300s</td>
                  <td className="py-3 px-3 text-right print:hidden">
                    <button
                      onClick={() => handleCopy("cname.vercel-dns.com", "CNAME Record")}
                      className="inline-flex items-center gap-1 text-[11px] text-clay hover:text-ink font-sans uppercase font-bold cursor-pointer"
                    >
                      <Copy size={12} />
                      <span>{copiedField === "CNAME Record" ? "Copied!" : "Copy CNAME"}</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-8">
          <h3 className="font-display text-2xl text-ink border-b border-border pb-2">
            Step-by-Step Setup Guide
          </h3>

          {/* STEP 1 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-ink text-white font-bold text-sm grid place-items-center shrink-0">
              1
            </div>
            <div className="space-y-2">
              <h4 className="font-display text-lg text-ink">Log in to Spaceship Control Panel</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open <a href="https://www.spaceship.com" target="_blank" rel="noopener noreferrer" className="text-clay underline font-medium inline-flex items-center gap-1">Spaceship.com <ExternalLink size={11} /></a> and sign in to your registrar account.
              </p>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-ink text-white font-bold text-sm grid place-items-center shrink-0">
              2
            </div>
            <div className="space-y-2">
              <h4 className="font-display text-lg text-ink">Navigate to Domain List & Advanced DNS</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In your dashboard, click on <strong>Domains</strong> or <strong>Domain List</strong>, locate <strong className="text-ink">visvam.in</strong>, and select the <strong>Advanced DNS</strong> tab.
              </p>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-ink text-white font-bold text-sm grid place-items-center shrink-0">
              3
            </div>
            <div className="space-y-3">
              <h4 className="font-display text-lg text-ink">Add Root A Record for visvam.in</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click <strong>Add New Record</strong> and configure the main A record:
              </p>
              <ul className="text-xs space-y-1.5 list-disc list-inside bg-cream/40 p-4 border border-border rounded-lg font-mono text-ink">
                <li><strong>Type:</strong> A</li>
                <li><strong>Host / Name:</strong> @ (or leave blank if Spaceship defaults to root)</li>
                <li><strong>IP Address / Value:</strong> 76.76.21.21</li>
                <li><strong>TTL:</strong> Automatic / 300 seconds</li>
              </ul>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-ink text-white font-bold text-sm grid place-items-center shrink-0">
              4
            </div>
            <div className="space-y-3">
              <h4 className="font-display text-lg text-ink">Add CNAME Record for www.visvam.in</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click <strong>Add New Record</strong> again for the www subdomain:
              </p>
              <ul className="text-xs space-y-1.5 list-disc list-inside bg-cream/40 p-4 border border-border rounded-lg font-mono text-ink">
                <li><strong>Type:</strong> CNAME</li>
                <li><strong>Host / Name:</strong> www</li>
                <li><strong>Value / Target:</strong> cname.vercel-dns.com</li>
                <li><strong>TTL:</strong> Automatic / 300 seconds</li>
              </ul>
            </div>
          </div>

          {/* STEP 5 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-ink text-white font-bold text-sm grid place-items-center shrink-0">
              5
            </div>
            <div className="space-y-2">
              <h4 className="font-display text-lg text-ink">Save Changes & Allow DNS Propagation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click <strong>Save All Changes</strong>. DNS propagation across worldwide ISP resolvers typically takes between <strong>5 minutes to 30 minutes</strong> (up to 24 hours max).
              </p>
            </div>
          </div>
        </div>

        {/* Verification & SSL Info Box */}
        <div className="border border-border p-6 bg-background rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-clay font-bold text-xs uppercase tracking-wider">
            <ShieldCheck size={16} />
            <span>Automatic SSL Certificate & Security Provisioning</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Once the DNS A and CNAME records propagate, an SSL certificate (<code className="text-ink font-semibold">https://visvam.in</code>) will automatically be issued and renewed. No manual certificate installation is required.
          </p>
        </div>

        {/* Verification Link */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground print:hidden">
          <span>Check live DNS propagation status:</span>
          <a
            href="https://dnschecker.org/#A/visvam.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-clay font-semibold uppercase tracking-wider hover:text-ink inline-flex items-center gap-1"
          >
            <span>Open DNSChecker.org</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </main>
    </div>
  );
}
