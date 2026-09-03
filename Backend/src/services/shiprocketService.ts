import { IOrder } from "../models/Order.js";
import { orderWeightKg } from "../utils/shippingWeight.js";

interface ShiprocketAuthConfig {
  email: string;
  password: string;
  pickupLocation: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedAuthToken: CachedToken | null = null;

const SHIPROCKET_API_BASE = "https://apiv2.shiprocket.in/v1/external";

/**
 * Shiprocket rejects anything that isn't a bare 10-digit Indian mobile number
 * with `422 Phone number is in invalid format` — no "+91", no spaces, no
 * dashes. Numbers reach us in every shape, including from orders placed before
 * the checkout field was sanitised, so normalise at the boundary.
 */
function toShiprocketPhone(raw?: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  // "919876543210" -> "9876543210"; "09876543210" -> "9876543210"
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return local.length === 10 ? local : "";
}

export type CourierOption = {
  id: number;
  name: string;
  /** What Shiprocket bills in total — freight PLUS COD and other charges. */
  rate: number;
  /** Freight alone, so a scary total can be explained rather than guessed at. */
  freightCharge?: number;
  /** COD collection fee, a % of order value. Dominates `rate` on big COD orders. */
  codCharges?: number;
  /** Surface (road) vs air. Air runs several times the price for dry goods. */
  isSurface?: boolean;
  /** Shiprocket's delivery-performance score, 0-5. */
  rating?: number;
  etd: string;
  estimatedDays: number | string;
};

export type ServiceabilityResult =
  | {
      success: true;
      isServiceable: boolean;
      city: string;
      state: string;
      estimatedDays: number | string;
      etd: string;
      courierName: string;
      courierRate: number;
      /** Courier the quote is based on — the cheapest serviceable one. */
      quotedCourierId?: number;
      availableCouriers: CourierOption[];
    }
  | { success: false; isServiceable: false; message: string };

export type AwbResult =
  | { success: true; awbCode: string; courierName: string; courierId?: number }
  | { success: false; message: string };

export type ShipmentResult =
  | {
      success: true;
      orderId: number;
      shipmentId: number;
      /** Absent when the order reached Shiprocket but no courier could be assigned. */
      awbCode?: string;
      courierName?: string;
      courierId?: number;
      trackingUrl?: string;
      labelUrl?: string;
      /** Why AWB assignment did not happen, when it did not. */
      awbError?: string;
    }
  | { success: false; message: string };

export type TrackingResult =
  | {
      success: true;
      awbCode: string;
      currentStatus: string;
      currentLocation: string;
      etd: string;
      courier?: string;
      timeline: Array<{ date: string; activity: string; location: string; completed?: boolean }>;
    }
  | { success: false; message: string };

/** Pulls the most useful error text out of a Shiprocket error body. */
function shiprocketError(data: any, fallback: string): string {
  if (!data) return fallback;
  if (typeof data.message === "string" && data.message) {
    // `errors` carries the per-field detail, e.g. { billing_phone: [...] }
    const fields = data.errors && typeof data.errors === "object" ? data.errors : null;
    if (fields) {
      const detail = Object.entries(fields)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
        .join("; ");
      if (detail) return `${data.message} (${detail})`;
    }
    return data.message;
  }
  return fallback;
}

export class ShiprocketService {
  private static getConfig(): ShiprocketAuthConfig {
    return {
      email: process.env.SHIPROCKET_EMAIL || "",
      password: process.env.SHIPROCKET_PASSWORD || "",
      pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    };
  }

  public static isConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(config.email && config.password);
  }

