import { Router } from "express";
import { subscribeNewsletter, getNewsletterSubscribers, deleteSubscriber, getMySubscription, setMySubscription } from "../controllers/newsletterController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authLimiter, subscribeNewsletter);

// Self-serve preference for the signed-in customer — must be declared before
// the admin-only routes so "/me" is not read as a subscriber id.
router.get("/me", protect, getMySubscription);
router.put("/me", protect, setMySubscription);

router.get("/", protect, admin, getNewsletterSubscribers);
router.delete("/:id", protect, admin, deleteSubscriber);

export default router;

