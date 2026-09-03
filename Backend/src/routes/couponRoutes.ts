import { Router } from "express";
import {
  validateCoupon,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { authenticate, requireAdmin, optionalAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Checkout preview — works with or without a signed-in customer
router.post("/validate", optionalAuth, validateCoupon);

// Admin management
router.get("/", authenticate, requireAdmin, listCoupons);
router.post("/", authenticate, requireAdmin, createCoupon);
router.put("/:id", authenticate, requireAdmin, updateCoupon);
router.delete("/:id", authenticate, requireAdmin, deleteCoupon);

export default router;
