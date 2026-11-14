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
  BulkInitializeItem,
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
    payload: BulkInitializePayload | BulkInitializeItem[]
  ): Promise<InventoryDetailResponse[]> {
    const rawItems = Array.isArray(payload) ? payload : payload.items;
    const normalizedItems = rawItems.map((item) => ({
      productPublicId: item.productPublicId,
      unitOfMeasure: item.unitOfMeasure,
      initialQuantity: (item as any).initialQuantity ?? item.initialPhysicalQuantity ?? 0,
      initialPhysicalQuantity: item.initialPhysicalQuantity ?? (item as any).initialQuantity ?? 0,
      lowStockThreshold: item.lowStockThreshold ?? 10,
      reason: item.reason || "INITIAL_STOCK",
      notes: item.notes || "Initial master product stock onboarding",
    }));

    try {
      return await this.request<InventoryDetailResponse[]>(
        "/api/admin/inventory/initialize",
        {
          method: "POST",
          body: JSON.stringify({ items: normalizedItems }),
        }
      );
    } catch (err: any) {
      // If endpoint expected a top-level array instead of { items: [...] }
      if (err.status === 400 || err.status === 404 || err.status === 405) {
        try {
          return await this.request<InventoryDetailResponse[]>(
            "/api/admin/inventory/initialize",
            {
              method: "POST",
              body: JSON.stringify(normalizedItems),
            }
          );
        } catch {
          // If bulk endpoint is unmapped on backend, fallback to individual parallel initializations
          return await Promise.all(
            normalizedItems.map((it) =>
              this.initializeStock(it.productPublicId, {
                unitOfMeasure: it.unitOfMeasure,
                initialQuantity: it.initialQuantity,
                lowStockThreshold: it.lowStockThreshold,
                reason: it.reason,
                notes: it.notes,
              })
            )
          );
        }
      }
      throw err;
    }
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
      const allProducts = await adminProductService.getAllProducts();
      if (Array.isArray(allProducts) && allProducts.length > 0) {
        this.productCache.clear();
        for (const p of allProducts) {
          if (p.publicId) {
            this.productCache.set(p.publicId, p);
          }
        }
        this.productCacheTimestamp = now;
      }
    } catch (err) {
      console.warn("[InventoryService] Product catalog fetch failed for inventory joining:", err);
      throw err;
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
    allItems: EnrichedInventoryItem[];
    pageData: InventoryPageData;
    stats: InventoryOverviewStats;
  }> {
    // 1. Fetch Product Catalog (all products from Product Service)
    let products: AdminProduct[] = [];
    let productError: Error | null = null;
    try {
      products = await adminProductService.getAllProducts();
      if (Array.isArray(products)) {
        this.productCache.clear();
        for (const p of products) {
          if (p.publicId) {
            this.productCache.set(p.publicId, p);
          }
        }
        this.productCacheTimestamp = Date.now();
      }
    } catch (err: any) {
      console.error("[InventoryService] Failed to load products from Product Service:", err);
      productError = err;
    }

    // 2. Fetch Inventory Records from Inventory Service
    let inventoryPage: InventoryPageData | null = null;
    let inventoryError: Error | null = null;
    try {
      inventoryPage = await this.getInventory({ page: 0, size: 500 });
    } catch (err: any) {
      console.error("[InventoryService] Failed to load inventory from Inventory Service:", err);
      inventoryError = err;
    }

    // If Product Service failed and we have no products, throw clear error
    if (productError && products.length === 0) {
      throw new ApiError(
        `Product Service Error: ${productError.message || "Failed to load product catalogue"}. Please verify Product Service is running.`,
        (productError as any).status || 500,
        null
      );
    }

    // If Inventory Service failed, throw clear error
    if (inventoryError) {
      throw new ApiError(
        `Inventory Service Error: ${inventoryError.message || "Failed to load inventory records"}. Please verify Inventory Service is running.`,
        (inventoryError as any).status || 500,
        null
      );
    }

    // 3. Fetch Active Alerts (optional, don't fail page if alerts endpoint fails)
    let activeAlertsCount = 0;
    try {
      const alerts = await this.getStockAlerts({ alertStatus: "ACTIVE", size: 100 });
      activeAlertsCount = alerts?.totalElements || alerts?.content?.length || 0;
    } catch {
      // Non-fatal
    }

    const inventoryRecords: InventoryDetailResponse[] = inventoryPage?.content || [];

    // 4. Merge Products with Inventory Records using mergeProductsWithInventory
    const allMergedItems = mergeProductsWithInventory(products, inventoryRecords);

    // 5. Calculate statistics from actual merged data
    const stats = calculateInventoryStats(allMergedItems, activeAlertsCount);

    // 6. Apply filters to merged items
    let filteredItems = allMergedItems;

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filteredItems = filteredItems.filter((item) => {
        const name = (item.product?.name || (item.product as any)?.excelName || "").toLowerCase();
        const pId = (item.inventory.productPublicId || "").toLowerCase();
        const cat = (
          typeof item.product?.category === "string"
            ? item.product.category
            : (item.product?.category as any)?.name || ""
        ).toLowerCase();
        return name.includes(q) || pId.includes(q) || cat.includes(q);
      });
    }

    if (params?.stockStatus && params.stockStatus !== "All") {
      const filterStatus = params.stockStatus.toUpperCase();
      filteredItems = filteredItems.filter((item) => {
        const status = (item.inventory.stockStatus || "").toUpperCase();
        return status === filterStatus;
      });
    }

    if (params?.unitOfMeasure && params.unitOfMeasure !== "All") {
      const unit = params.unitOfMeasure.toUpperCase();
      filteredItems = filteredItems.filter((item) => {
        return (item.inventory.unitOfMeasure || "").toUpperCase() === unit;
      });
    }

    if (params?.initialized !== undefined && params.initialized !== "All") {
      const isInit = String(params.initialized) === "true";
      filteredItems = filteredItems.filter((item) => {
        return item.inventory.initialized === isInit;
      });
    }

    // 7. Paginate filtered items
    const page = params?.page !== undefined ? Math.max(0, params.page) : 0;
    const size = params?.size || 20;
    const startIndex = page * size;
    const pagedItems = filteredItems.slice(startIndex, startIndex + size);

    const pageData: InventoryPageData = {
      content: pagedItems.map((i) => i.inventory),
      pageNumber: page,
      pageSize: size,
      totalElements: filteredItems.length,
      totalPages: Math.ceil(filteredItems.length / size) || 1,
      first: page === 0,
      last: startIndex + size >= filteredItems.length,
    };

    return {
      items: pagedItems,
      allItems: allMergedItems,
      pageData,
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

/**
 * Merges Product Service catalogue records with Inventory Service stock records.
 * Matches using: product.publicId === inventory.productPublicId
 *
 * Rules:
 * - Product Service is the source of truth for all products in the catalogue.
 * - Inventory Service is the source of truth for warehouse stock records.
 * - Products without inventory records are mapped with initialized: false and stockStatus: 'NOT_INITIALIZED'.
 * - Never create fake inventory or automatically initialize stock.
 * - Never remove products simply because inventory does not exist.
 */
export function mergeProductsWithInventory(
  products: (AdminProduct | Product)[],
  inventoryRecords: InventoryDetailResponse[]
): EnrichedInventoryItem[] {
  const inventoryMap = new Map<string, InventoryDetailResponse>();
  for (const inv of inventoryRecords) {
    if (inv && inv.productPublicId) {
      inventoryMap.set(String(inv.productPublicId).toLowerCase().trim(), inv);
    }
  }

  const matchedInventoryIds = new Set<string>();
  const merged: EnrichedInventoryItem[] = [];

  for (const prod of products) {
    if (!prod) continue;
    const pubId = String(prod.publicId || (prod as any).id || "").trim();
    if (!pubId) continue;

    const key = pubId.toLowerCase();
    const inv = inventoryMap.get(key);

    const configuredUnit =
      (prod as any).quantityUnit ||
      (prod as any).unit ||
      "KG";

    if (inv) {
      matchedInventoryIds.add(key);
      merged.push({
        inventory: {
          ...inv,
          productPublicId: inv.productPublicId || pubId,
          unitOfMeasure: inv.unitOfMeasure || configuredUnit,
          initialized: inv.initialized !== undefined ? inv.initialized : true,
          stockStatus:
            inv.stockStatus ||
            (inv.availableQuantity <= 0
              ? "OUT_OF_STOCK"
              : inv.availableQuantity <= inv.lowStockThreshold
              ? "LOW_STOCK"
              : "IN_STOCK"),
        },
        product: prod as Product,
      });
    } else {
      // Product in catalogue without inventory record
      merged.push({
        inventory: {
          publicId: "",
          productPublicId: pubId,
          unitOfMeasure: configuredUnit,
          physicalQuantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          lowStockThreshold: 10,
          initialized: false,
          stockStatus: "NOT_INITIALIZED",
        },
        product: prod as Product,
      });
    }
  }

  // Edge case: inventory records that don't match any product in catalog
  for (const inv of inventoryRecords) {
    if (inv && inv.productPublicId) {
      const key = String(inv.productPublicId).toLowerCase().trim();
      if (!matchedInventoryIds.has(key)) {
        merged.push({
          inventory: inv,
          product: undefined,
        });
      }
    }
  }

  return merged;
}

/**
 * Calculates dashboard statistics from actual merged product and inventory records.
 * Makes strict distinction between Total Product catalogue count and Initialized inventory count.
 */
export function calculateInventoryStats(
  items: EnrichedInventoryItem[],
  activeAlertsCount: number = 0
): InventoryOverviewStats {
  const totalItems = items.length;
  let initializedCount = 0;
  let uninitializedCount = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalPhysicalQuantity = 0;
  let totalAvailableQuantity = 0;
  let totalReservedQuantity = 0;

  for (const item of items) {
    const inv = item.inventory;
    if (inv.initialized) {
      initializedCount++;
      const status = (inv.stockStatus || "").toUpperCase();
      if (status === "IN_STOCK" || status === "IN STOCK") {
        inStockCount++;
      } else if (status === "LOW_STOCK" || status === "LOW STOCK") {
        lowStockCount++;
      } else if (status === "OUT_OF_STOCK" || status === "OUT OF STOCK") {
        outOfStockCount++;
      }
      totalPhysicalQuantity += Number(inv.physicalQuantity) || 0;
      totalAvailableQuantity += Number(inv.availableQuantity) || 0;
      totalReservedQuantity += Number(inv.reservedQuantity) || 0;
    } else {
      uninitializedCount++;
    }
  }

  return {
    totalItems,
    initializedCount,
    uninitializedCount,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    activeAlertsCount,
    totalPhysicalQuantity,
    totalAvailableQuantity,
    totalReservedQuantity,
  };
}
