/**
 * RRV Green Basket - Core API Client
 *
 * Connects frontend application to Java Spring Boot REST backend APIs.
 * Supports:
 * - Dynamic environment base URL (`NEXT_PUBLIC_API_BASE_URL`)
 * - Auto JWT Authorization header injection from localStorage
 * - Request timeout handling via AbortController
 * - Unified typed error handling (ApiError)
 * - Seamless automatic fallback to high-fidelity mock data when backend server is offline
 */

import { ApiResponse, BackendHealthStatus } from "@/types";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  public status: number;
  public data?: unknown;
  public isNetworkError: boolean;

  constructor(message: string, status: number = 500, data?: unknown, isNetworkError: boolean = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

const AUTH_TOKEN_KEY = "rrv_green_basket_auth_token";
const REFRESH_TOKEN_KEY = "rrv_green_basket_refresh_token";

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string, refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (e) {
    console.error("Failed to store auth token:", e);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (e) {
    console.error("Failed to clear auth token:", e);
  }
};

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private enableMockFallback: boolean;

  constructor() {
    this.baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
    this.defaultTimeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 15000;
    this.enableMockFallback = process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK !== "false";
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, "");
  }

  /**
   * Core request dispatcher with fallback support
   */
  public async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    fallbackData?: T
  ): Promise<T> {
    const {
      params,
      timeoutMs = this.defaultTimeout,
      skipAuth = false,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    // Construct URL with query parameters
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let url = `${this.baseUrl}${normalizedEndpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...((customHeaders as Record<string, string>) || {}),
    };

    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Abort controller for timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Handle non-2xx responses
      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const message =
          (typeof errorData === "object" && errorData && "message" in errorData)
            ? String((errorData as { message: unknown }).message)
            : `API request failed with status ${response.status}: ${response.statusText}`;

        throw new ApiError(message, response.status, errorData, false);
      }

      // Check for empty body (e.g. 204 No Content)
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
    } catch (error: unknown) {
      clearTimeout(timer);

      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isTypeError = error instanceof TypeError; // usually NetworkError / Failed to fetch
      const isConnRefused =
        isTypeError || isAbort || (error instanceof Error && error.message.includes("fetch"));

      // If backend is offline/unreachable and fallbackData is provided, gracefully return mock data
      if (this.enableMockFallback && fallbackData !== undefined && isConnRefused) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[RRV Backend Client] Connection to ${url} unavailable (${
              isAbort ? "Timeout" : "Server Offline"
            }). Seamlessly serving high-fidelity local dataset.`
          );
        }
        return fallbackData;
      }

      if (error instanceof ApiError) {
        throw error;
      }

      const errorMessage = isAbort
        ? `Request timed out after ${timeoutMs}ms for ${endpoint}`
        : error instanceof Error
        ? error.message
        : "Unknown network error occurred";

      throw new ApiError(errorMessage, 0, null, true);
    }
  }

  // HTTP Helper shortcuts
  public async get<T>(endpoint: string, options?: RequestOptions, fallbackData?: T): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" }, fallbackData);
  }

  public async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
    fallbackData?: T
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      fallbackData
    );
  }

  public async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
    fallbackData?: T
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "PUT",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      fallbackData
    );
  }

  public async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
    fallbackData?: T
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      fallbackData
    );
  }

  public async delete<T>(endpoint: string, options?: RequestOptions, fallbackData?: T): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" }, fallbackData);
  }

  /**
   * Health Check: Detects if the Java Spring Boot Backend API is running
   */
  public async checkHealth(): Promise<BackendHealthStatus> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      }).catch(async () => {
        // Fallback check to actuator health endpoint
        return fetch(`${this.baseUrl}/actuator/health`, {
          signal: controller.signal,
        });
      });

      clearTimeout(timer);

      if (response && response.ok) {
        return {
          online: true,
          service: "RRV Green Basket Java Backend",
          status: "UP",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "development",
        };
      }
    } catch {
      // Backend not running
    }

    return {
      online: false,
      service: "RRV Green Basket Java Backend",
      status: "DOWN",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
  }
}

// Global Singleton Export
export const apiClient = new ApiClient();
export default apiClient;
