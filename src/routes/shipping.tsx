import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy — Viśvam Harvest" },
      {
        name: "description",
        content: "Discover Viśvam Harvest's cold-chain shipping logistics and express delivery timelines.",
      },
    ],
  }),
  component: ShippingPolicy,
});

function ShippingPolicy() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="mb-16 border-b border-border/40 pb-10">
            <span className="text-[11px] font-mono text-clay uppercase tracking-widest font-semibold block mb-3">
              LOGISTICS & DELIVERY
            </span>
            <h1 className="font-display italic text-4xl sm:text-6xl text-ink">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Effective Date: January 1, 2026 &bull; Last Updated: August 2026
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-foreground/90 max-w-3xl">
            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">1. Cold-Chain Preserved Packaging</h2>
              <p className="text-muted-foreground">
                Every order dispatched from Viśvam Harvest is nitrogen-flushed and vacuum-sealed in food-grade airtight pouches to lock in natural oils, aroma, and orchard-fresh crunch throughout transit.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">2. Dispatch & Delivery Timelines</h2>
              <p className="text-muted-foreground">
                Orders are processed and dispatched from our cold-storage facility within 24 to 48 business hours. Standard express shipping typically delivers within 3 to 5 business days depending on your location.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">3. Order Tracking</h2>
              <p className="text-muted-foreground">
                Once your shipment is handed over to our courier partner, you will receive an SMS and email notification containing a direct tracking link to monitor your parcel in real-time.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display italic text-2xl text-ink">4. Shipping Charges & Festive Gifting</h2>
              <p className="text-muted-foreground">
                We offer complimentary express shipping on orders exceeding specified minimum thresholds. For bulk corporate gifting and festive hampers, custom delivery schedules can be arranged via our concierge.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
