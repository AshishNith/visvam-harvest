import mongoose, { Document, Schema } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

NewsletterSchema.index({ email: 1, status: 1 });

export const Newsletter = mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
