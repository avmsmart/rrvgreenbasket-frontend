/**
 * RRV Green Basket - Wishlist API Service
 * Integrates directly with Spring Boot Wishlist Microservice via API Gateway (/api/wishlist)
 */

import {
  WishlistResponse,
  WishlistCountResponse,
  WishlistItemResponse,
  WishlistStatusResponse,
  WishlistBulkStatusResponse,
  ApiResponse,
} from "@/types";
import {
  customerAuthService,
  customerTokenStorage,
} from "./customer-auth.service";

export class WishlistApiError extends Error {
  public statusCode: number;
  public endpoint: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    endpoint: string = "",
    details?: unknown
  ) {
    super(message);
    this.name = "WishlistApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export class WishlistService {
  /**
   * Resolves the API Gateway base URL for Wishlist operations
   */
  public getBaseUrl(): string {
    // In client-side browser execution, use same-origin relative path "" so requests
    // route through the Next.js API proxy (/api/wishlist/...)
    // This completely eliminates CORS errors and duplicate upstream Access-Control-Allow-Origin headers
    if (typeof window !== "undefined") {
      return "";
    }
    if (process.env.NEXT_PUBLIC_WISHLIST_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_WISHLIST_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    }
    return "http://localhost:8080";
  }

  /**
   * Core authenticated HTTP request handler for Wishlist Service
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = customerTokenStorage.getAccessToken();

    if (!token) {
      throw new WishlistApiError(
        "Authentication required. Please sign in to access your wishlist.",
        401,
        endpoint
      );
    }

    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${cleanToken}`,
      ...((options.headers as Record<string, string>) || {}),
    };

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const message = isAbort
        ? `Request timed out connecting to Wishlist service at ${baseUrl}`
        : `Network error: Unable to reach Wishlist service at ${baseUrl}. Please check your connection.`;
      throw new WishlistApiError(message, 0, endpoint, err);
    }

    // Handle 401 Unauthorized - Attempt Automatic Customer Token Refresh
    if (response.status === 401) {
      try {
        const refreshed = await customerAuthService.refreshTokens();
        const retryToken = refreshed.accessToken.replace(/^Bearer\s+/i, "").trim();
        headers["Authorization"] = `Bearer ${retryToken}`;

        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (refreshErr) {
        throw new WishlistApiError(
          "Your session has expired. Please sign in again.",
          401,
          endpoint,
          refreshErr
        );
      }
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const message =
        typeof errorData === "object" && errorData && "message" in errorData
          ? String((errorData as { message: unknown }).message)
          : `Wishlist API failed with status ${response.status}: ${response.statusText}`;

      throw new WishlistApiError(message, response.status, endpoint, errorData);
    }

    if (response.status === 204) {
      return (null as unknown) as T;
    }

    const json = await response.json();

    // Unwrap standard ApiResponse envelope if present
    if (json && typeof json === "object" && "data" in json && "success" in json) {
      const enveloped = json as ApiResponse<T>;
      return enveloped.data;
    }

    return json as T;
  }

  /**
   * GET /api/wishlist
   * Retrieves complete customer wishlist
   */
  public async getWishlist(): Promise<WishlistResponse> {
    return this.request<WishlistResponse>("/api/wishlist", {
      method: "GET",
    });
  }

  /**
   * GET /api/wishlist/count
   * Retrieves total wishlist items count
   */
  public async getWishlistCount(): Promise<WishlistCountResponse> {
    return this.request<WishlistCountResponse>("/api/wishlist/count", {
      method: "GET",
    });
  }

  /**
   * POST /api/wishlist/items
   * Adds a product to the customer's wishlist
   */
  public async addToWishlist(productPublicId: string): Promise<WishlistItemResponse> {
    return this.request<WishlistItemResponse>("/api/wishlist/items", {
      method: "POST",
      body: JSON.stringify({ productPublicId }),
    });
  }

  /**
   * DELETE /api/wishlist/items/{productPublicId}
   * Removes a product from the customer's wishlist
   */
  public async removeFromWishlist(productPublicId: string): Promise<void> {
    await this.request<void>(`/api/wishlist/items/${encodeURIComponent(productPublicId)}`, {
      method: "DELETE",
    });
  }

  /**
   * DELETE /api/wishlist
   * Clears the complete customer wishlist
   */
  public async clearWishlist(): Promise<void> {
    await this.request<void>("/api/wishlist", {
      method: "DELETE",
    });
  }

  /**
   * GET /api/wishlist/items/{productPublicId}/exists
   * Checks wishlist status for an individual product
   */
  public async checkWishlistStatus(productPublicId: string): Promise<WishlistStatusResponse> {
    return this.request<WishlistStatusResponse>(
      `/api/wishlist/items/${encodeURIComponent(productPublicId)}/exists`,
      {
        method: "GET",
      }
    );
  }

  /**
   * POST /api/wishlist/items/status
   * Checks bulk wishlist status for multiple products (batches of max 50 items)
   */
  public async checkBulkWishlistStatus(
    productPublicIds: string[]
  ): Promise<WishlistBulkStatusResponse> {
    const validIds = Array.from(new Set(productPublicIds.filter((id) => Boolean(id?.trim()))));

    if (validIds.length === 0) {
      return { statusMap: {} };
    }

    // Split into batches of at most 50 products per request (backend requirement)
    const BATCH_SIZE = 50;
    const combinedStatusMap: Record<string, boolean> = {};

    for (let i = 0; i < validIds.length; i += BATCH_SIZE) {
      const batch = validIds.slice(i, i + BATCH_SIZE);
      try {
        const response = await this.request<WishlistBulkStatusResponse>(
          "/api/wishlist/items/status",
          {
            method: "POST",
            body: JSON.stringify({ productPublicIds: batch }),
          }
        );

        if (response?.statusMap) {
          Object.assign(combinedStatusMap, response.statusMap);
        }
      } catch (err) {
        console.warn(`[WishlistService] Batch status check failed for items:`, err);
      }
    }

    return {
      statusMap: combinedStatusMap,
    };
  }
}

export const wishlistService = new WishlistService();
