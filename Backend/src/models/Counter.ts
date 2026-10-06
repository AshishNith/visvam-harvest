import mongoose, { Document, Schema } from "mongoose";

/**
 * A single atomically-incremented sequence.
 *
 * `_id` is the sequence key — for order numbering that is `"<CHANNEL>:<YYMMDD>"`
 * (e.g. `"W:260910"`), so each channel gets its own counter that starts fresh
 * at IST midnight simply because a new day means a new key. Nothing has to run
 * at midnight to "reset" anything.
 *
 * Increments go through `findOneAndUpdate({$inc}, {upsert:true})`, which Mongo
 * applies atomically on a single document. Never derive the next value by
 * counting existing orders — two concurrent checkouts read the same count and
 * collide.
 */
export interface ICounter extends Document<string> {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export const Counter = mongoose.model<ICounter>("Counter", CounterSchema);
