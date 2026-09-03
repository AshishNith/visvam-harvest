import type { IOrder } from "../models/Order.js";
import { ShiprocketService } from "./shiprocketService.js";

/**
 * Pushes a freshly placed order into Shiprocket so it shows up in the
 * dashboard's "New" tab — created, but with no courier or AWB yet. The courier
 * is chosen later from the Admin Panel, which calls the ship endpoint and
 * resumes from AWB assignment on this same shipment.
 *
 * Best-effort by design: a Shiprocket outage must never block order placement
 * or payment confirmation, so every failure is logged and swallowed. Any order
 * still missing `shiprocket.shipmentId` is retried by the Admin Panel's "Ship"
 * button.
 */
export async function ensureShiprocketOrder(order: IOrder): Promise<void> {
  // Warehouse-pickup orders are collected in person and must never reach
  // Shiprocket. Guard here as the single choke point, so no current or future
  // caller can push one by mistake.
  if (order.fulfillmentMethod === "pickup") return;
  if (order.shiprocket?.shipmentId || order.shiprocket?.awbCode) return;
  if (!ShiprocketService.isConfigured()) return;

  try {
    const result = await ShiprocketService.createShipmentOnly(order);
    if (!result.success) {
      console.warn(
        `Shiprocket auto-push failed for order ${String(order._id)}: ${result.message}`
      );
      return;
    }

    order.shiprocket = {
      ...(order.shiprocket || {}),
      orderId: result.orderId,
      shipmentId: result.shipmentId,
      awbCode: result.awbCode,
      courierName: result.courierName,
      courierId: result.courierId,
      trackingUrl: result.trackingUrl,
      status: result.awbCode ? "MANIFESTED" : "NEW",
      lastTrackedAt: new Date(),
    };
    await order.save();
  } catch (err) {
    console.error(`Shiprocket auto-push error for order ${String(order._id)}:`, err);
  }
}
