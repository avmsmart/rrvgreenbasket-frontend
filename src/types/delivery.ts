export type DeliveryStatus = "Pending" | "Out for Delivery" | "Delivered" | "Failed";

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  area: string;
  totalDeliveries: number;
  pendingDeliveries?: number;
  activeDeliveries?: number;
  rating: number;
  status: "Active" | "On Delivery" | "Idle" | "Inactive" | "Online" | "Offline";
  currentOrder?: string;
  vehicleDetails?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  avatar?: string;
  joinedDate?: string;
  monthlyDeliveries?: number;
  onTimeDeliveries?: number;
  onTimeRate?: string;
  monthlyEarnings?: number;
  orderAcceptanceRate?: string;
  customerSatisfaction?: string;
  avgDeliveryTime?: string;
  distanceCovered?: string;
  drivingLicenseNumber?: string;
  drivingLicenseStatus?: "Verified" | "Pending" | "Rejected";
  vehicleRcNumber?: string;
  vehicleRcStatus?: "Verified" | "Pending" | "Rejected";
  aadhaarNumber?: string;
  aadhaarStatus?: "Verified" | "Pending" | "Rejected";
  bankAccountDetails?: string;
  bankAccountStatus?: "Verified" | "Pending" | "Rejected";
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated?: string;
  };
  currentOrderDetails?: {
    orderId: string;
    itemsCount: number;
    amount: number;
    assignedTime: string;
  };
}

export interface DeliveryPartnersSummary {
  totalPartners: number;
  activePartners: number;
  onDelivery: number;
  idlePartners: number;
  inactivePartners: number;
}

export interface AreaDeliveryStat {
  area: string;
  deliveries: number;
  percentage: number;
  deliveriesCount?: number;
  activePartners?: number;
}

export interface DeliveryOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  area: string;
  itemsCount: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: DeliveryStatus;
  deliveryTime?: string;
  orderTime: string;
  orderDate: string;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  assignedPartnerPhone?: string;
  failureReason?: string;
  items?: DeliveryOrderItem[];
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  lastLocationUpdate?: string;
}

export interface DeliverySummary {
  totalOrders: number;
  pendingAssignment: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
}

export interface DeliveryTimelineItem {
  id: string;
  time: string;
  orderId: string;
  partnerName: string;
  action: string;
  status: DeliveryStatus;
  details?: string;
}

export interface DeliveryIssue {
  id: string;
  orderId: string;
  time: string;
  reason: string;
  customerName?: string;
  partnerName?: string;
}

export interface DeliveryFilterParams {
  date?: string;
  status?: string;
  area?: string;
  partner?: string;
  search?: string;
  sortBy?: string;
  [key: string]: string | number | boolean | undefined;
}
