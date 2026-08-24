import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyFirebaseToken } from "../config/firebase.js";
import { User, IUser } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required and must not be empty.");
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  firebaseUser?: any;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = authReq.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authorization token missing" });
    return;
  }

  const token = authHeader.split(" ")[1];

  // Try JWT verification first (faster, no network call)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id);
    if (user) {
      authReq.user = user;
      return next();
    }
  } catch {
    // JWT failed — try Firebase token next
  }

  // Fallback: Try Firebase token verification
  try {
    const decodedToken = await verifyFirebaseToken(token);
    authReq.firebaseUser = decodedToken;

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

    authReq.user = user || undefined;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
      error: error.message,
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = authReq.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id);
    if (user) {
      authReq.user = user;
      return next();
    }
  } catch {}

  try {
    const decodedToken = await verifyFirebaseToken(token);
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (user) authReq.user = user;
  } catch {}

  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user && authReq.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied. Admin rights required." });
  }
};

// Aliases for route readability
export const protect = authenticate;
export const admin = requireAdmin;
