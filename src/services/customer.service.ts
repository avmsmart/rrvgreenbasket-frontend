import { apiClient } from "./api-client";
import { Customer } from "@/types";
import { MOCK_CUSTOMERS_DATA } from "@/data";

export interface CustomerQueryParams {
  search?: string;
  status?: "Active" | "Inactive" | "All";
}

export const customerService = {
  /**
   * Fetch customer directory
   */
  async getCustomers(params?: CustomerQueryParams): Promise<Customer[]> {
    let filtered = [...MOCK_CUSTOMERS_DATA];

    if (params?.status && params.status !== "All") {
      filtered = filtered.filter((c) => c.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    return apiClient.get<Customer[]>(
      "/admin/customers",
      {
        params: {
          search: params?.search,
          status: params?.status === "All" ? undefined : params?.status,
        },
      },
      filtered
    );
  },

  /**
   * Fetch single customer details
   */
  async getCustomerById(customerId: string): Promise<Customer | null> {
    const fallback =
      MOCK_CUSTOMERS_DATA.find((c) => c.id === customerId) || null;

    return apiClient.get<Customer | null>(
      `/admin/customers/${encodeURIComponent(customerId)}`,
      {},
      fallback
    );
  },
};
