/**
 * RRV Green Basket - Delivery Management Service
 * Integrates directly with Spring Boot Delivery Microservice via API Gateway:
 * - Public: /api/delivery/**
 * - Admin: /api/admin/delivery/**
 */

import {
  CustomerDeliveryZone,
  CheckDeliveryAvailabilityRequest,
  DeliveryAvailabilityResponse,
  DeliveryZoneResponse,
  CreateDeliveryZoneRequest,
  UpdateDeliveryZoneRequest,
  AdminDeliveryZoneQueryParams,
  PageResponse,
  DeliveryOrder,
  DeliveryFilterParams,
  DeliverySummary,
  DeliveryPartner,
  DeliveryTimelineItem,
  DeliveryIssue,
  DeliveryStatus,
} from "@/types";
import { getAuthToken } from "./api-client";
import { customerTokenStorage } from "./customer-auth.service";

export class DeliveryApiError extends Error {
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
    this.name = "DeliveryApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

class DeliveryService {
  public getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return "";
    }
    if (process.env.NEXT_PUBLIC_DELIVERY_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_DELIVERY_API_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    }
    return "http://192.168.0.142:8080";
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
        ? "Delivery service request timed out. Please try again."
        : err instanceof Error
        ? `Unable to reach Delivery Service: ${err.message}`
        : "Unable to reach Delivery Service. Please check your connection.";
      throw new DeliveryApiError(message, 0, endpoint, err);
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
          : `Delivery API failed with status ${response.status}: ${response.statusText}`;

      throw new DeliveryApiError(message, response.status, endpoint, errorData);
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
  // Public Customer Delivery APIs
  // ==========================================================================

  /**
   * GET /api/delivery/zones
   * Retrieve list of all currently active delivery zones with boundaries
   */
  async getActiveZones(): Promise<CustomerDeliveryZone[]> {
    return this.request<CustomerDeliveryZone[]>("/api/delivery/zones", {
      method: "GET",
      cache: "no-store",
    });
  }

  /**
   * POST /api/delivery/check-availability
   * Check if a coordinate location is within a serviceable delivery zone
   */
  async checkAvailability(
    payload: CheckDeliveryAvailabilityRequest
  ): Promise<DeliveryAvailabilityResponse> {
    return this.request<DeliveryAvailabilityResponse>(
      "/api/delivery/check-availability",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * GET /api/delivery/zones/resolve?latitude={lat}&longitude={lng}
   * Resolves delivery zone and charges by coordinates
   */
  async resolveZone(
    latitude: number,
    longitude: number
  ): Promise<DeliveryAvailabilityResponse> {
    const query = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
    }).toString();

    return this.request<DeliveryAvailabilityResponse>(
      `/api/delivery/zones/resolve?${query}`,
      { method: "GET" }
    );
  }

  // ==========================================================================
  // Admin Delivery Zone Management APIs (Role: ADMIN / SUPER_ADMIN)
  // ==========================================================================

