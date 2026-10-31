export type CustomerStatus = "Active" | "Inactive";
export type CustomerType = "All Customer Types" | "New" | "Repeat" | "Regular";

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

export interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  totalPurchaseValue: number;
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

export interface CustomerFilterParams {
  search?: string;
  status?: string;
  location?: string;
  customerType?: string;
  sortBy?: string;
  tab?: string;
  [key: string]: string | number | boolean | undefined;
}
