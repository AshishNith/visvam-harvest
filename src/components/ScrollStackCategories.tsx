import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cImg } from "@/lib/products";

type CategoryItem = {
  id: string;
  slug: "gourmet" | "nuts" | "gifting";
  tag: string;
  title: string;
  subtitle: string;
  image: string;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: "gourmet",
    slug: "gourmet",
    tag: "01 / SELECTION",
    title: "Gourmet Selections",
    subtitle: "Sun-Dried Afghani Figs, Royal Medjool Dates & Superseed Mixes.",
    image: cImg("05_Dates_Khajoor/DSC00525.jpg"),
  },
  {
    id: "nuts",
    slug: "nuts",
    tag: "02 / SELECTION",
    title: "Nuts & Dried Fruits",
    subtitle: "California Jumbo Almonds, W240 Cashews & Kashmiri Walnuts.",
    image: cImg("01_Almonds_Badam/DSC00414.jpg"),
  },
  {
    id: "gifting",
    slug: "gifting",
    tag: "03 / SELECTION",
    title: "Royal Gift Hampers",
    subtitle: "Handcrafted Luxury Gift Boxes & Vacuum-Sealed Compartments.",
    image: cImg("08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg"),
  },
];

export function ScrollStackCategories() {
  return (
    <section className="py-20 md:py-28 bg-background border-b border-border/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-ink">
              The Harvest Categories
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Three curated lines — Gourmet selections, single-origin nuts, and handcrafted gift hampers.
          </p>
        </div>

        <div className="space-y-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="relative aspect-[21/9] sm:aspect-[24/9] overflow-hidden group rounded-xs shadow-sm"
            >
              <img
                src={cat.image}
                alt={cat.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-8 sm:p-16 text-white space-y-4">
                <span className="text-xs font-mono text-sand uppercase tracking-widest">{cat.tag}</span>
                <h3 className="font-display italic text-3xl sm:text-5xl lg:text-6xl">{cat.title}</h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed hidden sm:block">
                  {cat.subtitle}
                </p>
                <Link
                  to={`/${cat.slug}`}
                  className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-white hover:text-sand border-b border-white/60 pb-1 self-start transition-all"
                >
                  <span>Explore Line</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

