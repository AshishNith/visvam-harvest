import { Router } from "express";
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin } from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all user management routes with JWT auth & Admin authorization
router.use(authenticate, requireAdmin);

router.route("/")
  .get(getAllUsers);

router.route("/:id")
  .put(updateUserByAdmin)
  .delete(deleteUserByAdmin);

export default router;
