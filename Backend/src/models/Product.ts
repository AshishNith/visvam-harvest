import mongoose, { Document, Schema } from "mongoose";

export type ProductCategory = "gourmet" | "nuts" | "gifting" | "dried-fruits" | "exotic-seeds" | "combos";

export interface IProduct extends Document {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  category: ProductCategory;
  badge?: string;
  images: string[];
  description: string;
  serving: string;
  origin: string;
  prepMinutes?: number;
  grade?: string;
  benefits?: string[];
  bestseller?: boolean;
  isNewProduct?: boolean;
  stock: number;
  rating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tagline: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["gourmet", "nuts", "gifting", "dried-fruits", "exotic-seeds", "combos"],
      index: true,
    },
    badge: {
      type: String,
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    serving: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    prepMinutes: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
    },
    benefits: {
      type: [String],
      default: [],
    },
    bestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewProduct: {
      type: Boolean,
      default: false,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 100,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed text and compound search index for 5,000 users
ProductSchema.index({ name: "text", description: "text", tagline: "text" });
ProductSchema.index({ category: 1, bestseller: -1, price: 1 });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
