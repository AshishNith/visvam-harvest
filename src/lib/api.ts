import { Product } from "./products";
import { ShippingAddress } from "./cart-context";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://visvam-backend.onrender.com/api/v1";

// ─── Auth Token Management ───────────────────────────────────────
const AUTH_TOKEN_KEY = "visvam_auth_token";
const AUTH_USER_KEY = "visvam_auth_user";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getStoredUser(): { _id: string; name: string; email: string; role: string; phone?: string } | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setStoredUser(user: any) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ─── Auth API ────────────────────────────────────────────────────
export async function getUserProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, { headers: authHeaders() });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function syncFirebaseUserWithBackend(idToken: string, extraData?: { avatar?: string; name?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(extraData || {}),
    });
    const json = await res.json();
    if (json.success && json.token) {
      setAuthToken(json.token);
      setStoredUser(json.data);
    }
    return json;
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to sync Firebase user" };
  }
}

export async function completeUserProfile(data: { name?: string; phone?: string; address?: any }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/complete-profile`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to complete profile" };
  }
}


// ─── Products API ────────────────────────────────────────────────
export interface FetchProductsParams {
  category?: string;
  search?: string;
  bestseller?: boolean;
  isNew?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function fetchProductsFromBackend(params?: FetchProductsParams): Promise<Product[] | null> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.bestseller) queryParams.append("bestseller", "true");
    if (params?.isNew) queryParams.append("isNew", "true");
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json.data)) return null;
    return json.data.map((item: any) => ({
      ...item,
      _id: item._id || item.id,
      isNew: item.isNew ?? item.isNewProduct ?? false,
    }));
  } catch (error) {
    console.warn("Backend API unavailable, using local static data fallback.", error);
    return null;
  }
}

export async function fetchProductBySlugFromBackend(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.data) return null;
    return {
      ...json.data,
      _id: json.data._id || json.data.id,
      isNew: json.data.isNew ?? json.data.isNewProduct ?? false,
    };
  } catch (error) {
    console.warn("Backend API unavailable, using local static data fallback.", error);
    return null;
  }
}

// ─── Orders API ──────────────────────────────────────────────────
export interface SubmitOrderData {
  orderItems: {
    product: string;
    slug: string;
    name: string;
    qty: number;
    price: number;
    image?: string;
    variantTitle?: string;
    variantSku?: string;
    selectedOptions?: Record<string, string>;
  }[];
  shippingAddress: ShippingAddress;
  guestEmail?: string;
  paymentMethod: string;
}

const LOCAL_ORDERS_KEY = "visvam_local_user_orders";

export function getLocalOrders(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: any) {
  try {
    if (!order || !order._id) return;
    const current = getLocalOrders();
    const updated = [order, ...current.filter((o) => o._id !== order._id)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save local order:", err);
  }
}

export async function submitOrderToBackend(orderData: SubmitOrderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(orderData),
    });

    const json = await res.json();
    if (json.success && json.data) {
      saveLocalOrder(json.data);
    }
    return json;
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to submit order" };
  }
}

export async function trackOrderByIdFromBackend(orderId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(orderId)}`);
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to connect to tracking service" };
  }
}

// ─── Contact & Newsletter ────────────────────────────────────────
export async function submitContactInquiryToBackend(data: { name: string; email: string; message: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to submit inquiry" };
  }
}

export async function subscribeNewsletterToBackend(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to subscribe to newsletter" };
  }
}

import { FALLBACK_REVIEWS } from "./reviews-data";

// ─── Reviews API ─────────────────────────────────────────────────
export async function fetchProductReviews(productSlug: string) {
  const fallback = FALLBACK_REVIEWS[productSlug] || FALLBACK_REVIEWS["california-jumbo-almonds"] || [];
  const fallbackAvg =
    fallback.length > 0
      ? Math.round((fallback.reduce((sum, r) => sum + r.rating, 0) / fallback.length) * 10) / 10
      : 0;

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(productSlug)}`);
    const json = await res.json();
    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json;
    }
    return { success: true, count: fallback.length, avgRating: fallbackAvg, data: fallback };
  } catch (error: any) {
    return { success: true, count: fallback.length, avgRating: fallbackAvg, data: fallback };
  }
}

export async function submitReview(data: {
  productSlug: string;
  rating: number;
  title: string;
  comment: string;
  reviewerName?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to submit review" };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete review" };
  }
}

// ─── My Orders API ───────────────────────────────────────────────
export async function fetchMyOrders() {
  let serverOrders: any[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      serverOrders = json.data;
    }
  } catch (error: any) {
    console.warn("Failed to fetch server orders:", error);
  }

  const localOrders = getLocalOrders();
  const mergedMap = new Map<string, any>();

  serverOrders.forEach((o) => {
    if (o && o._id) mergedMap.set(o._id, o);
  });

  localOrders.forEach((o) => {
    if (o && o._id && !mergedMap.has(o._id)) {
      mergedMap.set(o._id, o);
    }
  });

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return { success: true, data: merged };
}

// ─── Profile API ─────────────────────────────────────────────────
export async function updateUserProfile(data: { name?: string; phone?: string; address?: any }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update profile" };
  }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to change password" };
  }
}

// ─── Shiprocket Logistics API ─────────────────────────────────────
export async function checkPincodeServiceability(pincode: string, weightKg: number = 0.5): Promise<{
  success: boolean;
  isServiceable?: boolean;
  estimatedDays?: number;
  etd?: string;
  courierName?: string;
  courierRate?: number;
  region?: string;
  availableCouriers?: Array<{ id: number; name: string; rate: number; etd: string; estimatedDays: number }>;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/check-serviceability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode, weightKg }),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Could not check PIN code serviceability" };
  }
}

export async function trackOrderShipment(awbOrOrderId: string): Promise<{
  success: boolean;
  awbCode?: string;
  currentStatus?: string;
  currentLocation?: string;
  etd?: string;
  courier?: string;
  timeline?: Array<{ date: string; activity: string; location: string; completed?: boolean }>;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/track/${awbOrOrderId}`);
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch live shipment tracking" };
  }
}

