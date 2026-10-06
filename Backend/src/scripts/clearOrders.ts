import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";
import path from "path";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

/**
 * Deletes every document in the `orders` collection.
 *
 * There is no admin "delete order" endpoint (see orderRoutes.ts — admins can
 * only list and change status), so wiping the order history has to happen
 * against the database directly.
 *
 * Every run dumps the orders to `Backend/backups/` before deleting, because the
 * delete itself is unrecoverable — that dump is the only way back. It contains
 * customer names, addresses, phone numbers and emails, so `backups/` is
 * gitignored; treat the file as customer PII and delete it once you're sure.
 *
 * Coupon redemption counters live on the coupon documents (`timesRedeemed`,
 * `redemptions[]`, `redeemedBy[]`, `redeemedEmails[]`), not on orders, so they
 * survive this and would keep blocking customers who hit a once-per-customer
 * limit on orders that no longer exist. `--reset-coupons` clears them too.
 *
 * `--env=NAME` picks which variable in Backend/.env holds the connection
 * string, so the URI never has to be typed on a command line. It matters here:
 * `MONGO_URI` points at the dedicated VisvamCluster01, but the VPS running
 * production is still on the old shared cluster in `OLD_MONGO_URI`, whose
 * default database is `test`. Clearing the wrong one looks like a clean success
 * and leaves every real order in place.
 *
 *   npm run clear-orders                              # dry run, MONGO_URI
 *   npm run clear-orders -- --env=OLD_MONGO_URI       # dry run, production
 *   npm run clear-orders -- --env=OLD_MONGO_URI --apply
 *   npm run clear-orders -- --env=OLD_MONGO_URI --apply --reset-coupons
 */

/** Hides the password so a connection string can be printed or pasted safely. */
const maskUri = (uri: string) => uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, "$1<hidden>@");

const clearOrders = async () => {
  const apply = process.argv.includes("--apply");
  const resetCoupons = process.argv.includes("--reset-coupons");
  const skipBackup = process.argv.includes("--no-backup");

  const envArg = process.argv.find((a) => a.startsWith("--env="));
  const envName = envArg ? envArg.slice("--env=".length) : "MONGO_URI";

  const mongoUri = process.env[envName];
  if (!mongoUri) {
    console.error(`${envName} is not set in Backend/.env`);
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db!;
  const col = db.collection("orders");

  // Print the target loudly — this repo has two clusters in play (the old
  // shared `cluster0` and the dedicated `visvamcluster01`), and the wrong one
  // deletes the wrong company's data.
  console.log(`Source:   Backend/.env -> ${envName}`);
  console.log(`URI:      ${maskUri(mongoUri)}`);
  console.log(`Host:     ${mongoose.connection.host}`);
  console.log(`Database: ${db.databaseName}`);
  console.log(apply ? "Mode:     APPLY (deleting)\n" : "Mode:     DRY RUN (no changes)\n");

  const names = (await db.listCollections().toArray()).map((c) => c.name).sort();
  console.log(`Collections in "${db.databaseName}" (${names.length}): ${names.join(", ")}`);
  console.log("");
  console.log("Only the `orders` collection is touched; everything else is left alone.");
  console.log("");

  const total = await col.countDocuments();
  if (total === 0) {
    console.log("The orders collection is already empty — nothing to do.");
    await mongoose.disconnect();
    return;
  }

  const byStatus = await col
    .aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { n: -1 } }])
    .toArray();
  const paid = await col.countDocuments({ isPaid: true });
  const shipped = await col.countDocuments({ "shiprocket.awbCode": { $exists: true, $ne: null } });

  console.log(`Found ${total} order(s):`);
  for (const s of byStatus) console.log(`  ${s._id ?? "(no status)"}: ${s.n}`);
  console.log(`  paid: ${paid}    with a real Shiprocket AWB: ${shipped}`);

  if (shipped > 0) {
    console.log(
      `\n  WARNING: ${shipped} order(s) carry a Shiprocket waybill — parcels that may be in transit.\n` +
        `  Deleting them here does not cancel anything at Shiprocket, and /track will stop working for those customers.`
    );
  }

  if (!apply) {
    console.log("\nDry run — nothing deleted. Re-run with --apply to commit.");
    await mongoose.disconnect();
    return;
  }

  if (!skipBackup) {
    const dir = path.resolve(process.cwd(), "backups");
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(dir, `orders-${db.databaseName}-${stamp}.json`);
    const docs = await col.find({}).toArray();
    fs.writeFileSync(file, JSON.stringify(docs, null, 2));
    console.log(`\nBacked up ${docs.length} order(s) to ${file}`);
  } else {
    console.log("\nSkipping backup (--no-backup) — this delete is unrecoverable.");
  }

  const res = await col.deleteMany({});
  console.log(`Deleted ${res.deletedCount} order(s).`);

  if (resetCoupons) {
    const coupons = db.collection("coupons");
    const reset = await coupons.updateMany(
      {},
      { $set: { timesRedeemed: 0, redemptions: [], redeemedBy: [], redeemedEmails: [] } }
    );
    console.log(`Reset redemption counters on ${reset.modifiedCount} coupon(s).`);
  } else {
    const stale = await db.collection("coupons").countDocuments({ timesRedeemed: { $gt: 0 } });
    if (stale > 0)
      console.log(
        `Note: ${stale} coupon(s) still carry redemption counts from the deleted orders.\n` +
          `      Re-run with --reset-coupons to clear them.`
      );
  }

  console.log(`\nOrders remaining: ${await col.countDocuments()}`);
  await mongoose.disconnect();
};

clearOrders().catch((err) => {
  console.error("Clear failed:", err.message);
  process.exit(1);
});
