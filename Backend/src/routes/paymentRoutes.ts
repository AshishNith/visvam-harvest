import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  reconcileRazorpayPayment,
} from "../controllers/paymentController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/razorpay/webhook", razorpayWebhook);
router.post("/razorpay/reconcile/:orderId", authenticate, requireAdmin, reconcileRazorpayPayment);

export default router;
