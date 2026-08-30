import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import { Category } from "../models/Category.js";
import { Inquiry } from "../models/Inquiry.js";
import { MerchandisingSlot } from "../models/MerchandisingSlot.js";
import { Newsletter } from "../models/Newsletter.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

/**
 * Copies Viśvam's data from the old cluster into a dedicated database on the
 * new one.
 *
 * The old connection string has no database path, so Mongoose fell back to a
 * database literally named `test` — which turned out to be shared with an
 * unrelated app (`lehdatas`, `userlogins`). Only the eight collections backed
 * by our own models are copied; the foreign ones stay where they are.
 *
 * Indexes are deliberately NOT copied. They are rebuilt from the Mongoose
 * schemas via syncIndexes(), so the new cluster gets index definitions that
 * match the code exactly — including the `email` index that was stuck
 * non-sparse on the old cluster and broke every phone-OTP signup after the
 * first.
 *
 * Documents keep their original _id values, so cross-collection references
 * (orders → users, reviews → products) survive the move.
 *
 * Usage:  npm run migrate-cluster            (aborts if target has data)
 *         npm run migrate-cluster -- --force (wipes target collections first)
 */

const MODELS = [
  { model: Category, collection: "categories" },
  { model: Product, collection: "products" },
  { model: User, collection: "users" },
  { model: Order, collection: "orders" },
  { model: Review, collection: "reviews" },
  { model: Newsletter, collection: "newsletters" },
  { model: Inquiry, collection: "inquiries" },
  { model: MerchandisingSlot, collection: "merchandisingslots" },
];

const migrate = async () => {
  const sourceUri = process.env.MONGO_URI;
  const targetUri = process.env.TARGET_MONGO_URI;
  const targetDbName = process.env.TARGET_DB_NAME || "visvam";
  const force = process.argv.includes("--force");

  if (!sourceUri || !targetUri) {
    console.error("Set both MONGO_URI and TARGET_MONGO_URI in Backend/.env");
    process.exit(1);
  }

  const { MongoClient } = mongoose.mongo;

  const source = new MongoClient(sourceUri, { serverSelectionTimeoutMS: 20000 });
  const target = new MongoClient(targetUri, { serverSelectionTimeoutMS: 20000 });
  await source.connect();
  await target.connect();

  const sourceDb = source.db();
  const targetDb = target.db(targetDbName);
  console.log(`Source: ${sourceDb.databaseName}  →  Target: ${targetDbName}\n`);

  // Refuse to run onto a database that already holds data, so a re-run can
  // never silently double-insert or clobber something that was already live.
  if (!force) {
    const occupied: string[] = [];
    for (const { collection } of MODELS) {
      const count = await targetDb.collection(collection).countDocuments();
      if (count > 0) occupied.push(`${collection} (${count} docs)`);
    }
    if (occupied.length > 0) {
      console.error("Aborted — target already contains data:");
      occupied.forEach((c) => console.error(`  ${c}`));
      console.error("\nRe-run with --force to replace those collections.");
      await source.close();
      await target.close();
      process.exit(1);
    }
  }

  const copied: Record<string, number> = {};

  for (const { collection } of MODELS) {
    const docs = await sourceDb.collection(collection).find({}).toArray();

    if (force) {
      await targetDb.collection(collection).deleteMany({});
    }

    if (docs.length > 0) {
      await targetDb.collection(collection).insertMany(docs, { ordered: false });
    }

    copied[collection] = docs.length;
    console.log(`  copied ${String(docs.length).padStart(4)} docs → ${collection}`);
  }

  await source.close();
  await target.close();

  // Rebuild indexes from the schemas rather than from the old cluster.
  console.log("\nBuilding indexes from Mongoose schemas...");
  await mongoose.connect(targetUri, { dbName: targetDbName, serverSelectionTimeoutMS: 20000 });

  for (const { model, collection } of MODELS) {
    await model.syncIndexes();
    const names = (await mongoose.connection.db!.collection(collection).indexes())
      .map((i) => i.name)
      .filter((n) => n !== "_id_");
    console.log(`  ${collection.padEnd(20)} ${names.join(", ") || "none"}`);
  }

  // The bug that started all this: confirm the new email index excludes
  // users who signed up by phone and therefore have no email at all.
  const emailIndex = (await mongoose.connection.db!.collection("users").indexes()).find(
    (i) => i.name === "email_1"
  );
  console.log(
    `\nusers.email_1 → unique: ${Boolean(emailIndex?.unique)}, sparse: ${Boolean(emailIndex?.sparse)}`
  );

  console.log("\nVerifying document counts against source:");
  let mismatch = false;
  for (const { collection } of MODELS) {
    const count = await mongoose.connection.db!.collection(collection).countDocuments();
    const ok = count === copied[collection];
    if (!ok) mismatch = true;
    console.log(`  ${ok ? "OK  " : "FAIL"} ${collection.padEnd(20)} ${count}/${copied[collection]}`);
  }

  await mongoose.disconnect();

  if (mismatch) {
    console.error("\nMigration finished with count mismatches — do not switch MONGO_URI yet.");
    process.exit(1);
  }
  console.log("\nMigration complete. Update MONGO_URI (backend .env and the VPS) to point at the new cluster.");
};

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
