import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  product?: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  qty: number;
  price: number;
  image: string;
  variantTitle?: string;
  variantSku?: string;
  selectedOptions?: Record<string, string>;
  /** Pack size text ("500g Pouch") — the weight fallback for variant-less items. */
  serving?: string;
  /**
   * Gross packed weight per unit in kg, captured at order time. Preferred over
   * parsing a number out of the title, and frozen here so a later catalogue
   * edit can't change what an existing order was quoted on.
   */
  weightKg?: number;
}

export interface IShiprocketDetails {
  orderId?: number;
  shipmentId?: number;
  awbCode?: string;
  courierName?: string;
  courierId?: number;
  labelUrl?: string;
  manifestUrl?: string;
  invoiceUrl?: string;
  trackingUrl?: string;
  status?: string;
  statusCode?: number;
  lastTrackedAt?: Date;
  etd?: string;
}

export interface IPaymentResult {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  guestEmail?: string;
  orderItems: IOrderItem[];
  pickupLane: string;
  pickupSlot: string;
  /**
   * How the customer receives the order:
   *  - "ship"   — couriered to `shippingAddress` (default; pushed to Shiprocket)
   *  - "pickup" — collected in person from the Sector 63 warehouse. No courier,
   *               no delivery charge, never sent to Shiprocket. Only offered to
   *               Delhi NCR customers (see Backend/src/config/pickup.ts).
   */
  fulfillmentMethod: "ship" | "pickup";
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    phone?: string;
    email?: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: IPaymentResult;
  itemsPrice: number;
  /** Coupon code applied at checkout, uppercased. Absent when none was used. */
  couponCode?: string;
  /** Whole-rupee amount taken off the items subtotal by the coupon. 0 if none. */
  discountAmount: number;
  taxPrice: number;
  shippingPrice: number;
  /** Cash-on-Delivery surcharge. Zero for prepaid orders. */
  codFee: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  status: "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled";
  shiprocket?: IShiprocketDetails;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    guestEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    orderItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        slug: { type: String, required: true },
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        image: { type: String, default: "" },
        variantTitle: { type: String },
        variantSku: { type: String },
        selectedOptions: { type: Map, of: String },
        serving: { type: String },
        weightKg: { type: Number, min: 0 },
      },
    ],
    pickupLane: {
      type: String,
      required: true,
      default: "riverside",
    },
    pickupSlot: {
      type: String,
      required: true,
      default: "ASAP",
    },
    fulfillmentMethod: {
      type: String,
      enum: ["ship", "pickup"],
      default: "ship",
      index: true,
    },
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      phone: String,
      email: String,
      country: { type: String, default: "India" },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Card / Pickup",
    },
    paymentResult: {
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    codFee: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },
    shiprocket: {
      orderId: Number,
      shipmentId: Number,
      awbCode: { type: String, index: true },
      courierName: String,
      courierId: Number,
      labelUrl: String,
      manifestUrl: String,
      invoiceUrl: String,
      trackingUrl: String,
      status: String,
      statusCode: Number,
      lastTrackedAt: Date,
      etd: String,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
