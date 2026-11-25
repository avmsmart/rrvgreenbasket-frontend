/**
 * RRV Green Basket - Customer Management Types
 * Aligned with Spring Boot Customer Service API Contracts
 */

export type CustomerAccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// Compatible with legacy "Active" | "Inactive" while strictly enforcing Spring backend statuses
export type CustomerStatus = CustomerAccountStatus | "Active" | "Inactive";

export type CustomerTypeFilter = "ALL" | "FIRST_TIME" | "REPEAT" | "TOP_CUSTOMER";
export type CustomerType = "All Customer Types" | "New" | "Repeat" | "Regular";

/**
 * Spring Data Page generic envelope (0-indexed)
 */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Current page index (0-based)
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Customer Listing item returned in SpringPage<CustomerListItem>
 */
export interface CustomerListItem {
  id: string; // Customer public UUID
  fullName: string;
  email: string | null;
  mobileNumber: string;
  profileImageUrl: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  location: string | null; // Primary address (city / PIN)
  totalOrders: number;
  totalSpent: number;
  createdAt: string; // ISO date
}

/**
 * Top Summary metrics returned by GET /api/customers/admin/dashboard/summary
 */
export interface CustomerDashboardSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  suspendedCustomers: number;
  newCustomersThisMonth: number;
  totalOrders: number;
  totalPurchaseValue: number;
  repeatCustomers: number;
}

/**
 * Customer Address DTO
 */
export interface CustomerAddressDto {
  id: string; // Public UUID
  addressType: "HOME" | "WORK" | "OTHER";
  receiverName: string;
  receiverMobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

/**
 * Customer Recent Order DTO
 */
export interface CustomerRecentOrderDto {
  orderPublicId: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  itemCount: number;
}

/**
 * Comprehensive Customer Detail Response returned by GET /api/customers/admin/{customerId}/details
 */
export interface CustomerDetailResponse {
  id: string; // Customer public UUID
  authUserId: string;
  fullName: string;
  email: string | null;
  mobileNumber: string;
  profileImageUrl: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  // Aggregated Order Statistics
  statistics: {
    totalOrders: number;
    totalSpent: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
  // Addresses
  addresses: CustomerAddressDto[];
  // Recent Orders (Latest 3-5 orders)
  recentOrders: CustomerRecentOrderDto[];
}

/**
 * Request payload for customer profile edit: PUT /api/customers/{customerId}
 */
export interface CustomerProfileUpdateRequest {
  fullName: string;
  email?: string | null;
  profileImageUrl?: string | null;
}

/**
 * Request payload for customer status patch: PATCH /api/customers/{customerId}/status
 */
export interface CustomerStatusUpdateRequest {
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

/**
 * Query parameters for customer listing & export
 */
export interface CustomerQueryParams {
  query?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;
  location?: string;
  customerType?: CustomerTypeFilter | string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  [key: string]: string | number | boolean | undefined;
}

// =========================================================================
// Legacy / Compatibility Types (preserves compatibility with other widgets)
// =========================================================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  joinedOn: string;
  avatarColor?: string;
  customerType?: "New" | "Repeat" | "Regular";
  address?: string;
  lastOrderDate?: string;
  recentOrders?: {
    orderId: string;
    date: string;
    amount: number;
    itemsCount: number;
    status: string;
  }[];
}

export interface CustomerSummary extends CustomerDashboardSummary {
  newCustomers?: number;
}

export interface TopSpendingCustomer {
  rank: number;
  id: string;
  name: string;
  totalSpent: number;
  totalOrders: number;
  avatarColor?: string;
}

export interface NewCustomerActivity {
  id: string;
  name: string;
  phone: string;
  joinedTime: string;
  status: CustomerStatus;
  avatarColor?: string;
}

export interface CustomerFilterParams extends CustomerQueryParams {
  search?: string;
  tab?: string;
}
