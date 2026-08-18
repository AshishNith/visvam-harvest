import { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { ShiprocketService } from "../services/shiprocketService.js";

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

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.status === "Cancelled") {
      res.status(400).json({ success: false, message: "Cannot ship a cancelled order" });
      return;
    }

    // Call Shiprocket Service
    const shipResult = await ShiprocketService.createOrderAndAssignAWB(order);

    if (!shipResult.success) {
      res.status(500).json({
        success: false,
        message: "Failed to create shipment in Shiprocket",
      });
      return;
    }

    // Update MongoDB Order document
    order.status = "Shipped";
    order.shiprocket = {
      orderId: shipResult.orderId,
      shipmentId: shipResult.shipmentId,
      awbCode: shipResult.awbCode,
      courierName: shipResult.courierName,
      courierId: shipResult.courierId,
      labelUrl: shipResult.labelUrl,
      manifestUrl: shipResult.labelUrl,
      invoiceUrl: shipResult.invoiceUrl,
      trackingUrl: shipResult.trackingUrl,
      status: "MANIFESTED",
      lastTrackedAt: new Date(),
    };

    await order.save();

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
        res.status(200).json({
          success: true,
          status: order?.status || "Pending",
          message: "Shipment is being prepared for dispatch.",
          timeline: [
            {
              date: order ? new Date(order.createdAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN"),
              activity: "Order confirmed & packaging underway in cold-chain facility",
              location: "Viśvam Dispatch Center, Dehradun",
              completed: true,
            },
            {
              date: "Next Step",
              activity: "Courier partner pickup & AWB generation",
              location: "Dispatch Hub",
              completed: false,
            },
          ],
        });
        return;
      }
    }

    const trackingResult = await ShiprocketService.trackShipment(awbCode);
    res.status(200).json(trackingResult);
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
