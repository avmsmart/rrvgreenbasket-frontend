/**
 * RRV Green Basket - Cart API Service
 * Spring Boot Cart Microservice integration through the API Gateway.
 *
 * This service seamlessly executes authenticated requests with customer JWT Bearer tokens.
 * A failed cart request never invalidates or wipes customer session credentials.
 */

import {
  CartResponse,
  CartItemResponse,
  AddCartItemRequest,
  UpdateCartItemRequest,
  CartErrorResponse,
} from "@/types/cart";
import {
  customerAuthService,
  customerTokenStorage,
} from "./customer-auth.service";

const CUSTOMER_CART_KEY = "rrv_customer_active_cart";

export class CartApiError extends Error {
  public statusCode: number;
  public endpoint: string;
  public details?: CartErrorResponse | unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    endpoint: string = "",
    details?: CartErrorResponse | unknown
  ) {
    super(message);
    this.name = "CartApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export class CartService {
  public getBaseUrl(): string {
    if (typeof window !== "undefined") return "";

    if (process.env.NEXT_PUBLIC_CART_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_CART_API_BASE_URL.replace(/\/$/, "");
    }

    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    }

    return "http://192.168.0.142:8080";
  }

  private normalizeToken(value?: string | null): string {
    return (value || "")
      .replace(/^Bearer\s+/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();
  }

  private async readResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) return null;

    const text = await response.text();
    if (!text.trim()) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private unwrapResponse<T>(body: unknown): T {
    if (
      body !== null &&
      typeof body === "object" &&
      Object.prototype.hasOwnProperty.call(body, "data")
    ) {
      return (body as { data: T }).data;
    }
    return body as T;
  }

  public getLocalCart(): CartResponse {
    if (typeof window === "undefined") {
      return {
        publicId: "cart-active",
        status: "ACTIVE",
        items: [],
        itemCount: 0,
        totalAmount: 0,
      };
    }
    try {
      const raw = localStorage.getItem(CUSTOMER_CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          return parsed;
        }
      }
    } catch {}
    return {
      publicId: "cart-active",
      status: "ACTIVE",
      items: [],
      itemCount: 0,
      totalAmount: 0,
    };
  }

  public saveLocalCart(cart: CartResponse): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CUSTOMER_CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(
        new CustomEvent("rrv:cart:changed", { detail: cart })
      );
    } catch {}
  }

  public applyItemToLocalCart(payload: AddCartItemRequest): CartResponse {
    const current = this.getLocalCart();
    const items = [...current.items];
    const pId = payload.productPublicId.trim();
    const qty = Number(payload.quantityKg) || 1;

    const existingIndex = items.findIndex(
      (it) => it.productPublicId?.toLowerCase() === pId.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      const newQty = Number((existing.quantityKg + qty).toFixed(3));
      const pricePerKg = Number(existing.pricePerKg) || 0;
      items[existingIndex] = {
        ...existing,
        quantityKg: newQty,
        totalPrice: Math.round(newQty * pricePerKg),
      };
    } else {
      const pricePerKg = Number(payload.pricePerKg) || 50;
      items.push({
        publicId: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productPublicId: pId,
        productName: payload.productName || "Fresh Produce",
        productImageUrl: payload.productImageUrl || "",
        quantityKg: qty,
        unitOfMeasure: payload.unitOfMeasure || "KG",
        pricePerKg,
        totalPrice: Math.round(qty * pricePerKg),
      });
    }

    const itemCount = items.length;
    const totalAmount = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);

    const updated: CartResponse = {
      ...current,
      items,
      itemCount,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };

    this.saveLocalCart(updated);
    return updated;
  }

  public updateQuantityInLocalCart(
    cartItemPublicId: string,
    quantityKg: number
  ): CartResponse {
    const current = this.getLocalCart();
    let items = [...current.items];
    const qty = Number(quantityKg);

    if (qty <= 0) {
      items = items.filter((it) => it.publicId !== cartItemPublicId);
    } else {
      const idx = items.findIndex((it) => it.publicId === cartItemPublicId);
      if (idx >= 0) {
        const it = items[idx];
        const price = Number(it.pricePerKg) || 0;
        items[idx] = {
          ...it,
          quantityKg: qty,
          totalPrice: Math.round(qty * price),
        };
      }
    }

    const updated: CartResponse = {
      ...current,
      items,
      itemCount: items.length,
      totalAmount: items.reduce((sum, it) => sum + (it.totalPrice || 0), 0),
      updatedAt: new Date().toISOString(),
    };

    this.saveLocalCart(updated);
    return updated;
  }

  public removeItemFromLocalCart(cartItemPublicId: string): CartResponse {
    const current = this.getLocalCart();
    const items = current.items.filter((it) => it.publicId !== cartItemPublicId);

    const updated: CartResponse = {
      ...current,
      items,
      itemCount: items.length,
      totalAmount: items.reduce((sum, it) => sum + (it.totalPrice || 0), 0),
      updatedAt: new Date().toISOString(),
    };

    this.saveLocalCart(updated);
    return updated;
  }

  public clearLocalCart(): CartResponse {
    const emptyCart: CartResponse = {
      publicId: "cart-active",
      status: "ACTIVE",
      items: [],
      itemCount: 0,
      totalAmount: 0,
      updatedAt: new Date().toISOString(),
    };
    this.saveLocalCart(emptyCart);
    return emptyCart;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const rawToken = customerTokenStorage.getAccessToken();
    const cleanToken = this.normalizeToken(rawToken);

    if (!cleanToken) {
      throw new CartApiError(
        "Please sign in to access your cart.",
        401,
        endpoint
      );
    }

    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${cleanToken}`,
      ...((options.headers as Record<string, string>) || {}),
    };

    if (options.body && !headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error: unknown) {
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";

      throw new CartApiError(
        isAbort
          ? "Cart request timed out. Please try again."
          : error instanceof Error
            ? `Unable to reach Cart Service: ${error.message}`
            : "Unable to reach Cart Service. Please check your connection.",
        0,
        endpoint,
        error
      );
    }

    // Attempt token refresh retry once on 401 without wiping session
    if (response.status === 401) {
      try {
        const refreshed = await customerAuthService.refreshTokens();
        if (refreshed?.accessToken) {
          const retryToken = this.normalizeToken(refreshed.accessToken);
          headers["Authorization"] = `Bearer ${retryToken}`;

          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      } catch (refreshErr) {
        console.warn("[CartService] Token refresh attempted on 401:", refreshErr);
      }
    }

    if (!response.ok) {
      const responseBody = await this.readResponseBody(response);
      const body =
        responseBody !== null && typeof responseBody === "object"
          ? (responseBody as Record<string, unknown>)
          : null;

      let message =
        (typeof body?.message === "string" && body.message) ||
        (typeof body?.error === "string" && body.error) ||
        (typeof body?.detail === "string" && body.detail) ||
        (typeof responseBody === "string" && responseBody) ||
        "";

      if (!message) {
        switch (response.status) {
          case 400:
            message =
              "Invalid cart request. Please check the product and quantity.";
            break;
          case 401:
            message =
              "Your cart session could not be verified. Please try again.";
            break;
          case 403:
            message = "You do not have permission to modify this cart.";
            break;
          case 404:
            message = "Cart item or endpoint not found.";
            break;
          case 409:
            message =
              "Insufficient stock or the selected product is unavailable.";
            break;
          case 503:
            message =
              "Cart Service is temporarily unavailable. Please retry.";
            break;
          default:
            message = `Cart request failed with HTTP ${response.status}.`;
        }
      }

      console.error("[CartService] API request failed:", {
        endpoint,
        status: response.status,
        message,
        responseBody,
      });

      // Do NOT clear customer session on cart failure
      throw new CartApiError(
        message,
        response.status,
        endpoint,
        responseBody
      );
    }

    const responseBody = await this.readResponseBody(response);

    if (response.status === 204 || responseBody === null) {
      return undefined as unknown as T;
    }

    return this.unwrapResponse<T>(responseBody);
  }

  /** GET /api/cart - Retrieve the authenticated customer's cart. */
  async getCart(): Promise<CartResponse> {
    const token = customerTokenStorage.getAccessToken();
    if (!token) {
      return this.getLocalCart();
    }

    try {
      const remote = await this.request<CartResponse>("/api/cart", {
        method: "GET",
        cache: "no-store",
      });
      if (remote && Array.isArray(remote.items)) {
        this.saveLocalCart(remote);
        return remote;
      }
      return this.getLocalCart();
    } catch (err: unknown) {
      console.warn("[CartService] Backend getCart fallback to persistent cart:", err);
      return this.getLocalCart();
    }
  }

  /** POST /api/cart/items - Add a product quantity in KG. */
  async addItem(payload: AddCartItemRequest): Promise<CartResponse> {
    const pId = payload.productPublicId.trim();
    const qty = Number(payload.quantityKg) || 1;

    try {
      const response = await this.request<CartResponse>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productPublicId: pId,
          quantityKg: qty,
        }),
      });

      if (response && Array.isArray(response.items)) {
        this.saveLocalCart(response);
        return response;
      }
      return this.applyItemToLocalCart(payload);
    } catch (err: unknown) {
      console.warn("[CartService] Backend addItem fallback to persistent cart:", err);
      return this.applyItemToLocalCart(payload);
    }
  }

  /** PUT /api/cart/items/{cartItemPublicId} - Update cart quantity. */
  async updateQuantity(
    cartItemPublicId: string,
    payload: UpdateCartItemRequest
  ): Promise<CartResponse> {
    const qty = Number(payload.quantityKg);

    try {
      const response = await this.request<CartResponse>(
        `/api/cart/items/${encodeURIComponent(cartItemPublicId)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            quantityKg: qty,
          }),
        }
      );

      if (response && Array.isArray(response.items)) {
        this.saveLocalCart(response);
        return response;
      }
      return this.updateQuantityInLocalCart(cartItemPublicId, qty);
    } catch (err: unknown) {
      console.warn("[CartService] Backend updateQuantity fallback to persistent cart:", err);
      return this.updateQuantityInLocalCart(cartItemPublicId, qty);
    }
  }

  /** DELETE /api/cart/items/{cartItemPublicId} - Remove one cart item. */
  async removeItem(cartItemPublicId: string): Promise<CartResponse> {
    try {
      const response = await this.request<CartResponse>(
        `/api/cart/items/${encodeURIComponent(cartItemPublicId)}`,
        { method: "DELETE" }
      );

      if (response && Array.isArray(response.items)) {
        this.saveLocalCart(response);
        return response;
      }
      return this.removeItemFromLocalCart(cartItemPublicId);
    } catch (err: unknown) {
      console.warn("[CartService] Backend removeItem fallback to persistent cart:", err);
      return this.removeItemFromLocalCart(cartItemPublicId);
    }
  }

  /** DELETE /api/cart/items - Clear the customer's cart. */
  async clearCart(): Promise<CartResponse> {
    try {
      const response = await this.request<CartResponse>("/api/cart/items", {
        method: "DELETE",
      });

      if (response && Array.isArray(response.items)) {
        this.saveLocalCart(response);
        return response;
      }
      return this.clearLocalCart();
    } catch (err: unknown) {
      console.warn("[CartService] Backend clearCart fallback to persistent cart:", err);
      return this.clearLocalCart();
    }
  }
}

export const cartService = new CartService();
