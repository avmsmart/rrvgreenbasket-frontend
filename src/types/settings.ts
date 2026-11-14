export interface DaySchedule {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

/**
 * Public Store Settings (API 13)
 * GET /api/store/settings/public
 */
export interface PublicStoreSettings {
  storeName: string;
  brandTagline: string;
  supportEmail: string;
  supportPhone: string;
  physicalAddress: string;
  websiteUrl: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

/**
 * Admin Store Settings (API 14)
 * GET /api/admin/store/settings
 */
export interface AdminStoreSettings {
  publicId?: string;
  storeName: string;
  brandTagline: string;
  supportEmail: string;
  supportPhone: string;
  physicalAddress: string;
  websiteUrl: string;
  logoFileName?: string | null;
  logoS3Key?: string | null;
  logoUrl?: string | null;
  faviconFileName?: string | null;
  faviconS3Key?: string | null;
  faviconUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string | null;
}

/**
 * Update Store Settings Request (API 15)
 * PUT /api/admin/store/settings
 */
export interface UpdateStoreSettingsRequest {
  storeName: string;
  brandTagline?: string;
  supportEmail?: string;
  supportPhone?: string;
  physicalAddress?: string;
  websiteUrl?: string;
}

/**
 * Store Asset Upload Response (APIs 16 & 17)
 */
export interface StoreAssetUploadResponse {
  assetType: "LOGO" | "FAVICON";
  fileName: string;
  logoUrl?: string;
  faviconUrl?: string;
  assetUrl: string;
  uploaded: boolean;
}

export interface StoreSettings {
  // General Information
  storeName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  websiteUrl?: string;
  platformLogo?: string;
  appFavicon?: string;

  // Business Hours
  businessHours?: DaySchedule[];
  timeZone?: string;

  // Currency & Localization
  currency?: string;
  language?: string;
  dateFormat?: string;

  // Order Rules
  allowCod?: boolean;
  minimumOrderAmount: number; // e.g. 199
  enableScheduledDelivery?: boolean;
  allowCustomerCancellation?: boolean;
  autoAssignDeliveryPartner?: boolean;
  orderCutoffTime: string; // e.g. "22:00"

  // Inventory Rules
  lowStockAlertEnabled?: boolean;
  lowStockThreshold?: number; // e.g. 10
  autoUpdateStockAfterOrder?: boolean;
  allowOutOfStockPurchase?: boolean;

  // Legacy/Delivery compatibility
  operatingHours?: {
    opensAt: string;
    closesAt: string;
  };
  deliverySlots?: string[];
  freeDeliveryThreshold?: number;
  standardDeliveryFee?: number;
  taxPercentage?: number;
  acceptingOrders?: boolean;
  mandiProcurementAutoCalculate?: boolean;
}
