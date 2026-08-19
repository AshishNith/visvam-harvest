import { useState, useEffect } from "react";
import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  Truck,
  Search,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  Calendar,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { trackOrderShipment } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: (search.orderId as string) || (search.awb as string) || "",
    };
  },
  head: () => ({
    meta: [
      { title: "Track Your Order — Viśvam Logistics" },
      {
        name: "description",
        content: "Track your Viśvam dry fruit order in real-time with live express courier updates.",
      },
    ],
  }),
  component: TrackOrderPage,
});

interface TrackingResult {
  awbCode?: string;
  courier?: string;
  currentStatus?: string;
  currentLocation?: string;
  etd?: string;
  timeline?: Array<{ date: string; activity: string; location: string; completed?: boolean }>;
  status?: string;
  message?: string;
}

function TrackOrderPage() {
  const searchParams = useSearch({ from: "/track" });
  const [query, setQuery] = useState(searchParams.orderId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleTrack = async (targetId: string) => {
    const clean = targetId.trim();
    if (!clean) {
      toast.error("Please enter an Order ID or AWB Tracking Number");
      return;
    }

    setLoading(true);
    try {
      const data = await trackOrderShipment(clean);
      if (data.success) {
        setResult(data);
      } else {
        toast.error(data.message || "No tracking information found for this query");
        setResult(null);
      }
    } catch {
      toast.error("Could not fetch live tracking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.orderId) {
      handleTrack(searchParams.orderId);
    }
  }, [searchParams.orderId]);

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-clay font-bold block">
              Shiprocket Logistics Tracking
            </span>
            <h1 className="font-display italic text-3xl sm:text-4xl text-ink">
              Track Your Viśvam Order
            </h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Real-time courier milestones, delivery date estimation, and air waybill dispatch details.
            </p>
          </div>

          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack(query);
            }}
            className="bg-cream/50 border border-border p-3 flex flex-col sm:flex-row items-center gap-3 shadow-2xs"
          >
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter 24-character Order ID or AWB Tracking Code (e.g. BLUEDART...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-background border border-border/80 outline-none focus:border-clay font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-clay transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
              <span>Track Live</span>
            </button>
          </form>

          {/* Result Card */}
          {result && (
            <div className="bg-background border border-border p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in">
              {/* Top Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-cream/30 border border-border/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">AWB Number</span>
                  <span className="font-mono font-bold text-ink">{result.awbCode || query}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Courier Partner</span>
                  <span className="font-semibold text-clay">{result.courier || "Blue Dart Express Air"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Current Status</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
                    {result.currentStatus || result.status || "IN TRANSIT"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Estimated Delivery</span>
                  <span className="font-bold text-ink">{result.etd || "2–3 Business Days"}</span>
                </div>
              </div>

              {/* Progress Milestones Stepper */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-border pb-2 flex items-center gap-2">
                  <Clock size={14} className="text-clay" /> Dispatch & Transit Timeline
                </h3>

                <div className="space-y-4 pl-3 border-l-2 border-clay/30">
                  {(result.timeline || []).map((step, idx) => (
                    <div key={idx} className="relative pl-5 space-y-0.5">
                      <span
                        className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full ${
                          step.completed ? "bg-clay ring-4 ring-clay/20" : "bg-muted-foreground/30"
                        }`}
                      />
                      <p className={`text-xs font-semibold ${step.completed ? "text-ink" : "text-muted-foreground"}`}>
                        {step.activity}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2 font-mono">
                        <span>{step.date}</span>
                        {step.location && (
                          <>
                            <span>•</span>
                            <span>{step.location}</span>
                          </>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packaging Reassurance */}
              <div className="p-4 bg-sand/30 border border-border/40 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck size={20} className="text-clay shrink-0" />
                <p>
                  Viśvam shipments are securely packed in protective food-grade packaging to ensure safe transit.
                </p>
              </div>
            </div>
          )}

          {/* Quick Help */}
          <div className="text-center text-xs text-muted-foreground pt-4">
            Need help with your shipment? Reach out to our dedicated concierge at{" "}
            <a href="mailto:care@visvam.in" className="text-clay underline font-medium">
              care@visvam.in
            </a>{" "}
            or WhatsApp{" "}
            <a
              href="https://wa.me/919217870974"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] font-semibold underline"
            >
              +91 92178 70974
            </a>
            .
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
