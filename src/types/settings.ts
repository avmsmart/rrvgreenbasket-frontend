export interface DaySchedule {
  id?: string;
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}
export interface SupportedCurrency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  rate?: number;
  isDefault?: boolean;
}

export interface RegionalZone {
  id: string;
  name: string;
  code: string;
  language: string;
  dateFormat: string;
  status: "Active" | "Inactive";
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
  currencies?: SupportedCurrency[];
  regionalZones?: RegionalZone[];

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
