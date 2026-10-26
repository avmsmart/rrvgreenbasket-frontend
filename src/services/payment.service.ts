import { apiClient } from "./api-client";
import { PaymentTransaction, PaymentMethod, PaymentStatus } from "@/types";
import { MOCK_PAYMENTS_DATA } from "@/data";

export interface PaymentQueryParams {
  status?: PaymentStatus | "All";
  method?: PaymentMethod | "All";
  search?: string;
  date?: string;
}

export const paymentService = {
  /**
   * Fetch payment transactions
   */
  async getPayments(params?: PaymentQueryParams): Promise<PaymentTransaction[]> {
    let filtered = [...MOCK_PAYMENTS_DATA];

    if (params?.status && params.status !== "All") {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.method && params.method !== "All") {
      filtered = filtered.filter((p) => p.paymentMethod === params.method);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.orderId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q)
      );
    }

    return apiClient.get<PaymentTransaction[]>(
      "/admin/payments",
      {
        params: {
          status: params?.status === "All" ? undefined : params?.status,
          method: params?.method === "All" ? undefined : params?.method,
          search: params?.search,
          date: params?.date,
        },
      },
      filtered
    );
  },

  /**
   * Get payment summary stats (Total collected, UPI vs COD, Pending payouts)
   */
  async getPaymentSummaryStats(): Promise<{
    totalCollected: number;
    upiTotal: number;
    codPending: number;
    successfulTransactions: number;
  }> {
    const fallback = {
      totalCollected: 41850,
      upiTotal: 34500,
      codPending: 7350,
      successfulTransactions: 122,
    };

    return apiClient.get(
      "/admin/payments/summary",
      {},
      fallback
    );
  },
};
