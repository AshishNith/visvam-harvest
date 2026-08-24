import mongoose, { Document, Schema } from "mongoose";

export type ProductCategory = "gourmet" | "nuts" | "gifting" | "dried-fruits" | "exotic-seeds" | "combos";

export interface IVariantAttribute {
  name: string;
  values: string[];
}

export interface IProductVariant {
  _id?: string;
  sku?: string;
  title: string;
  options: Record<string, string>;
  price: number;
  mrp?: number;
  stock: number;
  image?: string;
  isDefault?: boolean;
}

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
  prepMinutes?: number;
  benefits?: string[];
  bestseller?: boolean;
  isNewProduct?: boolean;
  stock: number;
  rating: number;
  numReviews: number;
  hasVariants?: boolean;
  variantAttributes?: IVariantAttribute[];
  variants?: IProductVariant[];
  relatedProducts?: mongoose.Types.ObjectId[];
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
    prepMinutes: {
      type: Number,
      default: 0,
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
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variantAttributes: [
      {
        name: { type: String, required: true },
        values: [{ type: String, required: true }],
      },
    ],
    variants: [
      {
        sku: { type: String, trim: true },
        title: { type: String, required: true },
        options: { type: Map, of: String },
        price: { type: Number, required: true, min: 0 },
        mrp: { type: Number },
        stock: { type: Number, default: 0 },
        image: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    relatedProducts: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
      validate: {
        validator: (v: unknown[]) => v.length <= 3,
        message: "A product can have at most 3 related products",
      },
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
