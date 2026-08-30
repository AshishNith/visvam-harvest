import mongoose, { Document, Schema } from "mongoose";

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  firebaseUid?: string;
  email?: string;
  name: string;
  role: "user" | "admin";
  password?: string;
  phone?: string;
  avatar?: string;
  profileCompleted: boolean;
  // Legacy single address, kept so older accounts keep rendering while the
  // controller folds it into `addresses` on first read.
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A customer can keep several delivery addresses and choose one at checkout.
 * Field names mirror the checkout form (`pincode`, not the legacy `zipCode`)
 * so a saved address can be handed straight to an order without remapping.
 */
const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, trim: true, default: "Home" },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

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
    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// High concurrency indexes
UserSchema.index({ email: 1, firebaseUid: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
