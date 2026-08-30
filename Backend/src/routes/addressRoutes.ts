import { Router } from "express";
import {
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Every address belongs to the signed-in customer — none of these are public.
router.use(authenticate);

router.get("/", listAddresses);
router.post("/", addAddress);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);
router.patch("/:addressId/default", setDefaultAddress);

export default router;
