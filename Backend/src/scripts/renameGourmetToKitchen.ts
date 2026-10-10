import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

/**
 * Renames the "gourmet" category to "kitchen" in stored data.
 *
 * The storefront has called this category Kitchen for a while, but the slug
 * saved on products, on the category record and in the nav merchandising slot
 * was still "gourmet". The Product schema now only accepts "kitchen", so any
 * product left on the old slug would fail validation the next time an admin
 * saved it.
 *
 * Safe to run more than once — every step only touches rows still on the old
 * slug, and a second run reports zero changes.
 */
const renameGourmetToKitchen = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in Backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db!;
  console.log(`Connected to database: ${db.databaseName}`);

  const products = db.collection("products");
  const categories = db.collection("categories");
  const slots = db.collection("merchandisingslots");

  const productResult = await products.updateMany(
    { category: "gourmet" },
    { $set: { category: "kitchen" } }
  );
  console.log(`Products moved to "kitchen": ${productResult.modifiedCount}`);

  // `slug` and `key` are unique, so renaming onto a row that already exists
  // would throw. If the new one is already there, the old one is left alone
  // and reported instead of guessing which of the two should win.
  if (await categories.findOne({ slug: "kitchen" })) {
    const leftover = await categories.countDocuments({ slug: "gourmet" });
    console.log(`Category "kitchen" already exists. Old "gourmet" records left in place: ${leftover}`);
  } else {
    const categoryResult = await categories.updateOne({ slug: "gourmet" }, { $set: { slug: "kitchen" } });
    console.log(`Category records renamed: ${categoryResult.modifiedCount}`);
  }
  const labelResult = await categories.updateOne(
    { slug: "kitchen", label: "Gourmet Selection" },
    { $set: { label: "Kitchen Selection" } }
  );
  console.log(`Category labels updated: ${labelResult.modifiedCount}`);

  if (await slots.findOne({ key: "nav-kitchen" })) {
    const leftover = await slots.countDocuments({ key: "nav-gourmet" });
    console.log(`Slot "nav-kitchen" already exists. Old "nav-gourmet" slots left in place: ${leftover}`);
  } else {
    const slotResult = await slots.updateOne({ key: "nav-gourmet" }, { $set: { key: "nav-kitchen" } });
    console.log(`Merchandising slots renamed: ${slotResult.modifiedCount}`);
  }

  const remaining = await products.countDocuments({ category: "gourmet" });
  console.log(`Products still on "gourmet": ${remaining}`);

  await mongoose.disconnect();
};

renameGourmetToKitchen().catch(async (error) => {
  console.error("Rename failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
