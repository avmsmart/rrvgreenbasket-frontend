export type ProcurementStatus = "Completed" | "Partial" | "Not Started";

export interface ProcurementItem {
  id: string;
  productName: string;
  category: "Fruits" | "Vegetables" | "Leafy" | "Others" | string;
  requiredQty: number;
  procuredQty: number;
  pendingQty: number;
  unit: string;
  supplier: string;
  status: ProcurementStatus;
  estimatedCost: number;
  priority?: "High Priority" | "Medium" | "Low";
  date?: string;
  notes?: string;
}

export type SupplierOrderStatus = "Ordered" | "Received" | "Partially Received";

export interface SupplierOrder {
  id: string;
  supplierName: string;
  date: string;
  itemCount: number;
  totalAmount: number;
  status: SupplierOrderStatus;
}

export interface PendingProcurementItem {
  id: string;
  productName: string;
  pendingQty: number;
  unit: string;
  priority: "High Priority" | "Medium" | "Low";
}

export interface CategoryProcurementSummary {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ProcurementSummary {
  totalItems: number;
  totalQuantity: number;
  productsCount: number;
  estimatedCost: number;
  procurementPercentage: number;
  completedItemsCount: number;
  totalItemsCount: number;
}

export interface ProcurementFilterParams {
  [key: string]: string | number | boolean | undefined;
  search?: string;
  category?: string;
  supplier?: string;
  status?: string;
  tab?: string;
  date?: string;
}
