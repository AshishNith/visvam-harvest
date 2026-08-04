import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import cashews1 from "@/assets/cashews-1.png";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Farm Story — Viśvam Harvest" },
      {
        name: "description",
        content:
          "Discover the heritage behind Viśvam Harvest: single-origin orchards, traditional sun-drying, cold storage preservation, and zero preservatives.",
      },
      { property: "og:title", content: "Our Farm Story — Viśvam Harvest" },
      { property: "og:description", content: "Direct-from-orchard harvest of premium nuts and dried fruits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Story,
});

function Story() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-cream/30">
        <div className="max-w-[1400px] mx-auto px-6 py-24 lg:py-36 text-center">
          <p className="text-[10px] tracked text-muted-foreground mb-6 uppercase tracking-widest">— Farm-to-Table Heritage</p>
          <h1 className="font-display italic text-5xl md:text-7xl lg:text-[96px] leading-[0.95] max-w-5xl mx-auto animate-fade-up">
            Nurtured by Sun.<br />Graded by Hand.
          </h1>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative aspect-square lg:aspect-auto lg:min-h-[700px]">
          <img
            src={cashews1}
            alt="Hand-selected premium cashew nuts harvested at peak maturity"
            width={1200}
            height={1504}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="bg-cream p-10 lg:p-20 flex flex-col justify-center gap-8">
          <div>
            <p className="text-[10px] tracked text-muted-foreground mb-4 uppercase tracking-wider">01 — Orchard Direct</p>
            <h3 className="font-display italic text-3xl mb-4">
              Single-Origin Sourcing.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We partner directly with family orchards in California's Central Valley, Kashmiri walnut groves, Kandahar fig farms, and Jericho Valley date palms. No middle traders, zero blended batches.
            </p>
          </div>
          <div>
            <p className="text-[10px] tracked text-muted-foreground mb-4 uppercase tracking-wider">02 — Sun & Time</p>
            <h3 className="font-display italic text-3xl mb-4">
              Traditional Sun & Shade Drying.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our fruits and nuts ripen naturally on the vine and tree. Afghani figs are sun-garlanded; long green raisins are shade-dried in mud Kishmish Khana rooms to preserve natural sugars and vivid hues.
            </p>
          </div>
          <div>
            <p className="text-[10px] tracked text-muted-foreground mb-4 uppercase tracking-wider">03 — Cold Lock Freshness</p>
            <h3 className="font-display italic text-3xl mb-4">
              Nitrogen-Flushed Airtight Seals.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upon harvest, every nut and dry fruit is stored under temperature-controlled 4°C conditions and sealed in nitrogen-flushed pouches to block oxidation, keeping every bite as crisp as harvest day.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
          {[
            ["100%", "Single-origin orchards"],
            ["50%+", "Natural oil in Mamra almonds"],
            ["0%", "Added preservatives or oil"],
            ["4°C", "Constant cold-chain storage"],
          ].map(([k, v]) => (
            <div key={k} className="bg-background p-10 text-center">
              <p className="font-display italic text-5xl mb-3 text-ink">{k}</p>
              <p className="text-[10.5px] tracked text-muted-foreground uppercase max-w-[20ch] mx-auto">
                {v}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-white py-24 text-center">
        <h2 className="font-display italic text-4xl md:text-5xl max-w-2xl mx-auto px-6 mb-8">
          Taste the difference of true orchard freshness.
        </h2>
        <Link
          to="/nuts"
          className="group inline-flex items-center gap-3 text-white text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-white/80 hover:text-clay hover:border-clay transition-all duration-300"
        >
          <span>Explore Harvest Catalog</span>
          <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
        </Link>
      </section>
    </SiteLayout>
  );
}
