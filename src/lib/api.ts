import { Product } from "./products";

export const API_BASE_URL = "http://localhost:5000/api/v1";

export async function fetchProductsFromBackend(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
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
    return json.data;
  } catch (error) {
    console.warn("Backend API unavailable, using local static data fallback.", error);
    return null;
  }
}

export async function submitOrderToBackend(orderData: any, token?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(orderData),
    });

    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
