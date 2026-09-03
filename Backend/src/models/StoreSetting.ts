import mongoose, { Document, Schema } from "mongoose";

/**
 * A single store-wide setting the Admin Panel can edit, keyed by a stable
 * string. Deliberately generic (key + value) so new knobs are added without a
 * schema change — the allowed keys and their validation live in
 * settingsController's SETTING_DEFS.
 */
export interface IStoreSetting extends Document {
  key: string;
  value: unknown;
  updatedAt: Date;
}

const StoreSettingSchema = new Schema<IStoreSetting>(
  {
    key: { type: String, required: true, unique: true, index: true, trim: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const StoreSetting = mongoose.model<IStoreSetting>("StoreSetting", StoreSettingSchema);
