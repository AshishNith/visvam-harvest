import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required and must not be empty.");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

// @desc    Login user with email+password (Admin-only fallback)
// @route   POST /api/v1/auth/login
// @access  Public (kept for admin panel login)
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Please provide email and password" });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail }).select("+password");

    // Auto-create default admin account if admin@visvam.com logs in for the first time
    if (!user && cleanEmail === "admin@visvam.com" && password === "admin123") {
      console.log("[Auth] Auto-creating default admin account for admin@visvam.com...");
      const hashedPassword = await bcrypt.hash("admin123", 12);
      const newAdmin = await User.create({
        name: "Viśvam Admin",
        email: "admin@visvam.com",
        password: hashedPassword,
        role: "admin",
        profileCompleted: true,
      });
      user = (await User.findById(newAdmin._id).select("+password")) as any;
    }

    if (!user || !user.password) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const token = generateToken(String(user._id), user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileCompleted: user.profileCompleted,
      },
      token,
    });
  } catch (error: any) {
    console.error("[Login Error]:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// @desc    Sync user after Firebase login/signup (OTP, Google, Email Link)
// @route   POST /api/v1/auth/sync
// @access  Protected
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { name, phone, address, avatar } = authReq.body;
    const firebaseUid = authReq.firebaseUser?.uid || authReq.user?.firebaseUid;
    const email = authReq.firebaseUser?.email || authReq.user?.email;
    const firebasePhone = authReq.firebaseUser?.phone_number || phone;
    const firebaseName = authReq.firebaseUser?.name || authReq.user?.name;
    const firebaseAvatar = authReq.firebaseUser?.picture || authReq.firebaseUser?.photoURL || avatar;

    console.log("🔐 [Auth Sync Request]:", {
      firebaseUid,
      email,
      phone: firebasePhone,
      name: name || firebaseName,
    });

    if (!firebaseUid && !email && !firebasePhone) {
      console.warn("⚠️ [Auth Sync Warning]: User identity missing from token");
      res.status(400).json({ success: false, message: "User identity missing from token" });
      return;
    }

    // Build lookup query — find user by firebaseUid, email, or phone
    const orConditions: any[] = [];
    if (firebaseUid) orConditions.push({ firebaseUid });
    if (email) orConditions.push({ email });
    if (firebasePhone) orConditions.push({ phone: firebasePhone });

    let user = orConditions.length > 0
      ? await User.findOne({ $or: orConditions })
      : null;

    if (user) {
      // Update existing user with any new data
      if (!user.firebaseUid && firebaseUid) user.firebaseUid = firebaseUid;
      if (!user.email && email) user.email = email;
      if (!user.phone && firebasePhone) user.phone = firebasePhone;
      if (name) user.name = name;
      if (address) user.address = address;
      if (firebaseAvatar) user.avatar = firebaseAvatar;
      await user.save();
      console.log(`✅ [Auth Sync]: Updated existing user ${user.name} (${user._id})`);
    } else {
      // Create new user — use whatever identity we have
      const displayName = name || firebaseName || (email ? email.split("@")[0] : firebasePhone || "Viśvam Customer");
      user = await User.create({
        firebaseUid,
        email: email || undefined,
        phone: firebasePhone || undefined,
        name: displayName,
        avatar: firebaseAvatar || "",
        address,
        role: "user",
        profileCompleted: false,
      });
      console.log(`🎉 [Auth Sync]: Created new user ${user.name} (${user._id})`);
    }

    const token = generateToken(String(user._id), user.role);

    res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}!`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        profileCompleted: user.profileCompleted,
      },
      token,
    });
  } catch (error: any) {
    console.error("❌ [Auth Sync Error]:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to sync account" });
  }
};

// @desc    Complete user profile (post-login details collection)
// @route   POST /api/v1/auth/complete-profile
// @access  Protected
export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const { name, phone, address } = authReq.body;

    if (name) authReq.user.name = name;
    if (phone) authReq.user.phone = phone;
    if (address) authReq.user.address = { ...authReq.user.address, ...address };
    authReq.user.profileCompleted = true;

    const updatedUser = await authReq.user.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully!",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        address: updatedUser.address,
        profileCompleted: updatedUser.profileCompleted,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to complete profile" });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Protected
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(404).json({ success: false, message: "User profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: authReq.user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Protected
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(404).json({ success: false, message: "User profile not found" });
      return;
    }

    const { name, phone, address } = authReq.body;
    if (name) authReq.user.name = name;
    if (phone) authReq.user.phone = phone;
    if (address) authReq.user.address = { ...authReq.user.address, ...address };

    const updatedUser = await authReq.user.save();
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user password (kept for admin accounts)
// @route   PUT /api/v1/auth/change-password
// @access  Protected
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const { currentPassword, newPassword } = authReq.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Please provide current and new password" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      return;
    }

    // Fetch user with password field
    const user = await User.findById(authReq.user._id).select("+password");
    if (!user || !user.password) {
      res.status(400).json({ success: false, message: "Password change not available for this account" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Current password is incorrect" });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users (Admin)
// @route   GET /api/v1/users
// @access  Admin
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or profile (Admin)
// @route   PUT /api/v1/users/:id
// @access  Admin
export const updateUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, name, phone } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (role && ["user", "admin"].includes(role)) user.role = role;
    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/v1/users/:id
// @access  Admin
export const deleteUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
