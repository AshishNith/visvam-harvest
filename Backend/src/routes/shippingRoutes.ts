import { Router } from "express";
import {
  checkServiceability,
  createShipment,
  getShipmentTracking,
  getShippingLabel,
  handleShiprocketWebhook,
} from "../controllers/shippingController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public endpoints
router.post("/check-serviceability", checkServiceability);
router.get("/track/:awbOrOrderId", getShipmentTracking);
router.post("/webhook", handleShiprocketWebhook);

// Order shipping & label operations (Admin only)
router.post("/orders/:orderId/ship", authenticate, requireAdmin, createShipment);
router.get("/orders/:orderId/label", authenticate, requireAdmin, getShippingLabel);

export default router;
