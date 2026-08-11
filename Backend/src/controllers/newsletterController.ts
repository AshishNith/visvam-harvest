import { Request, Response } from "express";
import { Newsletter } from "../models/Newsletter.js";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

// @desc    Subscribe to newsletter
// @route   POST /api/v1/newsletter
// @access  Public
export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = newsletterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
      });
      return;
    }

    const { email } = parseResult.data;

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.status === "subscribed") {
        res.status(200).json({
          success: true,
          message: "You are already subscribed to the Royal Harvest Circle!",
        });
        return;
      }
      existing.status = "subscribed";
      existing.subscribedAt = new Date();
      await existing.save();
    } else {
      await Newsletter.create({ email, status: "subscribed" });
    }

    res.status(201).json({
      success: true,
      message: "Welcome to the Royal Harvest Circle! 10% discount code has been reserved for your email.",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Newsletter subscription failed.",
    });
  }
};

// @desc    Get all newsletter subscribers (Admin)
// @route   GET /api/v1/newsletter
// @access  Admin
export const getNewsletterSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscribers = await Newsletter.find()
      .sort({ subscribedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch newsletter subscribers.",
    });
  }
};

// @desc    Delete subscriber (Admin)
// @route   DELETE /api/v1/newsletter/:id
// @access  Admin
export const deleteSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      res.status(404).json({ success: false, message: "Subscriber not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Subscriber removed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

