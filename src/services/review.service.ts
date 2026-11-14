/**
 * RRV Green Basket - Customer & Public Review Service
 * Integrates directly with Spring Boot Review Microservice (Port 8088 / API Gateway)
 */

import {
  ApiResponse,
  ProductReviewItem,
  SubmitReviewRequest,
  UpdateReviewRequest,
  ProductRatingSummary,
  ProductBulkRatingSummary,
  PaginatedReviewsData,
  ReviewSortOption,
} from "@/types";
import { customerTokenStorage } from "./customer-auth.service";

export class ReviewApiError extends Error {
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
    this.name = "ReviewApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export class ReviewService {
  /**
   * Resolves base URL for Review Service
   */
  public getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return "";
    }
    if (process.env.NEXT_PUBLIC_REVIEW_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_REVIEW_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    }
    return "http://localhost:8088";
  }

  /**
   * Internal HTTP request handler for Review endpoints
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireCustomerAuth: boolean = false
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (requireCustomerAuth) {
      const token = customerTokenStorage.getAccessToken();
      if (!token) {
        throw new ReviewApiError(
          "Customer authentication required to perform this review action.",
          401,
          endpoint
        );
      }
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
      throw new ReviewApiError(
        `Failed to reach Review Service: ${err instanceof Error ? err.message : "Network error"}`,
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
        `Review service returned HTTP status ${response.status}`;
      throw new ReviewApiError(
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
   * API 1 — Submit Product Review
   * POST /api/reviews
   * Requires: CUSTOMER
   */
  async submitReview(payload: SubmitReviewRequest): Promise<ProductReviewItem> {
    if (!payload.productPublicId?.trim()) {
      throw new ReviewApiError("Product Public ID is required", 400, "/api/reviews");
    }
    if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
      throw new ReviewApiError("Rating must be between 1 and 5", 400, "/api/reviews");
    }
    if (!payload.reviewComment?.trim()) {
      throw new ReviewApiError("Review comment is required", 400, "/api/reviews");
    }

    return this.request<ProductReviewItem>(
      "/api/reviews",
      {
        method: "POST",
        body: JSON.stringify({
          productPublicId: payload.productPublicId,
          rating: Number(payload.rating),
          reviewTitle: payload.reviewTitle?.trim() || undefined,
          reviewComment: payload.reviewComment.trim(),
        }),
      },
      true
    );
  }

  /**
   * API 2 — Update Existing Review
   * PUT /api/reviews/{reviewPublicId}
   * Requires: CUSTOMER
   */
  async updateReview(
    reviewPublicId: string,
    payload: UpdateReviewRequest
  ): Promise<ProductReviewItem> {
    if (!reviewPublicId?.trim()) {
      throw new ReviewApiError("Review Public ID is required", 400, "/api/reviews");
    }
    if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
      throw new ReviewApiError("Rating must be between 1 and 5", 400, "/api/reviews");
    }
    if (!payload.reviewComment?.trim()) {
      throw new ReviewApiError("Review comment is required", 400, "/api/reviews");
    }

    return this.request<ProductReviewItem>(
      `/api/reviews/${encodeURIComponent(reviewPublicId)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          rating: Number(payload.rating),
          reviewTitle: payload.reviewTitle?.trim() || undefined,
          reviewComment: payload.reviewComment.trim(),
        }),
      },
      true
    );
  }

  /**
   * API 3 — Delete Own Review
   * DELETE /api/reviews/{reviewPublicId}
   * Requires: CUSTOMER
   */
  async deleteReview(reviewPublicId: string): Promise<boolean> {
    if (!reviewPublicId?.trim()) {
      throw new ReviewApiError("Review Public ID is required", 400, "/api/reviews");
    }

    await this.request<void>(
      `/api/reviews/${encodeURIComponent(reviewPublicId)}`,
      {
        method: "DELETE",
      },
      true
    );
    return true;
  }

  /**
   * API 4 — Get My Reviews
   * GET /api/reviews/my-reviews?page=0&size=10&sort=createdAt,desc
   * Requires: CUSTOMER
   */
  async getMyReviews(
    page: number = 0,
    size: number = 10,
    sort: string = "createdAt,desc"
  ): Promise<PaginatedReviewsData> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
    });

    return this.request<PaginatedReviewsData>(
      `/api/reviews/my-reviews?${params.toString()}`,
      { method: "GET" },
      true
    );
  }

  /**
   * API 5 — Check My Review for a Product
   * GET /api/reviews/products/{productPublicId}/my-review
   * Requires: CUSTOMER
   * Returns ProductReviewItem or null if no active review exists
   */
  async getMyReviewForProduct(
    productPublicId: string
  ): Promise<ProductReviewItem | null> {
    if (!productPublicId?.trim()) return null;

    try {
      const data = await this.request<any>(
        `/api/reviews/products/${encodeURIComponent(productPublicId)}/my-review`,
        { method: "GET" },
        true
      );
      if (
        data &&
        typeof data === "object" &&
        typeof data.publicId === "string" &&
        data.publicId.trim().length > 0 &&
        (!data.productPublicId || data.productPublicId === productPublicId)
      ) {
        return data as ProductReviewItem;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * API 6 — Get Product Reviews
   * GET /api/reviews/products/{productPublicId}?page=0&size=10&sortBy=newest
   * Public endpoint
   */
  async getProductReviews(
    productPublicId: string,
    page: number = 0,
    size: number = 10,
    sortBy: ReviewSortOption = "newest"
  ): Promise<PaginatedReviewsData> {
    if (!productPublicId?.trim()) {
      return {
        content: [],
        pageNumber: 0,
        pageSize: size,
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
      };
    }

    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
    });

    return this.request<PaginatedReviewsData>(
      `/api/reviews/products/${encodeURIComponent(productPublicId)}?${params.toString()}`,
      { method: "GET" },
      false
    );
  }

  /**
   * API 7 — Get Product Rating Summary
   * GET /api/reviews/products/{productPublicId}/summary
   * Public endpoint
   */
  async getProductRatingSummary(
    productPublicId: string
  ): Promise<ProductRatingSummary | null> {
    if (!productPublicId?.trim()) return null;

    try {
      return await this.request<ProductRatingSummary>(
        `/api/reviews/products/${encodeURIComponent(productPublicId)}/summary`,
        { method: "GET" },
        false
      );
    } catch (err) {
      if (err instanceof ReviewApiError && err.statusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * API 8 — Bulk Product Rating Summaries
   * POST /api/reviews/products/summaries
   * Public endpoint, batches in chunks of at most 50 IDs
   */
  async getBulkRatingSummaries(
    productPublicIds: string[]
  ): Promise<ProductBulkRatingSummary[]> {
    const validIds = Array.from(
      new Set(productPublicIds.filter((id) => Boolean(id && id.trim())))
    );

    if (validIds.length === 0) return [];

    const CHUNK_SIZE = 50;
    const results: ProductBulkRatingSummary[] = [];

    for (let i = 0; i < validIds.length; i += CHUNK_SIZE) {
      const chunk = validIds.slice(i, i + CHUNK_SIZE);
      try {
        const batchRes = await this.request<ProductBulkRatingSummary[]>(
          "/api/reviews/products/summaries",
          {
            method: "POST",
            body: JSON.stringify({ productPublicIds: chunk }),
          },
          false
        );
        if (Array.isArray(batchRes)) {
          results.push(...batchRes);
        }
      } catch (err) {
        console.warn("[ReviewService] Failed to load rating summaries chunk:", err);
      }
    }

    return results;
  }
}

export const reviewService = new ReviewService();
