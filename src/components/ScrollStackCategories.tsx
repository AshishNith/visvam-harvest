import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import nutsCategoriesBg from "@/assets/Nuts-Dried-Homepage-BG.png";
import gourmetHeroBg from "@/assets/Gourmets-Homepage-BG.png";
import giftingCategoriesBg from "@/assets/Gifting-Homepage-BG.png";

type CategoryItem = {
  id: string;
  slug: "gourmet" | "nuts" | "gifting";
  title: string;
  subtitle: string;
  image: string;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: "nuts",
    slug: "nuts",
    title: "Nuts & Dried Fruits",
    subtitle: "Every nut is hand-picked for depth of flavor, elegantly packaged to deliver a hushed yet unmistakable sense of refinement.",
    image: nutsCategoriesBg,
  },
  {
    id: "gourmet",
    slug: "gourmet",
    title: "Gourmet",
    subtitle: "Curated for everyday indulgence. A little sweet, a little savoury, made for togetherness.",
    image: gourmetHeroBg,
  },
  {
    id: "gifting",
    slug: "gifting",
    title: "Gifting",
    subtitle: "Handcrafted presentation boxes and celebratory hampers, composed for the moments worth marking.",
    image: giftingCategoriesBg,
  },
];

export function ScrollStackCategories() {
  return (
    <section className="py-12 sm:py-20 md:py-28 bg-background border-b border-border/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-12">
          <h2 className="font-display italic text-3xl sm:text-5xl lg:text-6xl text-ink">
            The Ritual Selects
          </h2>
        </div>

        <div className="space-y-5 sm:space-y-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/${cat.slug}`}
              className="relative min-h-[170px] sm:min-h-[220px] lg:min-h-[260px] aspect-[16/10] sm:aspect-[28/9] lg:aspect-[32/9] overflow-hidden group rounded-2xl sm:rounded-3xl shadow-sm block"
            >
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30 flex flex-col justify-center p-5 sm:p-8 lg:p-10 text-white space-y-2 sm:space-y-3">
                <h3 className="font-display italic text-2xl sm:text-3xl lg:text-4xl leading-tight">{cat.title}</h3>
                <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed line-clamp-2">
                  {cat.subtitle}
                </p>
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white group-hover:text-sand border-b border-white/60 pb-1 self-start transition-all pt-1">
                  <span>Explore</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

