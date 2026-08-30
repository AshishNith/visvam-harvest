import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

/**
 * Repairs the stale `email_1` index on the users collection.
 *
 * The User schema declares `sparse: true` on `email`, but the index that
 * actually exists in MongoDB was created before that flag was added. Mongoose
 * only creates missing indexes — it never alters an existing one — so the old
 * non-sparse unique index survived every deploy.
 *
 * A non-sparse unique index treats a missing/null `email` as the value `null`,
 * so the first phone-OTP signup stores fine and every one after it fails with
 * "E11000 duplicate key error ... index: email_1 dup key: { email: null }".
 */
const fixEmailIndex = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in Backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
  const col = mongoose.connection.db!.collection("users");
  console.log(`Connected to database: ${mongoose.connection.db!.databaseName}`);

  // Safety gate: recreating a unique index fails if two users share a real
  // email, so bail out before touching anything rather than half-applying.
  const duplicates = await col
    .aggregate([
      { $match: { email: { $type: "string" } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  if (duplicates.length > 0) {
    console.error("Aborted — these emails are used by more than one user:");
    console.error(JSON.stringify(duplicates, null, 2));
    console.error("Merge or clean up those accounts first, then re-run.");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log("Safety check passed — no duplicate real emails.");

  const before = await col.indexes();
  const existing = before.find((i) => i.name === "email_1");
  if (existing?.sparse) {
    console.log("email_1 is already sparse — nothing to do.");
    await mongoose.disconnect();
    return;
  }

  await col.dropIndex("email_1");
  console.log("Dropped stale email_1 index.");

  await col.createIndex({ email: 1 }, { unique: true, sparse: true, name: "email_1" });
  console.log("Recreated email_1 as unique + sparse.");

  console.log("\nFinal indexes on users:");
  for (const i of await col.indexes()) {
    console.log(`  ${i.name} — unique: ${Boolean(i.unique)}, sparse: ${Boolean(i.sparse)}`);
  }

  await mongoose.disconnect();
};

fixEmailIndex().catch((err) => {
  console.error("Index repair failed:", err.message);
  process.exit(1);
});
