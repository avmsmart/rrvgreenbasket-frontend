/**
 * RRV Green Basket - Order Management Service
 * Integrates directly with Spring Boot Order Microservice via API Gateway:
 * - Public: /api/orders/operating-window
 * - Customer: /api/orders/** (JWT Authenticated)
 * - Admin: /api/admin/orders/** (Admin JWT Authenticated)
 */

import {
  OrderResponse,
  CreateOrderRequest,
  CancelOrderRequest,
  UpdateOrderStatusRequest,
  OrderBusinessSettingsResponse,
  UpdateOrderSettingsRequest,
  OrderStatisticsResponse,
  AdminOrderQueryParams,
  BackendOrderStatus,
  PageResponse,
  Order,
  OrderStatus,
  OrderStatsSummary,
} from "@/types";
import { getAuthToken } from "./api-client";
import { customerTokenStorage } from "./customer-auth.service";

export class OrderApiError extends Error {
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
    this.name = "OrderApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

class OrderService {
  public getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return "";
    }
    if (process.env.NEXT_PUBLIC_ORDER_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_ORDER_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    }
    return "http://192.168.0.138:8080";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAdminAuth = false
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (requiresAdminAuth) {
      const adminToken = getAuthToken();
      if (adminToken) {
        const clean = adminToken.replace(/^Bearer\s+/i, "").trim();
        headers["Authorization"] = `Bearer ${clean}`;
      }
    } else {
      const customerToken = customerTokenStorage.getAccessToken();
      if (customerToken) {
        const clean = customerToken.replace(/^Bearer\s+/i, "").trim();
        headers["Authorization"] = `Bearer ${clean}`;
      }
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
        ? "Order service request timed out. Please try again."
        : err instanceof Error
        ? `Unable to reach Order Service: ${err.message}`
        : "Unable to reach Order Service. Please check your connection.";
      throw new OrderApiError(message, 0, endpoint, err);
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
          : `Order API failed with status ${response.status}: ${response.statusText}`;

      throw new OrderApiError(message, response.status, endpoint, errorData);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const json = await response.json();
    if (json && typeof json === "object" && "data" in json) {
      return (json as { data: T }).data;
    }
    return json as T;
  }

  // ==========================================================================
  // Public Order APIs
  // ==========================================================================

  /**
   * GET /api/orders/operating-window
   * Check daily operating hours and current order acceptance status
   */
  async getOperatingWindow(): Promise<OrderBusinessSettingsResponse> {
    return this.request<OrderBusinessSettingsResponse>(
      "/api/orders/operating-window",
      { method: "GET", cache: "no-store" }
    );
  }

  // ==========================================================================
  // Customer Order APIs (Customer JWT Authenticated)
  // ==========================================================================

  /**
   * POST /api/orders
   * Place a new order with items from active cart and delivery address
   */
  async createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const idempotencyKey =
      payload.idempotencyKey ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

