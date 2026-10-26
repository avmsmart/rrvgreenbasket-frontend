export interface PackingOrderItem {
  itemId: string;
  productId: string;
  productName: string;
  unit: string;
  orderedQty: number;
  packedQty: number;
  isPacked: boolean;
  mandiSource?: string;
}

export interface PackingOrder {
  orderId: string;
  customerName: string;
  orderTime: string;
  sector: string;
  items: PackingOrderItem[];
  status: "Pending" | "Packing" | "Packed" | "Dispatched";
  assignedPacker?: string;
}

export interface PackingSummary {
  totalOrdersToPack: number;
  completedPacking: number;
  inProgress: number;
  pending: number;
  queue: PackingOrder[];
}
