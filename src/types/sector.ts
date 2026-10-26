export interface Sector {
  id: string;
  name: string; // e.g. "Sector 1 - Kurnool Town", "Sector 2 - C-Camp"
  code: string; // "SEC-01"
  pincodes: string[];
  activeDeliveryPartners: number;
  totalOrdersToday: number;
  minOrderForFreeDelivery: number;
  standardDeliveryFee: number;
  deliverySlotTimes: string[];
  status: "Active" | "Inactive" | "Congested";
}
