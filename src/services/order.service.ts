import { apiClient } from "./api-client";
import { Order, OrderStatus, OrderStatsSummary, PaymentStatus, PaymentMethod } from "@/types";
import { MOCK_ORDERS_DATA, MOCK_ORDER_STATS_BY_DATE, MOCK_DATE_ANALYTICS } from "@/data";

export interface OrderQueryParams {
  status?: OrderStatus | "All";
  paymentStatus?: PaymentStatus | "All";
  paymentMethod?: PaymentMethod | "All";
  search?: string;
  date?: string;
  sortBy?: "orderTime" | "amount" | "itemsCount" | "customerName";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const orderService = {
  /**
   * Fetch customer orders list with rich filtering & sorting
   */
  async getOrders(params?: OrderQueryParams): Promise<Order[]> {
    let filtered = [...MOCK_ORDERS_DATA];

    const rawDate = params?.date;
    const normalizedDate = rawDate
      ? rawDate.includes("24") || rawDate.toLowerCase().includes("yesterday")
        ? "24 Aug 2025"
        : rawDate.includes("23")
        ? "23 Aug 2025"
        : rawDate.includes("22")
        ? "22 Aug 2025"
        : rawDate.includes("7")
        ? "Last 7 Days"
        : rawDate.includes("All")
        ? "All Dates"
        : "25 Aug 2025"
      : undefined;

    if (normalizedDate && normalizedDate !== "All Dates") {
      if (normalizedDate !== "Last 7 Days") {
        filtered = filtered.filter((o) => o.orderDate === normalizedDate);
      }
    }

    if (params?.status && params.status !== "All") {
      filtered = filtered.filter((o) => o.status === params.status);
    }
    if (params?.paymentStatus && params.paymentStatus !== "All") {
      filtered = filtered.filter((o) => o.paymentStatus === params.paymentStatus);
    }
    if (params?.paymentMethod && params.paymentMethod !== "All") {
      filtered = filtered.filter((o) => o.paymentMethod === params.paymentMethod);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.customerAddress && o.customerAddress.toLowerCase().includes(q))
      );
    }

    if (params?.sortBy) {
      filtered.sort((a, b) => {
        const order = params.sortOrder === "desc" ? -1 : 1;
        if (params.sortBy === "amount") {
          return (a.amount - b.amount) * order;
        }
        if (params.sortBy === "itemsCount") {
          return (a.itemsCount - b.itemsCount) * order;
        }
        if (params.sortBy === "customerName") {
          return a.customerName.localeCompare(b.customerName) * order;
        }
        return a.orderTime.localeCompare(b.orderTime) * order;
      });
    }

    return apiClient.get<Order[]>(
      "/admin/orders",
      {
        params: {
          status: params?.status === "All" ? undefined : params?.status,
          paymentStatus: params?.paymentStatus === "All" ? undefined : params?.paymentStatus,
          paymentMethod: params?.paymentMethod === "All" ? undefined : params?.paymentMethod,
          search: params?.search,
          date: normalizedDate,
          page: params?.page,
          pageSize: params?.pageSize,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      },
      filtered
    );
  },

  /**
   * Fetch 6-card summary statistics matching Page 5 of UI/UX PDF for a specific date
   */
  async getOrderStats(date: string = "25 Aug 2025"): Promise<OrderStatsSummary> {
    const normalized =
      date.includes("24") || date.toLowerCase().includes("yesterday")
        ? "24 Aug 2025"
        : date.includes("23")
        ? "23 Aug 2025"
        : date.includes("22")
        ? "22 Aug 2025"
        : date.includes("Last 7")
        ? "Last 7 Days"
        : date.includes("All")
        ? "All Dates"
        : "25 Aug 2025";

    const fallback =
      MOCK_ORDER_STATS_BY_DATE[normalized] ||
      MOCK_ORDER_STATS_BY_DATE["25 Aug 2025"];

    return apiClient.get<OrderStatsSummary>(
      "/admin/orders/stats",
      { params: { date: normalized } },
      fallback
    );
  },

  /**
   * Fetch hourly timeline & top products for a specific date
   */
  async getDateAnalytics(date: string = "25 Aug 2025") {
    const normalized =
      date.includes("24") || date.toLowerCase().includes("yesterday")
        ? "24 Aug 2025"
        : date.includes("23")
        ? "23 Aug 2025"
        : date.includes("22")
        ? "22 Aug 2025"
        : "25 Aug 2025";

    const fallback =
      MOCK_DATE_ANALYTICS[normalized] ||
      MOCK_DATE_ANALYTICS["25 Aug 2025"];

    return apiClient.get(
      "/admin/orders/date-analytics",
      { params: { date: normalized } },
      fallback
    );
  },


  /**
   * Fetch a single order by order ID (e.g. #ORD001234)
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    const fallback =
      MOCK_ORDERS_DATA.find(
        (o) => o.id.toLowerCase() === orderId.toLowerCase()
      ) || null;

    return apiClient.get<Order | null>(
      `/admin/orders/${encodeURIComponent(orderId)}`,
      {},
      fallback
    );
  },

  /**
   * Update the status of an order
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const existing = MOCK_ORDERS_DATA.find((o) => o.id === orderId) || MOCK_ORDERS_DATA[0];
    const updated: Order = { ...existing, status };

    return apiClient.patch<Order>(
      `/admin/orders/${encodeURIComponent(orderId)}/status`,
      { status },
      {},
      updated
    );
  },

  /**
   * Create a manual order from the admin dashboard (+ Create Manual Order)
   */
  async createManualOrder(newOrder: Partial<Order>): Promise<Order> {
    const created: Order = {
      id: `#ORD00${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newOrder.customerName || "Walk-in Customer",
      customerPhone: newOrder.customerPhone || "+91 98765 00000",
      customerAddress: newOrder.customerAddress || "Kurnool Central",
      itemsCount: newOrder.items?.length || 1,
      amount: newOrder.amount || 150,
      paymentMethod: newOrder.paymentMethod || "COD",
      paymentStatus: newOrder.paymentStatus || "Pending",
      status: "Pending",
      orderTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      orderDate: "Today",
      items: newOrder.items || [],
      subtotal: newOrder.subtotal || newOrder.amount || 150,
      deliveryCharge: newOrder.deliveryCharge || 0,
      discount: newOrder.discount || 0,
      timeline: [
        {
          status: "Order Placed",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          completed: true,
        },
      ],
    };

    return apiClient.post<Order>(
      "/admin/orders",
      newOrder,
      {},
      created
    );
  },

  /**
   * Assign a delivery partner to an order
   */
  async assignDeliveryPartner(
    orderId: string,
    partnerId: string,
    partnerName: string
  ): Promise<Order> {
    const existing = MOCK_ORDERS_DATA.find((o) => o.id === orderId) || MOCK_ORDERS_DATA[0];
    const updated: Order = {
      ...existing,
      deliveryPartner: `${partnerName} (${partnerId})`,
      status: "Out for Delivery",
    };

    return apiClient.patch<Order>(
      `/admin/orders/${encodeURIComponent(orderId)}/assign-partner`,
      { partnerId, partnerName },
      {},
      updated
    );
  },

  /**
   * Cancel an order with reason
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const existing = MOCK_ORDERS_DATA.find((o) => o.id === orderId) || MOCK_ORDERS_DATA[0];
    const updated: Order = {
      ...existing,
      status: "Cancelled",
    };

    return apiClient.post<Order>(
      `/admin/orders/${encodeURIComponent(orderId)}/cancel`,
      { reason },
      {},
      updated
    );
  },
};
