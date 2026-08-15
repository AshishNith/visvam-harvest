import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

dotenv.config();

const CUSTOMER_NAMES = [
  { name: "Ananya Sharma", email: "ananya.s@gmail.com" },
  { name: "Vikram Kapoor", email: "vikram.k@outlook.com" },
  { name: "Priya Menon", email: "priya.menon@hotmail.com" },
  { name: "Rohan Mehta", email: "rohan.m92@gmail.com" },
  { name: "Deepika Chawla", email: "deepika.c@yahoo.com" },
  { name: "Arjun Namboodiri", email: "arjun.n@gmail.com" },
  { name: "Smita Kulkarni", email: "smita.k@outlook.com" },
  { name: "Rajesh Patel", email: "rajesh.p@gmail.com" },
  { name: "Kavita Joshi", email: "kavita.j@hotmail.com" },
  { name: "Siddharth Varma", email: "siddharth.v@gmail.com" },
  { name: "Neha Bansal", email: "neha.b@yahoo.com" },
  { name: "Farhan Khan", email: "farhan.k@gmail.com" },
  { name: "Meera Iyer", email: "meera.i@outlook.com" },
  { name: "Tushar Gupta", email: "tushar.g@gmail.com" },
  { name: "Pooja Singhania", email: "pooja.s@hotmail.com" },
  { name: "Aditya Deshmukh", email: "aditya.d@gmail.com" },
  { name: "Tanvi Bhattacharya", email: "tanvi.b@outlook.com" },
  { name: "Gautam Bose", email: "gautam.b@gmail.com" },
  { name: "Radhika Sen", email: "radhika.s@yahoo.com" },
  { name: "Manish Pandey", email: "manish.p@gmail.com" },
];

const CITIES = [
  { city: "Mumbai", postalCode: "400001", state: "Maharashtra" },
  { city: "Delhi", postalCode: "110001", state: "Delhi" },
  { city: "Bengaluru", postalCode: "560001", state: "Karnataka" },
  { city: "Hyderabad", postalCode: "500001", state: "Telangana" },
  { city: "Chennai", postalCode: "600001", state: "Tamil Nadu" },
  { city: "Pune", postalCode: "411001", state: "Maharashtra" },
  { city: "Ahmedabad", postalCode: "380001", state: "Gujarat" },
  { city: "Kolkata", postalCode: "700001", state: "West Bengal" },
  { city: "Jaipur", postalCode: "302001", state: "Rajasthan" },
  { city: "Lucknow", postalCode: "226001", state: "Uttar Pradesh" },
];

const STATUSES: Array<"Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled"> = [
  "Pending", "Processing", "Shipped", "Completed", "Cancelled",
];

const PICKUP_LANES = ["riverside", "orchard-gate", "heritage-lounge"];
const PICKUP_SLOTS = ["ASAP", "10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM", "5:00 PM - 7:00 PM"];
const PAYMENT_METHODS = ["Card / Pickup", "UPI", "Cash on Delivery", "Net Banking"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedOrders() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visvam_harvest";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log("🛒 Seeding Historical Orders...");

    // Clear existing orders
    await Order.deleteMany({});

    const products = await Product.find({});
    if (products.length === 0) {
      console.error("❌ No products found. Run product seeding first.");
      return;
    }

    const ordersToCreate: any[] = [];
    const now = Date.now();
    const DAY = 86400000;

    // Generate 48 orders spread across 90 days
    // More orders in recent weeks (realistic growth pattern)
    const orderDistribution = [
      // Last 7 days: 12 orders (high recent activity)
      ...Array.from({ length: 12 }, () => randInt(0, 6)),
      // 8-21 days ago: 10 orders
      ...Array.from({ length: 10 }, () => randInt(7, 20)),
      // 22-30 days ago: 8 orders
      ...Array.from({ length: 8 }, () => randInt(21, 29)),
      // 31-60 days ago: 10 orders
      ...Array.from({ length: 10 }, () => randInt(30, 59)),
      // 61-90 days ago: 8 orders
      ...Array.from({ length: 8 }, () => randInt(60, 89)),
    ];

    for (let i = 0; i < orderDistribution.length; i++) {
      const daysAgo = orderDistribution[i];
      const customer = rand(CUSTOMER_NAMES);
      const location = rand(CITIES);

      // Select 1-4 random products for this order
      const numItems = randInt(1, 4);
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      const selectedProducts = shuffled.slice(0, numItems);

      const orderItems = selectedProducts.map((p) => {
        const qty = randInt(1, 3);
        return {
          product: p._id,
          slug: p.slug,
          name: p.name,
          qty,
          price: p.price,
          image: p.images?.[0] || "",
        };
      });

      const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      const taxRate = 0.05;
      const taxPrice = Math.round(itemsPrice * taxRate * 100) / 100;
      const shippingPrice = itemsPrice >= 1500 ? 0 : 99;
      const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

      // Status distribution: more recent = more pending/processing, older = more completed
      let status: typeof STATUSES[number];
      if (daysAgo <= 3) {
        status = rand(["Pending", "Pending", "Processing"] as any);
      } else if (daysAgo <= 14) {
        status = rand(["Processing", "Shipped", "Completed"] as any);
      } else if (daysAgo <= 30) {
        status = rand(["Completed", "Completed", "Shipped", "Completed"] as any);
      } else {
        // Older orders mostly completed, some cancelled
        status = rand(["Completed", "Completed", "Completed", "Cancelled"] as any);
      }

      const isPaid = status === "Completed" || status === "Shipped" || (status === "Processing" && Math.random() > 0.3);

      const orderDate = new Date(now - daysAgo * DAY - randInt(0, 12) * 3600000);

      ordersToCreate.push({
        guestEmail: customer.email,
        orderItems,
        pickupLane: rand(PICKUP_LANES),
        pickupSlot: rand(PICKUP_SLOTS),
        shippingAddress: {
          fullName: customer.name,
          address: `${randInt(1, 999)}, ${rand(["MG Road", "Park Street", "Brigade Road", "Linking Road", "Ring Road", "Main Bazaar", "Temple Road"])}`,
          city: location.city,
          postalCode: location.postalCode,
          country: "India",
        },
        paymentMethod: rand(PAYMENT_METHODS),
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt: isPaid ? orderDate : undefined,
        status,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    await Order.insertMany(ordersToCreate);

    // Summary stats
    const totalRev = ordersToCreate.reduce((s, o) => s + o.totalPrice, 0);
    const statusCounts: Record<string, number> = {};
    for (const o of ordersToCreate) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    console.log(`\n📦 Seeded ${ordersToCreate.length} orders (Total Revenue: ₹${totalRev.toLocaleString("en-IN", { minimumFractionDigits: 2 })})`);
    console.log(`   Status breakdown: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
  } catch (err: any) {
    console.error("❌ Error seeding orders:", err.message);
  }
}

// Allow standalone execution
if (process.argv[1]?.endsWith("seedOrders.ts") || process.argv[1]?.endsWith("seedOrders.js")) {
  seedOrders().then(() => mongoose.disconnect());
}
