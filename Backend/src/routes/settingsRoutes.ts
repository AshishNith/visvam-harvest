import { Router } from "express";
import { getSettings, updateSetting } from "../controllers/settingsController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getSettings);
router.put("/:key", authenticate, requireAdmin, updateSetting);

export default router;