    return this.request<OrderResponse>("/api/orders", {
      method: "POST",
      headers: {
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        ...payload,
        idempotencyKey,
      }),
    });
  }

  /**
   * GET /api/orders/my-orders
   * Retrieve paginated order history for the authenticated customer
   */
  async getMyOrders(
    page = 0,
    size = 20,
    sort = "orderPlacedAt,desc"
  ): Promise<PageResponse<OrderResponse>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
    }).toString();

    return this.request<PageResponse<OrderResponse>>(
      `/api/orders/my-orders?${query}`,
      { method: "GET", cache: "no-store" }
    );
  }

  /**
   * GET /api/orders/{orderPublicId}
   * Retrieve full details of an order owned by customer
   */
  async getOrderById(orderPublicId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(
      `/api/orders/${encodeURIComponent(orderPublicId)}`,
      { method: "GET" }
    );
  }

  /**
   * PATCH /api/orders/{orderPublicId}/cancel
   * Cancel an order in PLACED or CONFIRMED status
   */
  async cancelOrder(
    orderPublicId: string,
    reason: string
  ): Promise<Order> {
    const res = await this.request<OrderResponse>(
      `/api/orders/${encodeURIComponent(orderPublicId)}/cancel`,
      {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      }
    );
    return this.mapToLegacyOrder(res);
  }

  // ==========================================================================
  // Admin Order APIs (Role: ADMIN / SUPER_ADMIN)
  // ==========================================================================

  /**
   * GET /api/admin/orders
   * Paginated order list with search, status, date, and customer filters
   */
  async getAdminOrders(
    params?: AdminOrderQueryParams
  ): Promise<PageResponse<OrderResponse>> {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set("search", params.search.trim());
    if (params?.status && params.status !== "All") query.set("status", String(params.status));
    if (params?.customerPublicId?.trim()) query.set("customerPublicId", params.customerPublicId.trim());
    if (params?.fromDate?.trim()) query.set("fromDate", params.fromDate.trim());
    if (params?.toDate?.trim()) query.set("toDate", params.toDate.trim());
    if (params?.deliveryDate?.trim()) query.set("deliveryDate", params.deliveryDate.trim());
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));
    if (params?.sort?.trim()) query.set("sort", params.sort.trim());

    const queryString = query.toString();
    const endpoint = `/api/admin/orders${queryString ? `?${queryString}` : ""}`;

    return this.request<PageResponse<OrderResponse>>(
      endpoint,
      { method: "GET", cache: "no-store" },
      true
    );
  }

  /**
   * GET /api/admin/orders/statistics
   * Real aggregate order counts and revenue metrics from Order Service
   */
  async getOrderStatistics(): Promise<OrderStatisticsResponse> {
    return this.request<OrderStatisticsResponse>(
      "/api/admin/orders/statistics",
      { method: "GET", cache: "no-store" },
      true
    );
  }

  /**
   * GET /api/admin/orders/{orderPublicId}
   * Full details including items, customer, and full audit status history
   */
  async getAdminOrderById(orderPublicId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(
      `/api/admin/orders/${encodeURIComponent(orderPublicId)}`,
      { method: "GET" },
      true
    );
  }

  /**
   * PATCH /api/admin/orders/{orderPublicId}/status
   * Execute real status transition (PLACED -> CONFIRMED -> PROCESSING -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED)
   */
  async updateOrderStatus(
    orderPublicId: string,
    status: BackendOrderStatus | OrderStatus,
    reason?: string
  ): Promise<Order> {
    const backendStatus = String(status).toUpperCase().replace(/\s+/g, "_") as BackendOrderStatus;
    const res = await this.request<OrderResponse>(
      `/api/admin/orders/${encodeURIComponent(orderPublicId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: backendStatus, reason }),
      },
      true
    );
    return this.mapToLegacyOrder(res);
  }

  /**
   * GET /api/admin/orders/settings
   * Retrieve order acceptance settings and operating window
   */
  async getOrderSettings(): Promise<OrderBusinessSettingsResponse> {
    return this.request<OrderBusinessSettingsResponse>(
      "/api/admin/orders/settings",
      { method: "GET", cache: "no-store" },
      true
    );
  }

  /**
   * PUT /api/admin/orders/settings
   * Update order acceptance settings
   */
  async updateOrderSettings(
    payload: UpdateOrderSettingsRequest
  ): Promise<OrderBusinessSettingsResponse> {
    return this.request<OrderBusinessSettingsResponse>(
      "/api/admin/orders/settings",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true
    );
  }

  /**
   * PATCH /api/admin/orders/settings/status
   * Toggle order acceptance enabled/disabled switch
   */
  async updateOrderAcceptanceStatus(
    enabled: boolean
  ): Promise<OrderBusinessSettingsResponse> {
    return this.request<OrderBusinessSettingsResponse>(
      "/api/admin/orders/settings/status",
      {
        method: "PATCH",
        body: JSON.stringify({ orderAcceptanceEnabled: enabled }),
      },
      true
    );
  }

  // ==========================================================================
  // Legacy compatibility helpers
  // ==========================================================================
  async getOrders(params?: any): Promise<Order[]> {
    try {
      const res = await this.getAdminOrders(params);
      if (res && Array.isArray(res.content)) {
        return res.content.map(this.mapToLegacyOrder);
      }
    } catch {
      // Return empty array
    }
    return [];
  }

  async getOrderStats(date?: string): Promise<OrderStatsSummary> {
    try {
      const stats = await this.getOrderStatistics();
      return {
        totalOrders: stats.totalOrders || 0,
        pending: stats.pendingOrders || 0,
        processing: stats.processingOrders || 0,
        outForDelivery: stats.outForDeliveryOrders || 0,
        delivered: stats.deliveredOrders || 0,
        cancelled: stats.cancelledOrders || 0,
      };
    } catch {
      return {
        totalOrders: 0,
        pending: 0,
        processing: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0,
      };
    }
  }

  async createManualOrder(payload: Partial<Order>): Promise<Order> {
    const res = await this.createOrder({
      deliveryAddress: {
        addressLine: payload.customerAddress || "Kurnool",
        city: "Kurnool",
        state: "Andhra Pradesh",
        pincode: "518001",
        latitude: 15.8281,
        longitude: 78.0373,
      },
      paymentMethod: (payload.paymentMethod as any) || "COD",
      notes: "Manual order created by Admin",
    });
    return this.mapToLegacyOrder(res);
  }

  public mapToLegacyOrder(o: OrderResponse): Order {
    return {
      id: o.orderNumber || o.orderPublicId,
      customerName: o.customerName || "Customer",
      customerPhone: o.customerPhone || "",
      customerAddress: o.deliveryAddress?.addressLine || "",
      itemsCount: o.items?.length || 0,
      amount: o.totalAmount || 0,
      paymentMethod: o.paymentMethod || "COD",
      paymentStatus: o.paymentStatus === "COMPLETED" ? "Paid" : o.paymentStatus === "FAILED" ? "Failed" : "Pending",
      status: o.orderStatus,
      orderTime: o.orderPlacedAt || new Date().toISOString(),
      orderDate: o.deliveryDate || "",
      items: (o.items || []).map((it) => ({
        id: it.orderItemPublicId,
        productId: it.productPublicId,
        productName: it.productName,
        unit: it.unitOfMeasure || "KG",
        unitPrice: it.pricePerKg,
        quantity: it.quantityKg,
        totalPrice: it.totalPrice,
        imageUrl: it.productImageUrl,
      })),
      subtotal: o.subtotalAmount,
      deliveryCharge: o.deliveryCharge,
      discount: o.discountAmount,
    };
  }
}

export const orderService = new OrderService();
