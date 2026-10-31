/**
 * Customer Address Service
 * Connects directly to Spring Boot Customer Address REST APIs on port 8082.
 *
 * All requests forward the customer JWT Bearer token and handle automatic 401 token refresh.
 * No mock data is used for address operations.
 */

import {
  CustomerAddress,
  CustomerAddressRequest,
} from "@/types/customer-address";
import {
  customerAuthService,
  customerTokenStorage,
} from "./customer-auth.service";

export class CustomerAddressError extends Error {
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
    this.name = "CustomerAddressError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export class CustomerAddressService {
  /**
   * Resolves the dedicated base URL for the Customer Address Service running on port 8082.
   * Kept separate from the customer authentication service.
   */
  public getBaseUrl(): string {
    // 1. Explicit address service URL
    if (process.env.NEXT_PUBLIC_CUSTOMER_ADDRESS_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_CUSTOMER_ADDRESS_API_BASE_URL.replace(/\/$/, "");
    }

    // 2. Customer service URL
    if (process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL.replace(/\/$/, "");
    }

    // 3. Fallback: derive from standard NEXT_PUBLIC_API_BASE_URL, ensuring port 8082
    const baseApi = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (baseApi) {
      try {
        const url = new URL(baseApi);
        if (url.port === "8080" || url.port === "8081") {
          url.port = "8082";
          return url.origin;
        }
      } catch {
        // Fallback string replacement
        return baseApi.replace(/:\d+$/, ":8082").replace(/\/$/, "");
      }
      return baseApi.replace(/\/$/, "");
    }

    // 4. Default address service fallback
    return "http://10.63.45.179:8082";
  }

  /**
   * Core HTTP request handler for address operations on port 8082.
   * Injects customer JWT Bearer token, handles 401 refresh, and surfaces descriptive errors.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = customerTokenStorage.getAccessToken();

    if (!token) {
      throw new CustomerAddressError(
        "Authentication required. Please sign in to view and manage your delivery addresses.",
        401,
        endpoint
      );
    }

    // Sanitize token to avoid duplicate Bearer prefix
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
        ? `Request timed out connecting to Address service at ${baseUrl}`
        : `Network connection error: Unable to reach Address service at ${baseUrl}. Please ensure the Spring Boot service is running on port 8082.`;
      throw new CustomerAddressError(message, 0, endpoint, err);
    }

    // Handle 401 Unauthorized - Attempt Automatic Token Refresh
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
        customerTokenStorage.clearSession();
        throw new CustomerAddressError(
          "Your session has expired. Please sign in again with your mobile OTP.",
          401,
          endpoint,
          refreshErr
        );
      }
    }

    let json: any = null;
    try {
      json = await response.json();
    } catch {
      // Non-JSON response body
    }

    if (!response.ok) {
      let errorMessage = `Address service returned status ${response.status} (${response.statusText})`;

      if (json && typeof json === "object") {
        if (json.message) {
          errorMessage = String(json.message);
        } else if (json.error) {
          errorMessage = String(json.error);
        }
      }

      if (response.status === 500) {
        errorMessage = `Backend Internal Server Error (500) at ${baseUrl}${normalizedEndpoint}: ${
          json?.message ||
          json?.error ||
          "The backend address service encountered an internal error. Please verify backend database connection and server logs on port 8082."
        }`;
      }

      throw new CustomerAddressError(
        errorMessage,
        response.status,
        endpoint,
        json
      );
    }

    // Unwrap envelope: { success: true, message: "...", data: [...] }
    if (json && typeof json === "object" && "data" in json) {
      return json.data !== undefined ? json.data : json;
    }

    return json as T;
  }

  /**
   * 4.1 GET /api/customers/addresses
   * Retrieve all delivery addresses belonging to the authenticated customer.
   */
  async getMyAddresses(): Promise<CustomerAddress[]> {
    const response = await this.request<
      CustomerAddress[] | { data: CustomerAddress[] }
    >("/api/customers/addresses", {
      method: "GET",
    });

    if (Array.isArray(response)) {
      return response;
    }

    if (response && Array.isArray((response as { data: CustomerAddress[] }).data)) {
      return (response as { data: CustomerAddress[] }).data;
    }

    return [];
  }

  /**
   * 4.2 POST /api/customers/add/addresses
   * Add a new delivery address for the authenticated customer.
   * Note: The first address automatically becomes the default address.
   */
  async addAddress(payload: CustomerAddressRequest): Promise<CustomerAddress> {
    const formattedPayload: CustomerAddressRequest = {
      receiverName: payload.receiverName.trim(),
      receiverMobile: payload.receiverMobile.trim().replace(/\D/g, "").slice(-10),
      addressLine1: payload.addressLine1.trim(),
      addressLine2: payload.addressLine2?.trim() || undefined,
      landmark: payload.landmark?.trim() || undefined,
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim().replace(/\D/g, "").slice(0, 6),
      country: payload.country.trim() || "India",
      addressType: payload.addressType,
      isDefault: Boolean(payload.isDefault),
    };

    return this.request<CustomerAddress>("/api/customers/add/addresses", {
      method: "POST",
      body: JSON.stringify(formattedPayload),
    });
  }

  /**
   * 4.3 PUT /api/customers/addresses/{addressId}
   * Update an existing delivery address.
   */
  async updateAddress(
    addressId: string,
    payload: CustomerAddressRequest
  ): Promise<CustomerAddress> {
    const formattedPayload: CustomerAddressRequest = {
      receiverName: payload.receiverName.trim(),
      receiverMobile: payload.receiverMobile.trim().replace(/\D/g, "").slice(-10),
      addressLine1: payload.addressLine1.trim(),
      addressLine2: payload.addressLine2?.trim() || undefined,
      landmark: payload.landmark?.trim() || undefined,
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim().replace(/\D/g, "").slice(0, 6),
      country: payload.country.trim() || "India",
      addressType: payload.addressType,
      isDefault: Boolean(payload.isDefault),
    };

    return this.request<CustomerAddress>(
      `/api/customers/addresses/${encodeURIComponent(addressId)}`,
      {
        method: "PUT",
        body: JSON.stringify(formattedPayload),
      }
    );
  }

  /**
   * 4.4 DELETE /api/customers/addresses/{addressId}
   * Delete an existing address.
   * If the deleted address was default, backend automatically promotes the next newest.
   */
  async deleteAddress(addressId: string): Promise<void> {
    await this.request<unknown>(
      `/api/customers/addresses/${encodeURIComponent(addressId)}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * 4.5 PATCH /api/customers/addresses/{addressId}/default
   * Set the chosen address as default.
   */
  async setDefaultAddress(addressId: string): Promise<CustomerAddress> {
    return this.request<CustomerAddress>(
      `/api/customers/addresses/${encodeURIComponent(addressId)}/default`,
      {
        method: "PATCH",
      }
    );
  }
}

export const customerAddressService = new CustomerAddressService();
export default customerAddressService;
