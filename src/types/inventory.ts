export interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  productName: string;
  type: "Stock Added" | "Stock Adjusted" | "Stock Updated" | "Stock Deducted";
  quantityChange: string;
  dateTime: string;
  updatedBy: string;
}

export interface LowStockAlert {
  id: string;
  productName: string;
  currentStock: string;
  minStock: string;
  needed: string;
}
