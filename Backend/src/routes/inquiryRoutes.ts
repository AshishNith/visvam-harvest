import { Router } from "express";
import { submitInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from "../controllers/inquiryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", authLimiter, submitInquiry);
router.get("/", protect, admin, getInquiries);
router.put("/:id/status", protect, admin, updateInquiryStatus);
router.delete("/:id", protect, admin, deleteInquiry);

export default router;

