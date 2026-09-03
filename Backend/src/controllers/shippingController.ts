import { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { ShiprocketService } from "../services/shiprocketService.js";
import { orderWeightKg } from "../utils/shippingWeight.js";

// @desc    Check Pincode Serviceability & Delivery Timeframe
// @route   POST /api/v1/shipping/check-serviceability
// @access  Public
export const checkServiceability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode, weightKg = 0.5, isCod = false } = req.body;

    if (!pincode || String(pincode).trim().length < 6) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid 6-digit Indian delivery PIN code.",
      });
      return;
    }

    const result = await ShiprocketService.checkServiceability(
      String(pincode).trim(),
      Number(weightKg) || 0.5,
      Boolean(isCod)
    );

    // Rates go out exactly as Shiprocket quoted them — the customer is charged
    // the courier rate, nothing added. The COD surcharge is a separate line on
    // the order (see orderController), not a markup on delivery.
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Shipping serviceability controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check PIN code serviceability",
    });
  }
};

// @desc    Push Order to Shiprocket and generate AWB
// @route   POST /api/v1/shipping/orders/:orderId/ship
// @access  Admin / Protected
export const createShipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    // Optional: a specific Shiprocket courier_company_id chosen in the Admin
    // Panel. Omitted / falsy => let Shiprocket auto-pick.
    const rawCourierId = (req.body ?? {}).courierId;
    const courierId = Number(rawCourierId) > 0 ? Number(rawCourierId) : undefined;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.status === "Cancelled") {
      res.status(400).json({ success: false, message: "Cannot ship a cancelled order" });
      return;
    }

    if (order.shiprocket?.awbCode) {
      res.status(400).json({
        success: false,
        message: `This order already has AWB ${order.shiprocket.awbCode}.`,
      });
      return;
    }

    // The order may already exist in Shiprocket from an earlier attempt whose
    // AWB assignment failed (empty wallet, inactive pickup address). Retry just
    // the assignment rather than creating a duplicate order.
    if (order.shiprocket?.shipmentId) {
      const retry = await ShiprocketService.assignAwb(order.shiprocket.shipmentId, courierId);
      if (!retry.success) {
        res.status(502).json({
          success: false,
          message: `Order is already in Shiprocket (shipment #${order.shiprocket.shipmentId}) but no courier could be assigned: ${retry.message}`,
        });
        return;
      }

      order.status = "Shipped";
      order.shiprocket = {
        ...order.shiprocket,
        awbCode: retry.awbCode,
        courierName: retry.courierName,
        courierId: retry.courierId,
        trackingUrl: `https://shiprocket.co/tracking/${retry.awbCode}`,
        status: "MANIFESTED",
        lastTrackedAt: new Date(),
      };
      await order.save();

      res.status(200).json({
        success: true,
        message: `Shipment manifested with ${retry.courierName}! AWB: ${retry.awbCode}`,
        data: { orderId: order._id, status: order.status, shiprocket: order.shiprocket },
      });
      return;
    }

    const shipResult = await ShiprocketService.createOrderAndAssignAWB(order, courierId);

    if (!shipResult.success) {
      res.status(502).json({ success: false, message: shipResult.message });
      return;
    }

    // The Shiprocket order exists — record its ids even when no courier was
    // assigned, so a retry resumes from AWB assignment instead of duplicating.
    order.shiprocket = {
      ...(order.shiprocket || {}),
      orderId: shipResult.orderId,
      shipmentId: shipResult.shipmentId,
      awbCode: shipResult.awbCode,
      courierName: shipResult.courierName,
      courierId: shipResult.courierId,
      labelUrl: shipResult.labelUrl,
      trackingUrl: shipResult.trackingUrl,
      status: shipResult.awbCode ? "MANIFESTED" : "AWB_PENDING",
      lastTrackedAt: new Date(),
    };

    // Only a real waybill means the parcel is actually going somewhere.
    if (shipResult.awbCode) {
      order.status = "Shipped";
    }

    await order.save();

    if (!shipResult.awbCode) {
      res.status(502).json({
        success: false,
        message: `Order created in Shiprocket (shipment #${shipResult.shipmentId}) but no courier could be assigned: ${shipResult.awbError}`,
        data: { orderId: order._id, status: order.status, shiprocket: order.shiprocket },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Shipment manifested with ${shipResult.courierName}! AWB: ${shipResult.awbCode}`,
      data: {
        orderId: order._id,
        status: order.status,
        shiprocket: order.shiprocket,
      },
    });
  } catch (error: any) {
    console.error("Create shipment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create shipment",
    });
  }
};

// @desc    List couriers that can service a placed order's destination
// @route   GET /api/v1/shipping/orders/:orderId/couriers
// @access  Admin / Protected
export const getOrderCouriers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const pincode = String(order.shippingAddress?.postalCode || "").replace(/\D/g, "");
    if (pincode.length !== 6) {
      res.status(400).json({
        success: false,
        message: "This order has no valid 6-digit delivery PIN code.",
      });
      return;
    }

    const isCod = !order.isPaid && /cod|cash/i.test(order.paymentMethod || "");
    const weightKg = orderWeightKg(order.orderItems as any);
    const result = await ShiprocketService.checkServiceability(pincode, weightKg, isCod);

    // Echo back what the quote was actually based on. Without this an operator
    // seeing a ₹400 rate cannot tell whether it is heavy freight, a COD
    // collection fee on a big order, or a parcel weight that came out wrong.
    res.status(result.success ? 200 : 502).json(
      result.success ? { ...result, weightKg, isCod } : result
    );
  } catch (error: any) {
    console.error("Get order couriers error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load couriers for this order",
    });
  }
};

// @desc    Get Live Shipment Tracking
// @route   GET /api/v1/shipping/track/:awbOrOrderId
// @access  Public / Protected
export const getShipmentTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawParam = req.params.awbOrOrderId;
    const awbOrOrderId = Array.isArray(rawParam) ? rawParam[0] : String(rawParam || "");
    let awbCode = awbOrOrderId;

    // Check if input is a MongoDB Order ID
    if (awbOrOrderId && awbOrOrderId.match(/^[0-9a-fA-F]{24}$/)) {
      const order = await Order.findById(awbOrOrderId);
      if (order && order.shiprocket?.awbCode) {
        awbCode = order.shiprocket.awbCode;
      } else {
        // Not yet handed to a courier. This is the order's own status, not a
        // courier scan — no waybill exists to look up.
        res.status(200).json({
          success: true,
          status: order?.status || "Pending",
          message: "Shipment is being prepared for dispatch.",
          timeline: [
            {
              date: order ? new Date(order.createdAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN"),
              activity: "Order confirmed and being packed",
              location: "Viśvam Dispatch Centre",
              completed: true,
            },
            {
              date: "Next Step",
              activity: "Courier pickup & AWB generation",
              location: "Dispatch Hub",
              completed: false,
            },
          ],
        });
        return;
      }
    }

    const trackingResult = await ShiprocketService.trackShipment(awbCode);
    res.status(trackingResult.success ? 200 : 502).json(trackingResult);
  } catch (error: any) {
    console.error("Tracking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to track shipment",
    });
  }
};

// @desc    Get printable shipping label
// @route   GET /api/v1/shipping/orders/:orderId/label
// @access  Admin / Protected
export const getShippingLabel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order || !order.shiprocket?.shipmentId) {
      res.status(404).json({
        success: false,
        message: "No active shipment found for this order. Please ship the order first.",
      });
      return;
    }

    const labelUrl = await ShiprocketService.getShippingLabel(order.shiprocket.shipmentId);
    if (!labelUrl) {
      res.status(502).json({
        success: false,
        message: "Shiprocket could not generate a label for this shipment yet.",
      });
      return;
    }

    res.status(200).json({ success: true, labelUrl });
  } catch (error: any) {
    console.error("Get label error:", error);
    res.status(500).json({ success: false, message: "Failed to generate label URL" });
  }
};

// @desc    Shiprocket Webhook Listener
// @route   POST /api/v1/shipping/webhook
// @access  Public (Shiprocket Webhook Callback)
export const handleShiprocketWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { awb, current_status, order_id } = req.body;

    console.log("Shiprocket Webhook received:", { awb, current_status, order_id });

    if (awb) {
      const order = await Order.findOne({ "shiprocket.awbCode": awb });
      if (order) {
        const normalizedStatus = String(current_status).toUpperCase();

        if (normalizedStatus.includes("DELIVERED")) {
          order.status = "Completed";
          order.isPaid = true;
        } else if (normalizedStatus.includes("OUT FOR DELIVERY") || normalizedStatus.includes("IN TRANSIT") || normalizedStatus.includes("PICKED UP")) {
          order.status = "Shipped";
        } else if (normalizedStatus.includes("CANCEL")) {
          order.status = "Cancelled";
        }

        if (order.shiprocket) {
          order.shiprocket.status = normalizedStatus;
          order.shiprocket.lastTrackedAt = new Date();
        }

        await order.save();
      }
    }

    res.status(200).json({ success: true, message: "Webhook acknowledged" });
  } catch (error: any) {
    console.error("Shiprocket webhook processing error:", error);
    res.status(200).json({ success: false, message: "Webhook received with error" });
  }
};
