/**
 * RRV Green Basket - Order Management Service
 * Integrates directly with Spring Boot Order Microservice via API Gateway:
 * - Public: /api/orders/operating-window
 * - Customer: /api/orders/** (JWT Authenticated)
 * - Admin: /api/admin/orders/** (Admin JWT Authenticated)
 */

import {
  OrderResponse,
  AdminOrder,
  AdminOrderPageResponse,
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
import { cartService } from "./cart.service";
import { getOrderApiBaseUrl } from "@/config/api.config";
import { MOCK_ADMIN_ORDERS_DATA } from "@/data/admin-orders-data";
import {
  getRegisteredCustomer,
  getDeliveryRecipient,
  getFormattedDeliveryAddress,
  formatOrderDateTime,
} from "@/utils";

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
    return getOrderApiBaseUrl();
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
   * Validate the authenticated backend cart before asking the backend to create an order.
   */
  async createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const token = customerTokenStorage.getAccessToken();
    if (!token || !token.trim()) {
      throw new OrderApiError(
        "Please sign in before placing your order.",
        401,
        "/api/orders"
      );
    }

    // This deliberately does not use localStorage as an authenticated cart fallback.
    const backendCart = await cartService.getCart();
    if (!backendCart || !Array.isArray(backendCart.items)) {
      throw new OrderApiError(
        "Unable to retrieve your cart. Please try again.",
        400,
        "/api/cart"
      );
    }

    if (backendCart.items.length === 0) {
      throw new OrderApiError(
        "Your backend cart is empty. Please add products again before placing your order.",
        400,
        "/api/cart"
      );
    }

    const idempotencyKey =
      payload.idempotencyKey ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

    // The backend must re-read the cart and calculate authoritative prices and fees.
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
  ): Promise<AdminOrderPageResponse<AdminOrder>> {
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

    try {
      const res = await this.request<any>(
        endpoint,
        { method: "GET", cache: "no-store" },
        true
      );
      if (res && Array.isArray(res.content)) {
        return {
          content: res.content,
          pageNumber: res.pageNumber ?? res.number ?? 0,
          pageSize: res.pageSize ?? res.size ?? 20,
          totalElements: res.totalElements ?? res.content.length,
          totalPages: res.totalPages ?? 1,
          first: res.first ?? true,
          last: res.last ?? true,
        };
      }
      if (Array.isArray(res)) {
        return {
          content: res,
          pageNumber: 0,
          pageSize: res.length,
          totalElements: res.length,
          totalPages: 1,
          first: true,
          last: true,
        };
      }
    } catch (e) {
      console.warn("Order service request failed, falling back to local dataset:", e);
    }

    // Fallback dataset for offline / development
    let filtered = [...MOCK_ADMIN_ORDERS_DATA];
    if (params?.status && params.status !== "All") {
      filtered = filtered.filter(
        (o) => String(o.orderStatus).toUpperCase() === String(params.status).toUpperCase()
      );
    }
    if (params?.search?.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.registeredCustomerName && o.registeredCustomerName.toLowerCase().includes(q)) ||
          (o.registeredCustomerMobile && o.registeredCustomerMobile.includes(q)) ||
          (o.recipientName && o.recipientName.toLowerCase().includes(q)) ||
          (o.recipientMobile && o.recipientMobile.includes(q))
      );
    }

    const pageSize = params?.size ?? 20;
    const pageNumber = params?.page ?? 0;
    const startIndex = pageNumber * pageSize;
    const pageSlice = filtered.slice(startIndex, startIndex + pageSize);

    return {
      content: pageSlice,
      pageNumber,
      pageSize,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize) || 1,
      first: pageNumber === 0,
      last: startIndex + pageSize >= filtered.length,
    };
  }

  /**
   * GET /api/admin/orders/statistics
   * Real aggregate order counts and revenue metrics from Order Service
   */
  async getOrderStatistics(): Promise<OrderStatisticsResponse> {
    try {
      return await this.request<OrderStatisticsResponse>(
        "/api/admin/orders/statistics",
        { method: "GET", cache: "no-store" },
        true
      );
    } catch {
      // Calculate from local dataset
      const all = MOCK_ADMIN_ORDERS_DATA;
      return {
        totalOrders: all.length,
        todayOrders: all.length,
        pendingOrders: all.filter((o) => o.orderStatus === "CONFIRMED" || o.orderStatus === "PLACED").length,
        confirmedOrders: all.filter((o) => o.orderStatus === "CONFIRMED").length,
        processingOrders: all.filter((o) => o.orderStatus === "PROCESSING" || o.orderStatus === "PACKED").length,
        packedOrders: all.filter((o) => o.orderStatus === "PACKED").length,
        outForDeliveryOrders: all.filter((o) => o.orderStatus === "OUT_FOR_DELIVERY").length,
        deliveredOrders: all.filter((o) => o.orderStatus === "DELIVERED").length,
        cancelledOrders: all.filter((o) => o.orderStatus === "CANCELLED").length,
        totalRevenue: all.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        todayRevenue: all.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      };
    }
  }

  /**
   * GET /api/admin/orders/{orderPublicId}
   * Full details including items, customer, and full audit status history
   */
  async getAdminOrderById(orderPublicId: string): Promise<AdminOrder> {
    try {
      const res = await this.request<AdminOrder>(
        `/api/admin/orders/${encodeURIComponent(orderPublicId)}`,
        { method: "GET" },
        true
      );
      if (res && res.orderPublicId) {
        return res;
      }
    } catch (e) {
      console.warn("Failed to fetch admin order by id, falling back to local dataset:", e);
    }

    const found = MOCK_ADMIN_ORDERS_DATA.find(
      (o) => o.orderPublicId === orderPublicId || o.orderNumber === orderPublicId
    );
    if (found) {
      return found;
    }

    throw new OrderApiError(`Order not found: ${orderPublicId}`, 404, `/api/admin/orders/${orderPublicId}`);
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
    try {
      const res = await this.request<AdminOrder>(
        `/api/admin/orders/${encodeURIComponent(orderPublicId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: backendStatus, reason }),
        },
        true
      );
      return this.mapToLegacyOrder(res);
    } catch {
      // Local fallback: update mock record
      const match = MOCK_ADMIN_ORDERS_DATA.find(
        (o) => o.orderPublicId === orderPublicId || o.orderNumber === orderPublicId
      );
      if (match) {
        match.orderStatus = backendStatus;
        if (!match.statusHistory) match.statusHistory = [];
        match.statusHistory.push({
          id: Date.now(),
          newStatus: backendStatus,
          changedBy: "Admin",
          reason: reason || `Status updated to ${backendStatus}`,
          timestamp: new Date().toISOString(),
        });
        return this.mapToLegacyOrder(match);
      }
      throw new OrderApiError("Order not found to update status", 404);
    }
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
        return res.content.map((o) => this.mapToLegacyOrder(o));
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
        recipientName: payload.recipientName || payload.customerName || "Customer",
        recipientMobile: payload.recipientMobile || payload.customerPhone || "9440123456",
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

  public mapToLegacyOrder(o: AdminOrder | OrderResponse): Order {
    const regCustomer = getRegisteredCustomer(o);
    const recipient = getDeliveryRecipient(o);
    const delivery = getFormattedDeliveryAddress(o);

    const subtotal =
      o.subtotal !== undefined
        ? Number(o.subtotal)
        : o.subtotalAmount !== undefined
        ? Number(o.subtotalAmount)
        : Math.max(0, (Number(o.totalAmount) || 0) - (Number(o.deliveryCharge) || 0) + (Number(o.discountAmount) || 0));

    const totalAmount = Number(o.totalAmount) || 0;
    const deliveryCharge = Number(o.deliveryCharge) || 0;
    const discount = Number(o.discountAmount) || 0;

    return {
      id: o.orderNumber || o.orderPublicId,
      orderPublicId: o.orderPublicId,
      orderNumber: o.orderNumber,
      customerPublicId: o.customerPublicId || regCustomer.customerPublicId,

      // Registered Customer (Account Owner)
      registeredCustomerName: regCustomer.name,
      registeredCustomerMobile: regCustomer.mobile,
      customer: o.customer || {
        registeredName: regCustomer.name,
        registeredMobile: regCustomer.mobile,
        customerPublicId: o.customerPublicId || regCustomer.customerPublicId,
      },

      // Delivery Recipient
      recipientName: recipient.name,
      recipientMobile: recipient.mobile,

      // Delivery Zone & Location
      deliveryZonePublicId: o.deliveryZonePublicId,
      deliveryZoneName: o.deliveryZoneName,
      deliveryAddress: o.deliveryAddress,
      deliveryAddressObj: typeof o.deliveryAddress === "object" ? o.deliveryAddress : undefined,
      deliveryLatitude: o.deliveryLatitude ?? delivery.latitude,
      deliveryLongitude: o.deliveryLongitude ?? delivery.longitude,

      promisedDeliveryDate: o.promisedDeliveryDate,
      orderPlacedAt: o.orderPlacedAt,
      cancellationAllowed: o.cancellationAllowed,
      cancellationDeadline: o.cancellationDeadline,

      // Display fields for table & backward compat
      customerName: regCustomer.name,
      customerPhone: regCustomer.mobile,
      customerAddress: delivery.fullAddress,
      itemsCount: o.items?.length || 0,
      amount: totalAmount,
      totalAmount,
      subtotal,
      deliveryCharge,
      discount,
      discountAmount: discount,
      paymentMethod: (o.paymentMethod as any) || "COD",
      paymentStatus: (o.paymentStatus as any) || "COD_PENDING",
      status: (o.orderStatus as any) || "CONFIRMED",
      orderTime: o.orderPlacedAt ? formatOrderDateTime(o.orderPlacedAt) : new Date().toISOString(),
      orderDate: o.orderDate || o.promisedDeliveryDate || "",
      items: (o.items || []).map((it: any) => ({
        id: it.id || it.orderItemPublicId || it.publicId || String(Math.random()),
        productId: it.productPublicId || it.id || "PRD",
        productName: it.productName,
        unit: it.unitOfMeasure || it.unit || "KG",
        unitOfMeasure: it.unitOfMeasure || it.unit || "KG",
        unitPrice: typeof it.unitPrice === "number" ? it.unitPrice : it.pricePerKg || 0,
        quantity: typeof it.quantity === "number" ? it.quantity : it.quantityKg || 1,
        totalPrice: typeof it.totalPrice === "number" ? it.totalPrice : (it.unitPrice || 0) * (it.quantity || 1),
        productImage: it.productImage || it.productImageUrl || null,
        imageUrl: it.productImage || it.productImageUrl || undefined,
      })),
      statusHistory: o.statusHistory || [],
    };
  }
}

export const orderService = new OrderService();
