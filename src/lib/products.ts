export type Category = "gourmet" | "nuts" | "gifting";

export interface IVariantAttribute {
  name: string;
  values: string[];
}

export interface IProductVariant {
  _id?: string;
  sku?: string;
  title: string;
  options: Record<string, string>;
  price: number;
  mrp?: number;
  stock: number;
  image?: string;
  isDefault?: boolean;
  /** Gross packed weight in kg — drives the Shiprocket delivery rate. */
  weightKg?: number;
}

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
  stock?: number;
  /** Gross packed weight in kg for products without variants. */
  weightKg?: number;
  benefits?: string[];
  bestseller?: boolean;
  isNew?: boolean;
  isNewProduct?: boolean;
  hasVariants?: boolean;
  variantAttributes?: IVariantAttribute[];
  variants?: IProductVariant[];
  relatedProducts?: Product[];
};

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvwpxb2oa";

// Tiny 1×1 transparent placeholder — used only when Cloudinary is unavailable
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect width='1' height='1' fill='%23f8f1e7'/%3E%3C/svg%3E";

// Constructs optimized Cloudinary CDN URLs with auto-format & quality compression
// w_1400,c_limit caps delivery width: f_auto,q_auto alone still served the
// full 6224px original into ~400px slots, costing ~800KB per card image.
export function cImg(folderAndFilename: string): string {
  if (!CLOUDINARY_CLOUD_NAME) return PLACEHOLDER;
  const cleanPath = folderAndFilename.replace(/^\//, "").replace(/\.JPG$/i, ".jpg");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1400,c_limit/visvam_harvest/${cleanPath}`;
}

// Images uploaded through the admin panel are stored as raw Cloudinary URLs —
// full-resolution originals (often 8000px+ / ~10MB each). Served untouched they
// blow out both bandwidth and, far worse, main-thread decode time: a 9344x7015
// JPEG costs ~260MB of RGBA once decoded, which is what stalls scrolling.
// This rewrites any Cloudinary delivery URL to request a sensibly sized,
// auto-format, auto-quality derivative instead. Already-transformed URLs and
// non-Cloudinary URLs are returned untouched.
export function optimizeImageUrl(url: string, width = 800): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const marker = "/image/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;

  const prefix = url.slice(0, at + marker.length);
  const rest = url.slice(at + marker.length);

  // Cloudinary puts transformations directly after /upload/. If the first
  // segment isn't a version (v123…) or a bare path, transforms already exist.
  const firstSegment = rest.split("/")[0];
  const alreadyTransformed = /(^|,)(f_|q_|w_|h_|c_|dpr_)/.test(firstSegment);
  if (alreadyTransformed) return url;

  return `${prefix}f_auto,q_auto,w_${width},c_limit/${rest}`;
}

// Applies optimizeImageUrl across a product's image array.
export function optimizeProductImages<T extends { images?: string[] }>(product: T, width = 800): T {
  if (!Array.isArray(product.images)) return product;
  return { ...product, images: product.images.map((img) => optimizeImageUrl(img, width)) };
}

