import { Request, Response } from "express";
import { Inquiry } from "../models/Inquiry.js";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
});

// @desc    Submit a contact inquiry
// @route   POST /api/v1/contact
// @access  Public
export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = inquirySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, message } = parseResult.data;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString();

    const inquiry = await Inquiry.create({
      name,
      email,
      message,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out to Viśvam Harvest. Our concierge will contact you shortly.",
      data: {
        id: inquiry._id,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit inquiry. Please try again.",
    });
  }
};

// @desc    Get all contact inquiries (Admin)
// @route   GET /api/v1/contact
// @access  Admin
export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Inquiry.countDocuments();

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: inquiries,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inquiry status (Admin)
// @route   PUT /api/v1/contact/:id/status
// @access  Admin
export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value" });
      return;
    }

    const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!inquiry) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      data: inquiry,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contact inquiry (Admin)
// @route   DELETE /api/v1/contact/:id
// @access  Admin
export const deleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findByIdAndDelete(id);

    if (!inquiry) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Inquiry removed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

