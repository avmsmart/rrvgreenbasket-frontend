import { apiClient } from "./api-client";
import {
  PaymentTransaction,
  PaymentsSummary,
  PaymentMethodShare,
  DailyCollectionStat,
  PaymentActivityLog,
  PaymentStatus,
} from "@/types";
import {
  MOCK_PAYMENT_TRANSACTIONS,
  MOCK_PAYMENTS_SUMMARY,
  MOCK_PAYMENT_METHOD_SHARES,
  MOCK_DAILY_COLLECTIONS,
  MOCK_PAYMENT_ACTIVITIES,
} from "@/data/payment-data";
import { getSystemDateFormatted, getOffsetDateFormatted } from "@/utils";

function getDynamicMockTransactions(): PaymentTransaction[] {
  const systemToday = getSystemDateFormatted();
  const systemYesterday = getOffsetDateFormatted(-1);
  return MOCK_PAYMENT_TRANSACTIONS.map((t) => ({
    ...t,
    date: (t.date || systemToday)
      .replace(/27 Oct 2026/g, systemToday)
      .replace(/26 Oct 2026/g, systemYesterday),
  }));
}

const transactionsCache: PaymentTransaction[] = getDynamicMockTransactions();

export const paymentService = {
  /**
   * Fetch all payment transactions with filtering, search, and sorting
   */
  async getTransactions(params?: {
    search?: string;
    status?: string;
    method?: string;
    sortBy?: string;
    tab?: string;
  }): Promise<PaymentTransaction[]> {
    let list = [...transactionsCache];

    if (params) {
      if (params.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        list = list.filter(
          (t) =>
            t.id.toLowerCase().includes(query) ||
            t.orderId.toLowerCase().includes(query) ||
            t.customerName.toLowerCase().includes(query) ||
            Boolean(t.customerPhone && t.customerPhone.includes(query)) ||
            Boolean(t.gatewayRef && t.gatewayRef.toLowerCase().includes(query))
        );
      }

      if (params.tab && params.tab !== "All Transactions") {
        list = list.filter(
          (t) => t.status.toLowerCase() === params.tab!.toLowerCase()
        );
      }

      if (params.status && params.status !== "All Status") {
        list = list.filter(
          (t) => t.status.toLowerCase() === params.status!.toLowerCase()
        );
      }

      if (params.method && params.method !== "All Methods") {
        list = list.filter((t) =>
          (t.method || t.paymentMethod || "")
            .toLowerCase()
            .includes(params.method!.toLowerCase())
        );
      }

      if (params.sortBy) {
        if (params.sortBy === "Newest First") {
          list.sort(
            (a, b) =>
              new Date(b.timestamp || b.date || 0).getTime() -
              new Date(a.timestamp || a.date || 0).getTime()
          );
        } else if (params.sortBy === "Oldest First") {
          list.sort(
            (a, b) =>
              new Date(a.timestamp || a.date || 0).getTime() -
              new Date(b.timestamp || b.date || 0).getTime()
          );
        } else if (params.sortBy === "Amount: High to Low") {
          list.sort((a, b) => b.amount - a.amount);
        } else if (params.sortBy === "Amount: Low to High") {
          list.sort((a, b) => a.amount - b.amount);
        }
      }
    }

    return apiClient.get<PaymentTransaction[]>(
      "/admin/payments/transactions",
      { params },
      list
    );
  },

  /**
   * Fetch payment summary KPIs
   */
  async getPaymentsSummary(): Promise<PaymentsSummary> {
    const totalRevenue = transactionsCache
      .filter((t) => t.status === "Paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const paidOrders = transactionsCache.filter((t) => t.status === "Paid").length;
    const pendingPayments = transactionsCache.filter(
      (t) => t.status === "Pending"
    ).length;
    const failedPayments = transactionsCache.filter(
      (t) => t.status === "Failed"
    ).length;
    const refundedList = transactionsCache.filter((t) => t.status === "Refunded");
    const refundedAmount = refundedList.reduce(
      (sum, t) => sum + (t.refundAmount || t.amount),
      0
    );

    const calculatedSummary: PaymentsSummary = {
      totalRevenue: totalRevenue || MOCK_PAYMENTS_SUMMARY.totalRevenue,
      revenueGrowth: "+12.4%",
      paidOrders: paidOrders || MOCK_PAYMENTS_SUMMARY.paidOrders,
      paidSuccessRate: "91.4%",
      pendingPayments: pendingPayments || MOCK_PAYMENTS_SUMMARY.pendingPayments,
      failedPayments: failedPayments || MOCK_PAYMENTS_SUMMARY.failedPayments,
      refundedAmount: refundedAmount || MOCK_PAYMENTS_SUMMARY.refundedAmount,
      refundedCount: refundedList.length || MOCK_PAYMENTS_SUMMARY.refundedCount,
    };

    return apiClient.get<PaymentsSummary>(
      "/admin/payments/summary",
      {},
      calculatedSummary
    );
  },

  /**
   * Fetch payment method distribution shares
   */
  async getMethodShares(): Promise<PaymentMethodShare[]> {
    return apiClient.get<PaymentMethodShare[]>(
      "/admin/payments/methods-share",
      {},
      MOCK_PAYMENT_METHOD_SHARES
    );
  },

  /**
   * Fetch weekly daily collection statistics
   */
  async getDailyCollections(): Promise<DailyCollectionStat[]> {
    return apiClient.get<DailyCollectionStat[]>(
      "/admin/payments/daily-collection",
      {},
      MOCK_DAILY_COLLECTIONS
    );
  },

  /**
   * Fetch recent payment activity audit log
   */
  async getPaymentActivities(): Promise<PaymentActivityLog[]> {
    return apiClient.get<PaymentActivityLog[]>(
      "/admin/payments/activities",
      {},
      MOCK_PAYMENT_ACTIVITIES
    );
  },

  /**
   * Process refund for a transaction
   */
  async processRefund(
    id: string,
    amount: number,
    reason: string
  ): Promise<PaymentTransaction> {
    const idx = transactionsCache.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const updated: PaymentTransaction = {
        ...transactionsCache[idx],
        status: "Refunded",
        refundAmount: amount,
        refundDate: new Date().toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        failureReason: reason,
      };
      transactionsCache[idx] = updated;

      return apiClient.post<PaymentTransaction>(
        `/admin/payments/transactions/${encodeURIComponent(id)}/refund`,
        { amount, reason },
        {},
        updated
      );
    }
    throw new Error(`Transaction ${id} not found`);
  },

  /**
   * Mark transaction as paid (e.g. for COD or pending bank verification)
   */
  async markAsPaid(
    id: string,
    gatewayRef = "OFFLINE_VERIFIED"
  ): Promise<PaymentTransaction> {
    const idx = transactionsCache.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const updated: PaymentTransaction = {
        ...transactionsCache[idx],
        status: "Paid",
        gatewayRef,
      };
      transactionsCache[idx] = updated;

      return apiClient.patch<PaymentTransaction>(
        `/admin/payments/transactions/${encodeURIComponent(id)}/mark-paid`,
        { gatewayRef },
        {},
        updated
      );
    }
    throw new Error(`Transaction ${id} not found`);
  },

  /**
   * Export transactions as CSV
   */
  exportCsv(transactions: PaymentTransaction[]): string {
    const headers = [
      "Transaction ID",
      "Order ID",
      "Customer Name",
      "Phone",
      "Amount",
      "Payment Method",
      "Status",
      "Date",
      "Gateway Ref",
    ];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.orderId}"`,
      `"${t.customerName}"`,
      `"${t.customerPhone}"`,
      `"${t.amount}"`,
      `"${t.method}"`,
      `"${t.status}"`,
      `"${t.date}"`,
      `"${t.gatewayRef || ""}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  },
};
