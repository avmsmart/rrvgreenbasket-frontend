export type ProductCategory =
  | "Vegetables"
  | "English Vegetables"
  | "Indian Vegetables"
  | "Fruits"
  | "Leafy Greens"
  | "Groceries"
  | "Dairy Products"
  | "Snacks & Foods"
  | "Beverages"
  | "Organic Products"
  | "Household Items";

export type BackendProductCategoryName =
  | "Fruits"
  | "Leafy Vegetables"
  | "Root Vegetables"
  | "Seasonings"
  | "Mushrooms"
  | "Other Items";

export type BackendQuantityUnit =
  | "KG"
  | "GRAM"
  | "PIECE"
  | "BUNCH"
  | "PACK"
  | "DOZEN"
  | "LITRE"
  | "ML";

export interface BackendCategoryDef {
  name: BackendProductCategoryName;
  slug: string;
}

export interface BackendQuantityUnitDef {
  value: BackendQuantityUnit;
  label: string;
  priceLabel: string;
  quantityLabel: string;
  unitShort: string;
}

export const BACKEND_PRODUCT_CATEGORIES: readonly BackendCategoryDef[] = [
  { name: "Fruits", slug: "fruits" },
  { name: "Leafy Vegetables", slug: "leafy-vegetables" },
  { name: "Root Vegetables", slug: "root-vegetables" },
  { name: "Seasonings", slug: "seasonings" },
  { name: "Mushrooms", slug: "mushrooms" },
  { name: "Other Items", slug: "other-items" },
] as const;

export const BACKEND_QUANTITY_UNITS: readonly BackendQuantityUnitDef[] = [
  {
    value: "KG",
    label: "Kilogram (KG)",
    priceLabel: "Price per KG (₹)",
    quantityLabel: "Default Quantity (KG)",
    unitShort: "KG",
  },
  {
    value: "GRAM",
    label: "Gram (G)",
    priceLabel: "Price per Gram (₹)",
    quantityLabel: "Default Quantity (Gram)",
    unitShort: "Gram",
  },
  {
    value: "PIECE",
    label: "Piece",
    priceLabel: "Price per Piece (₹)",
    quantityLabel: "Default Quantity (Pieces)",
    unitShort: "Pieces",
  },
  {
    value: "BUNCH",
    label: "Bunch",
    priceLabel: "Price per Bunch (₹)",
    quantityLabel: "Default Quantity (Bunches)",
    unitShort: "Bunches",
  },
  {
    value: "PACK",
    label: "Pack",
    priceLabel: "Price per Pack (₹)",
    quantityLabel: "Default Quantity (Packs)",
    unitShort: "Packs",
  },
  {
    value: "DOZEN",
    label: "Dozen",
    priceLabel: "Price per Dozen (₹)",
    quantityLabel: "Default Quantity (Dozens)",
    unitShort: "Dozens",
  },
  {
    value: "LITRE",
    label: "Litre",
    priceLabel: "Price per Litre (₹)",
    quantityLabel: "Default Quantity (Litres)",
    unitShort: "Litres",
  },
  {
    value: "ML",
    label: "Millilitre (ML)",
    priceLabel: "Price per ML (₹)",
    quantityLabel: "Default Quantity (ML)",
    unitShort: "ML",
  },
] as const;

export const CATEGORY_DEFAULT_UNITS: Record<BackendProductCategoryName, BackendQuantityUnit> = {
  "Fruits": "PIECE",
  "Leafy Vegetables": "BUNCH",
  "Root Vegetables": "KG",
  "Seasonings": "GRAM",
  "Mushrooms": "PACK",
  "Other Items": "KG",
};

export type BackendProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";
export type ProductStatus = BackendProductStatus;
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type UIProductStatusLabel = "In Stock" | "Out of Stock" | "Draft" | "Archived";

export const PRODUCT_STATUS_MAP: Record<UIProductStatusLabel, BackendProductStatus> = {
  "In Stock": "ACTIVE",
  "Out of Stock": "INACTIVE",
  "Draft": "DRAFT",
  "Archived": "ARCHIVED",
};

export const API_TO_UI_STATUS_MAP: Record<BackendProductStatus, UIProductStatusLabel> = {
  "ACTIVE": "In Stock",
  "INACTIVE": "Out of Stock",
  "DRAFT": "Draft",
  "ARCHIVED": "Archived",
};

/**
 * Normalizes any status string (UI label or API enum) to a valid BackendProductStatus enum.
 * Guarantees that only "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED" is sent to the backend.
 */
