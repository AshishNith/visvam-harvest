import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck, PhoneCall, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/cart-context";

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: (search.orderId as string) || "",
      amount: search.amount ? Number(search.amount) : 0,
    };
  },
  head: () => ({
    meta: [
      { title: "Order Confirmed — Viśvam" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderId, amount } = useSearch({ from: "/order-success" });
  const displayId = orderId || `VIS-${Math.floor(100000 + Math.random() * 900000)}`;

  const today = new Date();
  const deliveryMin = new Date(today);
  deliveryMin.setDate(today.getDate() + 2);
  const deliveryMax = new Date(today);
  deliveryMax.setDate(today.getDate() + 4);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "short" });

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-16 sm:py-24">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="bg-cream/40 border border-border/60 p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-clay/10 text-clay grid place-items-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-clay font-bold block mb-1">
                Order Confirmed
              </span>
              <h1 className="font-display italic text-3xl sm:text-4xl text-ink">
                Thank you for your order!
              </h1>
              <p className="text-xs text-muted-foreground mt-2">
                Order Reference: <strong className="text-ink font-mono">{displayId}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-6 border-t border-border/40">
              <div className="bg-background p-4 border border-border/40 space-y-1">
                <div className="flex items-center gap-2 text-clay mb-2">
                  <Truck size={16} />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Estimated Delivery</span>
                </div>
                <p className="text-xs font-semibold text-ink">
                  {formatDate(deliveryMin)} – {formatDate(deliveryMax)}
                </p>
                <p className="text-[11px] text-muted-foreground">Cold-chain express courier dispatch</p>
              </div>

              <div className="bg-background p-4 border border-border/40 space-y-1">
                <div className="flex items-center gap-2 text-clay mb-2">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Packaging Guarantee</span>
                </div>
                <p className="text-xs font-semibold text-ink">Nitrogen Sealed at 4°C</p>
                <p className="text-[11px] text-muted-foreground">Locks in peak natural oils & fresh crunch</p>
              </div>
            </div>

            {amount > 0 && (
              <div className="flex justify-between items-center bg-sand/40 p-4 text-xs font-medium text-ink">
                <span>Total Amount Paid / Payable</span>
                <span className="font-display italic text-lg text-clay font-bold">{formatPrice(amount)}</span>
              </div>
            )}

            <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/track"
                search={{ orderId: displayId }}
                className="group inline-flex items-center gap-2 text-white bg-ink text-[11px] font-semibold uppercase tracking-widest py-3 px-6 hover:bg-clay transition-all duration-300 w-full sm:w-auto justify-center"
              >
                <Truck size={14} className="text-clay" />
                <span>Track Live Shipment</span>
              </Link>

              <Link
                to="/profile"
                className="group inline-flex items-center gap-2 text-ink text-[11px] font-semibold uppercase tracking-widest py-3 px-6 border border-ink hover:bg-ink hover:text-white transition-all duration-300 w-full sm:w-auto justify-center"
              >
                <Package size={14} />
                <span>My Orders</span>
              </Link>

              <a
                href={`https://wa.me/919217870974?text=${encodeURIComponent(`Hi Viśvam, tracking update request for order ${displayId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-white bg-[#25D366] text-[11px] font-semibold uppercase tracking-widest py-3 px-6 hover:brightness-105 transition-all duration-300 w-full sm:w-auto justify-center"
              >
                <PhoneCall size={14} />
                <span>WhatsApp Updates</span>
              </a>
            </div>

            <div className="pt-4">
              <Link to="/nuts" className="text-xs text-clay underline hover:text-ink transition">
                Continue Exploring Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
