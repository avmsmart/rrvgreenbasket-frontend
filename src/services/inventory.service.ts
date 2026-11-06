/**
 * RRV Green Basket - Inventory Management Service
 *
 * Microservice: INVENTORY-SERVICE (Spring Boot)
 * Admin Prefix: /api/admin/inventory
 * Customer Prefix: /api/inventory
 *
 * REST Endpoints:
 * 1.  GET    /api/admin/inventory                         - Paginated inventory stock records with filters
 * 2.  GET    /api/admin/inventory/{productPublicId}       - Single product inventory details
 * 3.  PUT    /api/admin/inventory/{productPublicId}/initialize - Initialize single product stock
 * 4.  POST   /api/admin/inventory/initialize              - Bulk initialize products stock
 * 5.  POST   /api/admin/inventory/stock-in                - Record inward stock (Purchase/Harvest/Return)
 * 6.  POST   /api/admin/inventory/stock-out               - Record outward stock (Damage/Spoilage/Internal)
 * 7.  POST   /api/admin/inventory/adjustments             - Stock adjustment (Relative +/- or Absolute physical)
 * 8.  PUT    /api/admin/inventory/{productPublicId}/correct-initial - Correct opening/initial stock
 * 9.  PATCH  /api/admin/inventory/{productPublicId}/threshold - Update low stock threshold
 * 10. GET    /api/admin/inventory/movements               - Stock movement audit history with filters
 * 11. GET    /api/admin/inventory/alerts                  - Stock alerts (LOW_STOCK, OUT_OF_STOCK)
 * 12. PATCH  /api/admin/inventory/alerts/{alertPublicId}/acknowledge - Acknowledge alert
 * 13. GET    /api/inventory/products/{productPublicId}/availability - Customer stock availability
 *
 * STRICT RESTRICTION: Internal endpoints (/api/internal/inventory/...) are NEVER invoked from frontend.
 */

import { apiClient, ApiError, getAuthToken, removeAuthToken } from "./api-client";
import { adminProductService } from "./product.service";
import {
  InventoryDetailResponse,
  InventoryPageData,
  InventoryQueryParams,
  InitializeInventoryPayload,
  BulkInitializePayload,
  StockInPayload,
  StockOutPayload,
  StockAdjustmentPayload,
  StockAdjustmentRelativePayload,
  StockAdjustmentAbsolutePayload,
  CorrectInitialStockPayload,
  UpdateThresholdPayload,
  StockMovementResponse,
  StockMovementsQueryParams,
  StockMovementsPageData,
  StockAlertResponse,
  StockAlertsQueryParams,
  StockAlertsPageData,
  StockAvailabilityResponse,
  EnrichedInventoryItem,
  InventoryOverviewStats,
  InventoryItem,
  LowStockAlert,
  AdminProduct,
  Product,
} from "@/types";

export class InventoryService {
  // In-memory cache for product catalog lookup to enrich inventory items
  private productCache: Map<string, Product | AdminProduct> = new Map();
  private productCacheTimestamp = 0;
  private readonly CACHE_TTL_MS = 60000; // 1 minute

