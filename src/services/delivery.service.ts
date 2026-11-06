import { apiClient } from "./api-client";
import {
  DeliveryOrder,
  DeliveryPartner,
  DeliverySummary,
  DeliveryTimelineItem,
  DeliveryIssue,
  DeliveryFilterParams,
  DeliveryStatus,
} from "@/types";
import {
  getDeliveryDataByDate,
  MOCK_DELIVERY_PARTNERS_PAGE15,
  MOCK_DELIVERY_ORDERS_PAGE15,
} from "@/data";
import { getSystemDateFormatted } from "@/utils";

// In-memory cache per date for interactive mock updates
const localDeliveryCache: Record<string, DeliveryOrder[]> = {};
let partnersCache: DeliveryPartner[] = [...MOCK_DELIVERY_PARTNERS_PAGE15];

export const deliveryService = {
  /**
   * Fetch list of delivery orders with search, filters, sorting and date sensitivity
   */
  async getDeliveryOrders(params?: DeliveryFilterParams): Promise<DeliveryOrder[]> {
    const targetDate = params?.date || getSystemDateFormatted();

    if (!localDeliveryCache[targetDate]) {
      const data = getDeliveryDataByDate(targetDate);
      localDeliveryCache[targetDate] = [...data.orders];
    }

    let orders = [...localDeliveryCache[targetDate]];

    if (params) {
      if (params.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        orders = orders.filter(
          (o) =>
            o.id.toLowerCase().includes(query) ||
            o.customerName.toLowerCase().includes(query) ||
            o.customerPhone.toLowerCase().includes(query) ||
            (o.assignedPartnerName && o.assignedPartnerName.toLowerCase().includes(query)) ||
            o.area.toLowerCase().includes(query)
        );
      }

      if (params.status && params.status !== "All" && params.status !== "All Deliveries") {
        orders = orders.filter(
          (o) => o.status.toLowerCase() === params.status!.toLowerCase()
        );
      }

      if (params.area && params.area !== "All" && params.area !== "All Delivery Areas") {
        orders = orders.filter((o) =>
          o.area.toLowerCase().includes(params.area!.toLowerCase())
        );
      }

      if (
        params.partner &&
        params.partner !== "All" &&
        params.partner !== "All Delivery Partners"
      ) {
        if (params.partner === "Unassigned") {
          orders = orders.filter((o) => !o.assignedPartnerName);
        } else {
          orders = orders.filter((o) =>
            o.assignedPartnerName?.toLowerCase() === params.partner!.toLowerCase()
          );
        }
      }

      if (params.sortBy) {
        if (params.sortBy.includes("Order Time")) {
          // Default chronological order as in Page 15
        } else if (params.sortBy.includes("Amount")) {
          orders.sort((a, b) => b.amount - a.amount);
        } else if (params.sortBy.includes("Customer")) {
          orders.sort((a, b) => a.customerName.localeCompare(b.customerName));
        } else if (params.sortBy.includes("Delivery Time")) {
          orders.sort((a, b) => (a.deliveryTime || "").localeCompare(b.deliveryTime || ""));
        }
      }
    }

    return apiClient.get<DeliveryOrder[]>(
      "/admin/delivery/orders",
      { params },
      orders
    );
  },

  /**
   * Get single delivery order by ID regardless of active filters or pagination
   */
  async getOrderById(orderId: string, date?: string): Promise<DeliveryOrder | undefined> {
    const targetDate = date || getSystemDateFormatted();
    if (!localDeliveryCache[targetDate]) {
      const data = getDeliveryDataByDate(targetDate);
      localDeliveryCache[targetDate] = [...data.orders];
    }
    const cleanId = orderId.toLowerCase().trim();
    let found = localDeliveryCache[targetDate].find(
      (o) => o.id.toLowerCase() === cleanId
    );
    if (!found) {
      found = MOCK_DELIVERY_ORDERS_PAGE15.find(
        (o) => o.id.toLowerCase() === cleanId
      );
      if (found) {
        found = { ...found, orderDate: targetDate };
      }
    }
    return found;
  },

  /**
   * Get all delivery orders for a given date without any filters
   */
  async getAllDeliveryOrdersUnfiltered(date?: string): Promise<DeliveryOrder[]> {
    const targetDate = date || getSystemDateFormatted();
    if (!localDeliveryCache[targetDate]) {
      const data = getDeliveryDataByDate(targetDate);
      localDeliveryCache[targetDate] = [...data.orders];
    }
    return [...localDeliveryCache[targetDate]];
  },

  /**
   * Fetch 5 delivery summary KPIs
   */
  async getDeliverySummary(date?: string): Promise<DeliverySummary> {
    const targetDate = date || getSystemDateFormatted();

    if (!localDeliveryCache[targetDate]) {
      const data = getDeliveryDataByDate(targetDate);
      localDeliveryCache[targetDate] = [...data.orders];
    }

    const currentOrders = localDeliveryCache[targetDate];
    const totalOrders = currentOrders.length;
    const pendingAssignment = currentOrders.filter(
      (o) => o.status === "Pending" || !o.assignedPartnerName
    ).length;
    const outForDelivery = currentOrders.filter(
      (o) => o.status === "Out for Delivery"
    ).length;
    const delivered = currentOrders.filter((o) => o.status === "Delivered").length;
    const failed = currentOrders.filter((o) => o.status === "Failed").length;

    const summary: DeliverySummary = {
      totalOrders,
      pendingAssignment,
      outForDelivery,
      delivered,
      failed,
    };

    return apiClient.get<DeliverySummary>(
      "/admin/delivery/summary",
      { params: { date: targetDate } },
      summary
    );
  },

  /**
   * Fetch active delivery partners
   */
  async getDeliveryPartners(status?: string): Promise<DeliveryPartner[]> {
    let list = [...partnersCache];
    if (status && status !== "All") {
      list = list.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    return apiClient.get<DeliveryPartner[]>(
      "/admin/delivery-partners",
      { params: { status } },
      list
    );
  },

  /**
   * Fetch delivery timeline
   */
  async getDeliveryTimeline(date?: string): Promise<DeliveryTimelineItem[]> {
    const data = getDeliveryDataByDate(date || getSystemDateFormatted());
    return apiClient.get<DeliveryTimelineItem[]>(
      "/admin/delivery/timeline",
      { params: { date } },
      data.timeline
    );
  },

  /**
   * Fetch delivery issues
   */
  async getDeliveryIssues(date?: string): Promise<DeliveryIssue[]> {
    const data = getDeliveryDataByDate(date || getSystemDateFormatted());
    return apiClient.get<DeliveryIssue[]>(
      "/admin/delivery/issues",
      { params: { date } },
      data.issues
    );
  },

  /**
   * Assign or reassign delivery partner to an order
   */
  async assignDeliveryPartner(
    orderId: string,
    partnerId: string,
    partnerName: string,
    partnerPhone?: string,
    date?: string
  ): Promise<DeliveryOrder> {
    const targetDate = date || getSystemDateFormatted();
    if (!localDeliveryCache[targetDate]) {
      localDeliveryCache[targetDate] = [...getDeliveryDataByDate(targetDate).orders];
    }

    const orderIndex = localDeliveryCache[targetDate].findIndex((o) => o.id === orderId);

    if (orderIndex !== -1) {
      const existing = localDeliveryCache[targetDate][orderIndex];
      const updated: DeliveryOrder = {
        ...existing,
        assignedPartnerId: partnerId,
        assignedPartnerName: partnerName,
        assignedPartnerPhone: partnerPhone || "+91 98765 43210",
        status: existing.status === "Pending" ? "Out for Delivery" : existing.status,
      };

      localDeliveryCache[targetDate][orderIndex] = updated;

      // Update partner stats
      partnersCache = partnersCache.map((p) =>
        p.id === partnerId
          ? {
              ...p,
              activeDeliveries: (p.activeDeliveries || 0) + 1,
              status: "Online",
            }
          : p
      );

      return apiClient.patch<DeliveryOrder>(
        `/admin/delivery/orders/${encodeURIComponent(orderId)}/assign`,
        { partnerId, partnerName },
        {},
        updated
      );
    }

    throw new Error(`Order ${orderId} not found`);
  },

  /**
   * Update delivery order status
   */
  async updateDeliveryStatus(
    orderId: string,
    status: DeliveryStatus,
    failureReason?: string,
    date?: string
  ): Promise<DeliveryOrder> {
    const targetDate = date || getSystemDateFormatted();
    if (!localDeliveryCache[targetDate]) {
      localDeliveryCache[targetDate] = [...getDeliveryDataByDate(targetDate).orders];
    }

    const orderIndex = localDeliveryCache[targetDate].findIndex((o) => o.id === orderId);

    if (orderIndex !== -1) {
      const existing = localDeliveryCache[targetDate][orderIndex];
      const updated: DeliveryOrder = {
        ...existing,
        status,
        deliveryTime:
          status === "Delivered" || status === "Failed"
            ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : existing.deliveryTime,
        failureReason: status === "Failed" ? failureReason || "Delivery attempt failed" : undefined,
      };

      localDeliveryCache[targetDate][orderIndex] = updated;

      return apiClient.patch<DeliveryOrder>(
        `/admin/delivery/orders/${encodeURIComponent(orderId)}/status`,
        { status, failureReason },
        {},
        updated
      );
    }

    throw new Error(`Order ${orderId} not found`);
  },
};
