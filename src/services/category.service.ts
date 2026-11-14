/**
 * RRV Green Basket - Category Management Service
 *
 * Microservice: PRODUCT-SERVICE (Spring Boot)
 *
 * Administrative Endpoints (Require Admin Authentication):
 * 1. GET    /api/admin/products/categories                - Retrieve all categories (active & inactive)
 * 2. GET    /api/admin/products/categories/{publicId}     - Retrieve single category details
 * 3. POST   /api/admin/products/categories                - Create new category
 * 4. PUT    /api/admin/products/categories/{publicId}     - Update category
 * 5. PATCH  /api/admin/products/categories/{publicId}/status?isActive={true|false} - Activate / Deactivate
 *
 * Public Customer Endpoint (Authentication NOT Required):
 * 6. GET    /api/products/categories                      - Retrieve active categories only
 */

import { ApiError, getAuthToken, removeAuthToken } from "./api-client";
import {
  Category,
  ApiResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";

export class CategoryService {
  // In-memory cache for public customer category loading
  private publicCategoriesCache: Category[] | null = null;
  private publicCategoriesPromise: Promise<Category[]> | null = null;

  /**
   * Resolves the API base URL from project environment configuration
   */
  public getBaseUrl(): string {
    const envUrl =
      process.env.NEXT_PUBLIC_ADMIN_PRODUCT_API_BASE_URL ||
      process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, "");
    }
    return "http://localhost:8080";
  }

  /**
   * Builds request headers. Injects Authorization Bearer token unless skipAuth is true.
   */
  private getHeaders(skipAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
        if (cleanToken) {
          headers["Authorization"] = `Bearer ${cleanToken}`;
        }
      }
    }

    return headers;
  }

  /**
   * Centralized HTTP request dispatcher
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let cleanBaseUrl = baseUrl;
    if (cleanBaseUrl.endsWith("/api") && normalizedEndpoint.startsWith("/api/")) {
      cleanBaseUrl = cleanBaseUrl.slice(0, -4);
    }
    const url = `${cleanBaseUrl}${normalizedEndpoint}`;

    const headers = {
      ...this.getHeaders(skipAuth),
      ...((options.headers as Record<string, string>) || {}),
    };

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    // For public endpoints (skipAuth = true), strictly omit session cookies and credentials
    if (skipAuth) {
      fetchOptions.credentials = "omit";
    }

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network error contacting Category Service";
      throw new ApiError(
        `Unable to reach Category Service (${baseUrl}): ${message}`,
        0,
        null,
        true
      );
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      // Handle 401 Unauthorized for authenticated endpoints
      if (response.status === 401 && !skipAuth) {
        removeAuthToken();
        throw new ApiError(
          "Admin session expired or unauthorized. Please sign in again.",
          401,
          errorData
        );
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new ApiError(
          "Access denied. You do not have administrator permissions for category management.",
          403,
          errorData
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new ApiError(
          `Category not found: ${endpoint}`,
          404,
          errorData
        );
      }

      const message =
        errorData && typeof errorData === "object" && "message" in errorData
          ? String((errorData as { message: unknown }).message)
          : `Category API request failed with status ${response.status}`;

      throw new ApiError(message, response.status, errorData, false);
    }

    if (response.status === 204) {
      return (null as unknown) as T;
    }

    const json = await response.json();

    // Unwrap standard ApiResponse { success, message, data, timestamp }
    if (json && typeof json === "object" && "data" in json && "success" in json) {
      return json.data as T;
    }

    return json as T;
  }

  // =========================================================================
  // 1. GET ALL CATEGORIES (ADMIN)
  // Endpoint: GET /api/admin/products/categories
  // Retrieves all categories including active and inactive records.
  // =========================================================================
  public async getAllCategories(): Promise<Category[]> {
    const raw = await this.request<Category[] | ApiResponse<Category[]>>(
      "/api/admin/products/categories",
      { method: "GET" }
    );

    let list: unknown = raw;
    if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as any).data)) {
      list = (raw as any).data;
    }

    if (!Array.isArray(list)) {
      console.error("[CategoryService] Expected array from /api/admin/products/categories, got:", raw);
      return [];
    }

    // Preserve backend ordering without dropping inactive items
    return list.map((item) => this.normalizeCategory(item));
  }

  // =========================================================================
  // 2. GET CATEGORY BY PUBLIC ID (ADMIN)
  // Endpoint: GET /api/admin/products/categories/{publicId}
  // =========================================================================
  public async getCategoryByPublicId(publicId: string): Promise<Category> {
    if (!publicId || !publicId.trim()) {
      throw new ApiError("Category publicId is required.", 400);
    }

    const raw = await this.request<Category | ApiResponse<Category>>(
      `/api/admin/products/categories/${encodeURIComponent(publicId.trim())}`,
      { method: "GET" }
    );

    let item: unknown = raw;
    if (raw && typeof raw === "object" && "data" in raw && (raw as any).data) {
      item = (raw as any).data;
    }

    return this.normalizeCategory(item);
  }

  // =========================================================================
  // 3. CREATE CATEGORY (ADMIN)
  // Endpoint: POST /api/admin/products/categories
  // =========================================================================
  public async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const cleanName = (payload.name || "").trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      throw new ApiError("Category name is required (2–100 characters).", 400);
    }

    const body: Record<string, unknown> = {
      name: cleanName,
      sortOrder: typeof payload.sortOrder === "number" ? payload.sortOrder : 0,
      isActive: payload.isActive !== false,
    };

    if (payload.slug && payload.slug.trim()) {
      body.slug = payload.slug.trim();
    }

    if (payload.description !== undefined && payload.description !== null) {
      const cleanDesc = payload.description.trim();
      body.description = cleanDesc || null;
    }

    if (payload.imageUrl !== undefined && payload.imageUrl !== null) {
      const cleanImg = payload.imageUrl.trim();
      body.imageUrl = cleanImg || null;
    }

    const raw = await this.request<Category | ApiResponse<Category>>(
      "/api/admin/products/categories",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    // Invalidate public cache so customer views reflect newly added categories
    this.clearPublicCache();

    let item: unknown = raw;
    if (raw && typeof raw === "object" && "data" in raw && (raw as any).data) {
      item = (raw as any).data;
    }

    return this.normalizeCategory(item);
  }

  // =========================================================================
  // 4. UPDATE CATEGORY (ADMIN)
  // Endpoint: PUT /api/admin/products/categories/{publicId}
  // All fields (name, slug, description, imageUrl, sortOrder, isActive) are sent.
  // =========================================================================
  public async updateCategory(
    publicId: string,
    payload: UpdateCategoryPayload
  ): Promise<Category> {
    if (!publicId || !publicId.trim()) {
      throw new ApiError("Category publicId is required for update.", 400);
    }

    const cleanName = (payload.name || "").trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      throw new ApiError("Category name is required (2–100 characters).", 400);
    }

    const body: Record<string, unknown> = {
      name: cleanName,
      slug: (payload.slug || "").trim() || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: payload.description ? payload.description.trim() : null,
      imageUrl: payload.imageUrl ? payload.imageUrl.trim() : null,
      sortOrder: typeof payload.sortOrder === "number" ? payload.sortOrder : 0,
      isActive: payload.isActive !== false,
    };

    const raw = await this.request<Category | ApiResponse<Category>>(
      `/api/admin/products/categories/${encodeURIComponent(publicId.trim())}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );

    this.clearPublicCache();

    let item: unknown = raw;
    if (raw && typeof raw === "object" && "data" in raw && (raw as any).data) {
      item = (raw as any).data;
    }

    return this.normalizeCategory(item);
  }

  // =========================================================================
  // 5. ACTIVATE / DEACTIVATE CATEGORY (ADMIN)
  // Endpoint: PATCH /api/admin/products/categories/{publicId}/status?isActive={true|false}
  // isActive is passed strictly as a query parameter without a request body.
  // =========================================================================
  public async updateCategoryStatus(
    publicId: string,
    isActive: boolean
  ): Promise<Category> {
    if (!publicId || !publicId.trim()) {
      throw new ApiError("Category publicId is required.", 400);
    }

    const endpoint = `/api/admin/products/categories/${encodeURIComponent(
      publicId.trim()
    )}/status?isActive=${Boolean(isActive)}`;

    const raw = await this.request<Category | ApiResponse<Category>>(endpoint, {
      method: "PATCH",
    });

    this.clearPublicCache();

    let item: unknown = raw;
    if (raw && typeof raw === "object" && "data" in raw && (raw as any).data) {
      item = (raw as any).data;
    }

    return this.normalizeCategory(item);
  }

  // =========================================================================
  // 6. GET PUBLIC CATEGORIES (CUSTOMER / STOREFRONT)
  // Endpoint: GET /api/products/categories
  // Public endpoint - Authentication NOT required. Does NOT send admin tokens.
  // Returns active categories only.
  // =========================================================================
  public async getPublicCategories(forceRefresh = false): Promise<Category[]> {
    if (!forceRefresh && this.publicCategoriesCache && this.publicCategoriesCache.length > 0) {
      return this.publicCategoriesCache;
    }

    if (!forceRefresh && this.publicCategoriesPromise) {
      return this.publicCategoriesPromise;
    }

    this.publicCategoriesPromise = (async () => {
      try {
        const raw = await this.request<Category[] | ApiResponse<Category[]>>(
          "/api/products/categories",
          { method: "GET" },
          true // skipAuth = true: strictly no Bearer token, credentials: "omit"
        );

        let list: unknown = raw;
        if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as any).data)) {
          list = (raw as any).data;
        }

        if (!Array.isArray(list)) {
          console.error("[CategoryService] Expected array from /api/products/categories, got:", raw);
          return [];
        }

        const normalized = list
          .map((item) => this.normalizeCategory(item))
          .filter((c) => c.isActive !== false)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        this.publicCategoriesCache = normalized;
        return normalized;
      } catch (err) {
        this.publicCategoriesCache = null;
        throw err;
      } finally {
        this.publicCategoriesPromise = null;
      }
    })();

    return this.publicCategoriesPromise;
  }

  /**
   * Clears the in-memory public categories cache
   */
  public clearPublicCache(): void {
    this.publicCategoriesCache = null;
    this.publicCategoriesPromise = null;
  }

  /**
   * Helper that validates and ensures all 9 backend fields are properly formatted
   */
  private normalizeCategory(item: unknown): Category {
    if (!item || typeof item !== "object") {
      throw new ApiError("Invalid category response format received from backend.", 500);
    }

    const c = item as Record<string, unknown>;
    const publicId = typeof c.publicId === "string" ? c.publicId.trim() : "";
    const name = typeof c.name === "string" ? c.name.trim() : "Unnamed Category";
    const slug = typeof c.slug === "string" ? c.slug.trim() : publicId;
    const description = typeof c.description === "string" ? c.description : null;
    const imageUrl = typeof c.imageUrl === "string" ? c.imageUrl : null;
    const sortOrder = typeof c.sortOrder === "number" ? c.sortOrder : 0;
    const isActive = c.isActive !== false;
    const createdAt = typeof c.createdAt === "string" ? c.createdAt : new Date().toISOString();
    const updatedAt = typeof c.updatedAt === "string" ? c.updatedAt : createdAt;

    return {
      publicId,
      name,
      slug,
      description,
      imageUrl,
      sortOrder,
      isActive,
      createdAt,
      updatedAt,
    };
  }
}

export const categoryService = new CategoryService();
