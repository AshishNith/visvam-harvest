import { Request, Response } from "express";
import { Newsletter } from "../models/Newsletter.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { sendSubscriptionConfirmationEmail } from "../services/emailService.js";
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
          message: "You are already subscribed to the Viśvam Royal Circle!",
        });
        return;
      }
      existing.status = "subscribed";
      existing.subscribedAt = new Date();
      await existing.save();
    } else {
      await Newsletter.create({ email, status: "subscribed" });
    }

    // Fire the confirmation email in the background — a delivery failure
    // (e.g. missing/invalid provider credentials) must not fail the signup.
    sendSubscriptionConfirmationEmail(email).catch((err) => {
      console.error("Subscription confirmation email failed:", err);
    });

    res.status(201).json({
      success: true,
      message: "Welcome to the Viśvam Royal Circle!",
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
// @desc    Read the signed-in customer's own newsletter status
// @route   GET /api/v1/newsletter/me
// @access  Private
export const getMySubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user?.email) {
      // Phone-only accounts have no inbox to send to, so there is nothing to toggle.
      res.status(200).json({ success: true, data: { subscribed: false, available: false } });
      return;
    }

    const record = await Newsletter.findOne({ email: user.email.toLowerCase() });
    res.status(200).json({
      success: true,
      data: { subscribed: record?.status === "subscribed", available: true },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Subscribe or unsubscribe the signed-in customer
// @route   PUT /api/v1/newsletter/me
// @access  Private
export const setMySubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user?.email) {
      res.status(400).json({ success: false, message: "Add an email to your profile first" });
      return;
    }

    const subscribed = Boolean(authReq.body.subscribed);
    const email = user.email.toLowerCase();

    // Upsert rather than create: unsubscribing and resubscribing should reuse
    // the same row instead of colliding with the unique email index.
    await Newsletter.findOneAndUpdate(
      { email },
      { email, status: subscribed ? "subscribed" : "unsubscribed" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: subscribed ? "Subscribed to the newsletter" : "Unsubscribed from the newsletter",
      data: { subscribed },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

