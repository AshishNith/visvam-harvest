import { Request, Response } from "express";
import mongoose from "mongoose";
import { MerchandisingSlot } from "../models/MerchandisingSlot.js";
import { Product } from "../models/Product.js";
import { clearProductCache } from "./productController.js";

// Per-slot cap on how many products an admin may pin, matching what each
// spot on the site actually renders. Add a new key here when a new
// curated spot is introduced on the frontend.
const SLOT_LIMITS: Record<string, number> = {
  "nav-nuts": 2,
  "nav-gourmet": 2,
  "nav-gifting": 2,
  "homepage-bestsellers": 3,
};

const DEFAULT_SLOT_LIMIT = 12;

// @desc    Get all merchandising slots with populated, ordered products
// @route   GET /api/v1/merchandising
// @access  Public
export const getMerchandising = async (req: Request, res: Response): Promise<void> => {
  try {
    const slots = await MerchandisingSlot.find().lean();

    const data: Record<string, any[]> = {};
    for (const slot of slots) {
      const products = await Product.find({ _id: { $in: slot.productIds } }).lean();
      const bySlugMap = new Map(products.map((p: any) => [String(p._id), p]));
      // Preserve the admin-picked order; silently drop ids for products
      // that have since been deleted.
      data[slot.key] = slot.productIds
        .map((id) => bySlugMap.get(String(id)))
        .filter(Boolean)
        .map((p: any) => ({
          ...p,
          isNew: p.isNew ?? p.isNewProduct ?? false,
        }));
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set the ordered product list for one merchandising slot
// @route   PUT /api/v1/merchandising/:key
// @access  Admin
export const updateMerchandisingSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = String(req.params.key);
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      res.status(400).json({ success: false, message: "productIds must be an array" });
      return;
    }

    const limit = SLOT_LIMITS[key] ?? DEFAULT_SLOT_LIMIT;
    if (productIds.length > limit) {
      res.status(400).json({
        success: false,
        message: `This slot allows at most ${limit} product(s)`,
      });
      return;
    }

    const invalidId = productIds.find((id) => !mongoose.isValidObjectId(id));
    if (invalidId) {
      res.status(400).json({ success: false, message: `Invalid product id: ${invalidId}` });
      return;
    }

    const slot = await MerchandisingSlot.findOneAndUpdate(
      { key },
      { key, productIds },
      { new: true, upsert: true, runValidators: true }
    );

    clearProductCache();
    res.status(200).json({ success: true, data: slot });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
