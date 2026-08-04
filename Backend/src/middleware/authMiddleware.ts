import { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "../config/firebase.js";
import { User, IUser } from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  firebaseUser?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authorization token missing" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await verifyFirebaseToken(token);
    req.firebaseUser = decodedToken;

    // Find or automatically create user record in MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user && decodedToken.email) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split("@")[0],
        role: decodedToken.admin ? "admin" : "user",
      });
    }

    req.user = user || undefined;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
      error: error.message,
    });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied. Admin rights required." });
  }
};