export function toApiProductStatus(status?: unknown): BackendProductStatus {
  if (!status || typeof status !== "string") return "ACTIVE";
  const trimmed = status.trim();
  const upper = trimmed.toUpperCase();

  if (upper === "ACTIVE" || upper === "IN STOCK") return "ACTIVE";
  if (upper === "INACTIVE" || upper === "OUT OF STOCK" || upper === "OUT_OF_STOCK") return "INACTIVE";
  if (upper === "DRAFT") return "DRAFT";
  if (upper === "ARCHIVED") return "ARCHIVED";

  if (trimmed in PRODUCT_STATUS_MAP) {
    return PRODUCT_STATUS_MAP[trimmed as UIProductStatusLabel];
  }

  return "ACTIVE";
}

/**
 * Converts backend enum values into friendly UI display labels.
 * ACTIVE -> "In Stock"
 * INACTIVE -> "Out of Stock"
 * DRAFT -> "Draft"
 * ARCHIVED -> "Archived"
 */
export function toUiProductStatus(status?: unknown): UIProductStatusLabel {
  if (!status || typeof status !== "string") return "In Stock";
  const trimmed = status.trim();
  const upper = trimmed.toUpperCase();

  if (upper === "ACTIVE" || upper === "IN STOCK") return "In Stock";
  if (upper === "INACTIVE" || upper === "OUT OF STOCK" || upper === "OUT_OF_STOCK") return "Out of Stock";
  if (upper === "DRAFT") return "Draft";
  if (upper === "ARCHIVED") return "Archived";

  if (upper in API_TO_UI_STATUS_MAP) {
    return API_TO_UI_STATUS_MAP[upper as BackendProductStatus];
  }

  return "In Stock";
}

export interface BackendCategory {
  publicId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  icon?: string;
  // Compatibility fields
  id?: string | number;
  categoryId?: string | number;
}

export type AdminProductCategory = BackendCategory;

export interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: BackendCategory[];
  timestamp: string;
}

export interface AdminProductImage {
  publicId: string;
  storageProvider?: string;
  storageKey?: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface AdminProduct {
  publicId: string;
  name: string;
  slug: string;
  category: AdminProductCategory;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  pricePerKg: number;
  defaultQuantityKg: number;
  quantityUnit: string;
  totalPrice: number;
  available: boolean;
  stockStatus: StockStatus | string;
  isFeatured: boolean;
  adminEnabled?: boolean;
  status?: ProductStatus;
  images?: AdminProductImage[];
  createdAt?: string;
  updatedAt?: string;

  // Compatibility fields for existing UI views
  id?: string;
  unit?: string;
  price?: number;
  originalPrice?: number;
  stock?: number;
  minStock?: number;
  excelName?: string;
  erpCode?: string;
  hsnCode?: string;
}

export interface AdminProductPageData {
  content: AdminProduct[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminProductListResponse {
  success: boolean;
  message?: string;
  data: AdminProductPageData;
  timestamp?: string;
}

export interface AdminProductDetailsResponse {
  success: boolean;
  message?: string;
  data: AdminProduct;
  timestamp?: string;
}

export interface AdminProductCreatePayload {
  categoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  pricePerKg: number;
  defaultQuantityKg?: number;
  quantityUnit?: string;
  status?: ProductStatus;
  adminEnabled?: boolean;
  isFeatured?: boolean;
  imageUrl?: string;
}

export interface AdminProductUpdatePayload extends Partial<AdminProductCreatePayload> {
  imageUrl?: string;
}

export interface AdminProductQueryParams {
  category?: string;
  categoryId?: string;
  search?: string;
  available?: boolean;
  status?: ProductStatus | string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface StoreProduct {
  id: string | number;
  publicId?: string;
  name: string;
  category: string;
  categoryId?: string | number;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: string;
  inStock?: boolean;
  description?: string;
}

export interface ProductAvailabilityRequest {
  adminEnabled: boolean;
}

export interface ProductStatusRequest {
  status: ProductStatus;
}

/**
 * Universal Product model supporting both legacy mock views and real Spring Boot admin backend
 */
export interface Product {
  id: string;
  publicId?: string;
  erpCode?: string;
  name: string;
  slug?: string;
  excelName?: string;
  category: ProductCategory | string;
  categoryObj?: AdminProductCategory;
  price: number;
  pricePerKg?: number;
  totalPrice?: number;
  originalPrice?: number;
  unit: string;
  quantityUnit?: string;
  defaultQuantityKg?: number;
  hsnCode?: string;
  stock: number;
  minStock?: number;
  stockStatus?: StockStatus | string;
  status: "In Stock" | "Low Stock" | "Out of Stock" | ProductStatus | string;
  apiStatus?: BackendProductStatus;
  imageUrl?: string;
  images?: AdminProductImage[];
  description?: string;
  shortDescription?: string;
  isOrganic?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  available?: boolean;
  adminEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
