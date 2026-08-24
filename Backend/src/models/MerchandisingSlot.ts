import mongoose, { Document, Schema } from "mongoose";

// A named, ordered list of products the admin curates for a specific spot on
// the site (a nav dropdown, the homepage bestsellers section, etc). New
// spots are added by introducing a new `key` — no schema change needed.
export interface IMerchandisingSlot extends Document {
  key: string;
  productIds: mongoose.Types.ObjectId[];
  updatedAt: Date;
}

const MerchandisingSlotSchema = new Schema<IMerchandisingSlot>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    productIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const MerchandisingSlot = mongoose.model<IMerchandisingSlot>(
  "MerchandisingSlot",
  MerchandisingSlotSchema
);
