/**
 * RRV Green Basket - Admin Review Management Service
 * Integrates directly with Spring Boot Review Microservice (Port 8088 / API Gateway)
 * Requires ADMIN or SUPER_ADMIN authorization.
 */

import {
  ApiResponse,
  AdminReviewItem,
  AdminReviewsFilterParams,
  AdminReviewsPageData,
  AdminReviewStatistics,
} from "@/types";
import { getAuthToken } from "./api-client";

export class AdminReviewApiError extends Error {
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
    this.name = "AdminReviewApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export class AdminReviewService {
  /**
   * Resolves base URL for Admin Review Service
   */
  public getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return "";
    }
    if (process.env.NEXT_PUBLIC_REVIEW_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_REVIEW_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    }
    return "http://localhost:8088";
  }

  /**
   * Internal authenticated HTTP request handler for Admin Review endpoints
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    const token = getAuthToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      headers["Authorization"] = `Bearer ${cleanToken}`;
    }

    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: unknown) {
      throw new AdminReviewApiError(
        `Failed to reach Admin Review Service: ${err instanceof Error ? err.message : "Network error"}`,
        503,
        endpoint
      );
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    let json: ApiResponse<T> | Record<string, unknown> | null = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      const errorMsg =
        (json as ApiResponse<unknown>)?.message ||
        (json as Record<string, unknown>)?.error ||
        `Admin Review Service returned HTTP ${response.status}`;
      throw new AdminReviewApiError(
        String(errorMsg),
        response.status,
        endpoint,
        (json as ApiResponse<unknown>)?.data || json
      );
    }

    if (json && typeof json === "object" && "data" in json) {
      return (json as ApiResponse<T>).data as T;
    }

    return json as T;
  }

  /**
   * API 9 — Get All Reviews with Filters
   * GET /api/admin/reviews
   * Supported: productPublicId, customerPublicId, rating, status, startDate, endDate, sort, page, size
   */
  async getReviews(params: AdminReviewsFilterParams = {}): Promise<AdminReviewsPageData> {
    const searchParams = new URLSearchParams();

    if (params.productPublicId?.trim()) {
      searchParams.set("productPublicId", params.productPublicId.trim());
    }
    if (params.customerPublicId?.trim()) {
      searchParams.set("customerPublicId", params.customerPublicId.trim());
    }
    if (params.rating !== undefined && params.rating >= 1 && params.rating <= 5) {
      searchParams.set("rating", String(params.rating));
    }
    if (params.status) {
      searchParams.set("status", params.status);
    }
    if (params.startDate?.trim()) {
      searchParams.set("startDate", params.startDate.trim());
    }
    if (params.endDate?.trim()) {
      searchParams.set("endDate", params.endDate.trim());
    }
    if (params.sort) {
      searchParams.set("sort", params.sort);
    }
    searchParams.set("page", String(params.page ?? 0));
    searchParams.set("size", String(params.size ?? 10));

    const query = searchParams.toString();
    return this.request<AdminReviewsPageData>(
      `/api/admin/reviews${query ? `?${query}` : ""}`,
      { method: "GET" }
    );
  }

  /**
   * API 10 — Get Review Details
   * GET /api/admin/reviews/{reviewPublicId}
   */
  async getReviewDetails(reviewPublicId: string): Promise<AdminReviewItem> {
    if (!reviewPublicId?.trim()) {
      throw new AdminReviewApiError("Review Public ID is required", 400, "/api/admin/reviews");
    }

    return this.request<AdminReviewItem>(
      `/api/admin/reviews/${encodeURIComponent(reviewPublicId)}`,
      { method: "GET" }
    );
  }

  /**
   * API 11 — Admin Delete Review (Soft Delete)
   * DELETE /api/admin/reviews/{reviewPublicId}?reason=...
   */
  async deleteReview(
    reviewPublicId: string,
    reason?: string
  ): Promise<boolean> {
    if (!reviewPublicId?.trim()) {
      throw new AdminReviewApiError("Review Public ID is required", 400, "/api/admin/reviews");
    }

    const query = reason?.trim()
      ? `?reason=${encodeURIComponent(reason.trim())}`
      : "";

    await this.request<void>(
      `/api/admin/reviews/${encodeURIComponent(reviewPublicId)}${query}`,
      { method: "DELETE" }
    );

    return true;
  }

  /**
   * API 12 — Admin Review Statistics
   * GET /api/admin/reviews/statistics
   */
  async getStatistics(): Promise<AdminReviewStatistics> {
    return this.request<AdminReviewStatistics>(
      "/api/admin/reviews/statistics",
      { method: "GET" }
    );
  }
}

export const adminReviewService = new AdminReviewService();
