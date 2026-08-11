import { Router } from "express";
import { subscribeNewsletter, getNewsletterSubscribers, deleteSubscriber } from "../controllers/newsletterController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authLimiter, subscribeNewsletter);
router.get("/", protect, admin, getNewsletterSubscribers);
router.delete("/:id", protect, admin, deleteSubscriber);

export default router;

