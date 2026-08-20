import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firebaseUid?: string;
  email?: string;
  name: string;
  role: "user" | "admin";
  password?: string;
  phone?: string;
  avatar?: string;
  profileCompleted: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    password: {
      type: String,
      select: false, // Never returned in queries by default
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// High concurrency indexes
UserSchema.index({ email: 1, firebaseUid: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
