import { Router } from "express";
import {
  getProducts,
  getBestsellers,
  getProductBySlug,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/bestsellers", getBestsellers);
router.get("/categories/all", getCategories);
router.get("/:slug", getProductBySlug);

// Admin Routes
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;
