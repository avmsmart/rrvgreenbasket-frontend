/**
 * RRV Green Basket - Customer Management Service
 * Strictly handles Spring Boot REST API integration with SpringData Page pagination,
 * JWT Authorization, UUID entities, status patch updates, and seamless offline fallbacks.
 */

import { apiClient, ApiError } from "./api-client";
import {
  CustomerListItem,
  CustomerDetailResponse,
  CustomerDashboardSummary,
  SpringPage,
  CustomerQueryParams,
  CustomerProfileUpdateRequest,
  CustomerStatusUpdateRequest,
  Customer,
  TopSpendingCustomer,
  NewCustomerActivity,
  CustomerFilterParams,
  ApiResponse,
} from "@/types";
import {
  MOCK_CUSTOMER_DETAILS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_TOP_SPENDING_CUSTOMERS,
  MOCK_NEW_CUSTOMERS_ACTIVITY,
  toCustomerListItem,
} from "@/data/customer-data";

// In-memory customer state for offline fallback reactivity
let memoryCustomers: CustomerDetailResponse[] = JSON.parse(
  JSON.stringify(MOCK_CUSTOMER_DETAILS)
);

export const customerService = {
  /**
   * 1. Dashboard Summary Cards
   * Endpoint: GET /api/customers/admin/dashboard/summary
   */
  async getDashboardSummary(): Promise<CustomerDashboardSummary> {
    const totalCustomers = memoryCustomers.length;
    const activeCustomers = memoryCustomers.filter((c) => c.status === "ACTIVE").length;
    const inactiveCustomers = memoryCustomers.filter((c) => c.status === "INACTIVE").length;
    const suspendedCustomers = memoryCustomers.filter((c) => c.status === "SUSPENDED").length;
    const repeatCustomers = memoryCustomers.filter((c) => c.statistics.totalOrders > 5).length;
    const totalOrders = memoryCustomers.reduce((acc, c) => acc + c.statistics.totalOrders, 0);
    const totalPurchaseValue = memoryCustomers.reduce((acc, c) => acc + c.statistics.totalSpent, 0);

    const fallbackSummary: CustomerDashboardSummary = {
      totalCustomers: MOCK_DASHBOARD_SUMMARY.totalCustomers || totalCustomers,
      activeCustomers: MOCK_DASHBOARD_SUMMARY.activeCustomers || activeCustomers,
      inactiveCustomers: MOCK_DASHBOARD_SUMMARY.inactiveCustomers || inactiveCustomers,
      suspendedCustomers: MOCK_DASHBOARD_SUMMARY.suspendedCustomers || suspendedCustomers,
      newCustomersThisMonth: MOCK_DASHBOARD_SUMMARY.newCustomersThisMonth || 128,
      totalOrders: MOCK_DASHBOARD_SUMMARY.totalOrders || totalOrders,
      totalPurchaseValue: MOCK_DASHBOARD_SUMMARY.totalPurchaseValue || totalPurchaseValue,
      repeatCustomers: MOCK_DASHBOARD_SUMMARY.repeatCustomers || repeatCustomers,
    };

    return apiClient.get<CustomerDashboardSummary>(
      "/api/customers/admin/dashboard/summary",
      undefined,
      fallbackSummary
    );
  },

  /**
   * 2. Customer Listing, Search & Pagination
   * Endpoint: GET /api/customers
   * Returns: SpringPage<CustomerListItem>
   */
  async getCustomersPage(
    params: CustomerQueryParams = {}
  ): Promise<SpringPage<CustomerListItem>> {
    const pageIndex = params.page !== undefined ? Number(params.page) : 0;
    const pageSize = params.size !== undefined ? Number(params.size) : 10;

    // Build local filtered slice for offline fallback
    let filtered = [...memoryCustomers];

    // Query search: name, email, mobile
    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.mobileNumber.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.addresses.some(
            (a) =>
              a.city.toLowerCase().includes(q) ||
              a.pincode.includes(q) ||
              a.addressLine1.toLowerCase().includes(q)
          )
      );
    }

    // Status filter
    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    // Location filter
    if (params.location && params.location !== "All Locations" && params.location.trim()) {
      const loc = params.location.toLowerCase().trim();
      filtered = filtered.filter((c) =>
        c.addresses.some(
          (a) =>
            a.city.toLowerCase().includes(loc) ||
            a.pincode.includes(loc) ||
            a.state.toLowerCase().includes(loc)
        )
      );
    }

    // Customer Type filter
    if (params.customerType && params.customerType !== "ALL") {
      if (params.customerType === "FIRST_TIME") {
        filtered = filtered.filter((c) => c.statistics.totalOrders <= 1);
      } else if (params.customerType === "REPEAT") {
        filtered = filtered.filter((c) => c.statistics.totalOrders > 5);
      } else if (params.customerType === "TOP_CUSTOMER") {
        filtered = filtered.filter((c) => c.statistics.totalSpent >= 10000);
      }
    }

    // Date range filter
    if (params.fromDate) {
      const from = new Date(params.fromDate).getTime();
      filtered = filtered.filter((c) => new Date(c.createdAt).getTime() >= from);
    }
    if (params.toDate) {
      const to = new Date(params.toDate).getTime() + 86400000; // inclusive end of day
      filtered = filtered.filter((c) => new Date(c.createdAt).getTime() <= to);
    }

    // Sorting
    const sortField = params.sortBy || "createdAt";
    const isDesc = (params.sortDirection || "DESC").toUpperCase() === "DESC";
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortField === "totalSpent") {
        cmp = a.statistics.totalSpent - b.statistics.totalSpent;
      } else if (sortField === "totalOrders") {
        cmp = a.statistics.totalOrders - b.statistics.totalOrders;
      } else if (sortField === "fullName") {
        cmp = a.fullName.localeCompare(b.fullName);
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return isDesc ? -cmp : cmp;
    });

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize) || 1;
    const start = pageIndex * pageSize;
    const pagedItems = filtered.slice(start, start + pageSize).map(toCustomerListItem);

    const fallbackPage: SpringPage<CustomerListItem> = {
      content: pagedItems,
      totalElements,
      totalPages,
      size: pageSize,
      number: pageIndex,
      first: pageIndex === 0,
      last: pageIndex >= totalPages - 1,
      empty: pagedItems.length === 0,
    };

    // Serialize params for query string
    const requestParams: Record<string, string | number | undefined> = {
      page: pageIndex,
      size: pageSize,
    };
    if (params.query) requestParams.query = params.query;
    if (params.status) requestParams.status = params.status;
    if (params.location) requestParams.location = params.location;
    if (params.customerType) requestParams.customerType = params.customerType;
    if (params.fromDate) requestParams.fromDate = params.fromDate;
    if (params.toDate) requestParams.toDate = params.toDate;
    if (params.sortBy) requestParams.sortBy = params.sortBy;
    if (params.sortDirection) requestParams.sortDirection = params.sortDirection;

    return apiClient.get<SpringPage<CustomerListItem>>(
      "/api/customers",
      { params: requestParams },
      fallbackPage
    );
  },

  /**
   * 3. Customer Detail
   * Endpoint: GET /api/customers/admin/{customerId}/details (or GET /api/customers/{customerId})
   */
  async getCustomerDetail(customerId: string): Promise<CustomerDetailResponse> {
    const fallbackCustomer =
      memoryCustomers.find((c) => c.id === customerId) || memoryCustomers[0];

    try {
      return await apiClient.get<CustomerDetailResponse>(
        `/api/customers/admin/${customerId}/details`,
        undefined,
        fallbackCustomer
      );
    } catch {
      // Fallback endpoint if admin subpath is routed directly
      return apiClient.get<CustomerDetailResponse>(
        `/api/customers/${customerId}`,
        undefined,
        fallbackCustomer
      );
    }
  },

  /**
   * 4. Status Update (Mark Inactive / Activate / Suspend)
   * Endpoint: PATCH /api/customers/{customerId}/status
   */
  async updateCustomerStatus(
    customerId: string,
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  ): Promise<{ success: boolean; status: "ACTIVE" | "INACTIVE" | "SUSPENDED" }> {
    // Update local memory cache
    const target = memoryCustomers.find((c) => c.id === customerId);
    if (target) {
      target.status = status;
      target.updatedAt = new Date().toISOString();
    }

    const fallbackResult = { success: true, status };

    try {
      const response = await apiClient.patch<ApiResponse<{ status: "ACTIVE" | "INACTIVE" | "SUSPENDED" }>>(
        `/api/customers/${customerId}/status`,
        { status }
      );
      return { success: true, status: (response as any)?.status || status };
    } catch {
      return fallbackResult;
    }
  },

  /**
   * 5. Profile Edit
   * Endpoint: PUT /api/customers/{customerId}
   * Mobile number is strictly immutable to preserve Auth Service synchronization.
   */
  async updateCustomerProfile(
    customerId: string,
    payload: CustomerProfileUpdateRequest
  ): Promise<CustomerDetailResponse> {
    const targetIndex = memoryCustomers.findIndex((c) => c.id === customerId);
    if (targetIndex >= 0) {
      memoryCustomers[targetIndex] = {
        ...memoryCustomers[targetIndex],
        fullName: payload.fullName,
        email: payload.email !== undefined ? payload.email : memoryCustomers[targetIndex].email,
        profileImageUrl:
          payload.profileImageUrl !== undefined
            ? payload.profileImageUrl
            : memoryCustomers[targetIndex].profileImageUrl,
        updatedAt: new Date().toISOString(),
      };
    }

    const fallbackResult = memoryCustomers[targetIndex] || memoryCustomers[0];

    return apiClient.put<CustomerDetailResponse>(
      `/api/customers/${customerId}`,
      {
        fullName: payload.fullName,
        email: payload.email,
        profileImageUrl: payload.profileImageUrl,
      },
      undefined,
      fallbackResult
    );
  },

  /**
   * 6. CSV Export
   * Endpoint: GET /api/customers/admin/export
   * Supports identical query parameters as customer listing.
   */
  async exportCustomersCsv(params: CustomerQueryParams = {}): Promise<Blob> {
    const requestParams: Record<string, string | number | undefined> = {};
    if (params.query) requestParams.query = params.query;
    if (params.status) requestParams.status = params.status;
    if (params.location) requestParams.location = params.location;
    if (params.customerType) requestParams.customerType = params.customerType;
    if (params.fromDate) requestParams.fromDate = params.fromDate;
    if (params.toDate) requestParams.toDate = params.toDate;

    try {
      const searchParams = new URLSearchParams();
      Object.entries(requestParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      const exportUrl = `/api/customers/admin/export${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(exportUrl, {
        headers: {
          Accept: "text/csv, application/octet-stream",
        },
      });

      if (res.ok) {
        return await res.blob();
      }
    } catch (e) {
      console.warn("Backend CSV export unavailable, compiling local high-fidelity CSV...", e);
    }

    // Local CSV generation fallback
    let list = [...memoryCustomers];
    if (params.query) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.mobileNumber.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }
    if (params.status) {
      list = list.filter((c) => c.status === params.status);
    }

    const headers = [
      "Customer Public UUID",
      "Full Name",
      "Mobile Number",
      "Email",
      "Status",
      "Location",
      "Total Orders",
      "Total Spent (INR)",
      "Registered On",
    ];

    const rows = list.map((c) => {
      const defaultAddr = c.addresses.find((a) => a.isDefault) || c.addresses[0];
      const loc = defaultAddr ? `${defaultAddr.city} (${defaultAddr.pincode})` : "N/A";
      return [
        `"${c.id}"`,
        `"${c.fullName.replace(/"/g, '""')}"`,
        `"${c.mobileNumber}"`,
        `"${c.email || ""}"`,
        `"${c.status}"`,
        `"${loc}"`,
        c.statistics.totalOrders,
        c.statistics.totalSpent,
        `"${new Date(c.createdAt).toLocaleDateString("en-IN")}"`,
      ].join(",");
    });

    const csvString = [headers.join(","), ...rows].join("\r\n");
    return new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  },

  // =========================================================================
  // Legacy / Adapter Methods
  // =========================================================================

  async getCustomerSummary(): Promise<CustomerDashboardSummary> {
    return this.getDashboardSummary();
  },

  async getTopSpendingCustomers(): Promise<TopSpendingCustomer[]> {
    return MOCK_TOP_SPENDING_CUSTOMERS;
  },

  async getNewCustomersActivity(): Promise<NewCustomerActivity[]> {
    return MOCK_NEW_CUSTOMERS_ACTIVITY;
  },

  async getCustomers(params?: CustomerFilterParams): Promise<Customer[]> {
    const rawStatus = String(params?.status || "");
    const page = await this.getCustomersPage({
      query: params?.search,
      status:
        rawStatus.toUpperCase() === "ACTIVE"
          ? "ACTIVE"
          : rawStatus.toUpperCase() === "INACTIVE"
          ? "INACTIVE"
          : rawStatus.toUpperCase() === "SUSPENDED"
          ? "SUSPENDED"
          : undefined,
      location: params?.location,
      sortBy: params?.sortBy,
      page: 0,
      size: 100,
    });

    return page.content.map((item) => {
      return {
        id: item.id,
        name: item.fullName,
        phone: item.mobileNumber,
        email: item.email || "",
        location: item.location || "Kurnool",
        totalOrders: item.totalOrders,
        totalSpent: item.totalSpent,
        status: item.status,
        joinedOn: new Date(item.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
    });
  },

  async toggleCustomerStatus(id: string): Promise<{ status: "ACTIVE" | "INACTIVE" | "SUSPENDED" }> {
    const target = memoryCustomers.find((c) => c.id === id);
    const nextStatus = target?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await this.updateCustomerStatus(id, nextStatus);
    return { status: res.status };
  },

  async updateCustomer(
    id: string,
    data: { name: string; email: string }
  ): Promise<CustomerDetailResponse> {
    return this.updateCustomerProfile(id, {
      fullName: data.name,
      email: data.email,
    });
  },

  async addCustomer(data: { name: string; phone: string; email?: string }): Promise<CustomerDetailResponse> {
    // Generate UUID
    const uuid = "cust_" + Math.random().toString(36).substring(2, 9) + "-" + Date.now();
    const newRecord: CustomerDetailResponse = {
      id: uuid,
      authUserId: "auth_" + Date.now(),
      fullName: data.name,
      email: data.email || null,
      mobileNumber: data.phone,
      profileImageUrl: null,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        totalOrders: 0,
        totalSpent: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
      },
      addresses: [
        {
          id: "addr_" + Date.now(),
          addressType: "HOME",
          receiverName: data.name,
          receiverMobile: data.phone,
          addressLine1: "Primary Address",
          city: "Kurnool",
          state: "Andhra Pradesh",
          pincode: "518002",
          country: "India",
          isDefault: true,
        },
      ],
      recentOrders: [],
    };
    memoryCustomers.unshift(newRecord);
    return newRecord;
  },
};
export default customerService;
