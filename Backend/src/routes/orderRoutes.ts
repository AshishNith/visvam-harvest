import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  trackOrderById,
} from "../controllers/orderController.js";
import { authenticate, optionalAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// `optionalAuth` so a signed-in customer's token (the storefront always sends
// one — checkout requires a login) populates `req.user`. Without it the handler
// had no verified identity for the customer and fell back entirely to
// client-supplied email fields, which is why the once-per-customer coupon rule
// couldn't be enforced. Still optional, so it never hard-blocks order creation.
router.post("/", optionalAuth, createOrder);
router.get("/track/:orderId", trackOrderById);
router.get("/my-orders", authenticate, getMyOrders);
router.get("/:id", authenticate, getOrderById);

// Admin Routes
router.get("/", authenticate, requireAdmin, getAllOrders);
router.put("/:id/status", authenticate, requireAdmin, updateOrderStatus);

export default router;

