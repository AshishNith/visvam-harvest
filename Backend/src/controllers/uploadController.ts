import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

/**
 * Customer-facing profile picture upload.
 *
 * Deliberately separate from `uploadImage`: that one is admin-only because it
 * feeds the product catalogue. Avatars need to be writable by any signed-in
 * customer, land in their own Cloudinary folder, and get cropped down so a
 * 10MB phone photo does not become the header image.
 */
export const uploadAvatar = async (req: any, res: Response): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: "No image file provided" });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // No base64 fallback here — inlining an avatar into the user document
    // would bloat every profile read that returns it.
    if (!cloudName || !apiKey || !apiSecret) {
      res.status(503).json({
        success: false,
        message: "Image hosting is not configured. Please try again later.",
      });
      return;
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "visvam_avatars",
        resource_type: "image",
        transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
      },
      async (error, result) => {
        if (error || !result) {
          res.status(500).json({ success: false, message: error?.message || "Upload failed" });
          return;
        }

        try {
          user.avatar = result.secure_url;
          await user.save();
          res.status(200).json({
            success: true,
            message: "Profile picture updated",
            url: result.secure_url,
          });
        } catch (saveError: any) {
          res.status(500).json({ success: false, message: saveError.message });
        }
      }
    );

    uploadStream.end(file.buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to upload avatar" });
  }
};

export const uploadImage = async (req: any, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: "No image file provided" });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Fallback if Cloudinary environment variables aren't set yet
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      res.status(200).json({
        success: true,
        message: "Image processed successfully. Add CLOUDINARY credentials to .env for CDN hosting.",
        url: base64Image,
        public_id: `local-${Date.now()}`,
      });
      return;
    }

    // Ensure Cloudinary SDK is initialized with active env credentials
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Upload buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "visvam_harvest_products",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          res.status(500).json({
            success: false,
            message: error?.message || "Cloudinary upload failed",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Image uploaded successfully to Cloudinary CDN",
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image",
    });
  }
};
