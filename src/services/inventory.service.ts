import { apiClient } from "./api-client";
import { InventoryItem, LowStockAlert } from "@/types";
import { MOCK_INVENTORY_DATA, MOCK_LOW_STOCK_ALERTS } from "@/data";

export interface InventoryQueryParams {
  search?: string;
  category?: string;
  status?: "In Stock" | "Low Stock" | "Out of Stock" | "All";
}

export const inventoryService = {
  /**
   * Fetch inventory stock items
   */
  async getInventory(params?: InventoryQueryParams): Promise<InventoryItem[]> {
    let filtered = [...MOCK_INVENTORY_DATA];

    if (params?.status && params.status !== "All") {
      filtered = filtered.filter((i) => i.status === params.status);
    }
    if (params?.category) {
      filtered = filtered.filter((i) => i.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((i) => i.productName.toLowerCase().includes(q));
    }

    return apiClient.get<InventoryItem[]>(
      "/admin/inventory",
      {
        params: {
          search: params?.search,
          category: params?.category,
          status: params?.status === "All" ? undefined : params?.status,
        },
      },
      filtered
    );
  },

  /**
   * Fetch urgent low stock alerts
   */
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    return apiClient.get<LowStockAlert[]>(
      "/admin/inventory/low-stock-alerts",
      {},
      MOCK_LOW_STOCK_ALERTS
    );
  },

  /**
   * Update current stock quantity for an item
   */
  async updateStock(
    inventoryId: string,
    currentStock: number,
    note?: string
  ): Promise<InventoryItem> {
    const existing =
      MOCK_INVENTORY_DATA.find((i) => i.id === inventoryId) || MOCK_INVENTORY_DATA[0];
    const status: InventoryItem["status"] =
      currentStock === 0
        ? "Out of Stock"
        : currentStock <= existing.minStock
        ? "Low Stock"
        : "In Stock";

    const updated: InventoryItem = {
      ...existing,
      currentStock,
      status,
      lastUpdated: "Just now",
    };

    return apiClient.patch<InventoryItem>(
      `/admin/inventory/${encodeURIComponent(inventoryId)}/stock`,
      { currentStock, note },
      {},
      updated
    );
  },

  /**
   * Inward stock from Mandi or Farm supply
   */
  async recordStockInward(
    inventoryId: string,
    addedQuantity: number,
    supplier?: string
  ): Promise<InventoryItem> {
    const existing =
      MOCK_INVENTORY_DATA.find((i) => i.id === inventoryId) || MOCK_INVENTORY_DATA[0];
    const newStock = existing.currentStock + addedQuantity;
    const status: InventoryItem["status"] =
      newStock <= existing.minStock ? "Low Stock" : "In Stock";

    const updated: InventoryItem = {
      ...existing,
      currentStock: newStock,
      status,
      lastUpdated: "Just now",
    };

    return apiClient.post<InventoryItem>(
      `/admin/inventory/${encodeURIComponent(inventoryId)}/inward`,
      { addedQuantity, supplier },
      {},
      updated
    );
  },
};
