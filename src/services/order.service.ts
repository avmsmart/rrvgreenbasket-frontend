import { apiClient } from "./api-client";
import { Order, OrderStatus, OrderStatsSummary, PaymentStatus, PaymentMethod } from "@/types";
import { MOCK_ORDERS_DATA, MOCK_ORDER_STATS_BY_DATE, MOCK_DATE_ANALYTICS } from "@/data";
import { getSystemDateFormatted, getOffsetDateFormatted } from "@/utils";

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
    const systemToday = getSystemDateFormatted();
    const systemYesterday = getOffsetDateFormatted(-1);
    const day2Formatted = getOffsetDateFormatted(-2);
    const day3Formatted = getOffsetDateFormatted(-3);
    const rawDate = params?.date?.trim() || systemToday;

    const isAllDates = rawDate === "All Dates" || rawDate === "All" || rawDate === "Last 7 Days";

    const isToday =
      rawDate === systemToday ||
      rawDate.toLowerCase().includes("today") ||
      rawDate === "25 Aug 2025" ||
      rawDate === "26 Oct 2026";

    const isYesterday =
      rawDate === systemYesterday ||
      rawDate.toLowerCase().includes("yesterday") ||
      rawDate === "24 Aug 2025";

    let filtered: Order[] = [];

    if (isAllDates) {
      filtered = MOCK_ORDERS_DATA.map((o) => {
        if (o.orderDate === "25 Aug 2025") return { ...o, orderDate: systemToday };
        if (o.orderDate === "24 Aug 2025") return { ...o, orderDate: systemYesterday };
        if (o.orderDate === "23 Aug 2025") return { ...o, orderDate: day2Formatted };
        if (o.orderDate === "22 Aug 2025") return { ...o, orderDate: day3Formatted };
        return o;
      });
    } else if (isToday) {
      filtered = MOCK_ORDERS_DATA.filter(
        (o) => o.orderDate === "25 Aug 2025" || o.orderDate === "Today" || o.orderDate === systemToday
      ).map((o) => ({ ...o, orderDate: systemToday }));
    } else if (isYesterday) {
      filtered = MOCK_ORDERS_DATA.filter(
        (o) => o.orderDate === "24 Aug 2025" || o.orderDate === "Yesterday" || o.orderDate === systemYesterday
      ).map((o) => ({ ...o, orderDate: systemYesterday }));
    } else if (rawDate === day2Formatted || rawDate.includes("23")) {
      filtered = MOCK_ORDERS_DATA.filter(
        (o) => o.orderDate === "23 Aug 2025" || o.orderDate === day2Formatted
      ).map((o) => ({ ...o, orderDate: day2Formatted }));
    } else if (rawDate === day3Formatted || rawDate.includes("22")) {
      filtered = MOCK_ORDERS_DATA.filter(
        (o) => o.orderDate === "22 Aug 2025" || o.orderDate === day3Formatted
      ).map((o) => ({ ...o, orderDate: day3Formatted }));
    } else {
      // Custom date from calendar (e.g. 15 Oct 2026)
      filtered = MOCK_ORDERS_DATA.slice(0, 6).map((o, idx) => ({
        ...o,
        id: `#ORD00${8200 + idx}`,
        orderDate: rawDate,
        status:
          idx % 4 === 0
            ? "Delivered"
            : idx % 4 === 1
            ? "Processing"
            : idx % 4 === 2
            ? "Out for Delivery"
            : "Pending",
      }));
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
          date: rawDate,
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
  async getOrderStats(date?: string): Promise<OrderStatsSummary> {
    const systemToday = getSystemDateFormatted();
    const systemYesterday = getOffsetDateFormatted(-1);
    const targetDate = date?.trim() || systemToday;

    const isYesterday =
      targetDate.includes("24") ||
      targetDate.toLowerCase().includes("yesterday") ||
      targetDate === systemYesterday;

    const normalized = isYesterday
      ? "24 Aug 2025"
      : targetDate.includes("23")
      ? "23 Aug 2025"
      : targetDate.includes("22")
      ? "22 Aug 2025"
      : targetDate.includes("Last 7")
      ? "Last 7 Days"
      : targetDate.includes("All")
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
  async getDateAnalytics(date?: string) {
    const systemToday = getSystemDateFormatted();
    const systemYesterday = getOffsetDateFormatted(-1);
    const targetDate = date?.trim() || systemToday;

    const isYesterday =
      targetDate.includes("24") ||
      targetDate.toLowerCase().includes("yesterday") ||
      targetDate === systemYesterday;

    const normalized = isYesterday
      ? "24 Aug 2025"
      : targetDate.includes("23")
      ? "23 Aug 2025"
      : targetDate.includes("22")
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
      orderDate: newOrder.orderDate || "25 Aug 2025",
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

    // Store in central array so it persists across views
    MOCK_ORDERS_DATA.unshift(created);

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
