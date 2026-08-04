import { Response } from "express";
import { User } from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// @desc    Sync user after Firebase login/signup
// @route   POST /api/v1/auth/sync
// @access  Protected
export const syncUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, address } = req.body;
    const firebaseUid = req.firebaseUser.uid;
    const email = req.firebaseUser.email;

    let user = await User.findOne({ firebaseUid });

    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      await user.save();
    } else {
      user = await User.create({
        firebaseUid,
        email,
        name: name || email?.split("@")[0] || "Viśvam Customer",
        phone,
        address,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Protected
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: "User profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Protected
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: "User profile not found" });
      return;
    }

    const { name, phone, address } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (address) req.user.address = { ...req.user.address, ...address };

    const updatedUser = await req.user.save();
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
