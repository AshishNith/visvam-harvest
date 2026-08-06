import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import almondsImg from "@/assets/almonds-1.png";
import comboBoxImg from "@/assets/combo-box.jpg";

type CategoryItem = {
  id: string;
  slug: "gourmet" | "nuts" | "gifting";
  num: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  stickyTop: string;
  zIndexClass: string;
  zIndexNum: number;
};

const STACK_ITEMS: CategoryItem[] = [
  {
    id: "gourmet",
    slug: "gourmet",
    num: "01",
    title: "Gourmet",
    subtitle: "Organic Kandahar Dried Figs, Royal Medjool Dates & 7-in-1 Superseeds.",
    image: "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=1200&q=80",
    bgColor: "bg-[#F8F3EC]",
    textColor: "text-ink",
    accentColor: "text-clay",
    stickyTop: "top-20 md:top-24",
    zIndexClass: "z-10",
    zIndexNum: 10,
  },
  {
    id: "nuts",
    slug: "nuts",
    num: "02",
    title: "Nuts",
    subtitle: "Handpicked California Jumbo Almonds, W240 Cashews & Kashmiri Walnuts.",
    image: almondsImg,
    bgColor: "bg-[#EFE3D4]",
    textColor: "text-ink",
    accentColor: "text-clay",
    stickyTop: "top-24 md:top-32",
    zIndexClass: "z-20",
    zIndexNum: 20,
  },
  {
    id: "gifting",
    slug: "gifting",
    num: "03",
    title: "Gifting",
    subtitle: "Handcrafted Luxury Gift Boxes & Vacuum-Sealed Festive Hampers.",
    image: comboBoxImg,
    bgColor: "bg-[#241A12]",
    textColor: "text-white",
    accentColor: "text-ember",
    stickyTop: "top-28 md:top-40",
    zIndexClass: "z-30",
    zIndexNum: 30,
  },
];

export function ScrollStackCategories() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
        <div>
          <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-ink">
            The Harvest Categories
          </h2>
        </div>
        <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
          Three curated lines — Gourmet selections, single-origin nuts, and handcrafted gift hampers.
        </p>
      </div>

      <div className="space-y-10 md:space-y-16 pb-20 md:pb-36">
        {STACK_ITEMS.map((item) => (
          <div
            key={item.id}
            style={{ zIndex: item.zIndexNum }}
            className={`sticky ${item.stickyTop} ${item.zIndexClass} transition-all duration-500`}
          >
            <div
              className={`${item.bgColor} ${item.textColor} rounded-sm p-8 sm:p-12 lg:p-16 shadow-xl transition-all duration-500 overflow-hidden group`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-center">
                {/* Minimal Content Left */}
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div>
                    <span className={`text-xs font-mono tracking-widest ${item.accentColor} font-semibold uppercase block mb-3`}>
                      {item.num} — CATEGORY
                    </span>
                    <h3 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-none mb-4">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed max-w-md">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Minimal Link */}
                  <div>
                    <Link
                      to={`/${item.slug}`}
                      className="group/btn inline-flex items-center gap-2.5 text-xs font-medium tracked uppercase tracking-widest hover:text-clay transition-all duration-300"
                    >
                      <span className="border-b border-current pb-0.5">Explore {item.title}</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>

                {/* Image Right */}
                <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-sm overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-700">
                  <img
                    src={item.image}
                    alt={item.title}
                    width={1000}
                    height={750}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
