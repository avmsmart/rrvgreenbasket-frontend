export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  operatingHours: {
    opensAt: string;
    closesAt: string;
  };
  orderCutoffTime: string; // e.g. "22:00"
  deliverySlots: string[];
  minimumOrderAmount: number;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  taxPercentage: number;
  acceptingOrders: boolean;
  mandiProcurementAutoCalculate: boolean;
}
