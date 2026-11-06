/**
 * RRV Green Basket - Inventory Service Types & DTO Contracts
 *
 * Microservice: INVENTORY-SERVICE (Spring Boot)
 * Admin Prefix: /api/admin/inventory
 * Customer Prefix: /api/inventory
 */

import { Product, StockStatus } from "./product";

export type InventoryUnitOfMeasure =
  | "KG"
  | "GRAM"
  | "PIECE"
  | "BUNCH"
  | "PACK"
  | "DOZEN"
  | "LITRE"
  | "ML"
  | string;

export type InventoryMovementType =
  | "INITIAL_STOCK"
  | "STOCK_IN"
  | "STOCK_OUT"
  | "ADJUSTMENT"
  | "INITIAL_CORRECTION"
  | "RESERVATION"
  | "RELEASE"
  | "CONFIRMATION"
  | string;

export type StockAlertType = "LOW_STOCK" | "OUT_OF_STOCK";

export type StockAlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

export type StockReferenceType =
  | "PURCHASE"
  | "DAMAGE"
  | "SPOILAGE"
  | "EXPIRED"
  | "THEFT"
  | "INTERNAL_USE"
  | "RETURN"
  | "TRANSFER"
  | "HARVEST"
  | "AUDIT"
  | string;

/**
 * Inventory Detail Response DTO from backend
 * GET /api/admin/inventory
 * GET /api/admin/inventory/{productPublicId}
 */
export interface InventoryDetailResponse {
  publicId: string;
  productPublicId: string;
  unitOfMeasure: InventoryUnitOfMeasure;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  initialized: boolean;
  stockStatus: StockStatus | string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Spring Page representation for paginated Inventory responses
 */
export interface InventoryPageData {
  content: InventoryDetailResponse[];
  pageNumber?: number;
  number?: number;
  pageSize?: number;
  size?: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

/**
 * Query params for GET /api/admin/inventory
 */
export interface InventoryQueryParams {
  productPublicId?: string;
  unitOfMeasure?: string;
  stockStatus?: StockStatus | string;
  initialized?: boolean | string;
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

/**
 * Request payload for PUT /api/admin/inventory/{productPublicId}/initialize
 */
export interface InitializeInventoryPayload {
  unitOfMeasure: string;
  initialQuantity: number;
  lowStockThreshold: number;
  reason: string;
  notes?: string;
}

/**
 * Single item in bulk initialization payload
 */
export interface BulkInitializeItem {
  productPublicId: string;
  unitOfMeasure: string;
  initialPhysicalQuantity: number;
  lowStockThreshold: number;
  reason: string;
  notes?: string;
}

/**
 * Request payload for POST /api/admin/inventory/initialize
 */
export interface BulkInitializePayload {
  items: BulkInitializeItem[];
}

/**
 * Request payload for POST /api/admin/inventory/stock-in
 */
export interface StockInPayload {
  productPublicId: string;
  quantity: number;
  unitOfMeasure: string;
  reason: string;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
}

/**
 * Request payload for POST /api/admin/inventory/stock-out
 */
export interface StockOutPayload {
  productPublicId: string;
  quantity: number;
  unitOfMeasure: string;
  reason: string;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
}

/**
 * Request payload for POST /api/admin/inventory/adjustments (Relative mode)
 */
export interface StockAdjustmentRelativePayload {
  productPublicId: string;
  adjustmentQuantity: number;
  unitOfMeasure: string;
  reason: string;
  notes?: string;
}

/**
 * Request payload for POST /api/admin/inventory/adjustments (Absolute mode)
 */
export interface StockAdjustmentAbsolutePayload {
  productPublicId: string;
  newPhysicalQuantity: number;
  unitOfMeasure: string;
  reason: string;
  notes?: string;
}

/**
 * Union payload for adjustments
 */
export type StockAdjustmentPayload =
  | StockAdjustmentRelativePayload
  | StockAdjustmentAbsolutePayload;

/**
 * Request payload for PUT /api/admin/inventory/{productPublicId}/correct-initial
 */
export interface CorrectInitialStockPayload {
  productPublicId: string;
  correctedQuantity: number;
  reason: string;
  notes?: string;
}

/**
 * Request payload for PATCH /api/admin/inventory/{productPublicId}/threshold
 */
export interface UpdateThresholdPayload {
  lowStockThreshold: number;
}

/**
 * Stock Movement Response DTO from backend
 * GET /api/admin/inventory/movements
 */
export interface StockMovementResponse {
  publicId: string;
  productPublicId: string;
  movementType: InventoryMovementType;
  quantity: number;
  physicalQuantityBefore: number;
  physicalQuantityAfter: number;
  availableQuantityBefore: number;
  availableQuantityAfter: number;
  unitOfMeasure: string;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

/**
 * Query params for GET /api/admin/inventory/movements
 */
export interface StockMovementsQueryParams {
  productPublicId?: string;
  movementType?: string;
  referenceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Spring Page representation for movements
 */
export interface StockMovementsPageData {
  content: StockMovementResponse[];
  pageNumber?: number;
  number?: number;
  pageSize?: number;
  size?: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

/**
 * Stock Alert Response DTO from backend
 * GET /api/admin/inventory/alerts
 */
export interface StockAlertResponse {
  publicId: string;
  productPublicId: string;
  alertType: StockAlertType;
  currentQuantity: number;
  thresholdQuantity: number;
  unitOfMeasure: string;
  alertStatus: StockAlertStatus;
  createdAt: string;
  resolvedAt?: string;
}

/**
 * Query params for GET /api/admin/inventory/alerts
 */
export interface StockAlertsQueryParams {
  productPublicId?: string;
  alertType?: StockAlertType | string;
  alertStatus?: StockAlertStatus | string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Spring Page representation for alerts
 */
export interface StockAlertsPageData {
  content: StockAlertResponse[];
  pageNumber?: number;
  number?: number;
  pageSize?: number;
  size?: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

/**
 * Customer Stock Availability Response DTO from backend
 * GET /api/inventory/products/{productPublicId}/availability
 */
export interface StockAvailabilityResponse {
  productPublicId: string;
  unitOfMeasure: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  requestedQuantity?: number;
  sufficient: boolean;
  inStock: boolean;
  stockStatus: StockStatus | string;
  lowStock: boolean;
}

/**
 * Enriched Inventory Item: inventory record joined with Product Service data
 */
export interface EnrichedInventoryItem {
  inventory: InventoryDetailResponse;
  product?: Product;
}

/**
 * Overview statistics summary for Admin Inventory Dashboard
 */
export interface InventoryOverviewStats {
  totalItems: number;
  initializedCount: number;
  uninitializedCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeAlertsCount: number;
  totalPhysicalQuantity: number;
  totalAvailableQuantity: number;
  totalReservedQuantity: number;
}

// Backward compatibility legacy types for mock components
export interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
  productPublicId?: string;
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
  productPublicId?: string;
}
