import { Router } from "express";
import { loginUser, syncUser, getUserProfile, updateUserProfile, changePassword, completeProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Admin-only password login (kept for admin panel)
router.post("/login", authLimiter, loginUser);

// Firebase sync route (handles OTP, Google, Email Link auth)
router.post("/sync", authLimiter, authenticate, syncUser);

// Complete profile after first OTP/Google login
router.post("/complete-profile", authenticate, completeProfile);

// Protected profile routes
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.put("/change-password", authenticate, changePassword);

export default router;
