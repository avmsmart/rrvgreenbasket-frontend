import { apiClient } from "./api-client";
import {
  Customer,
  CustomerSummary,
  TopSpendingCustomer,
  NewCustomerActivity,
  CustomerFilterParams,
  CustomerStatus,
} from "@/types";
import {
  MOCK_CUSTOMERS_PAGE17,
  MOCK_CUSTOMER_SUMMARY_PAGE17,
  MOCK_TOP_SPENDING_CUSTOMERS,
  MOCK_NEW_CUSTOMERS_ACTIVITY,
} from "@/data";

// In-memory working cache
let customersCache: Customer[] = [...MOCK_CUSTOMERS_PAGE17];

export const customerService = {
  /**
   * Fetch customer list with search, filter tabs, locations, and sorting
   */
  async getCustomers(params?: CustomerFilterParams): Promise<Customer[]> {
    let list = [...customersCache];

    if (params) {
      // 1. Search Query
      if (params.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.phone.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.location.toLowerCase().includes(query)
        );
      }

      // 2. Tab Filter
      if (params.tab && params.tab !== "All Customers") {
        if (params.tab === "Active") {
          list = list.filter((c) => c.status === "Active");
        } else if (params.tab === "Inactive") {
          list = list.filter((c) => c.status === "Inactive");
        } else if (params.tab === "New") {
          list = list.filter((c) => c.customerType === "New");
        } else if (params.tab === "Repeat") {
          list = list.filter((c) => c.customerType === "Repeat");
        } else if (params.tab === "Top Customers") {
          list = list.filter((c) => c.totalSpent >= 2500);
        }
      }

      // 3. Status filter
      if (params.status && params.status !== "All Status") {
        list = list.filter(
          (c) => c.status.toLowerCase() === params.status!.toLowerCase()
        );
      }

      // 4. Location filter
      if (params.location && params.location !== "All Locations") {
        list = list.filter((c) =>
          c.location.toLowerCase().includes(params.location!.toLowerCase())
        );
      }

      // 5. Customer Type filter
      if (
        params.customerType &&
        params.customerType !== "All Customer Types"
      ) {
        list = list.filter(
          (c) =>
            c.customerType?.toLowerCase() === params.customerType!.toLowerCase()
        );
      }

      // 6. Sorting
      if (params.sortBy) {
        if (params.sortBy.includes("Total Spent")) {
          list.sort((a, b) => b.totalSpent - a.totalSpent);
        } else if (params.sortBy.includes("Total Orders")) {
          list.sort((a, b) => b.totalOrders - a.totalOrders);
        } else if (params.sortBy.includes("Name")) {
          list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (params.sortBy.includes("Joined Date")) {
          // Maintain Page 17 chronological sequence
        }
      }
    }

    return apiClient.get<Customer[]>(
      "/admin/customers",
      { params },
      list
    );
  },

  /**
   * Fetch customer summary KPIs
   */
  async getCustomerSummary(): Promise<CustomerSummary> {
    const totalCustomers = 1248;
    const activeCustomers = 896;
    const inactiveCustomers = 120;
    const newCustomers = 86;
    const repeatCustomers = 312;
    const totalPurchaseValue = 342680;

    return apiClient.get<CustomerSummary>(
      "/admin/customers/summary",
      {},
      {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        newCustomers,
        repeatCustomers,
        totalPurchaseValue,
      }
    );
  },

  /**
   * Top 5 spending customers
   */
  async getTopSpendingCustomers(): Promise<TopSpendingCustomer[]> {
    return apiClient.get<TopSpendingCustomer[]>(
      "/admin/customers/top-spending",
      {},
      MOCK_TOP_SPENDING_CUSTOMERS
    );
  },

  /**
   * Recent signups this month
   */
  async getNewCustomersActivity(): Promise<NewCustomerActivity[]> {
    return apiClient.get<NewCustomerActivity[]>(
      "/admin/customers/new-activity",
      {},
      MOCK_NEW_CUSTOMERS_ACTIVITY
    );
  },

  /**
   * Add a new customer
   */
  async addCustomer(
    customer: Omit<Customer, "id" | "totalOrders" | "totalSpent" | "joinedOn">
  ): Promise<Customer> {
    const newId = "CUST-" + String(Date.now()).slice(-4);
    const created: Customer = {
      ...customer,
      id: newId,
      totalOrders: 0,
      totalSpent: 0,
      joinedOn: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      customerType: "New",
      avatarColor: "bg-emerald-600",
    };

    customersCache = [created, ...customersCache];

    return apiClient.post<Customer>(
      "/admin/customers",
      customer,
      {},
      created
    );
  },

  /**
   * Update existing customer
   */
  async updateCustomer(
    id: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    const index = customersCache.findIndex((c) => c.id === id);
    if (index !== -1) {
      const updated = { ...customersCache[index], ...updates };
      customersCache[index] = updated;

      return apiClient.patch<Customer>(
        `/admin/customers/${encodeURIComponent(id)}`,
        updates,
        {},
        updated
      );
    }
    throw new Error(`Customer ${id} not found`);
  },

  /**
   * Toggle Active / Inactive status
   */
  async toggleCustomerStatus(id: string): Promise<Customer> {
    const index = customersCache.findIndex((c) => c.id === id);
    if (index !== -1) {
      const current = customersCache[index];
      const newStatus: CustomerStatus = current.status === "Active" ? "Inactive" : "Active";
      const updated = { ...current, status: newStatus };
      customersCache[index] = updated;

      return apiClient.patch<Customer>(
        `/admin/customers/${encodeURIComponent(id)}/status`,
        { status: newStatus },
        {},
        updated
      );
    }
    throw new Error(`Customer ${id} not found`);
  },
};