export const products: Product[] = [
  {
    slug: "california-jumbo-almonds",
    name: "California Jumbo Almonds (Badam)",
    tagline: "Single-Origin · Hand-Selected",
    price: 649,
    category: "nuts",
    badge: "Bestseller",
    images: [
      cImg("01_Almonds_Badam/DSC00414.jpg"),
      cImg("01_Almonds_Badam/DSC00445.jpg"),
      cImg("01_Almonds_Badam/DSC00418.jpg"),
    ],
    description:
      "Hand-selected jumbo whole almonds selected at peak oil maturity. Gently air-dried and carefully packaged to retain natural crunch, vitamin E, and sweet buttery flavor.",
    serving: "500g Pack",
    benefits: ["Rich in Vitamin E", "Heart Healthy", "High Plant Protein"],
    bestseller: true,
    hasVariants: true,
    variantAttributes: [
      { name: "Grade", values: ["Standard Jumbo", "Reserve Super Jumbo"] },
      { name: "Weight", values: ["250g", "500g"] },
    ],
    variants: [
      {
        sku: "ALM-STD-250",
        title: "Standard Jumbo · 250g",
        options: { Grade: "Standard Jumbo", Weight: "250g" },
        price: 649,
        mrp: 699,
        stock: 60,
        isDefault: true,
      },
      {
        sku: "ALM-STD-500",
        title: "Standard Jumbo · 500g",
        options: { Grade: "Standard Jumbo", Weight: "500g" },
        price: 1199,
        mrp: 1299,
        stock: 50,
      },
      {
        sku: "ALM-RSV-250",
        title: "Reserve Super Jumbo · 250g",
        options: { Grade: "Reserve Super Jumbo", Weight: "250g" },
        price: 749,
        mrp: 799,
        stock: 40,
      },
      {
        sku: "ALM-RSV-500",
        title: "Reserve Super Jumbo · 500g",
        options: { Grade: "Reserve Super Jumbo", Weight: "500g" },
        price: 1399,
        mrp: 1499,
        stock: 30,
      },
    ],
  },
  {
    slug: "king-w240-cashews",
    name: "King W240 Whole Cashews (Kaju)",
    tagline: "W240 King Size · Slow-Roasted",
    price: 749,
    category: "nuts",
    badge: "Premium Grade",
    images: [
      cImg("02_Cashews_Kaju/DSC00438.jpg"),
      cImg("02_Cashews_Kaju/DSC00471.jpg"),
      cImg("02_Cashews_Kaju/DSC00472.jpg"),
    ],
    description:
      "Extra-large W240 whole cashew kernels renowned for their rich creaminess and smooth bite. Naturally sun-dried and lightly batch-roasted without artificial oils.",
    serving: "500g Jar",
    benefits: ["Rich in Magnesium", "Zero Cholesterol", "Creamy Crunch"],
    bestseller: true,
    hasVariants: true,
    variantAttributes: [
      { name: "Grade", values: ["Bold", "Extra Bold"] },
      { name: "Weight", values: ["250g", "500g"] },
    ],
    variants: [
      {
        sku: "CSH-BLD-250",
        title: "Bold · 250g",
        options: { Grade: "Bold", Weight: "250g" },
        price: 749,
        mrp: 799,
        stock: 50,
        isDefault: true,
      },
      {
        sku: "CSH-BLD-500",
        title: "Bold · 500g",
        options: { Grade: "Bold", Weight: "500g" },
        price: 1399,
        mrp: 1499,
        stock: 45,
      },
      {
        sku: "CSH-XBLD-250",
        title: "Extra Bold · 250g",
        options: { Grade: "Extra Bold", Weight: "250g" },
        price: 849,
        mrp: 899,
        stock: 35,
      },
      {
        sku: "CSH-XBLD-500",
        title: "Extra Bold · 500g",
        options: { Grade: "Extra Bold", Weight: "500g" },
        price: 1599,
        mrp: 1699,
        stock: 25,
      },
    ],
  },
  {
    slug: "kashmiri-snow-walnuts",
    name: "Kashmiri Extra-Light Walnuts (Akhrot)",
    tagline: "Extra-Light Halves · Brain Food",
    price: 1549,
    category: "nuts",
    badge: "New Arrival",
    images: [
      cImg("04_Walnuts_Akhrot/DSC00512.jpg"),
      cImg("04_Walnuts_Akhrot/DSC00564.jpg"),
      cImg("04_Walnuts_Akhrot/DSC00591.jpg"),
    ],
    description:
      "Hand-extracted half kernels from wild Kashmiri walnut groves. Naturally sweet with zero bitterness, packed with heart-healthy Omega-3 ALA fatty acids.",
    serving: "500g Box",
    benefits: ["High Omega-3 ALA", "Memory Support", "Orchard Sourced"],
    bestseller: true,
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
      cImg("03_Pistachios_Pista/DSC00612.jpg"),
      cImg("03_Pistachios_Pista/DSC00613.jpg"),
      cImg("03_Pistachios_Pista/DSC00614.jpg"),
    ],
    description:
      "Naturally opened jumbo pistachios slow-roasted over wood embers and lightly dusted with unrefined pink salt crystals. Easy to shell and intensely flavorful.",
    serving: "500g Pack",
    benefits: ["High Fiber", "Potassium Rich", "Low Calorie Snack"],
    bestseller: true,
  },
  {
    slug: "iranian-mamra-almonds",
    name: "Royal Iranian Mamra Almonds",
    tagline: "50%+ Natural Oil · Single-Origin Mountain Sourced",
    price: 2349,
    category: "nuts",
    badge: "Superfood",
    images: [
      cImg("01_Almonds_Badam/DSC00421.jpg"),
      cImg("01_Almonds_Badam/DSC00423.jpg"),
      cImg("01_Almonds_Badam/DSC00414.jpg"),
    ],
    description:
      "The undisputed king of almonds. Cultivated in mineral-rich mountain soil, Mamra almonds possess over 50% natural almond oil content for unmatched brain & wellness benefits.",
    serving: "500g Box",
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
      cImg("05_Dates_Khajoor/DSC00565.jpg"),
      cImg("05_Dates_Khajoor/DSC00566.jpg"),
      cImg("05_Dates_Khajoor/DSC00567.jpg"),
    ],
    description:
      "Hand-strung dried figs sourced from Kandahar orchards. Naturally sun-dried until the natural fruit sugars caramelize into a soft, honey-like center rich in dietary fiber.",
    serving: "500g Pack",
    benefits: ["Digestive Wellness", "Rich Calcium Source", "Natural Sweetener"],
    bestseller: false,
  },
  {
    slug: "royal-medjool-dates",
    name: "Royal Medjool King Dates (Khajoor)",
    tagline: "Large Soft Medjool · Rich Caramel Bite · Mineral Rich",
    price: 1449,
    category: "gourmet",
    badge: "Organic",
    images: [
      cImg("05_Dates_Khajoor/DSC00525.jpg"),
      cImg("05_Dates_Khajoor/DSC00526.jpg"),
      cImg("05_Dates_Khajoor/DSC00530.jpg"),
    ],
    description:
      "Known as the fruit of kings. Abundantly plump, soft, and moist Medjool dates with a rich caramel texture. Perfect as a natural pre-workout energy boost.",
    serving: "500g Box",
    benefits: ["Instant Energy Boost", "High Iron", "Zero Additives"],
    bestseller: false,
  },
  {
    slug: "afghan-green-raisins",
    name: "Long Green Seedless Kishmish",
    tagline: "Shade-Dried Long Berries · Sweet & Tangy · Iron Rich",
    price: 949,
    category: "gourmet",
    badge: "Juicy",
    images: [
      cImg("06_Raisins_Kishmish/DSC00540.jpg"),
      cImg("06_Raisins_Kishmish/DSC00545.jpg"),
      cImg("06_Raisins_Kishmish/DSC00702.jpg"),
    ],
    description:
      "Slender long green raisins shade-dried in traditional earthen Kishmish Khana rooms to preserve their vivid green hue, tart acidity, and high antioxidant profile.",
    serving: "500g Pack",
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
      cImg("06_Raisins_Kishmish/DSC00545.jpg"),
      cImg("06_Raisins_Kishmish/DSC00702.jpg"),
      cImg("05_Dates_Khajoor/DSC00530.jpg"),
    ],
    description:
      "A vibrant berry blend of dark wild blueberries and succulent whole red cranberries. Lightly sweetened with natural apple juice concentrate for daily immunity support.",
    serving: "400g Jar",
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
      cImg("07_Peanuts_and_Other_Nuts/DSC00430.jpg"),
      cImg("07_Peanuts_and_Other_Nuts/DSC00487.jpg"),
      cImg("07_Peanuts_and_Other_Nuts/DSC00505.jpg"),
    ],
    description:
      "Silky, buttery macadamia nut halves and wholes cultivated in subterranean Australian soil. Unmatched rich texture with ultra-healthy keto-friendly monounsaturated fats.",
    serving: "400g Glass Jar",
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
      cImg("07_Peanuts_and_Other_Nuts/DSC00430.jpg"),
      cImg("07_Peanuts_and_Other_Nuts/DSC00487.jpg"),
      cImg("07_Peanuts_and_Other_Nuts/DSC00505.jpg"),
    ],
    description:
      "A nutrient-dense blend of 7 super seeds lightly dry-roasted with Himalayan pink salt. Packed with plant protein, magnesium, zinc, and dietary fiber for effortless health.",
    serving: "500g Pack",
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
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg"),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00764.jpg"),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00766.jpg"),
    ],
    description:
      "An opulent handcrafted rigid gift box featuring four distinct compartments of our finest Jumbo Almonds, W240 Cashews, Walnut Halves, and Roasted Pistachios.",
    serving: "1kg Luxury Gift Box",
    benefits: ["Protective Packaging", "Custom Ribbon Included", "Curated Selection"],
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
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00764.jpg"),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00766.jpg"),
      cImg("08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg"),
    ],
    description:
      "The ultimate celebratory dry fruit collection. Includes Iranian Mamra Almonds, Royal Medjool King Dates, Dried Kandahar Figs, and Wild Berry Mix housed in an embossed presentation box.",
    serving: "1.2kg Gold Gift Box",
    benefits: ["Gold Embossed Finish", "Refined Presentation", "Curated Grade"],
    isNew: true,
  },
];

export const getProductsByCategory = (c: Category) =>
  products.filter((p) => p.category === c);

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const categories: { slug: Category; label: string; index: string; description: string }[] = [
  { slug: "gourmet", label: "Gourmet", index: "01", description: "Organic Figs, Medjool Dates, Kishmish, Berries & Superseeds" },
  { slug: "nuts", label: "Nuts & Dried Fruits", index: "02", description: "California Jumbo Almonds, W240 Cashews, Kashmiri Walnuts & Pistachios" },
  { slug: "gifting", label: "Gifting", index: "03", description: "Handcrafted Luxury Presentation Gift Boxes & Royal Hampers" },
];
