import { Request, Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// Helper: recalculate product rating and numReviews
async function recalculateProductRating(productId: any) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
  }
}

// @desc    Create a product review
// @route   POST /api/v1/reviews
// @access  Public / Optional Auth
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { productSlug, rating, title, comment, reviewerName } = req.body;

    if (!productSlug || !rating || !title || !comment) {
      res.status(400).json({ success: false, message: "Please provide rating, title, and comment" });
      return;
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      return;
    }

    // Find or auto-create product by slug if not already in DB
    let product = await Product.findOne({ slug: productSlug });
    if (!product) {
      const formattedName = productSlug
        .split("-")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      product = await Product.create({
        slug: productSlug,
        name: formattedName,
        tagline: "Cold-Stored · Single Origin",
        price: 1199,
        category: "nuts",
        images: [],
        description: "Viśvam Organic Dry Fruit Selection",
        serving: "500g",
      });
    }

    // Determine user ID and user Name
    const userId = authReq.user?._id || new mongoose.Types.ObjectId();
    const userName = authReq.user?.name || (reviewerName && reviewerName.trim() ? reviewerName.trim() : "Verified Customer");

    // If authenticated user, prevent duplicate review
    if (authReq.user) {
      const existingReview = await Review.findOne({
        user: authReq.user._id,
        product: product._id,
      });

      if (existingReview) {
        res.status(400).json({ success: false, message: "You have already reviewed this product" });
        return;
      }
    }

    const review = await Review.create({
      user: userId,
      product: product._id,
      productSlug,
      userName,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
    });

    await recalculateProductRating(product._id);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: review,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "You have already reviewed this product" });
      return;
    }
    res.status(500).json({ success: false, message: error.message || "Failed to submit review" });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/v1/reviews/:productSlug
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productSlug } = req.params;

    const reviews = await Review.find({ productSlug })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating,
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Protected (own review or admin)
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found" });
      return;
    }

    // Check ownership or admin
    if (
      review.user.toString() !== authReq.user._id.toString() &&
      authReq.user.role !== "admin"
    ) {
      res.status(403).json({ success: false, message: "Not authorized to delete this review" });
      return;
    }

    const productId = review.product;
    await Review.findByIdAndDelete(review._id);
    await recalculateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
