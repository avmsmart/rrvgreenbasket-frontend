export type PackingStatus = "Pending" | "In Packing" | "Packed";

export interface PackingOrderItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isPacked: boolean;
  category?: string;
  imageUrl?: string;
}

export interface PackingOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsCount: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: PackingStatus;
  orderTime: string;
  orderDate: string;
  area: string;
  items: PackingOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  assignedPacker?: string;
  notes?: string;
}

export interface PackingSummary {
  totalOrdersToPack: number;
  pending: number;
  inPacking: number;
  packed: number;
  packingPercentage: number;
  packedOrdersCount: number;
}

export interface TopPackingProduct {
  rank: number;
  name: string;
  category: string;
  ordersCount: number;
  icon: string;
}

export interface PackingActivity {
  id: string;
  customerName: string;
  orderId: string;
  action: string;
  itemsCount: number;
  time: string;
  status: PackingStatus;
}

export interface PackingFilterParams {
  date?: string;
  status?: string;
  area?: string;
  paymentStatus?: string;
  sortBy?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}
