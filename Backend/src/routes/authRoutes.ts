import { Router } from "express";
import { registerUser, loginUser, syncUser, getUserProfile, updateUserProfile, changePassword } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public JWT auth routes
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// Firebase sync route
router.post("/sync", authLimiter, authenticate, syncUser);

// Protected profile routes
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.put("/change-password", authenticate, changePassword);

export default router;

