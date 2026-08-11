import almondPhoto1 from "@/Categorized_Photos/01_Almonds_Badam/DSC00414.JPG";
import almondPhoto2 from "@/Categorized_Photos/01_Almonds_Badam/DSC00445.JPG";
import almondPhoto3 from "@/Categorized_Photos/01_Almonds_Badam/DSC00573.JPG";
import mamraPhoto1 from "@/Categorized_Photos/01_Almonds_Badam/DSC00594.JPG";
import mamraPhoto2 from "@/Categorized_Photos/01_Almonds_Badam/DSC00595.JPG";

import cashewPhoto1 from "@/Categorized_Photos/02_Cashews_Kaju/DSC00438.JPG";
import cashewPhoto2 from "@/Categorized_Photos/02_Cashews_Kaju/DSC00471.JPG";
import cashewPhoto3 from "@/Categorized_Photos/02_Cashews_Kaju/DSC00515.JPG";

import pistaPhoto1 from "@/Categorized_Photos/03_Pistachios_Pista/DSC00612.JPG";
import pistaPhoto2 from "@/Categorized_Photos/03_Pistachios_Pista/DSC00613.JPG";
import pistaPhoto3 from "@/Categorized_Photos/03_Pistachios_Pista/DSC00614.JPG";

import walnutPhoto1 from "@/Categorized_Photos/04_Walnuts_Akhrot/DSC00512.JPG";
import walnutPhoto2 from "@/Categorized_Photos/04_Walnuts_Akhrot/DSC00564.JPG";
import walnutPhoto3 from "@/Categorized_Photos/04_Walnuts_Akhrot/DSC00591.JPG";

import datePhoto1 from "@/Categorized_Photos/05_Dates_Khajoor/DSC00525.JPG";
import datePhoto2 from "@/Categorized_Photos/05_Dates_Khajoor/DSC00530.JPG";
import datePhoto3 from "@/Categorized_Photos/05_Dates_Khajoor/DSC00562.JPG";

import raisinPhoto1 from "@/Categorized_Photos/06_Raisins_Kishmish/DSC00540.JPG";
import raisinPhoto2 from "@/Categorized_Photos/06_Raisins_Kishmish/DSC00545.JPG";
import raisinPhoto3 from "@/Categorized_Photos/06_Raisins_Kishmish/DSC00702.JPG";

import seedPhoto1 from "@/Categorized_Photos/07_Peanuts_and_Other_Nuts/DSC00430.JPG";
import seedPhoto2 from "@/Categorized_Photos/07_Peanuts_and_Other_Nuts/DSC00487.JPG";
import seedPhoto3 from "@/Categorized_Photos/07_Peanuts_and_Other_Nuts/DSC00505.JPG";

import giftPhoto1 from "@/Categorized_Photos/08_Assorted_Mix_and_Gift_Platters/DSC00762.JPG";
import giftPhoto2 from "@/Categorized_Photos/08_Assorted_Mix_and_Gift_Platters/DSC00764.JPG";
import giftPhoto3 from "@/Categorized_Photos/08_Assorted_Mix_and_Gift_Platters/DSC00766.JPG";

export type Category = "gourmet" | "nuts" | "gifting";

export type Product = {
  _id?: string;
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
  stock?: number;
  grade?: string;
  benefits?: string[];
  bestseller?: boolean;
  isNew?: boolean;
  isNewProduct?: boolean;
};

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvwpxb2oa";

