/**
 * RRV Green Basket - Order Management Types
 * Strongly typed DTOs matching Spring Boot Order Microservice contracts.
 */

export type BackendOrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export type BackendPaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export type BackendPaymentMethod =
  | "COD"
  | "ONLINE_FULL"
  | "ONLINE_PARTIAL";

export interface AddressDto {
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface OrderItemResponse {
  orderItemPublicId: string;
  productPublicId: string;
  productName: string;
  productImageUrl?: string;
  quantityKg: number;
  unitOfMeasure?: string;
  pricePerKg: number;
  totalPrice: number;
}

export interface OrderStatusHistoryResponse {
  status: BackendOrderStatus;
  reason?: string;
  changedAt: string;
  changedBy?: string;
}

export interface OrderResponse {
  orderPublicId: string;
  orderNumber: string;
  customerPublicId?: string;
  customerName?: string;
  customerPhone?: string;
  orderStatus: BackendOrderStatus;
  paymentMethod: BackendPaymentMethod;
  paymentStatus: BackendPaymentStatus;
  subtotalAmount: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
  deliveryAddress: AddressDto;
  statusHistory?: OrderStatusHistoryResponse[];
  items?: OrderItemResponse[];
  deliveryDate?: string;
  orderPlacedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  deliveryAddress: AddressDto;
  addressId?: string;
  paymentMethod: BackendPaymentMethod;
  notes?: string;
  idempotencyKey?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface UpdateOrderStatusRequest {
  status: BackendOrderStatus;
  reason?: string;
}

export interface OrderBusinessSettingsResponse {
  publicId?: string;
  orderAcceptanceEnabled: boolean;
  openingTime: string; // HH:mm:ss
  closingTime: string; // HH:mm:ss
  deliveryType?: string;
  deliveryDaysOffset?: number;
  timezone?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UpdateOrderSettingsRequest {
  orderAcceptanceEnabled: boolean;
  openingTime: string;
  closingTime: string;
  deliveryType?: string;
  deliveryDaysOffset?: number;
  timezone?: string;
}

export interface UpdateOrderSettingsStatusRequest {
  orderAcceptanceEnabled: boolean;
}

export interface OrderStatisticsResponse {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  packedOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

export interface AdminOrderQueryParams {
  search?: string;
  status?: BackendOrderStatus | string;
  customerPublicId?: string;
  fromDate?: string;
  toDate?: string;
  deliveryDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ============================================================================
// Legacy compatibility types to avoid breaking existing UI components
// ============================================================================
export type OrderStatus =
  | "Pending"
  | "Processing"
  | "In Packing"
  | "Packed"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | BackendOrderStatus;

export type PaymentMethod =
  | "UPI"
  | "COD"
  | "Card"
  | "Net Banking"
  | "Wallet"
  | BackendPaymentMethod;

export type PaymentStatus =
  | "Paid"
  | "Pending"
  | "Failed"
  | "Refunded"
  | BackendPaymentStatus;

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
  cancelled?: number;
}
