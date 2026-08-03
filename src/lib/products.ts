import almonds1 from "@/assets/almonds-1.png";
import almonds2 from "@/assets/almonds-2.png";
import almonds3 from "@/assets/almonds-3.png";
import cashews1 from "@/assets/cashews-1.png";
import cashews2 from "@/assets/cashews-2.png";
import cashews3 from "@/assets/cashews-3.png";
import walnuts1 from "@/assets/walnuts-1.png";
import walnuts2 from "@/assets/walnuts-2.png";
import walnuts3 from "@/assets/walnuts-3.png";
import pistachios1 from "@/assets/pistachios-1.png";
import pistachios2 from "@/assets/pistachios-2.png";
import pistachios3 from "@/assets/pistachios-3.png";
import mamra1 from "@/assets/mamra-1.png";

export type Category = "nuts" | "dried-fruits" | "exotic-seeds" | "combos";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  category: Category;
  badge?: string;
  images: string[];
  description: string;
  serving: string;
  origin: string;
  prepMinutes?: number;
  grade?: string;
  benefits?: string[];
  bestseller?: boolean;
  isNew?: boolean;
};

export const products: Product[] = [
  {
    slug: "california-jumbo-almonds",
    name: "California Jumbo Almonds (Badam)",
    tagline: "Grade A1 · California Orchards · Cold-Stored",
    price: 14.5,
    category: "nuts",
    badge: "Bestseller",
    images: [almonds1, almonds2, almonds3],
    description:
      "Hand-selected jumbo whole almonds harvested at peak oil maturity. Gently air-dried and nitrogen-sealed to retain natural crunch, vitamin E, and sweet buttery flavor.",
    serving: "500g Pouch",
    origin: "California, USA",
    grade: "Jumbo A1",
    benefits: ["Rich in Vitamin E", "Heart Healthy", "High Plant Protein"],
    bestseller: true,
  },
  {
    slug: "king-w240-cashews",
    name: "King W240 Whole Cashews (Kaju)",
    tagline: "W240 King Size · Mangaluru Origin · Slow-Roasted",
    price: 16.9,
    category: "nuts",
    badge: "Premium Grade",
    images: [cashews1, cashews2, cashews3],
    description:
      "Extra-large W240 whole cashew kernels renowned for their rich creaminess and smooth bite. Naturally sun-dried and lightly batch-roasted without artificial oils.",
    serving: "500g Jar",
    origin: "Mangaluru, India",
    grade: "W240 Whole",
    benefits: ["Rich in Magnesium", "Zero Cholesterol", "Creamy Crunch"],
    bestseller: true,
  },
  {
    slug: "kashmiri-snow-walnuts",
    name: "Kashmiri Extra-Light Walnuts (Akhrot)",
    tagline: "Extra-Light Halves · Single-Origin Kashmir · Brain Food",
    price: 18.5,
    category: "nuts",
    badge: "New Harvest",
    images: [walnuts1, walnuts2, walnuts3],
    description:
      "Hand-extracted half kernels from wild Kashmiri walnut groves. Naturally sweet with zero bitterness, packed with heart-healthy Omega-3 ALA fatty acids.",
    serving: "500g Box",
    origin: "Anantnag, Kashmir",
    grade: "Snow Light Halves",
    benefits: ["High Omega-3 ALA", "Memory Support", "100% Organic"],
    isNew: true,
  },
  {
    slug: "roasted-salted-pistachios",
    name: "Roasted & Salted Pistachios (Pista)",
    tagline: "Jumbo Shells · Himalayan Pink Salt · Wood-Fired",
    price: 15.8,
    category: "nuts",
    badge: "Crowd Favourite",
    images: [pistachios1, pistachios2, pistachios3],
    description:
      "Naturally opened jumbo pistachios slow-roasted over wood embers and lightly dusted with unrefined pink salt crystals. Easy to shell and intensely flavorful.",
    serving: "500g Pouch",
    origin: "Kerman Valley",
    grade: "Jumbo 20/22",
    benefits: ["High Fiber", "Potassium Rich", "Low Calorie Snack"],
    bestseller: true,
  },
  {
    slug: "iranian-mamra-almonds",
    name: "Royal Iranian Mamra Almonds",
    tagline: "50%+ Natural Oil · Wild Mountain Harvest",
    price: 28.0,
    category: "nuts",
    badge: "Superfood",
    images: [
      mamra1,
      "https://images.unsplash.com/photo-1508061252966-17387f8b52d9?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "The undisputed king of almonds. Cultivated in mineral-rich mountain soil, Mamra almonds possess over 50% natural almond oil content for unmatched brain & wellness benefits.",
    serving: "500g Tin",
    origin: "Chaharmahal, Iran",
    grade: "Authentic Mamra",
    benefits: ["50%+ Natural Oil", "Brain Boost", "Rich Antioxidants"],
  },
  {
    slug: "afghani-organic-anjeer",
    name: "Afghani Organic Dried Figs (Anjeer)",
    tagline: "Sun-Dried Garlands · Soft Honey Core · Zero Sugar Added",
    price: 19.2,
    category: "dried-fruits",
    badge: "High Fiber",
    images: [
      "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "Hand-strung dried figs harvested from Kandahar orchards. Naturally sun-dried until the natural fruit sugars caramelize into a soft, honey-like center rich in dietary fiber.",
    serving: "500g Pack",
    origin: "Kandahar, Afghanistan",
    grade: "Grade A Garland",
    benefits: ["Digestive Wellness", "Rich Calcium Source", "Natural Sweetener"],
    bestseller: true,
  },
  {
    slug: "royal-medjool-dates",
    name: "Royal Medjool King Dates (Khajoor)",
    tagline: "Large Soft Medjool · Rich Caramel Bite · Mineral Rich",
    price: 17.5,
    category: "dried-fruits",
    badge: "Organic",
    images: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "Known as the fruit of kings. Abundantly plump, soft, and moist Medjool dates with a rich caramel texture. Perfect as a natural pre-workout energy boost.",
    serving: "500g Box",
    origin: "Jericho Oasis",
    grade: "Super Jumbo",
    benefits: ["Instant Energy Boost", "High Iron", "Zero Additives"],
    bestseller: true,
  },
  {
    slug: "afghan-green-raisins",
    name: "Long Green Seedless Kishmish",
    tagline: "Shade-Dried Long Berries · Sweet & Tangy · Iron Rich",
    price: 11.4,
    category: "dried-fruits",
    badge: "Juicy",
    images: [
      "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "Slender long green raisins shade-dried in traditional earthen Kishmish Khana rooms to preserve their vivid green hue, tart acidity, and high antioxidant profile.",
    serving: "500g Pouch",
    origin: "Herat, Afghanistan",
    grade: "Long Green A+",
    benefits: ["High Iron", "Blood Health", "Natural Energy"],
  },
  {
    slug: "wild-dried-berries-mix",
    name: "Wild Cranberry & Blueberry Mix",
    tagline: "Whole Ruby Cranberries · Wild Blueberries · Low Sugar",
    price: 16.0,
    category: "dried-fruits",
    badge: "Immunity",
    images: [
      "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "A vibrant berry blend of dark wild blueberries and succulent whole red cranberries. Lightly sweetened with natural apple juice concentrate for daily immunity support.",
    serving: "400g Jar",
    origin: "Pacific Northwest",
    grade: "Wild Harvest",
    benefits: ["Rich in Polyphenols", "Urinary Health", "Vibrant Taste"],
    isNew: true,
  },
  {
    slug: "queensland-macadamia-nuts",
    name: "Raw Queensland Macadamia Nuts",
    tagline: "Whole Creamy Style 1 · Cold-Shelled · Keto Friendly",
    price: 24.5,
    category: "exotic-seeds",
    badge: "Exotic",
    images: [
      "https://images.unsplash.com/photo-1508061252966-17387f8b52d9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "Silky, buttery macadamia nut halves and wholes harvested in subterranean Australian soil. Unmatched rich texture with ultra-healthy keto-friendly monounsaturated fats.",
    serving: "400g Glass Jar",
    origin: "Queensland, Australia",
    grade: "Style 1 Whole",
    benefits: ["Keto Approved", "Monounsaturated Fats", "Silky Texture"],
  },
  {
    slug: "7-in-1-superseeds-mix",
    name: "7-in-1 Roasted Superseeds Wellness Mix",
    tagline: "Pumpkin, Sunflower, Flax, Chia, Sesame, Watermelon & Hemp",
    price: 12.8,
    category: "exotic-seeds",
    badge: "Daily Wellness",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "A nutrient-dense blend of 7 super seeds lightly dry-roasted with Himalayan pink salt. Packed with plant protein, magnesium, zinc, and dietary fiber for effortless health.",
    serving: "500g Pouch",
    origin: "Craft Roasted",
    grade: "7-Seed Synergy",
    benefits: ["Plant Protein", "Zinc & Magnesium", "Zero Oil Roasted"],
    bestseller: true,
  },
  {
    slug: "royal-heritage-gift-box",
    name: "Royal Heritage 4-in-1 Dry Fruit Gift Box",
    tagline: "Jumbo Almonds · W240 Cashews · Light Walnuts · Pista",
    price: 49.0,
    category: "combos",
    badge: "Festive Favorite",
    images: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "An opulent handcrafted rigid gift box featuring four individually vacuum-sealed compartments of our finest Jumbo Almonds, W240 Cashews, Walnut Halves, and Roasted Pistachios.",
    serving: "1kg Luxury Gift Box",
    origin: "Curated Collection",
    grade: "Heritage Gift Edition",
    benefits: ["Vacuum Sealed Freshness", "Custom Ribbon Included", "100% Organic Selection"],
    bestseller: true,
  },
  {
    slug: "festive-nut-berry-celebration",
    name: "Festive Nut & Berry Celebration Collection",
    tagline: "Mamra Almonds · Medjool Dates · Wild Berries · Anjeer",
    price: 56.0,
    category: "combos",
    badge: "Luxury Edition",
    images: [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "The ultimate celebratory dry fruit collection. Includes Iranian Mamra Almonds, Royal Medjool King Dates, Dried Kandahar Figs, and Wild Berry Mix housed in an embossed metallic tin.",
    serving: "1.2kg Gold Tin",
    origin: "Grand Selection",
    grade: "Royal Edition",
    benefits: ["Gold Embossed Tin", "Air-tight Lock", "Guaranteed Premium Grade"],
    isNew: true,
  },
];

export const getProductsByCategory = (c: Category) =>
  products.filter((p) => p.category === c);

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const categories: { slug: Category; label: string; index: string; description: string }[] = [
  { slug: "nuts", label: "Nuts & Kernels", index: "01", description: "Jumbo Almonds, W240 Cashews, Kashmiri Walnuts & Pistachios" },
  { slug: "dried-fruits", label: "Dried Fruits & Dates", index: "02", description: "Organic Figs, Royal Medjool Dates, Long Kishmish & Berries" },
  { slug: "exotic-seeds", label: "Exotic Seeds & Mixes", index: "03", description: "Queensland Macadamia Nuts & 7-in-1 Superseeds Mix" },
  { slug: "combos", label: "Gift Boxes & Combos", index: "04", description: "Handcrafted Luxury Gift Boxes & Festive Collections" },
];
