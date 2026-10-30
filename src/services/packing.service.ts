import { apiClient } from "./api-client";
import {
  PackingOrder,
  PackingSummary,
  PackingFilterParams,
  PackingStatus,
  TopPackingProduct,
  PackingActivity,
} from "@/types";
import { getPackingDataByDate } from "@/data";

// In-memory working cache per date
const localPackingCache: Record<string, PackingOrder[]> = {};

export const packingService = {
  /**
   * Fetch packing orders list with filters and date support
   */
  async getPackingOrders(params?: PackingFilterParams): Promise<PackingOrder[]> {
    const targetDate = params?.date || "26 Oct 2026";

    if (!localPackingCache[targetDate]) {
      const data = getPackingDataByDate(targetDate);
      localPackingCache[targetDate] = [...data.orders];
    }

    let orders = [...localPackingCache[targetDate]];

    if (params) {
      if (params.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        orders = orders.filter(
          (o) =>
            o.id.toLowerCase().includes(query) ||
            o.customerName.toLowerCase().includes(query) ||
            o.customerPhone.toLowerCase().includes(query) ||
            o.items.some((it) => it.productName.toLowerCase().includes(query))
        );
      }

      if (params.status && params.status !== "All" && params.status !== "All Orders") {
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
        params.paymentStatus &&
        params.paymentStatus !== "All" &&
        params.paymentStatus !== "All Payment Status"
      ) {
        orders = orders.filter((o) =>
          o.paymentMethod.toLowerCase().includes(params.paymentStatus!.toLowerCase())
        );
      }

      if (params.sortBy) {
        if (params.sortBy.includes("Order Time")) {
          // Keep chronological order as in PDF
        } else if (params.sortBy.includes("Amount")) {
          orders.sort((a, b) => b.amount - a.amount);
        } else if (params.sortBy.includes("Customer")) {
          orders.sort((a, b) => a.customerName.localeCompare(b.customerName));
        } else if (params.sortBy.includes("Order ID")) {
          orders.sort((a, b) => a.id.localeCompare(b.id));
        }
      }
    }

    return apiClient.get<PackingOrder[]>(
      "/admin/packing/orders",
      { params },
      orders
    );
  },

  /**
   * Fetch 5 packing summary KPIs
   */
  async getPackingSummary(date?: string): Promise<PackingSummary> {
    const targetDate = date || "26 Oct 2026";

    if (!localPackingCache[targetDate]) {
      const data = getPackingDataByDate(targetDate);
      localPackingCache[targetDate] = [...data.orders];
    }

    const currentOrders = localPackingCache[targetDate];
    const totalOrdersToPack = currentOrders.length;
    const pending = currentOrders.filter((o) => o.status === "Pending").length;
    const inPacking = currentOrders.filter((o) => o.status === "In Packing").length;
    const packed = currentOrders.filter((o) => o.status === "Packed").length;

    let totalItems = 0;
    let packedItems = 0;
    currentOrders.forEach((o) => {
      totalItems += o.items.length;
      packedItems += o.items.filter((it) => it.isPacked).length;
    });

    const packingPercentage =
      totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 57;

    const summary: PackingSummary = {
      totalOrdersToPack,
      pending,
      inPacking,
      packed,
      packingPercentage,
      packedOrdersCount: packed + 10,
    };

    return apiClient.get<PackingSummary>(
      "/admin/packing/summary",
      { params: { date: targetDate } },
      summary
    );
  },

  /**
   * Fetch Top 5 Products to Pack
   */
  async getTopProducts(date?: string): Promise<TopPackingProduct[]> {
    const targetDate = date || "26 Oct 2026";
    const data = getPackingDataByDate(targetDate);
    return apiClient.get<TopPackingProduct[]>(
      "/admin/packing/top-products",
      { params: { date: targetDate } },
      data.topProducts
    );
  },

  /**
   * Fetch Recent Packing Activities
   */
  async getRecentActivities(date?: string): Promise<PackingActivity[]> {
    const targetDate = date || "26 Oct 2026";
    const data = getPackingDataByDate(targetDate);
    return apiClient.get<PackingActivity[]>(
      "/admin/packing/recent-activities",
      { params: { date: targetDate } },
      data.activities
    );
  },

  /**
   * Update entire order packing status
   */
  async updatePackingStatus(
    orderId: string,
    newStatus: PackingStatus,
    date?: string
  ): Promise<PackingOrder> {
    const targetDate = date || "26 Oct 2026";
    if (!localPackingCache[targetDate]) {
      localPackingCache[targetDate] = [...getPackingDataByDate(targetDate).orders];
    }

    const orderIndex = localPackingCache[targetDate].findIndex(
      (o) => o.id === orderId
    );

    if (orderIndex !== -1) {
      const order = localPackingCache[targetDate][orderIndex];
      const updatedOrder: PackingOrder = {
        ...order,
        status: newStatus,
        items:
          newStatus === "Packed"
            ? order.items.map((it) => ({ ...it, isPacked: true }))
            : order.items,
      };

      localPackingCache[targetDate][orderIndex] = updatedOrder;

      return apiClient.patch<PackingOrder>(
        `/admin/packing/orders/${encodeURIComponent(orderId)}/status`,
        { status: newStatus },
        {},
        updatedOrder
      );
    }

    throw new Error(`Order ${orderId} not found`);
  },

  /**
   * Toggle item verification checkbox inside an order
   */
  async toggleOrderItemPacked(
    orderId: string,
    itemId: string,
    isPacked?: boolean,
    date?: string
  ): Promise<PackingOrder> {
    const targetDate = date || "26 Oct 2026";
    if (!localPackingCache[targetDate]) {
      localPackingCache[targetDate] = [...getPackingDataByDate(targetDate).orders];
    }

    const orderIndex = localPackingCache[targetDate].findIndex(
      (o) => o.id === orderId
    );

    if (orderIndex !== -1) {
      const order = localPackingCache[targetDate][orderIndex];
      const updatedItems = order.items.map((it) =>
        it.id === itemId
          ? { ...it, isPacked: isPacked !== undefined ? isPacked : !it.isPacked }
          : it
      );

      const allPacked = updatedItems.every((it) => it.isPacked);
      const somePacked = updatedItems.some((it) => it.isPacked);

      const status: PackingStatus = allPacked
        ? "Packed"
        : somePacked
        ? "In Packing"
        : "Pending";

      const updatedOrder: PackingOrder = {
        ...order,
        items: updatedItems,
        status,
      };

      localPackingCache[targetDate][orderIndex] = updatedOrder;

      return apiClient.patch<PackingOrder>(
        `/admin/packing/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
        { isPacked },
        {},
        updatedOrder
      );
    }

    throw new Error(`Order ${orderId} not found`);
  },

  /**
   * Pack all items in an order
   */
  async packAllOrderItems(orderId: string, date?: string): Promise<PackingOrder> {
    return this.updatePackingStatus(orderId, "Packed", date);
  },
};
