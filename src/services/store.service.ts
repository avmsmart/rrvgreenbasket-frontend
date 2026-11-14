/**
 * RRV Green Basket - Store Service
 * Integrates directly with Spring Boot Store Microservice (Port 8090 / API Gateway)
 * Covers Public Store Settings & Admin Store Branding & Asset Management (APIs 13–19)
 */

import {
  ApiResponse,
  PublicStoreSettings,
  AdminStoreSettings,
  UpdateStoreSettingsRequest,
  StoreAssetUploadResponse,
} from "@/types";
import { getAuthToken } from "./api-client";

export class StoreApiError extends Error {
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
    this.name = "StoreApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export class StoreService {
  /**
   * Resolves base URL for Store Service
   */
  public getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return "";
    }
    if (process.env.NEXT_PUBLIC_STORE_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_STORE_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    }
    return "http://localhost:8090";
  }

  /**
   * Internal HTTP request handler for Store Service
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAdminAuth: boolean = false
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (requireAdminAuth) {
      const token = getAuthToken();
      if (token) {
        const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
        headers["Authorization"] = `Bearer ${cleanToken}`;
      }
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
      throw new StoreApiError(
        `Failed to reach Store Service: ${err instanceof Error ? err.message : "Network error"}`,
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
        `Store Service returned HTTP ${response.status}`;
      throw new StoreApiError(
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
   * API 13 — Get Public Store Settings
   * GET /api/store/settings/public
   * Public endpoint, used globally across storefront header, footer, & meta
   */
  async getPublicSettings(): Promise<PublicStoreSettings> {
    return this.request<PublicStoreSettings>(
      "/api/store/settings/public",
      { method: "GET" },
      false
    );
  }

  /**
   * API 14 — Get Admin Store Settings
   * GET /api/admin/store/settings
   * Requires: ADMIN
   */
  async getAdminSettings(): Promise<AdminStoreSettings> {
    return this.request<AdminStoreSettings>(
      "/api/admin/store/settings",
      { method: "GET" },
      true
    );
  }

  /**
   * API 15 — Update Store Settings
   * PUT /api/admin/store/settings
   * Requires: ADMIN
   */
  async updateSettings(
    payload: UpdateStoreSettingsRequest
  ): Promise<AdminStoreSettings> {
    if (!payload.storeName?.trim()) {
      throw new StoreApiError("Store Name is required", 400, "/api/admin/store/settings");
    }

    return this.request<AdminStoreSettings>(
      "/api/admin/store/settings",
      {
        method: "PUT",
        body: JSON.stringify({
          storeName: payload.storeName.trim(),
          brandTagline: payload.brandTagline?.trim() || "",
          supportEmail: payload.supportEmail?.trim() || "",
          supportPhone: payload.supportPhone?.trim() || "",
          physicalAddress: payload.physicalAddress?.trim() || "",
          websiteUrl: payload.websiteUrl?.trim() || "",
        }),
      },
      true
    );
  }

  /**
   * API 16 — Upload Store Logo
   * POST /api/admin/store/assets/logo
   * Requires: ADMIN, multipart/form-data with "file"
   */
  async uploadLogo(file: File): Promise<StoreAssetUploadResponse> {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new StoreApiError(
        "Supported logo formats: PNG, JPG, JPEG, WEBP, SVG",
        400,
        "/api/admin/store/assets/logo"
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new StoreApiError(
        "Logo file size exceeds the 2 MB limit",
        400,
        "/api/admin/store/assets/logo"
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    return this.request<StoreAssetUploadResponse>(
      "/api/admin/store/assets/logo",
      {
        method: "POST",
        body: formData,
      },
      true
    );
  }

  /**
   * API 17 — Upload Favicon
   * POST /api/admin/store/assets/favicon
   * Requires: ADMIN, multipart/form-data with "file"
   */
  async uploadFavicon(file: File): Promise<StoreAssetUploadResponse> {
    const fileName = file.name.toLowerCase();
    const isIcoOrPng =
      fileName.endsWith(".ico") ||
      fileName.endsWith(".png") ||
      file.type === "image/x-icon" ||
      file.type === "image/vnd.microsoft.icon" ||
      file.type === "image/png";

    if (!isIcoOrPng) {
      throw new StoreApiError(
        "Supported favicon formats: ICO, PNG",
        400,
        "/api/admin/store/assets/favicon"
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new StoreApiError(
        "Favicon file size exceeds the 2 MB limit",
        400,
        "/api/admin/store/assets/favicon"
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    return this.request<StoreAssetUploadResponse>(
      "/api/admin/store/assets/favicon",
      {
        method: "POST",
        body: formData,
      },
      true
    );
  }

  /**
   * API 18 — Delete Store Logo
   * DELETE /api/admin/store/assets/logo
   * Requires: ADMIN
   */
  async deleteLogo(): Promise<boolean> {
    await this.request<void>(
      "/api/admin/store/assets/logo",
      { method: "DELETE" },
      true
    );
    return true;
  }

  /**
   * API 19 — Delete Favicon
   * DELETE /api/admin/store/assets/favicon
   * Requires: ADMIN
   */
  async deleteFavicon(): Promise<boolean> {
    await this.request<void>(
      "/api/admin/store/assets/favicon",
      { method: "DELETE" },
      true
    );
    return true;
  }
}

export const storeService = new StoreService();
