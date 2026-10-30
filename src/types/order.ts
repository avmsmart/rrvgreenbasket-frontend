export type OrderStatus =
  | "Pending"
  | "Processing"
  | "In Packing"
  | "Packed"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod = "UPI" | "COD" | "Card" | "Net Banking" | "Wallet";

export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
  hsnCode?: string;
}

export interface OrderTimelineEvent {
  status: string;
  time: string;
  completed: boolean;
}

export interface Order {
  id: string; // e.g. "#ORD001234"
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsCount: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  orderTime: string;
  orderDate?: string;
  deliveryTime?: string;
  deliveryPartner?: string;
  transactionId?: string;
  items?: OrderItem[];
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  couponCode?: string;
  timeline?: OrderTimelineEvent[];
}

export interface OrderStatsSummary {
  totalOrders: number;
  pending: number;
  processing: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
}