// Constructs optimized Cloudinary CDN URLs with auto-format & quality compression
export function cImg(folderAndFilename: string, fallback: string): string {
  if (!CLOUDINARY_CLOUD_NAME) return fallback;
  const cleanPath = folderAndFilename.replace(/^\//, "").replace(/\.JPG$/i, ".jpg");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/visvam_harvest/${cleanPath}`;
}

export const products: Product[] = [
  {
    slug: "california-jumbo-almonds",
    name: "California Jumbo Almonds (Badam)",
    tagline: "Grade A1 · California Orchards · Cold-Stored",
    price: 1199,
    category: "nuts",
    badge: "Bestseller",
    images: [
      cImg("01_Almonds_Badam/DSC00414.jpg", almondPhoto1),
      cImg("01_Almonds_Badam/DSC00445.jpg", almondPhoto2),
      cImg("01_Almonds_Badam/DSC00418.jpg", almondPhoto3),
    ],
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
    price: 1399,
    category: "nuts",
    badge: "Premium Grade",
    images: [
      cImg("02_Cashews_Kaju/DSC00438.jpg", cashewPhoto1),
      cImg("02_Cashews_Kaju/DSC00471.jpg", cashewPhoto2),
      cImg("02_Cashews_Kaju/DSC00472.jpg", cashewPhoto3),
    ],
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
    price: 1549,
    category: "nuts",
    badge: "New Harvest",
    images: [
      cImg("04_Walnuts_Akhrot/DSC00512.jpg", walnutPhoto1),
      cImg("04_Walnuts_Akhrot/DSC00564.jpg", walnutPhoto2),
      cImg("04_Walnuts_Akhrot/DSC00591.jpg", walnutPhoto3),
    ],
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
    price: 1299,
    category: "nuts",
    badge: "Crowd Favourite",
    images: [
      cImg("03_Pistachios_Pista/DSC00612.jpg", pistaPhoto1),
      cImg("03_Pistachios_Pista/DSC00613.jpg", pistaPhoto2),
      cImg("03_Pistachios_Pista/DSC00614.jpg", pistaPhoto3),
    ],
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
    price: 2349,
    category: "nuts",
    badge: "Superfood",
    images: [
      cImg("01_Almonds_Badam/DSC00421.jpg", mamraPhoto1),
      cImg("01_Almonds_Badam/DSC00423.jpg", mamraPhoto2),
      cImg("01_Almonds_Badam/DSC00414.jpg", almondPhoto1),
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
    price: 1599,
    category: "gourmet",
    badge: "High Fiber",
    images: [
      cImg("05_Dates_Khajoor/DSC00525.jpg", datePhoto1),
      cImg("05_Dates_Khajoor/DSC00530.jpg", datePhoto2),
      cImg("05_Dates_Khajoor/DSC00562.jpg", datePhoto3),
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
    price: 1449,
    category: "gourmet",
    badge: "Organic",
    images: [
      cImg("05_Dates_Khajoor/DSC00525.jpg", datePhoto1),
      cImg("05_Dates_Khajoor/DSC00530.jpg", datePhoto2),
      cImg("05_Dates_Khajoor/DSC00562.jpg", datePhoto3),
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
    price: 949,
    category: "gourmet",
    badge: "Juicy",
    images: [
      cImg("06_Raisins_Kishmish/DSC00540.jpg", raisinPhoto1),
      cImg("06_Raisins_Kishmish/DSC00545.jpg", raisinPhoto2),
      cImg("06_Raisins_Kishmish/DSC00702.jpg", raisinPhoto3),
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
    price: 1329,
    category: "gourmet",
    badge: "Immunity",
    images: [
      cImg("06_Raisins_Kishmish/DSC00545.jpg", raisinPhoto2),
      cImg("06_Raisins_Kishmish/DSC00702.jpg", raisinPhoto3),
      cImg("05_Dates_Khajoor/DSC00530.jpg", datePhoto2),
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
    price: 2049,
    category: "gourmet",
    badge: "Exotic",
    images: [
      cImg("07_Peanuts_and_Other_Nuts/DSC00430.jpg", seedPhoto1),
      cImg("07_Peanuts_and_Other_Nuts/DSC00487.jpg", seedPhoto2),
      cImg("07_Peanuts_and_Other_Nuts/DSC00505.jpg", seedPhoto3),
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
    price: 1049,
    category: "gourmet",
    badge: "Daily Wellness",
    images: [
      cImg("07_Peanuts_and_Other_Nuts/DSC00430.jpg", seedPhoto1),
      cImg("07_Peanuts_and_Other_Nuts/DSC00487.jpg", seedPhoto2),
      cImg("07_Peanuts_and_Other_Nuts/DSC00505.jpg", seedPhoto3),
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
    price: 4099,
    category: "gifting",
    badge: "Festive Favorite",
    images: [
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg", giftPhoto1),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00764.jpg", giftPhoto2),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00766.jpg", giftPhoto3),
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
    price: 4699,
    category: "gifting",
    badge: "Luxury Edition",
    images: [
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00764.jpg", giftPhoto2),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00766.jpg", giftPhoto3),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg", giftPhoto1),
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
  { slug: "gourmet", label: "Gourmet", index: "01", description: "Organic Figs, Medjool Dates, Kishmish, Berries & Superseeds" },
  { slug: "nuts", label: "Nuts", index: "02", description: "California Jumbo Almonds, W240 Cashews, Kashmiri Walnuts & Pistachios" },
  { slug: "gifting", label: "Gifting", index: "03", description: "Handcrafted Luxury Presentation Gift Boxes & Royal Hampers" },
];
