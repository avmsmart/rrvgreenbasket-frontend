/**
 * RRV Green Basket - Delivery Management Types
 * Strongly typed DTOs matching Spring Boot Delivery Microservice contracts.
 */

export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: number[][][]; // [ [ [lng, lat], [lng, lat], ... ] ]
}

export interface DeliveryZoneResponse {
  publicId: string;
  zoneName: string;
  zoneCode: string;
  description?: string;
  city: string;
  state: string;
  pincode?: string;
  deliveryCharge: number;
  minimumOrderAmount: number;
  freeDeliveryThreshold?: number;
  estimatedDeliveryTime?: string;
  active: boolean;
  boundary?: GeoJsonPolygon;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerDeliveryZone {
  publicId: string;
  zoneName: string;
  city: string;
  state: string;
  pincode?: string;
  deliveryCharge: number;
  minimumOrderAmount: number;
  freeDeliveryThreshold?: number;
  estimatedDeliveryTime?: string;
  boundary?: GeoJsonPolygon;
}

export interface CheckDeliveryAvailabilityRequest {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DeliveryAvailabilityResponse {
  available: boolean;
  serviceable?: boolean;
  zonePublicId?: string;
  zoneName?: string;
  deliveryCharge?: number;
  minimumOrderAmount?: number;
  freeDeliveryThreshold?: number;
  isFreeDelivery?: boolean;
  estimatedDeliveryTime?: string;
  estimatedDeliveryWindow?: string;
  message?: string;
}

export interface CreateDeliveryZoneRequest {
  zoneName: string;
  zoneCode: string;
  description?: string;
  city: string;
  state: string;
  pincode?: string;
  deliveryCharge: number;
  minimumOrderAmount: number;
  freeDeliveryThreshold?: number;
  estimatedDeliveryTime?: string;
  active: boolean;
  boundary: GeoJsonPolygon;
}

export interface UpdateDeliveryZoneRequest {
  zoneName: string;
  zoneCode: string;
  description?: string;
  city: string;
  state: string;
  pincode?: string;
  deliveryCharge: number;
  minimumOrderAmount: number;
  freeDeliveryThreshold?: number;
  estimatedDeliveryTime?: string;
  active: boolean;
  boundary: GeoJsonPolygon;
}

export interface UpdateDeliveryZoneStatusRequest {
  active: boolean;
}

export interface AdminDeliveryZoneQueryParams {
  search?: string;
  active?: boolean;
  city?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC" | "asc" | "desc";
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ============================================================================
// Legacy compatibility types to prevent compile errors in existing components
// ============================================================================
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
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  customerAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  area: string;
  amount: number;
  status: DeliveryStatus;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  assignedPartnerPhone?: string;
  orderTime: string;
  orderDate?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  deliveryTime?: string;
  failureReason?: string;
  driverStatus?: string;
  lastLocationUpdate?: string;
  itemsCount: number;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timeline?: DeliveryTimelineItem[];
  issues?: DeliveryIssue[];
}

export interface DeliveryTimelineItem {
  id?: string;
  orderId?: string;
  action?: string;
  partnerName?: string;
  status: string;
  time: string;
  completed?: boolean;
  details?: string;
}

export interface DeliveryIssue {
  id: string;
  orderId?: string;
  customerName?: string;
  time?: string;
  partnerName?: string;
  reason?: string;
  actionTaken?: string;
  type?: string;
  description?: string;
  reportedTime?: string;
  resolved?: boolean;
}

export interface DeliverySummary {
  totalDeliveries: number;
  totalOrders: number;
  pending: number;
  pendingAssignment: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
}

export interface DeliveryFilterParams {
  status?: string;
  area?: string;
  partner?: string;
  search?: string;
  date?: string;
  sortBy?: string;
}
