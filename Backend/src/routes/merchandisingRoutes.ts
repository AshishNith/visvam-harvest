import { Router } from "express";
import { getMerchandising, updateMerchandisingSlot } from "../controllers/merchandisingController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getMerchandising);
router.put("/:key", authenticate, requireAdmin, updateMerchandisingSlot);

export default router;
