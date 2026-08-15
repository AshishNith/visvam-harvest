import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dns from "dns";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { User } from "../models/User.js";
import { seedReviews } from "./seedReviews.js";
import { seedOrders } from "./seedOrders.js";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

const CDN = "https://res.cloudinary.com/dvwpxb2oa/image/upload/f_auto,q_auto/visvam_harvest";

export const categoriesData = [
  { slug: "gourmet", label: "Gourmet Selection", index: "01", description: "Organic Figs, Medjool Dates, Kishmish, Berries & Superseeds" },
  { slug: "nuts", label: "Nuts & Kernels", index: "02", description: "California Jumbo Almonds, W240 Cashews, Kashmiri Walnuts & Pistachios" },
  { slug: "gifting", label: "Gifting & Hampers", index: "03", description: "Handcrafted Luxury Gift Boxes & Festive Collections" },
];

export const productsData = [
  {
    slug: "california-jumbo-almonds",
    name: "California Jumbo Almonds (Badam)",
    tagline: "Grade A1 · California Orchards · Cold-Stored",
    price: 1199,
    category: "nuts",
    badge: "Bestseller",
    images: [
      `${CDN}/01_Almonds_Badam/DSC00414.jpg`,
      `${CDN}/01_Almonds_Badam/DSC00445.jpg`,
      `${CDN}/01_Almonds_Badam/DSC00418.jpg`,
    ],
    description: "Hand-selected jumbo whole almonds harvested at peak oil maturity. Gently air-dried and nitrogen-sealed to retain natural crunch, vitamin E, and sweet buttery flavor.",
    serving: "500g Pouch",
    origin: "California, USA",
    grade: "Jumbo A1",
    benefits: ["Rich in Vitamin E", "Heart Healthy", "High Plant Protein"],
    bestseller: true,
    isNew: false,
    isNewProduct: false,
    stock: 150,
  },
  {
    slug: "king-w240-cashews",
    name: "King W240 Whole Cashews (Kaju)",
    tagline: "W240 King Size · Mangaluru Origin · Slow-Roasted",
    price: 1399,
    category: "nuts",
    badge: "Premium Grade",
    images: [
      `${CDN}/02_Cashews_Kaju/DSC00438.jpg`,
      `${CDN}/02_Cashews_Kaju/DSC00471.jpg`,
      `${CDN}/02_Cashews_Kaju/DSC00472.jpg`,
    ],
    description: "Extra-large W240 whole cashew kernels renowned for their rich creaminess and smooth bite. Naturally sun-dried and lightly batch-roasted without artificial oils.",
    serving: "500g Jar",
    origin: "Mangaluru, India",
    grade: "W240 Whole",
    benefits: ["Rich in Magnesium", "Zero Cholesterol", "Creamy Crunch"],
    bestseller: true,
    isNew: false,
    isNewProduct: false,
    stock: 120,
  },
  {
    slug: "kashmiri-snow-walnuts",
    name: "Kashmiri Extra-Light Walnuts (Akhrot)",
    tagline: "Extra-Light Halves · Single-Origin Kashmir · Brain Food",
    price: 1549,
    category: "nuts",
    badge: "New Harvest",
    images: [
      `${CDN}/04_Walnuts_Akhrot/DSC00512.jpg`,
      `${CDN}/04_Walnuts_Akhrot/DSC00564.jpg`,
      `${CDN}/04_Walnuts_Akhrot/DSC00591.jpg`,
    ],
    description: "Hand-extracted half kernels from wild Kashmiri walnut groves. Naturally sweet with zero bitterness, packed with heart-healthy Omega-3 ALA fatty acids.",
    serving: "500g Box",
    origin: "Anantnag, Kashmir",
    grade: "Snow Light Halves",
    benefits: ["High Omega-3 ALA", "Memory Support", "100% Organic"],
    bestseller: true,
    isNew: true,
    isNewProduct: true,
    stock: 90,
  },
  {
    slug: "roasted-salted-pistachios",
    name: "Roasted & Salted Pistachios (Pista)",
    tagline: "Jumbo Shells · Himalayan Pink Salt · Wood-Fired",
    price: 1299,
    category: "nuts",
    badge: "Crowd Favourite",
    images: [
      `${CDN}/03_Pistachios_Pista/DSC00612.jpg`,
      `${CDN}/03_Pistachios_Pista/DSC00613.jpg`,
      `${CDN}/03_Pistachios_Pista/DSC00614.jpg`,
    ],
    description: "Naturally opened jumbo pistachios slow-roasted over wood embers and lightly dusted with unrefined pink salt crystals. Easy to shell and intensely flavorful.",
    serving: "500g Pouch",
    origin: "Kerman Valley",
    grade: "Jumbo 20/22",
    benefits: ["High Fiber", "Potassium Rich", "Low Calorie Snack"],
    bestseller: true,
    isNew: false,
    isNewProduct: false,
    stock: 140,
  },
  {
    slug: "iranian-mamra-almonds",
    name: "Royal Iranian Mamra Almonds",
    tagline: "50%+ Natural Oil · Wild Mountain Harvest",
    price: 2349,
    category: "nuts",
    badge: "Superfood",
    images: [
      `${CDN}/01_Almonds_Badam/DSC00421.jpg`,
      `${CDN}/01_Almonds_Badam/DSC00423.jpg`,
      `${CDN}/01_Almonds_Badam/DSC00414.jpg`,
    ],
    description: "The undisputed king of almonds. Cultivated in mineral-rich mountain soil, Mamra almonds possess over 50% natural almond oil content for unmatched brain & wellness benefits.",
    serving: "500g Tin",
    origin: "Chaharmahal, Iran",
    grade: "Authentic Mamra",
    benefits: ["50%+ Natural Oil", "Brain Boost", "Rich Antioxidants"],
    bestseller: false,
    isNew: false,
    isNewProduct: false,
    stock: 80,
  },
  {
    slug: "afghani-organic-anjeer",
    name: "Afghani Organic Dried Figs (Anjeer)",
    tagline: "Sun-Dried Garlands · Soft Honey Core · Zero Sugar Added",
    price: 1599,
    category: "gourmet",
    badge: "High Fiber",
    images: [
      `${CDN}/05_Dates_Khajoor/DSC00565.jpg`,
      `${CDN}/05_Dates_Khajoor/DSC00566.jpg`,
      `${CDN}/05_Dates_Khajoor/DSC00567.jpg`,
    ],
    description: "Hand-strung dried figs harvested from Kandahar orchards. Naturally sun-dried until the natural fruit sugars caramelize into a soft, honey-like center rich in dietary fiber.",
    serving: "500g Pack",
    origin: "Kandahar, Afghanistan",
    grade: "Grade A Garland",
    benefits: ["Digestive Wellness", "Rich Calcium Source", "Natural Sweetener"],
    bestseller: false,
    isNew: false,
    isNewProduct: false,
    stock: 110,
  },
  {
    slug: "royal-medjool-dates",
    name: "Royal Medjool King Dates (Khajoor)",
    tagline: "Large Soft Medjool · Rich Caramel Bite · Mineral Rich",
    price: 1449,
    category: "gourmet",
    badge: "Organic",
    images: [
      `${CDN}/05_Dates_Khajoor/DSC00525.jpg`,
      `${CDN}/05_Dates_Khajoor/DSC00526.jpg`,
      `${CDN}/05_Dates_Khajoor/DSC00530.jpg`,
    ],
    description: "Known as the fruit of kings. Abundantly plump, soft, and moist Medjool dates with a rich caramel texture. Perfect as a natural pre-workout energy boost.",
    serving: "500g Box",
    origin: "Jericho Oasis",
    grade: "Super Jumbo",
    benefits: ["Instant Energy Boost", "High Iron", "Zero Additives"],
    bestseller: false,
    isNew: false,
    isNewProduct: false,
    stock: 130,
  },
  {
    slug: "afghan-green-raisins",
    name: "Long Green Seedless Kishmish",
    tagline: "Shade-Dried Long Berries · Sweet & Tangy · Iron Rich",
    price: 949,
    category: "gourmet",
    badge: "Juicy",
    images: [
      `${CDN}/06_Raisins_Kishmish/DSC00540.jpg`,
      `${CDN}/06_Raisins_Kishmish/DSC00545.jpg`,
      `${CDN}/06_Raisins_Kishmish/DSC00702.jpg`,
    ],
    description: "Slender long green raisins shade-dried in traditional earthen Kishmish Khana rooms to preserve their vivid green hue, tart acidity, and high antioxidant profile.",
    serving: "500g Pouch",
    origin: "Herat, Afghanistan",
    grade: "Long Green A+",
    benefits: ["High Iron", "Blood Health", "Natural Energy"],
    bestseller: false,
    isNew: false,
    isNewProduct: false,
    stock: 160,
  },
  {
    slug: "wild-dried-berries-mix",
    name: "Wild Cranberry & Blueberry Mix",
    tagline: "Whole Ruby Cranberries · Wild Blueberries · Low Sugar",
    price: 1329,
    category: "gourmet",
    badge: "Immunity",
    images: [
      `${CDN}/06_Raisins_Kishmish/DSC00545.jpg`,
      `${CDN}/06_Raisins_Kishmish/DSC00702.jpg`,
      `${CDN}/05_Dates_Khajoor/DSC00530.jpg`,
    ],
    description: "A vibrant berry blend of dark wild blueberries and succulent whole red cranberries. Lightly sweetened with natural apple juice concentrate for daily immunity support.",
    serving: "400g Jar",
    origin: "Pacific Northwest",
    grade: "Wild Harvest",
    benefits: ["Rich in Polyphenols", "Urinary Health", "Vibrant Taste"],
    bestseller: false,
    isNew: true,
    isNewProduct: true,
    stock: 95,
  },
  {
    slug: "queensland-macadamia-nuts",
    name: "Raw Queensland Macadamia Nuts",
    tagline: "Whole Creamy Style 1 · Cold-Shelled · Keto Friendly",
    price: 2049,
    category: "gourmet",
    badge: "Exotic",
    images: [
      `${CDN}/07_Peanuts_and_Other_Nuts/DSC00430.jpg`,
      `${CDN}/07_Peanuts_and_Other_Nuts/DSC00487.jpg`,
      `${CDN}/07_Peanuts_and_Other_Nuts/DSC00505.jpg`,
    ],
    description: "Silky, buttery macadamia nut halves and wholes harvested in subterranean Australian soil. Unmatched rich texture with ultra-healthy keto-friendly monounsaturated fats.",
    serving: "400g Glass Jar",
    origin: "Queensland, Australia",
    grade: "Style 1 Whole",
    benefits: ["Keto Approved", "Monounsaturated Fats", "Silky Texture"],
    bestseller: false,
    isNew: false,
    isNewProduct: false,
    stock: 75,
  },
  {
    slug: "7-in-1-superseeds-mix",
    name: "7-in-1 Roasted Superseeds Wellness Mix",
    tagline: "Pumpkin, Sunflower, Flax, Chia, Sesame, Watermelon & Hemp",
    price: 1049,
    category: "gourmet",
    badge: "Daily Wellness",
    images: [
      `${CDN}/07_Peanuts_and_Other_Nuts/DSC00430.jpg`,
      `${CDN}/07_Peanuts_and_Other_Nuts/DSC00487.jpg`,
      `${CDN}/07_Peanuts_and_Other_Nuts/DSC00505.jpg`,
    ],
    description: "A nutrient-dense blend of 7 super seeds lightly dry-roasted with Himalayan pink salt. Packed with plant protein, magnesium, zinc, and dietary fiber for effortless health.",
    serving: "500g Pouch",
    origin: "Craft Roasted",
    grade: "7-Seed Synergy",
    benefits: ["Plant Protein", "Zinc & Magnesium", "Zero Oil Roasted"],
    bestseller: true,
    isNew: false,
    isNewProduct: false,
    stock: 180,
  },
  {
    slug: "royal-heritage-gift-box",
    name: "Royal Heritage 4-in-1 Dry Fruit Gift Box",
    tagline: "Jumbo Almonds · W240 Cashews · Light Walnuts · Pista",
    price: 4099,
    category: "gifting",
    badge: "Festive Favorite",
    images: [
      `${CDN}/08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg`,
      `${CDN}/08_Assorted_Mix_and_Gift_Platters/DSC00764.jpg`,
      `${CDN}/08_Assorted_Mix_and_Gift_Platters/DSC00766.jpg`,
    ],
    description: "An opulent handcrafted rigid gift box featuring four individually vacuum-sealed compartments of our finest Jumbo Almonds, W240 Cashews, Walnut Halves, and Roasted Pistachios.",
    serving: "1kg Luxury Gift Box",
    origin: "Curated Collection",
    grade: "Heritage Gift Edition",
    benefits: ["Vacuum Sealed Freshness", "Custom Ribbon Included", "100% Organic Selection"],
    bestseller: true,
    isNew: false,
    isNewProduct: false,
    stock: 60,
  },
  {
    slug: "festive-nut-berry-celebration",
    name: "Festive Nut & Berry Celebration Collection",
    tagline: "Mamra Almonds · Medjool Dates · Wild Berries · Anjeer",
    price: 4699,
    category: "gifting",
    badge: "Luxury Edition",
    images: [
      `${CDN}/08_Assorted_Mix_and_Gift_Platters/DSC00764.jpg`,
      `${CDN}/08_Assorted_Mix_and_Gift_Platters/DSC00766.jpg`,
      `${CDN}/08_Assorted_Mix_and_Gift_Platters/DSC00762.jpg`,
    ],
    description: "The ultimate celebratory dry fruit collection. Includes Iranian Mamra Almonds, Royal Medjool King Dates, Dried Kandahar Figs, and Wild Berry Mix housed in an embossed metallic tin.",
    serving: "1.2kg Gold Tin",
    origin: "Grand Selection",
    grade: "Royal Edition",
    benefits: ["Gold Embossed Tin", "Air-tight Lock", "Guaranteed Premium Grade"],
    bestseller: false,
    isNew: true,
    isNewProduct: true,
    stock: 50,
  },
];

export async function seedDatabase(customUri?: string) {
  const mongoUri = customUri || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visvam";

  try {
    if (mongoose.connection.readyState === 0) {
      console.log(`[Seed] Connecting to MongoDB at: ${mongoUri}...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
      console.log("[Seed] Connected to MongoDB for seeding.");
    }

    // Seed Categories
    await Category.deleteMany({});
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Seeded ${insertedCategories.length} categories.`);

    // Seed Products
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`[Seed] Seeded ${insertedProducts.length} products successfully.`);

    // Seed Default Admin User
    const adminEmail = "admin@visvam.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await User.create({
        name: "Viśvam Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`[Seed] Created default admin account: ${adminEmail}`);
    }

    // Seed 10-11 Customer Reviews for each product
    await seedReviews();

    // Seed 48 historical orders across 90 days
    await seedOrders();

    return { success: true, count: insertedProducts.length };
  } catch (error) {
    console.error("[Seed] Error during database seeding:", error);
    throw error;
  }
}

// Auto-run when executed directly
seedDatabase()
  .then((res) => {
    console.log(`[Seed Complete] Successfully seeded database with ${res.count} products!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[Seed Failed]:", err);
    process.exit(1);
  });
