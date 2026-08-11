import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  trackOrderById,
} from "../controllers/orderController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", createOrder);
router.get("/track/:orderId", trackOrderById);
router.get("/my-orders", authenticate, getMyOrders);
router.get("/:id", authenticate, getOrderById);

// Admin Routes
router.get("/", authenticate, requireAdmin, getAllOrders);
router.put("/:id/status", authenticate, requireAdmin, updateOrderStatus);

export default router;

