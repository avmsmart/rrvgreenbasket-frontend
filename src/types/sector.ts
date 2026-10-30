export interface Sector {
  id: string;
  name: string; // e.g. "Fresh Vegetables" or "Sector 1 - Kurnool Town"
  description?: string; // e.g. "Farm fresh seasonal vegetables"
  icon?: string; // emoji e.g. "🥦"
  image?: string;
  productsCount?: number; // e.g. 86
  status: "Active" | "Inactive" | "Congested";
  isFeatured?: boolean; // Featured on storefront homepage
  displayOrder?: number; // 1, 2, 3...
  totalOrders?: number; // 120
  revenue?: number; // 48250

  // Geographic/Delivery sector fields
  code?: string; // "SEC-01"
  pincodes?: string[];
  activeDeliveryPartners?: number;
  totalOrdersToday?: number;
  minOrderForFreeDelivery?: number;
  standardDeliveryFee?: number;
  deliverySlotTimes?: string[];
}
