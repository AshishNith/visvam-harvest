import { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

// In-Memory Cache Store for 5,000 Concurrent Active Users Performance
interface CacheItem {
  timestamp: number;
  data: any;
}
const productCache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

const getCached = (key: string) => {
  const item = productCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    productCache.delete(key);
    return null;
  }
  return item.data;
};

const setCache = (key: string, data: any) => {
  productCache.set(key, { timestamp: Date.now(), data });
};

export const clearProductCache = () => {
  productCache.clear();
};

// @desc    Get all products with filtering, search, pagination
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, bestseller, isNew, page = 1, limit = 20, sort } = req.query;

    const cacheKey = `products_${category}_${search}_${bestseller}_${isNew}_${page}_${limit}_${sort}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      res.status(200).json(cachedData);
      return;
    }

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (bestseller === "true") {
      query.bestseller = true;
    }

    if (isNew === "true" || req.query.isNewProduct === "true") {
      query.isNewProduct = true;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === "price-low") sortOptions = { price: 1 };
    if (sort === "price-high") sortOptions = { price: -1 };
    if (sort === "bestseller") sortOptions = { bestseller: -1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const rawProducts = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const products = rawProducts.map((p: any) => ({
      ...p,
      isNew: p.isNew ?? p.isNewProduct ?? false,
    }));

    const total = await Product.countDocuments(query);

    const responsePayload = {
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    };

    setCache(cacheKey, responsePayload);
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bestseller products
// @route   GET /api/v1/products/bestsellers
// @access  Public
export const getBestsellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "products_bestsellers";
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      res.status(200).json(cachedData);
      return;
    }

    const rawProducts = await Product.find({ bestseller: true }).limit(8).lean();
    const products = rawProducts.map((p: any) => ({
      ...p,
      isNew: p.isNew ?? p.isNewProduct ?? false,
    }));
    const responsePayload = {
      success: true,
      data: products,
    };

    setCache(cacheKey, responsePayload);
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/v1/products/:slug
// @access  Public
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const cacheKey = `product_slug_${slug}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      res.status(200).json(cachedData);
      return;
    }

    const rawProduct = await Product.findOne({ slug })
      .populate("relatedProducts", "slug name tagline price category badge images serving stock hasVariants variantAttributes variants isNewProduct bestseller rating numReviews")
      .lean();

    if (!rawProduct) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const product = {
      ...rawProduct,
      isNew: (rawProduct as any).isNew ?? (rawProduct as any).isNewProduct ?? false,
      // A related product can be deleted after being picked; drop dangling refs.
      relatedProducts: ((rawProduct as any).relatedProducts || []).filter(Boolean),
    };

    const responsePayload = {
      success: true,
      data: product,
    };

    setCache(cacheKey, responsePayload);
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all product categories
// @route   GET /api/v1/products/categories/all
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "categories_all";
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      res.status(200).json(cachedData);
      return;
    }

    const categories = await Category.find().lean();
    const responsePayload = {
      success: true,
      data: categories,
    };

    setCache(cacheKey, responsePayload);
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/v1/products
// @access  Admin
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    clearProductCache();
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/v1/products/:id
// @access  Admin
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    clearProductCache();
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/v1/products/:id
// @access  Admin
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    clearProductCache();
    res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