  /**
   * GET /api/admin/delivery/zones
   * Paginated list of delivery zones with filters
   */
  async getAdminZones(
    params?: AdminDeliveryZoneQueryParams
  ): Promise<PageResponse<DeliveryZoneResponse>> {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set("search", params.search.trim());
    if (params?.active !== undefined) query.set("active", String(params.active));
    if (params?.city?.trim()) query.set("city", params.city.trim());
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));
    if (params?.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());
    if (params?.sortDirection) query.set("sortDirection", params.sortDirection.toUpperCase());

    const queryString = query.toString();
    const endpoint = `/api/admin/delivery/zones${queryString ? `?${queryString}` : ""}`;

    return this.request<PageResponse<DeliveryZoneResponse>>(
      endpoint,
      { method: "GET", cache: "no-store" },
      true
    );
  }

  /**
   * GET /api/admin/delivery/zones/{zonePublicId}
   */
  async getZoneById(zonePublicId: string): Promise<DeliveryZoneResponse> {
    return this.request<DeliveryZoneResponse>(
      `/api/admin/delivery/zones/${encodeURIComponent(zonePublicId)}`,
      { method: "GET" },
      true
    );
  }

  /**
   * POST /api/admin/delivery/zones
   * Create new delivery zone with polygon boundary & pricing rules
   */
  async createZone(
    payload: CreateDeliveryZoneRequest
  ): Promise<DeliveryZoneResponse> {
    return this.request<DeliveryZoneResponse>(
      "/api/admin/delivery/zones",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true
    );
  }

  /**
   * PUT /api/admin/delivery/zones/{zonePublicId}
   * Update existing zone details and boundary
   */
  async updateZone(
    zonePublicId: string,
    payload: UpdateDeliveryZoneRequest
  ): Promise<DeliveryZoneResponse> {
    return this.request<DeliveryZoneResponse>(
      `/api/admin/delivery/zones/${encodeURIComponent(zonePublicId)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true
    );
  }

  /**
   * PATCH /api/admin/delivery/zones/{zonePublicId}/status
   * Activate or deactivate a delivery zone
   */
  async updateZoneStatus(
    zonePublicId: string,
    active: boolean
  ): Promise<DeliveryZoneResponse> {
    return this.request<DeliveryZoneResponse>(
      `/api/admin/delivery/zones/${encodeURIComponent(zonePublicId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ active }),
      },
      true
    );
  }

  /**
   * DELETE /api/admin/delivery/zones/{zonePublicId}
   * Soft-delete / deactivate zone
   */
  async deleteZone(zonePublicId: string): Promise<void> {
    return this.request<void>(
      `/api/admin/delivery/zones/${encodeURIComponent(zonePublicId)}`,
      { method: "DELETE" },
      true
    );
  }

  // ==========================================================================
  // Compatibility wrappers for existing admin views during transition
  // ==========================================================================
  async getDeliveryOrders(params?: DeliveryFilterParams): Promise<DeliveryOrder[]> {
    try {
      // Connect to real admin orders
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.status && params.status !== "All") query.set("status", params.status);
      const res = await this.request<PageResponse<any>>(
        `/api/admin/orders${query.toString() ? `?${query.toString()}` : ""}`,
        { method: "GET" },
        true
      );
      if (res && Array.isArray(res.content)) {
        return res.content.map((o: any) => ({
          id: o.orderNumber || o.orderPublicId,
          customerName: o.customerName || "Customer",
          customerPhone: o.customerPhone || "",
          deliveryAddress: o.deliveryAddress?.addressLine || "",
          customerAddress: o.deliveryAddress?.addressLine || "",
          area: o.deliveryAddress?.city || "",
          amount: o.totalAmount || 0,
          status: o.orderStatus === "DELIVERED" ? "Delivered" : o.orderStatus === "OUT_FOR_DELIVERY" ? "Out for Delivery" : "Pending",
          orderTime: o.orderPlacedAt || new Date().toISOString(),
          estimatedDelivery: o.deliveryDate || "",
          itemsCount: o.items?.length || 0,
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  }

  async getAllDeliveryOrdersUnfiltered(date?: string): Promise<DeliveryOrder[]> {
    return this.getDeliveryOrders({ date });
  }

  async getDeliverySummary(date?: string): Promise<DeliverySummary> {
    try {
      const orders = await this.getDeliveryOrders({ date });
      const pending = orders.filter((o) => o.status === "Pending").length;
      const out = orders.filter((o) => o.status === "Out for Delivery").length;
      const delivered = orders.filter((o) => o.status === "Delivered").length;
      const failed = orders.filter((o) => o.status === "Failed").length;
      return {
        totalDeliveries: orders.length,
        totalOrders: orders.length,
        pending,
        pendingAssignment: pending,
        outForDelivery: out,
        delivered,
        failed,
      };
    } catch {
      return {
        totalDeliveries: 0,
        totalOrders: 0,
        pending: 0,
        pendingAssignment: 0,
        outForDelivery: 0,
        delivered: 0,
        failed: 0,
      };
    }
  }

  async getDeliveryPartners(): Promise<DeliveryPartner[]> {
    return [];
  }

  async getDeliveryTimeline(date?: string): Promise<DeliveryTimelineItem[]> {
    return [];
  }

  async getDeliveryIssues(date?: string): Promise<DeliveryIssue[]> {
    return [];
  }

  async getOrderById(orderId: string): Promise<DeliveryOrder | undefined> {
    const list = await this.getDeliveryOrders();
    return list.find((o) => o.id === orderId);
  }

  async assignDeliveryPartner(
    orderId: string,
    partnerId: string,
    partnerName: string,
    partnerPhone?: string,
    date?: string
  ): Promise<boolean> {
    return true;
  }

  async updateDeliveryStatus(
    orderId: string,
    status: DeliveryStatus,
    reason?: string,
    date?: string
  ): Promise<boolean> {
    return true;
  }
}

export const deliveryService = new DeliveryService();
