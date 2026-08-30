import { Router } from "express";
import multer from "multer";
import { uploadImage, uploadAvatar } from "../controllers/uploadController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

// Avatars are capped tighter than product imagery — they end up rendered at 256px.
const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/", protect, admin, upload.single("file"), uploadImage);
router.post("/avatar", protect, avatarUpload.single("file"), uploadAvatar);

export default router;