  /**
   * Dedicated base URL resolution for Inventory Microservice
   */
  public getBaseUrl(): string {
    const envUrl =
      process.env.NEXT_PUBLIC_INVENTORY_API_BASE_URL ||
      process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, "");
    }
    return "http://localhost:8080";
  }

  /**
   * Helper headers builder injecting JWT Bearer token
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const token = getAuthToken();
    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      if (cleanToken) {
        headers["Authorization"] = `Bearer ${cleanToken}`;
      }
    }
    return headers;
  }

  /**
   * Internal HTTP request dispatcher
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let cleanBaseUrl = baseUrl;
    if (cleanBaseUrl.endsWith("/api") && normalizedEndpoint.startsWith("/api/")) {
      cleanBaseUrl = cleanBaseUrl.slice(0, -4);
    }
    const url = `${cleanBaseUrl}${normalizedEndpoint}`;

    const headers = {
      ...this.getHeaders(),
      ...((options.headers as Record<string, string>) || {}),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network error contacting inventory service";
      throw new ApiError(
        `Unable to reach Inventory service (${baseUrl}): ${message}`,
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

      if (response.status === 401) {
        removeAuthToken();
        throw new ApiError(
          "Admin session expired or unauthorized. Please sign in again.",
          401,
          errorData
        );
      }

      if (response.status === 403) {
        throw new ApiError(
          "Access denied. You do not have permissions for inventory management.",
          403,
          errorData
        );
      }

      if (response.status === 404) {
        throw new ApiError(
          `Inventory record not found: ${endpoint}`,
          404,
          errorData
        );
      }

      const message =
        errorData && typeof errorData === "object" && "message" in errorData
          ? String((errorData as { message: unknown }).message)
          : `Inventory API request failed with status ${response.status}`;

      throw new ApiError(message, response.status, errorData, false);
    }

    if (response.status === 204) {
      return (null as unknown) as T;
    }

    const json = await response.json();

    // Unwrap standard ApiResponse { success, data, message } envelope
    if (json && typeof json === "object" && "data" in json && "success" in json) {
      return json.data as T;
    }

    return json as T;
  }

  // =========================================================================
  // 1. GET /api/admin/inventory - List stock records
  // =========================================================================
  public async getInventory(params?: InventoryQueryParams): Promise<InventoryPageData> {
    const searchParams = new URLSearchParams();

    const pageIndex = params?.page !== undefined ? Math.max(0, params.page) : 0;
    searchParams.append("page", String(pageIndex));
    searchParams.append("size", String(params?.size || 20));

    if (params?.productPublicId) {
      searchParams.append("productPublicId", params.productPublicId.trim());
    }
    if (params?.unitOfMeasure) {
      searchParams.append("unitOfMeasure", params.unitOfMeasure.trim());
    }
    if (params?.stockStatus && params.stockStatus !== "All") {
      searchParams.append("stockStatus", params.stockStatus.trim());
    }
    if (params?.initialized !== undefined && params.initialized !== "All") {
      searchParams.append("initialized", String(params.initialized));
    }
    if (params?.sort) {
      searchParams.append("sort", params.sort);
    }
    if (params?.search) {
      searchParams.append("search", params.search.trim());
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/admin/inventory${queryString ? `?${queryString}` : ""}`;
    const result = await this.request<InventoryPageData | InventoryDetailResponse[]>(endpoint, {
      method: "GET",
    });

    // Normalize if backend returned an array instead of a Spring Page
    if (Array.isArray(result)) {
      return {
        content: result,
        pageNumber: pageIndex,
        pageSize: params?.size || 20,
        totalElements: result.length,
        totalPages: Math.ceil(result.length / (params?.size || 20)) || 1,
        first: pageIndex === 0,
        last: true,
      };
    }

    return result;
  }

  // =========================================================================
  // 2. GET /api/admin/inventory/{productPublicId} - Single product inventory
  // =========================================================================
  public async getInventoryByProduct(
    productPublicId: string
  ): Promise<InventoryDetailResponse> {
    return this.request<InventoryDetailResponse>(
      `/api/admin/inventory/${encodeURIComponent(productPublicId.trim())}`,
      { method: "GET" }
    );
  }

  // =========================================================================
  // 3. PUT /api/admin/inventory/{productPublicId}/initialize - Single product init
  // =========================================================================
  public async initializeStock(
    productPublicId: string,
    payload: InitializeInventoryPayload
  ): Promise<InventoryDetailResponse> {
    return this.request<InventoryDetailResponse>(
      `/api/admin/inventory/${encodeURIComponent(productPublicId.trim())}/initialize`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  }

  // =========================================================================
  // 4. POST /api/admin/inventory/initialize - Bulk initialize stock
  // =========================================================================
  public async bulkInitializeStock(
    payload: BulkInitializePayload
  ): Promise<InventoryDetailResponse[]> {
    return this.request<InventoryDetailResponse[]>(
      "/api/admin/inventory/initialize",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  // =========================================================================
  // 5. POST /api/admin/inventory/stock-in - Record inward stock
  // =========================================================================
  public async stockIn(
    payload: StockInPayload
  ): Promise<StockMovementResponse | InventoryDetailResponse> {
    return this.request<StockMovementResponse | InventoryDetailResponse>(
      "/api/admin/inventory/stock-in",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  // =========================================================================
  // 6. POST /api/admin/inventory/stock-out - Record outward stock
  // =========================================================================
  public async stockOut(
    payload: StockOutPayload
  ): Promise<StockMovementResponse | InventoryDetailResponse> {
    return this.request<StockMovementResponse | InventoryDetailResponse>(
      "/api/admin/inventory/stock-out",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  // =========================================================================
  // 7. POST /api/admin/inventory/adjustments - Stock adjustment (Relative/Absolute)
  // =========================================================================
  public async adjustStock(
    payload: StockAdjustmentPayload
  ): Promise<StockMovementResponse | InventoryDetailResponse> {
    // Sanitize payload: never send both adjustmentQuantity and newPhysicalQuantity
    const sanitizedPayload: Record<string, unknown> = {
      productPublicId: payload.productPublicId,
      unitOfMeasure: payload.unitOfMeasure,
      reason: payload.reason,
    };

    if (payload.notes) {
      sanitizedPayload.notes = payload.notes;
    }

    if ("adjustmentQuantity" in payload && typeof payload.adjustmentQuantity === "number") {
      sanitizedPayload.adjustmentQuantity = payload.adjustmentQuantity;
    } else if ("newPhysicalQuantity" in payload && typeof payload.newPhysicalQuantity === "number") {
      sanitizedPayload.newPhysicalQuantity = payload.newPhysicalQuantity;
    }

    return this.request<StockMovementResponse | InventoryDetailResponse>(
      "/api/admin/inventory/adjustments",
      {
        method: "POST",
        body: JSON.stringify(sanitizedPayload),
      }
    );
  }

  // =========================================================================
  // 8. PUT /api/admin/inventory/{productPublicId}/correct-initial - Correct initial stock
  // =========================================================================
  public async correctInitialStock(
    productPublicId: string,
    payload: CorrectInitialStockPayload
  ): Promise<InventoryDetailResponse> {
    return this.request<InventoryDetailResponse>(
      `/api/admin/inventory/${encodeURIComponent(productPublicId.trim())}/correct-initial`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  }

  // =========================================================================
  // 9. PATCH /api/admin/inventory/{productPublicId}/threshold - Update threshold
  // =========================================================================
  public async updateThreshold(
    productPublicId: string,
    lowStockThreshold: number
  ): Promise<InventoryDetailResponse> {
    const payload: UpdateThresholdPayload = { lowStockThreshold };
    return this.request<InventoryDetailResponse>(
      `/api/admin/inventory/${encodeURIComponent(productPublicId.trim())}/threshold`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  }

  // =========================================================================
  // 10. GET /api/admin/inventory/movements - Stock movement audit log
  // =========================================================================
  public async getStockMovements(
    params?: StockMovementsQueryParams
  ): Promise<StockMovementsPageData> {
    const searchParams = new URLSearchParams();

    const pageIndex = params?.page !== undefined ? Math.max(0, params.page) : 0;
    searchParams.append("page", String(pageIndex));
    searchParams.append("size", String(params?.size || 20));

    if (params?.productPublicId) {
      searchParams.append("productPublicId", params.productPublicId.trim());
    }
    if (params?.movementType && params.movementType !== "All") {
      searchParams.append("movementType", params.movementType.trim());
    }
    if (params?.referenceId) {
      searchParams.append("referenceId", params.referenceId.trim());
    }
    if (params?.startDate) {
      searchParams.append("startDate", params.startDate.trim());
    }
    if (params?.endDate) {
      searchParams.append("endDate", params.endDate.trim());
    }
    if (params?.sort) {
      searchParams.append("sort", params.sort);
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/admin/inventory/movements${queryString ? `?${queryString}` : ""}`;
    const result = await this.request<StockMovementsPageData | StockMovementResponse[]>(endpoint, {
      method: "GET",
    });

    if (Array.isArray(result)) {
      return {
        content: result,
        pageNumber: pageIndex,
        pageSize: params?.size || 20,
        totalElements: result.length,
        totalPages: Math.ceil(result.length / (params?.size || 20)) || 1,
        first: pageIndex === 0,
        last: true,
      };
    }

    return result;
  }

  // =========================================================================
  // 11. GET /api/admin/inventory/alerts - Stock alerts
  // =========================================================================
  public async getStockAlerts(
    params?: StockAlertsQueryParams
  ): Promise<StockAlertsPageData> {
    const searchParams = new URLSearchParams();

    const pageIndex = params?.page !== undefined ? Math.max(0, params.page) : 0;
    searchParams.append("page", String(pageIndex));
    searchParams.append("size", String(params?.size || 20));

    if (params?.productPublicId) {
      searchParams.append("productPublicId", params.productPublicId.trim());
    }
    if (params?.alertType && params.alertType !== "All") {
      searchParams.append("alertType", params.alertType.trim());
    }
    if (params?.alertStatus && params.alertStatus !== "All") {
      searchParams.append("alertStatus", params.alertStatus.trim());
    }
    if (params?.sort) {
      searchParams.append("sort", params.sort);
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/admin/inventory/alerts${queryString ? `?${queryString}` : ""}`;
    const result = await this.request<StockAlertsPageData | StockAlertResponse[]>(endpoint, {
      method: "GET",
    });

    if (Array.isArray(result)) {
      return {
        content: result,
        pageNumber: pageIndex,
        pageSize: params?.size || 20,
        totalElements: result.length,
        totalPages: Math.ceil(result.length / (params?.size || 20)) || 1,
        first: pageIndex === 0,
        last: true,
      };
    }

    return result;
  }

  // =========================================================================
  // 12. PATCH /api/admin/inventory/alerts/{alertPublicId}/acknowledge
  // =========================================================================
  public async acknowledgeStockAlert(
    alertPublicId: string
  ): Promise<StockAlertResponse> {
    return this.request<StockAlertResponse>(
      `/api/admin/inventory/alerts/${encodeURIComponent(alertPublicId.trim())}/acknowledge`,
      { method: "PATCH" }
    );
  }

  // =========================================================================
  // 13. GET /api/inventory/products/{productPublicId}/availability (Customer)
  // =========================================================================
  public async getProductAvailability(
    productPublicId: string,
    quantity?: number
  ): Promise<StockAvailabilityResponse> {
    const searchParams = new URLSearchParams();
    if (quantity !== undefined && quantity > 0) {
      searchParams.append("quantity", String(quantity));
    }
    const queryString = searchParams.toString();
    const endpoint = `/api/inventory/products/${encodeURIComponent(
      productPublicId.trim()
    )}/availability${queryString ? `?${queryString}` : ""}`;

    return this.request<StockAvailabilityResponse>(endpoint, { method: "GET" });
  }

  // =========================================================================
  // Helper: Load product catalog cache for bulk joining (avoids N+1 calls)
  // =========================================================================
  public async getProductCatalogMap(forceRefresh = false): Promise<Map<string, Product | AdminProduct>> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.productCache.size > 0 &&
      now - this.productCacheTimestamp < this.CACHE_TTL_MS
    ) {
      return this.productCache;
    }

    try {
      // Fetch up to 100 products from Product Service
      const productPage = await adminProductService.getProducts({ page: 0, size: 100 });
      if (productPage?.content && Array.isArray(productPage.content)) {
        this.productCache.clear();
        for (const p of productPage.content) {
          if (p.publicId) {
            this.productCache.set(p.publicId, p);
          }
        }
        this.productCacheTimestamp = now;
      }
    } catch (err) {
      console.warn("[InventoryService] Product catalog fetch failed for inventory joining:", err);
    }

    return this.productCache;
  }

  // =========================================================================
  // 14. Enriched Inventory Fetcher: Joins Inventory records with Product Service
  // =========================================================================
  public async getEnrichedInventory(
    params?: InventoryQueryParams
  ): Promise<{
    items: EnrichedInventoryItem[];
    pageData: InventoryPageData;
    stats: InventoryOverviewStats;
  }> {
    // Run inventory query and product catalog fetch in parallel
    const [inventoryPage, productMap, alertsPage] = await Promise.all([
      this.getInventory(params),
      this.getProductCatalogMap(),
      this.getStockAlerts({ alertStatus: "ACTIVE", size: 100 }).catch(() => ({
        content: [],
        totalElements: 0,
        totalPages: 0,
      })),
    ]);

    const inventoryItems = inventoryPage?.content || [];

    // Join each inventory record with its matching product by productPublicId (UUID)
    const items: EnrichedInventoryItem[] = inventoryItems.map((inv) => {
      const matchedProduct = inv.productPublicId
        ? (productMap.get(inv.productPublicId) as Product | undefined)
        : undefined;

      return {
        inventory: inv,
        product: matchedProduct,
      };
    });

    // Compute aggregated overview statistics
    let initializedCount = 0;
    let uninitializedCount = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalPhysical = 0;
    let totalAvailable = 0;
    let totalReserved = 0;

    for (const item of items) {
      const inv = item.inventory;
      if (inv.initialized) {
        initializedCount++;
      } else {
        uninitializedCount++;
      }

      const status = (inv.stockStatus || "").toUpperCase();
      if (status === "IN_STOCK") {
        inStockCount++;
      } else if (status === "LOW_STOCK") {
        lowStockCount++;
      } else if (status === "OUT_OF_STOCK") {
        outOfStockCount++;
      }

      totalPhysical += inv.physicalQuantity || 0;
      totalAvailable += inv.availableQuantity || 0;
      totalReserved += inv.reservedQuantity || 0;
    }

    const stats: InventoryOverviewStats = {
      totalItems: inventoryPage.totalElements || items.length,
      initializedCount,
      uninitializedCount,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      activeAlertsCount: alertsPage.totalElements || 0,
      totalPhysicalQuantity: totalPhysical,
      totalAvailableQuantity: totalAvailable,
      totalReservedQuantity: totalReserved,
    };

    return {
      items,
      pageData: inventoryPage,
      stats,
    };
  }

  // =========================================================================
  // Legacy Backward Compatibility methods
  // =========================================================================
  public async getLowStockAlerts(): Promise<LowStockAlert[]> {
    try {
      const alerts = await this.getStockAlerts({ alertStatus: "ACTIVE", size: 50 });
      return (alerts.content || []).map((a) => ({
        id: a.publicId,
        productName: `Product (${a.productPublicId.slice(0, 8)}...)`,
        currentStock: `${a.currentQuantity} ${a.unitOfMeasure}`,
        minStock: `${a.thresholdQuantity} ${a.unitOfMeasure}`,
        needed: `${Math.max(0, a.thresholdQuantity - a.currentQuantity)} ${a.unitOfMeasure}`,
        productPublicId: a.productPublicId,
      }));
    } catch {
      return [];
    }
  }

  public async updateStock(
    inventoryId: string,
    currentStock: number,
    note?: string
  ): Promise<InventoryDetailResponse> {
    return this.adjustStock({
      productPublicId: inventoryId,
      newPhysicalQuantity: currentStock,
      unitOfMeasure: "KG",
      reason: "AUDIT",
      notes: note,
    }) as Promise<InventoryDetailResponse>;
  }

  public async recordStockInward(
    inventoryId: string,
    addedQuantity: number,
    supplier?: string
  ): Promise<InventoryDetailResponse> {
    return this.stockIn({
      productPublicId: inventoryId,
      quantity: addedQuantity,
      unitOfMeasure: "KG",
      reason: "PURCHASE",
      notes: supplier ? `Supplier: ${supplier}` : undefined,
    }) as Promise<InventoryDetailResponse>;
  }
}

export const inventoryService = new InventoryService();
