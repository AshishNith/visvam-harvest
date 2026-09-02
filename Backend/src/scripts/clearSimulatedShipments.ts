import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

/**
 * Clears fabricated Shiprocket details off orders.
 *
 * Until the simulation fallbacks were removed, a rejected Shiprocket call was
 * caught and turned into a fake success: the order got a made-up waybill
 * (`BLUEDART` + 9 digits, or the `SR<shipmentId>` placeholder used when order
 * creation succeeded but AWB assignment did not) and was flipped to "Shipped".
 * No parcel exists for any of them, yet customers can see that fake tracking on
 * /track and in their order history.
 *
 * This strips the invented `shiprocket` block and walks the status back to
 * "Processing" so those orders can be shipped for real.
 *
 *   npm run clear-simulated-shipments            # dry run, changes nothing
 *   npm run clear-simulated-shipments -- --apply # writes
 */

// `BLUEDART123456789` was the simulated AWB; `SR12345678` the no-AWB placeholder.
const FAKE_AWB = /^(BLUEDART\d+|SR\d+)$/;

const clearSimulatedShipments = async () => {
  const apply = process.argv.includes("--apply");

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in Backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
  const col = mongoose.connection.db!.collection("orders");
  console.log(`Connected to database: ${mongoose.connection.db!.databaseName}`);
  console.log(apply ? "Mode: APPLY (writing changes)\n" : "Mode: DRY RUN (no changes)\n");

  const candidates = await col
    .find({ "shiprocket.awbCode": { $regex: FAKE_AWB } })
    .project({ _id: 1, status: 1, createdAt: 1, shiprocket: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  if (candidates.length === 0) {
    console.log("No orders carry a fabricated AWB — nothing to do.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${candidates.length} order(s) with a fabricated AWB:\n`);
  let willRevert = 0;
  for (const o of candidates) {
    const revert = o.status === "Shipped";
    if (revert) willRevert += 1;
    console.log(
      `  ${String(o._id)}  awb=${o.shiprocket?.awbCode}  status=${o.status}` +
        (revert ? " -> Processing" : " (status left as-is)")
    );
  }

  console.log(
    `\nWould clear ${candidates.length} shiprocket block(s); ${willRevert} status change(s) Shipped -> Processing.`
  );
  // A "Completed"/"Cancelled" order was moved there deliberately by an admin —
  // strip the invented waybill but don't second-guess the status they set.

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to commit.");
    await mongoose.disconnect();
    return;
  }

  const ids = candidates.map((o) => o._id);

  const cleared = await col.updateMany({ _id: { $in: ids } }, { $unset: { shiprocket: "" } });
  const reverted = await col.updateMany(
    { _id: { $in: ids }, status: "Shipped" },
    { $set: { status: "Processing" } }
  );

  console.log(`\nCleared shiprocket details on ${cleared.modifiedCount} order(s).`);
  console.log(`Reverted ${reverted.modifiedCount} order(s) from Shipped to Processing.`);

  const remaining = await col.countDocuments({ "shiprocket.awbCode": { $regex: FAKE_AWB } });
  console.log(`Remaining orders with a fabricated AWB: ${remaining}`);

  await mongoose.disconnect();
};

clearSimulatedShipments().catch((err) => {
  console.error("Cleanup failed:", err.message);
  process.exit(1);
});
