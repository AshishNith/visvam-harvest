import { Router } from "express";
import {
  checkServiceability,
  createShipment,
  getShipmentTracking,
  getShippingLabel,
  handleShiprocketWebhook,
} from "../controllers/shippingController.js";

const router = Router();

// Public endpoints
router.post("/check-serviceability", checkServiceability);
router.get("/track/:awbOrOrderId", getShipmentTracking);
router.post("/webhook", handleShiprocketWebhook);

// Order shipping & label operations
router.post("/orders/:orderId/ship", createShipment);
router.get("/orders/:orderId/label", getShippingLabel);

export default router;
