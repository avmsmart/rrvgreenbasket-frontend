import { apiClient } from "./api-client";
import {
  ProcurementItem,
  ProcurementStatus,
  SupplierOrder,
  PendingProcurementItem,
  CategoryProcurementSummary,
  ProcurementSummary,
  ProcurementFilterParams,
} from "@/types";
import { getProcurementDataByDate } from "@/data";

// In-memory working cache per date for local state updates
const localItemsCache: Record<string, ProcurementItem[]> = {};

export const procurementService = {
  /**
   * Fetch procurement items with optional filters and date sensitivity
   */
  async getProcurementItems(
    params?: ProcurementFilterParams
  ): Promise<ProcurementItem[]> {
    const targetDate = params?.date || "26 Oct 2026";
    
    // Check or initialize local cache for date
    if (!localItemsCache[targetDate]) {
      const data = getProcurementDataByDate(targetDate);
      localItemsCache[targetDate] = [...data.items];
    }

    let items = [...localItemsCache[targetDate]];

    if (params) {
      if (params.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        items = items.filter(
          (p) =>
            p.productName.toLowerCase().includes(query) ||
            p.supplier.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query)
        );
      }

      if (params.category && params.category !== "All" && params.category !== "All Categories") {
        items = items.filter(
          (p) => p.category.toLowerCase() === params.category!.toLowerCase()
        );
      }

      if (params.supplier && params.supplier !== "All" && params.supplier !== "All Suppliers") {
        items = items.filter(
          (p) => p.supplier.toLowerCase() === params.supplier!.toLowerCase()
        );
      }

      if (params.status && params.status !== "All" && params.status !== "All Status") {
        items = items.filter(
          (p) => p.status.toLowerCase() === params.status!.toLowerCase()
        );
      }

      if (params.tab) {
        if (params.tab === "Received Stock") {
          items = items.filter((p) => p.status === "Completed");
        } else if (params.tab === "Pending Items") {
          items = items.filter((p) => p.status !== "Completed");
        }
      }
    }

    return apiClient.get<ProcurementItem[]>(
      "/admin/procurement",
      { params },
      items
    );
  },

  /**
   * Get procurement summary KPIs for a specific date
   */
  async getProcurementSummary(date?: string): Promise<ProcurementSummary> {
    const targetDate = date || "26 Oct 2026";
    const data = getProcurementDataByDate(targetDate);

    // If local updates occurred, recompute summary
    if (localItemsCache[targetDate]) {
      const currentItems = localItemsCache[targetDate];
      const totalItems = currentItems.length;
      const totalQuantity = currentItems.reduce(
        (acc, curr) => acc + (curr.unit === "kg" ? curr.requiredQty : 0),
        0
      );
      const estimatedCost = currentItems.reduce(
        (acc, curr) => acc + curr.estimatedCost,
        0
      );
      const completedItems = currentItems.filter(
        (p) => p.status === "Completed"
      ).length;
      const percentage =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      const dynamicSummary: ProcurementSummary = {
        totalItems,
        totalQuantity: totalQuantity || data.summary.totalQuantity,
        productsCount: data.summary.productsCount,
        estimatedCost,
        procurementPercentage: percentage,
        completedItemsCount: completedItems,
        totalItemsCount: totalItems,
      };

      return apiClient.get<ProcurementSummary>(
        "/admin/procurement/summary",
        { params: { date: targetDate } },
        dynamicSummary
      );
    }

    return apiClient.get<ProcurementSummary>(
      "/admin/procurement/summary",
      { params: { date: targetDate } },
      data.summary
    );
  },

  /**
   * Get category-wise procurement breakdown for a specific date
   */
  async getCategoryBreakdown(date?: string): Promise<CategoryProcurementSummary[]> {
    const data = getProcurementDataByDate(date);
    return apiClient.get<CategoryProcurementSummary[]>(
      "/admin/procurement/category-breakdown",
      { params: { date } },
      data.categoryBreakdown
    );
  },

  /**
   * Get supplier orders list for a specific date
   */
  async getSupplierOrders(date?: string): Promise<SupplierOrder[]> {
    const data = getProcurementDataByDate(date);
    return apiClient.get<SupplierOrder[]>(
      "/admin/procurement/supplier-orders",
      { params: { date } },
      data.supplierOrders
    );
  },

  /**
   * Get pending procurement items for a specific date
   */
  async getPendingItems(date?: string): Promise<PendingProcurementItem[]> {
    const data = getProcurementDataByDate(date);
    return apiClient.get<PendingProcurementItem[]>(
      "/admin/procurement/pending-items",
      { params: { date } },
      data.pendingItems
    );
  },

  /**
   * Update an existing procurement item
   */
  async updateProcurementItem(
    procurementId: string,
    updates: Partial<ProcurementItem>,
    date?: string
  ): Promise<ProcurementItem> {
    const targetDate = date || updates.date || "26 Oct 2026";
    if (!localItemsCache[targetDate]) {
      localItemsCache[targetDate] = [...getProcurementDataByDate(targetDate).items];
    }

    const index = localItemsCache[targetDate].findIndex(
      (p) => p.id === procurementId
    );

    if (index !== -1) {
      const existing = localItemsCache[targetDate][index];
      const procuredQty =
        updates.procuredQty !== undefined ? updates.procuredQty : existing.procuredQty;
      const requiredQty =
        updates.requiredQty !== undefined ? updates.requiredQty : existing.requiredQty;
      const pendingQty = Math.max(0, requiredQty - procuredQty);
      const status: ProcurementStatus =
        updates.status !== undefined
          ? updates.status
          : pendingQty === 0
          ? "Completed"
          : procuredQty > 0
          ? "Partial"
          : "Not Started";

      localItemsCache[targetDate][index] = {
        ...existing,
        ...updates,
        requiredQty,
        procuredQty,
        pendingQty,
        status,
      };

      return apiClient.patch<ProcurementItem>(
        `/admin/procurement/${encodeURIComponent(procurementId)}`,
        updates,
        {},
        localItemsCache[targetDate][index]
      );
    }

    throw new Error(`Item ${procurementId} not found`);
  },

  /**
   * Add a new procurement plan item
   */
  async createProcurementItem(
    item: Omit<ProcurementItem, "id">,
    date?: string
  ): Promise<ProcurementItem> {
    const targetDate = date || item.date || "26 Oct 2026";
    if (!localItemsCache[targetDate]) {
      localItemsCache[targetDate] = [...getProcurementDataByDate(targetDate).items];
    }

    const newId = `PROC-${String(localItemsCache[targetDate].length + 1).padStart(3, "0")}`;
    const pendingQty = Math.max(0, item.requiredQty - item.procuredQty);
    const status: ProcurementStatus =
      item.status ||
      (pendingQty === 0
        ? "Completed"
        : item.procuredQty > 0
        ? "Partial"
        : "Not Started");

    const newItem: ProcurementItem = {
      ...item,
      id: newId,
      date: targetDate,
      pendingQty,
      status,
    };

    localItemsCache[targetDate].unshift(newItem);

    return apiClient.post<ProcurementItem>(
      "/admin/procurement",
      newItem,
      {},
      newItem
    );
  },

  /**
   * Generate procurement requirements from cutoff orders
   */
  async generateFromOrders(targetDate: string): Promise<{
    consolidatedItems: number;
    totalWeightKg: number;
    estimatedAmount: number;
    message: string;
  }> {
    return apiClient.post(
      "/admin/procurement/generate",
      { targetDate },
      {},
      {
        consolidatedItems: 35,
        totalWeightKg: 420,
        estimatedAmount: 28450,
        message: "Successfully consolidated 24 customer orders into mandi procurement requirement.",
      }
    );
  },
};
