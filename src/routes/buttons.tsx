import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, ShoppingBag, Sparkles, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/buttons")({
  head: () => ({
    meta: [
      { title: "Button Design Showcase — Viśvam Harvest" },
      { name: "description", content: "Explore modern, seamless, and luxury button design options for Viśvam Harvest." },
    ],
  }),
  component: ButtonShowcase,
});

function ButtonShowcase() {
  const [selected, setSelected] = useState<string | null>(null);

  const buttonVariants = [
    {
      id: "style-01",
      number: "01",
      name: "Soft Organic Capsule / Pill",
      tag: "Recommended for Hero & Primary CTAs",
      description: "Fully rounded pill shape with smooth background transition, zero harsh box corners, and comfortable padding.",
      lightBg: (
        <button className="bg-ink text-white px-8 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay hover:scale-[1.02] transition-all duration-300 shadow-md">
          Shop All Harvest
        </button>
      ),
      darkBg: (
        <button className="bg-white text-ink px-8 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay hover:text-white hover:scale-[1.02] transition-all duration-300 shadow-lg">
          Shop All Harvest
        </button>
      ),
    },
    {
      id: "style-02",
      number: "02",
      name: "Minimalist Floating Glassmorphism",
      tag: "Ultra-Seamless & Translucent",
      description: "Soft backdrop blur pill that blends seamlessly into any photo background with subtle border highlights.",
      lightBg: (
        <button className="bg-ink/80 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-ink hover:border-clay hover:scale-[1.02] transition-all duration-300 shadow-sm">
          Explore Collections
        </button>
      ),
      darkBg: (
        <button className="bg-white/15 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-white hover:text-ink hover:scale-[1.02] transition-all duration-300 shadow-md">
          Explore Collections
        </button>
      ),
    },
    {
      id: "style-03",
      number: "03",
      name: "Curved Soft-Edge (Rounded 12px)",
      tag: "Modern & Friendly",
      description: "Slightly rounded corners (12px radius) that feel soft and modern without looking like a full pill or harsh square box.",
      lightBg: (
        <button className="bg-ink text-white px-8 py-3.5 rounded-xl text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay transition-all duration-300 shadow-sm">
          Add To Harvest Bag
        </button>
      ),
      darkBg: (
        <button className="bg-white text-ink px-8 py-3.5 rounded-xl text-[11px] font-medium tracked uppercase tracking-widest hover:bg-sand transition-all duration-300 shadow-md">
          Add To Harvest Bag
        </button>
      ),
    },
    {
      id: "style-04",
      number: "04",
      name: "Seamless Underline & Arrow Indicator",
      tag: "Zero Box Boundary",
      description: "Completely borderless and box-free design. Features an elegant typography link with an animated directional arrow.",
      lightBg: (
        <button className="group inline-flex items-center gap-3 text-ink text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300">
          <span>Explore Farm Story</span>
          <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
        </button>
      ),
      darkBg: (
        <button className="group inline-flex items-center gap-3 text-white text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-white/70 hover:text-clay hover:border-clay transition-all duration-300">
          <span>Explore Farm Story</span>
          <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
        </button>
      ),
    },
    {
      id: "style-05",
      number: "05",
      name: "Pill Outline with Floating Icon Badge",
      tag: "Interactive & Elegant",
      description: "Fine rounded pill outline paired with a circular icon node that glides on hover.",
      lightBg: (
        <button className="group inline-flex items-center gap-3 border border-ink/80 text-ink px-7 py-3 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-ink hover:text-white transition-all duration-300">
          <span>Gift Collections</span>
          <span className="size-6 rounded-full bg-clay text-white grid place-items-center group-hover:bg-white group-hover:text-ink transition-colors duration-300">
            <ChevronRight size={12} />
          </span>
        </button>
      ),
      darkBg: (
        <button className="group inline-flex items-center gap-3 border border-white/60 text-white px-7 py-3 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-white hover:text-ink transition-all duration-300">
          <span>Gift Collections</span>
          <span className="size-6 rounded-full bg-white/20 text-white grid place-items-center group-hover:bg-ink group-hover:text-white transition-colors duration-300">
            <ChevronRight size={12} />
          </span>
        </button>
      ),
    },
    {
      id: "style-06",
      number: "06",
      name: "Warm Terracotta Clay Capsule",
      tag: "Earth & Harvest Vibe",
      description: "Rich terracotta clay colored rounded capsule reflecting warm agricultural heritage.",
      lightBg: (
        <button className="bg-clay text-white px-9 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-ink hover:scale-[1.02] transition-all duration-300 shadow-md flex items-center gap-2">
          <Sparkles size={13} />
          <span>Discover Mamra Almonds</span>
        </button>
      ),
      darkBg: (
        <button className="bg-clay text-white px-9 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-white hover:text-ink hover:scale-[1.02] transition-all duration-300 shadow-lg flex items-center gap-2">
          <Sparkles size={13} />
          <span>Discover Mamra Almonds</span>
        </button>
      ),
    },
    {
      id: "style-07",
      number: "07",
      name: "Floating Glow Capsule",
      tag: "Luxury Premium Feel",
      description: "Rounded capsule button with a warm ambient drop shadow that creates a gentle floating depth.",
      lightBg: (
        <button className="bg-ink text-white px-8 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay hover:shadow-clay/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg">
          Add Box To Order — $49
        </button>
      ),
      darkBg: (
        <button className="bg-white text-ink px-8 py-3.5 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay hover:text-white hover:shadow-clay/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xl">
          Add Box To Order — $49
        </button>
      ),
    },
    {
      id: "style-08",
      number: "08",
      name: "Dual-Tone Capsule with Icon Lead",
      tag: "E-Commerce Utility",
      description: "Capsule shape with an embedded shopping bag icon leading the text.",
      lightBg: (
        <button className="inline-flex items-center gap-3.5 bg-sand/80 text-ink border border-border px-7 py-3 rounded-full text-[11px] font-semibold tracked uppercase tracking-widest hover:bg-ink hover:text-white hover:border-ink transition-all duration-300">
          <ShoppingBag size={14} className="text-clay" />
          <span>Quick Bag Add</span>
        </button>
      ),
      darkBg: (
        <button className="inline-flex items-center gap-3.5 bg-white/10 text-white border border-white/20 px-7 py-3 rounded-full text-[11px] font-semibold tracked uppercase tracking-widest hover:bg-white hover:text-ink transition-all duration-300">
          <ShoppingBag size={14} className="text-clay" />
          <span>Quick Bag Add</span>
        </button>
      ),
    },
    {
      id: "style-09",
      number: "09",
      name: "Minimalist Soft Pill (Ghost Variant)",
      tag: "Secondary & Filter Buttons",
      description: "Subtle tinted pill background with clean typography for low-friction actions.",
      lightBg: (
        <button className="bg-sand/60 text-ink px-7 py-3 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay hover:text-white transition-all duration-300">
          View All Selections
        </button>
      ),
      darkBg: (
        <button className="bg-white/10 text-white px-7 py-3 rounded-full text-[11px] font-medium tracked uppercase tracking-widest hover:bg-white hover:text-ink transition-all duration-300">
          View All Selections
        </button>
      ),
    },
    {
      id: "style-10",
      number: "10",
      name: "Plus Capsule Action",
      tag: "Product Card Quick Add",
      description: "Compact capsule button tailored for product grids and quick add buttons.",
      lightBg: (
        <button className="inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-[10px] font-semibold tracked uppercase tracking-wider hover:bg-clay transition-all duration-300">
          <span>Add</span>
          <Plus size={12} />
        </button>
      ),
      darkBg: (
        <button className="inline-flex items-center gap-2 bg-white text-ink px-5 py-2.5 rounded-full text-[10px] font-semibold tracked uppercase tracking-wider hover:bg-clay hover:text-white transition-all duration-300">
          <span>Add</span>
          <Plus size={12} />
        </button>
      ),
    },
  ];

  return (
    <SiteLayout>
      {/* Header Banner */}
      <section className="border-b border-border bg-cream/60 pt-28 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <span className="text-[10px] tracked text-muted-foreground uppercase tracking-widest bg-white px-3 py-1 border border-border rounded-full">
            Client Design Review Showcase
          </span>
          <h1 className="font-display italic text-5xl md:text-7xl mt-4 mb-4">
            Button Style Options
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Choose your preferred button style below. Each design replaces harsh boxy shapes with seamless, organic, and modern luxury shapes tailored for <strong>Viśvam Harvest</strong>.
          </p>
        </div>
      </section>

      {/* Button Grid Showcase */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="space-y-16">
          {buttonVariants.map((variant) => {
            const isSelected = selected === variant.id;
            return (
              <div
                key={variant.id}
                onClick={() => setSelected(variant.id)}
                className={`bg-background border rounded-2xl p-8 lg:p-10 transition-all duration-300 cursor-pointer ${
                  isSelected ? "border-clay ring-2 ring-clay/20 shadow-xl" : "border-border hover:border-ink/40 shadow-sm"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display italic text-2xl text-clay">{variant.number}</span>
                      <h3 className="text-lg font-medium">{variant.name}</h3>
                      <span className="text-[9px] tracked font-semibold bg-sand px-3 py-1 rounded-full uppercase border border-border/50">
                        {variant.tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">{variant.description}</p>
                  </div>
                  <div className="text-[10px] tracked font-semibold uppercase text-clay">
                    {isSelected ? "✓ Selected Option" : "Click to Select"}
                  </div>
                </div>

                {/* Side-by-side Light & Dark Background Demos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Light background demo */}
                  <div className="bg-cream/80 p-10 rounded-xl border border-border/60 flex flex-col items-center justify-center gap-4 min-h-[160px] relative overflow-hidden">
                    <span className="absolute top-3 left-4 text-[9px] tracked text-muted-foreground uppercase">
                      Light Surface Preview
                    </span>
                    {variant.lightBg}
                  </div>

                  {/* Dark hero background demo */}
                  <div className="bg-ink p-10 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-4 min-h-[160px] relative overflow-hidden">
                    <span className="absolute top-3 left-4 text-[9px] tracked text-white/50 uppercase">
                      Dark Hero Surface Preview
                    </span>
                    {variant.darkBg}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Summary Footer */}
      <section className="bg-sand/40 border-t border-border py-16 text-center">
        <div className="max-w-md mx-auto px-6">
          <h3 className="font-display italic text-2xl mb-3">Which style do you prefer?</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Take a screenshot of this page or share the route with your client to finalize the button choice.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
