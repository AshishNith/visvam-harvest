import { Router } from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticate, optionalAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Public: get reviews for a product
router.get("/:productSlug", getProductReviews);

// Allow reviews for all users (optionalAuth attaches user if logged in)
router.post("/", optionalAuth, createReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