  /**
   * Retrieves an authenticated Bearer token from Shiprocket with in-memory caching.
   */
  public static async getToken(): Promise<string | null> {
    const config = this.getConfig();
    if (!config.email || !config.password) {
      return null;
    }

    // Return cached token if valid (buffer 1 hour)
    if (cachedAuthToken && cachedAuthToken.expiresAt > Date.now() + 60 * 60 * 1000) {
      return cachedAuthToken.token;
    }

    try {
      const response = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: config.email,
          password: config.password,
        }),
      });

      const data = (await response.json()) as any;
      if (response.ok && data?.token) {
        // Tokens are typically valid for 10 days
        cachedAuthToken = {
          token: data.token,
          expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
        };
        return data.token;
      }

      console.warn("Shiprocket auth failed:", data?.message || data);
      return null;
    } catch (err) {
      console.error("Shiprocket authentication error:", err);
      return null;
    }
  }

  /**
   * Check delivery pincode serviceability and estimated delivery timeframe.
   *
   * Returns `success: false` when Shiprocket can't be reached or quotes
   * nothing — callers decide what to charge. Never invents a rate: a made-up
   * figure here becomes the delivery fee the customer is actually billed.
   */
  public static async checkServiceability(
    deliveryPincode: string,
    weightKg: number = 0.5,
    isCod: boolean = false
  ): Promise<ServiceabilityResult> {
    const cleanPin = String(deliveryPincode).replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      return { success: false, isServiceable: false, message: "Invalid 6-digit Indian PIN code" };
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "248001";
    const token = await this.getToken();
    if (!token) {
      return {
        success: false,
        isServiceable: false,
        message: "Shipping is not configured. Please contact support.",
      };
    }

    try {
      const url = `${SHIPROCKET_API_BASE}/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${cleanPin}&weight=${weightKg}&cod=${isCod ? 1 : 0}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as any;
      if (response.ok && data?.status === 200 && data?.data) {
        const availableCouriers = data.data.available_courier_companies || [];
        if (availableCouriers.length === 0) {
          return {
            success: false,
            isServiceable: false,
            message: "No courier currently delivers to this PIN code.",
          };
        }

        // Shiprocket's `recommended_courier_company_id` is chosen by their own
        // priority/performance engine, NOT by price — it is routinely an air
        // service several hundred rupees above the cheapest serviceable option.
        // Quoting that to the customer while the team then ships surface made
        // the checkout price, the order's shippingPrice and the Admin Panel's
        // courier list all disagree. Always quote the cheapest serviceable
        // courier, and hand back the options price-sorted so the Admin Panel
        // picker lists that same courier first.
        const sorted = [...availableCouriers].sort(
          (a: any, b: any) => (Number(a.rate) || 0) - (Number(b.rate) || 0)
        );
        const cheapest = sorted[0];

        return {
          success: true,
          isServiceable: true,
          city: data.data.delivery_city || "",
          state: data.data.delivery_state || "",
          // ETA must come from the same courier as the price, or the checkout
          // promises one courier's speed at another courier's cost.
          estimatedDays: cheapest?.estimated_delivery_days ?? "",
          etd: cheapest?.etd || "",
          courierName: cheapest?.courier_name || "",
          courierRate: Number(cheapest?.rate) || 0,
          quotedCourierId: cheapest?.courier_company_id,
          // Was `.slice(0, 4)` on the UNSORTED list, which could hide both the
          // cheapest courier and the one the customer was actually quoted.
          availableCouriers: sorted.slice(0, 10).map((c: any) => ({
            id: c.courier_company_id,
            name: c.courier_name,
            rate: Number(c.rate) || 0,
            freightCharge: Number(c.freight_charge) || 0,
            codCharges: Number(c.cod_charges) || 0,
            isSurface: Boolean(c.is_surface),
            rating: Number(c.rating) || undefined,
            etd: c.etd,
            estimatedDays: c.estimated_delivery_days,
          })),
        };
      }

      const message = shiprocketError(
        data,
        `Shiprocket serviceability check failed (HTTP ${response.status}).`
      );
      console.warn("Shiprocket serviceability error:", message);
      return { success: false, isServiceable: false, message };
    } catch (err) {
      console.error("Shiprocket serviceability request failed:", err);
      return {
        success: false,
        isServiceable: false,
        message: "Could not reach Shiprocket to check this PIN code.",
      };
    }
  }

  /**
   * Requests a courier + AWB for an existing Shiprocket shipment.
   *
   * Split out from order creation so a retry after an AWB failure (an empty
   * wallet, an inactive pickup address) does not create a duplicate order.
   */
  public static async assignAwb(
    shipmentId: number | string,
    courierId?: number | string
  ): Promise<AwbResult> {
    const token = await this.getToken();
    if (!token) {
      return { success: false, message: "Shiprocket is not configured." };
    }

    // Omitting courier_id lets Shiprocket auto-pick via the account's courier
    // priority rules; passing one forces that specific courier company.
    const body: Record<string, number> = { shipment_id: Number(shipmentId) };
    if (courierId != null && Number(courierId) > 0) {
      body.courier_id = Number(courierId);
    }

    try {
      const response = await fetch(`${SHIPROCKET_API_BASE}/courier/assign/awb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as any;
      const assigned = data?.response?.data;
      if (response.ok && assigned?.awb_code) {
        return {
          success: true,
          awbCode: String(assigned.awb_code),
          courierName: assigned.courier_name || "",
          courierId: assigned.courier_company_id,
        };
      }

      return {
        success: false,
        message: shiprocketError(data, `AWB assignment failed (HTTP ${response.status}).`),
      };
    } catch (err) {
      console.error("Shiprocket AWB assignment request failed:", err);
      return { success: false, message: "Could not reach Shiprocket to assign an AWB." };
    }
  }

  /** Builds the Ad-hoc Order payload Shiprocket expects for a Viśvam order. */
  private static buildAdhocPayload(order: IOrder) {
    const config = this.getConfig();
    const orderIdStr = String(order._id);
    const orderNumber = orderIdStr.substring(orderIdStr.length - 8).toUpperCase();
    const orderDate = new Date(order.createdAt).toISOString().split("T")[0];

    // The SAME figure the delivery charge was quoted on. This used to be its
    // own flat 0.5kg-per-unit sum, which declared double the weight for 250g
    // packs (paying freight on 2kg for a 1kg parcel) and under-declared 500g
    // orders. orderWeightKg is the single source of truth for parcel weight.
    const totalWeightKg = orderWeightKg(order.orderItems);

    return {
      order_id: `VISVAM-${orderNumber}`,
      order_date: orderDate,
      pickup_location: config.pickupLocation,
      channel_id: "",
      comment: "Viśvam Premium Dry Fruits — Handle with care",
      billing_customer_name: order.shippingAddress?.fullName?.split(" ")[0] || "Valued",
      billing_last_name: order.shippingAddress?.fullName?.split(" ").slice(1).join(" ") || "Customer",
      billing_address: order.shippingAddress?.address || "Address",
      billing_address_2: "",
      billing_city: order.shippingAddress?.city || "Delhi",
      billing_pincode: Number(order.shippingAddress?.postalCode) || 110001,
      billing_state: order.shippingAddress?.state || "Delhi",
      billing_country: "India",
      billing_email: order.shippingAddress?.email || order.guestEmail || "care@visvam.in",
      billing_phone: toShiprocketPhone(order.shippingAddress?.phone) || "9999999999",
      shipping_is_billing: true,
      order_items: order.orderItems.map((item) => ({
        name: item.name,
        sku: item.slug || "dry-fruit-pack",
        units: item.qty,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 80211,
      })),
      payment_method:
        order.isPaid ||
        order.paymentMethod.toLowerCase().includes("card") ||
        order.paymentMethod.toLowerCase().includes("prepaid")
          ? "Prepaid"
          : "COD",
      shipping_charges: order.shippingPrice || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.itemsPrice,
      length: 15,
      breadth: 15,
      height: 10,
      weight: totalWeightKg,
    };
  }

  /**
   * Creates the Ad-hoc Order in Shiprocket. No courier or AWB is requested here
   * — the order simply appears in the Shiprocket dashboard's "New" tab.
   */
  private static async createAdhocOrder(
    token: string,
    order: IOrder
  ): Promise<
    | {
        success: true;
        orderId: number;
        shipmentId: number;
        awbCode?: string;
        courierName?: string;
        courierId?: number;
      }
    | { success: false; message: string }
  > {
    try {
      const createRes = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(this.buildAdhocPayload(order)),
      });

      const createData = (await createRes.json()) as any;
      if (!createRes.ok || !createData?.order_id || !createData?.shipment_id) {
        const message = shiprocketError(
          createData,
          `Shiprocket rejected the order (HTTP ${createRes.status}).`
        );
        console.warn("Shiprocket create order failed:", message);
        return { success: false, message };
      }

      return {
        success: true,
        orderId: createData.order_id,
        shipmentId: createData.shipment_id,
        // Some accounts return the AWB straight from order creation.
        awbCode: createData.awb_code ? String(createData.awb_code) : undefined,
        courierName: createData.courier_name || undefined,
        courierId: createData.courier_company_id || undefined,
      };
    } catch (err) {
      console.error("Shiprocket create order request failed:", err);
      return { success: false, message: "Could not reach Shiprocket to create the order." };
    }
  }

  /**
   * Pushes an order into Shiprocket WITHOUT assigning a courier, so it lands in
   * the dashboard's "New" tab. Called the moment an order is placed / paid; the
   * courier is chosen later from the Admin Panel.
   */
  public static async createShipmentOnly(order: IOrder): Promise<ShipmentResult> {
    const token = await this.getToken();
    if (!token) {
      return {
        success: false,
        message:
          "Shiprocket is not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD missing on the server).",
      };
    }

    const created = await this.createAdhocOrder(token, order);
    if (!created.success) return created;

    return {
      success: true,
      orderId: created.orderId,
      shipmentId: created.shipmentId,
      awbCode: created.awbCode,
      courierName: created.courierName,
      courierId: created.courierId,
      trackingUrl: created.awbCode
        ? `https://shiprocket.co/tracking/${created.awbCode}`
        : undefined,
    };
  }

  /**
   * Creates an Ad-hoc Order in Shiprocket and requests AWB assignment.
   *
   * Pass `courierId` to force a specific courier company; omit it to let
   * Shiprocket pick using the account's courier-priority rules.
   *
   * A failure is reported as a failure — this never fabricates a waybill.
   * If the order is created but no courier can be assigned, that is reported
   * as a partial success carrying `awbError`, because the order genuinely does
   * exist in Shiprocket and must not be created a second time.
   */
  public static async createOrderAndAssignAWB(
    order: IOrder,
    courierId?: number | string
  ): Promise<ShipmentResult> {
    const token = await this.getToken();
    if (!token) {
      return {
        success: false,
        message:
          "Shiprocket is not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD missing on the server).",
      };
    }

    const created = await this.createAdhocOrder(token, order);
    if (!created.success) return created;

    // Some accounts return the AWB straight from order creation.
    if (created.awbCode) {
      return {
        success: true,
        orderId: created.orderId,
        shipmentId: created.shipmentId,
        awbCode: created.awbCode,
        courierName: created.courierName,
        courierId: created.courierId,
        trackingUrl: `https://shiprocket.co/tracking/${created.awbCode}`,
      };
    }

    // Order exists in Shiprocket from here on — an AWB failure must still
    // return the ids so the caller can retry assignment without duplicating it.
    const awb = await this.assignAwb(created.shipmentId, courierId);
    if (!awb.success) {
      return {
        success: true,
        orderId: created.orderId,
        shipmentId: created.shipmentId,
        awbError: awb.message,
      };
    }

    return {
      success: true,
      orderId: created.orderId,
      shipmentId: created.shipmentId,
      awbCode: awb.awbCode,
      courierName: awb.courierName,
      courierId: awb.courierId,
      trackingUrl: `https://shiprocket.co/tracking/${awb.awbCode}`,
    };
  }

  /**
   * Track Shipment Status by AWB Code.
   */
  public static async trackShipment(awbCode: string): Promise<TrackingResult> {
    const token = await this.getToken();
    if (!token) {
      return { success: false, message: "Shiprocket is not configured." };
    }

    try {
      const response = await fetch(`${SHIPROCKET_API_BASE}/courier/track/awb/${awbCode}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as any;
      const trackData = data?.tracking_data;
      if (response.ok && trackData) {
        // Shiprocket answers 200 with an error inside the body for an AWB it
        // does not recognise, rather than a 404.
        if (trackData.error) {
          return { success: false, message: String(trackData.error) };
        }

        return {
          success: true,
          awbCode,
          currentStatus: trackData.shipment_status || "IN_TRANSIT",
          currentLocation: trackData.current_location || "",
          etd: trackData.etd || "",
          courier: trackData.shipment_track?.[0]?.courier_name || undefined,
          timeline: (trackData.shipment_track_activities || trackData.scans || []).map((scan: any) => ({
            date: scan.date,
            activity: scan.activity,
            location: scan.location,
            completed: true,
          })),
        };
      }

      return {
        success: false,
        message: shiprocketError(data, `Tracking lookup failed (HTTP ${response.status}).`),
      };
    } catch (err) {
      console.error("Shiprocket tracking request failed:", err);
      return { success: false, message: "Could not reach Shiprocket for tracking." };
    }
  }

  /**
   * Fetch printable shipping label URL for an order shipment.
   * Returns null when Shiprocket cannot produce one.
   */
  public static async getShippingLabel(shipmentId: number | string): Promise<string | null> {
    const token = await this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${SHIPROCKET_API_BASE}/courier/generate/label`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
      });
      const data = (await response.json()) as any;
      if (response.ok && data?.label_url) {
        return data.label_url;
      }
      console.warn("Shiprocket label generation failed:", shiprocketError(data, "unknown error"));
      return null;
    } catch (err) {
      console.warn("Could not retrieve live label URL:", err);
      return null;
    }
  }
}
