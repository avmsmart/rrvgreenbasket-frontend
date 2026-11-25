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
  | "REFUNDED"
  | "COD_PENDING";

export type BackendPaymentMethod =
  | "COD"
  | "ONLINE_FULL"
  | "ONLINE_PARTIAL"
  | "UPI";

export interface AddressDto {
  recipientName?: string;
  recipientMobile?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude: number;
  longitude: number;
  addressPublicId?: string;
}

export type AdminDeliveryAddress = AddressDto;

export interface AdminOrderItem {
  id?: string;
  publicId?: string;
  orderItemPublicId?: string;
  productPublicId?: string;
  productName: string;
  productImage?: string | null;
  productImageUrl?: string | null;
  unitOfMeasure: string;
  quantity: number;
  quantityKg?: number;
  unitPrice: number;
  pricePerKg?: number;
  totalPrice: number;
}

export interface OrderItemResponse extends AdminOrderItem {
  orderItemPublicId: string;
  productPublicId: string;
  productName: string;
  quantityKg: number;
  pricePerKg: number;
  totalPrice: number;
}

export interface AdminOrderStatusHistory {
  id?: number | string;
  publicId?: string;
  newStatus?: string;
  status?: string;
  changedBy?: string;
  reason?: string;
  timestamp?: string;
  changedAt?: string;
}

export interface OrderStatusHistoryResponse {
  status: BackendOrderStatus;
  reason?: string;
  changedAt: string;
  changedBy?: string;
  newStatus?: string;
  timestamp?: string;
}

export interface RegisteredCustomerDto {
  registeredName?: string;
  registeredMobile?: string;
  customerPublicId?: string;
}

export interface AdminOrder {
  id?: string;
  orderPublicId: string;
  orderNumber: string;
  customerPublicId?: string;

  registeredCustomerName?: string;
  registeredCustomerMobile?: string;

  customer?: RegisteredCustomerDto;

  recipientName?: string;
  recipientMobile?: string;

  deliveryZonePublicId?: string;
  deliveryZoneName?: string;

  orderStatus: BackendOrderStatus | string;
  paymentStatus: BackendPaymentStatus | string;
  paymentMethod: BackendPaymentMethod | string;

  subtotal: number;
  subtotalAmount?: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  minimumOrderAmountSnapshot?: number;

  deliveryAddress?: AdminDeliveryAddress;

  deliveryLatitude?: number;
  deliveryLongitude?: number;

  promisedDeliveryDate?: string;
  orderPlacedAt?: string;
  cancellationAllowed?: boolean;
  cancellationDeadline?: string;
  orderDate?: string;
  currentStoreOpeningTime?: string;
  currentStoreClosingTime?: string;

  items: AdminOrderItem[];

  statusHistory?: AdminOrderStatusHistory[];

  // Optional extra metadata
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  deliveryDate?: string;
}

export interface AdminOrderPageResponse<T = AdminOrder> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  number?: number;
  size?: number;
  numberOfElements?: number;
  empty?: boolean;
}

export interface OrderResponse extends AdminOrder {
  orderStatus: BackendOrderStatus;
  paymentStatus: BackendPaymentStatus;
  paymentMethod: BackendPaymentMethod;
  orderPlacedAt: string;
  subtotalAmount: number;
  customerName?: string;
  customerPhone?: string;
  statusHistory?: OrderStatusHistoryResponse[];
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
  date?: string;
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
  | "Confirmed"
  | "CONFIRMED"
  | BackendOrderStatus;

export type PaymentMethod =
  | "UPI"
  | "COD"
  | "Card"
  | "Net Banking"
  | "Wallet"
  | "Cash on Delivery"
  | BackendPaymentMethod;

export type PaymentStatus =
  | "Paid"
  | "Pending"
  | "Failed"
  | "Refunded"
  | "COD_PENDING"
  | "COD Pending"
  | BackendPaymentStatus;

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  unitOfMeasure?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
  productImage?: string | null;
  hsnCode?: string;
}

export interface OrderTimelineEvent {
  status: string;
  time: string;
  completed: boolean;
}

export interface Order {
  id: string; // e.g. "RRV-20261121-55506" or "#ORD001234"
  orderPublicId?: string;
  orderNumber?: string;
  customerPublicId?: string;

  // Registered Customer / Account Owner
  registeredCustomerName?: string;
  registeredCustomerMobile?: string;
  customer?: RegisteredCustomerDto;

  // Delivery Recipient
  recipientName?: string;
  recipientMobile?: string;

  deliveryZonePublicId?: string;
  deliveryZoneName?: string;

  deliveryAddressObj?: AdminDeliveryAddress;
  deliveryAddress?: any; // String or AdminDeliveryAddress

  deliveryLatitude?: number;
  deliveryLongitude?: number;

  promisedDeliveryDate?: string;
  orderPlacedAt?: string;
  cancellationAllowed?: boolean;
  cancellationDeadline?: string;

  // Standard Order Management properties
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsCount?: number;
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
  subtotalAmount?: number;
  deliveryCharge?: number;
  discount?: number;
  discountAmount?: number;
  totalAmount?: number;
  couponCode?: string;
  timeline?: OrderTimelineEvent[];
  statusHistory?: AdminOrderStatusHistory[];
}

export interface OrderStatsSummary {
  totalOrders: number;
  pending: number;
  processing: number;
  outForDelivery: number;
  delivered: number;
  cancelled?: number;
}
