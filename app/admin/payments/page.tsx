"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Download, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { paymentService } from "@/services/payment.service";
import {
  PaymentTransaction,
  PaymentsSummary,
  PaymentMethodShare,
  DailyCollectionStat,
  PaymentActivityLog,
  PaymentStatus,
} from "@/types";
import {
  PaymentStatsCards,
  PaymentTabsBar,
  PaymentTabType,
  PaymentFiltersBar,
  PaymentTable,
  PaymentAnalyticsWidgets,
  TransactionDetailsDrawer,
} from "@/components/payments";

import {
  MOCK_PAYMENT_TRANSACTIONS,
  MOCK_PAYMENTS_SUMMARY,
  MOCK_PAYMENT_METHOD_SHARES,
  MOCK_DAILY_COLLECTIONS,
  MOCK_PAYMENT_ACTIVITIES,
} from "@/data";
import { getSystemDateFormatted, getOffsetDateFormatted } from "@/utils";

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(MOCK_PAYMENT_TRANSACTIONS);
  const [summary, setSummary] = useState<PaymentsSummary>(MOCK_PAYMENTS_SUMMARY);
  const [methodShares, setMethodShares] = useState<PaymentMethodShare[]>(MOCK_PAYMENT_METHOD_SHARES);
  const [dailyCollections, setDailyCollections] = useState<DailyCollectionStat[]>(MOCK_DAILY_COLLECTIONS);
  const [activityLogs, setActivityLogs] = useState<PaymentActivityLog[]>(MOCK_PAYMENT_ACTIVITIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters state
  const [activeTab, setActiveTab] = useState<PaymentTabType>("All Transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest First");
  const [dateRange, setDateRange] = useState<string>(() => `Today, ${getSystemDateFormatted()}`);

  // Drawer / Inspector
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [txData, summaryData, sharesData, collectionsData, activitiesData] =
        await Promise.all([
          paymentService.getTransactions(),
          paymentService.getPaymentsSummary(),
          paymentService.getMethodShares(),
          paymentService.getDailyCollections(),
          paymentService.getPaymentActivities(),
        ]);

      setTransactions(txData);
      setSummary(summaryData);
      setMethodShares(sharesData);
      setDailyCollections(collectionsData);
      setActivityLogs(activitiesData);
    } catch (err) {
      console.error("Failed to load payment data:", err);
      setError("Failed to load payments data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Tab filter
        if (activeTab !== "All Transactions" && t.status !== activeTab) {
          return false;
        }

        // Status dropdown
        if (statusFilter !== "All Status" && t.status !== statusFilter) {
          return false;
        }

        // Method dropdown
        if (
          methodFilter !== "All Methods" &&
          !(t.method || t.paymentMethod || "")
            .toLowerCase()
            .includes(methodFilter.toLowerCase())
        ) {
          return false;
        }

        // Date filter
        if (dateRange && dateRange !== "All Dates" && dateRange !== "All Time") {
          const txDate = (t.date || t.timestamp || "").toLowerCase();
          const todayFormatted = getSystemDateFormatted().toLowerCase();
          const yesterdayFormatted = getOffsetDateFormatted(-1).toLowerCase();

          if (dateRange.toLowerCase().includes("today") || dateRange.toLowerCase().includes(todayFormatted)) {
            if (!txDate.includes(todayFormatted) && !txDate.includes("27 oct")) return false;
          } else if (dateRange.toLowerCase().includes("yesterday") || dateRange.toLowerCase().includes(yesterdayFormatted)) {
            if (!txDate.includes(yesterdayFormatted) && !txDate.includes("26 oct")) return false;
          } else if (!dateRange.includes(" - ")) {
            if (!txDate.includes(dateRange.toLowerCase())) return false;
          }
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            t.id.toLowerCase().includes(q) ||
            t.orderId.toLowerCase().includes(q) ||
            t.customerName.toLowerCase().includes(q) ||
            Boolean(t.customerPhone && t.customerPhone.includes(q)) ||
            Boolean(t.gatewayRef && t.gatewayRef.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Newest First") {
          return (
            new Date(b.timestamp || b.date || 0).getTime() -
            new Date(a.timestamp || a.date || 0).getTime()
          );
        }
        if (sortBy === "Oldest First") {
          return (
            new Date(a.timestamp || a.date || 0).getTime() -
            new Date(b.timestamp || b.date || 0).getTime()
          );
        }
        if (sortBy === "Amount: High to Low") {
          return b.amount - a.amount;
        }
        if (sortBy === "Amount: Low to High") {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, activeTab, statusFilter, methodFilter, searchQuery, sortBy, dateRange]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: transactions.length,
      paid: transactions.filter((t) => t.status === "Paid").length,
      pending: transactions.filter((t) => t.status === "Pending").length,
      failed: transactions.filter((t) => t.status === "Failed").length,
      refunded: transactions.filter((t) => t.status === "Refunded").length,
    };
  }, [transactions]);

  const handleResetFilters = () => {
    setActiveTab("All Transactions");
    setSearchQuery("");
    setMethodFilter("All Methods");
    setStatusFilter("All Status");
    setSortBy("Newest First");
    setDateRange(`Today, ${getSystemDateFormatted()}`);
    showToast("Filters reset to default");
  };

  const handleExportPayments = () => {
    const csv = paymentService.exportCsv(filteredTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RRV_Payments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Payment transactions exported successfully");
  };

  const handleMarkPaid = async (tx: PaymentTransaction) => {
    try {
      const updated = await paymentService.markAsPaid(tx.id);
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      if (selectedTx?.id === updated.id) {
        setSelectedTx(updated);
      }
      const updatedSummary = await paymentService.getPaymentsSummary();
      setSummary(updatedSummary);
      showToast(`Order #${tx.orderId} marked as Paid`);
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    }
  };

  const handleRefund = async (
    tx: PaymentTransaction,
    amount?: number,
    reason?: string
  ) => {
    try {
      const refundAmount = amount !== undefined ? amount : tx.amount;
      const refundReason = reason || "Requested by Customer";
      const updated = await paymentService.processRefund(
        tx.id,
        refundAmount,
        refundReason
      );
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      if (selectedTx?.id === updated.id) {
        setSelectedTx(updated);
      }
      const updatedSummary = await paymentService.getPaymentsSummary();
      setSummary(updatedSummary);
      showToast(`Refund of ₹ ${refundAmount} processed for #${tx.orderId}`);
    } catch (err) {
      console.error("Failed to process refund:", err);
    }
  };

  const isFiltered =
    activeTab !== "All Transactions" ||
    searchQuery !== "" ||
    methodFilter !== "All Methods" ||
    statusFilter !== "All Status";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Payments Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track transactions, payment methods, revenue, and settlement status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-3xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportPayments}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00875a] hover:bg-[#00704a] text-white shadow-3xs transition-all duration-150"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Payments</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. 5 Stats Cards matching Page 21 */}
      {summary && <PaymentStatsCards summary={summary} />}

      {/* 3. Tabs Bar */}
      <PaymentTabsBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        dateRange={dateRange}
        onDateChange={(range) => {
          setDateRange(range);
          showToast(`Filtered transactions for ${range}`);
        }}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 4. Filters Bar */}
      <PaymentFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* 5. Payments Table (All 10 items matching Page 21) */}
      <PaymentTable
        transactions={filteredTransactions}
        onViewDetails={(tx) => {
          setSelectedTx(tx);
          setIsDrawerOpen(true);
        }}
        onRefund={handleRefund}
        onMarkPaid={handleMarkPaid}
      />

      {/* 6. Bottom Analytics Widgets (3 cards matching Page 21) */}
      <PaymentAnalyticsWidgets
        methodShares={methodShares}
        dailyCollections={dailyCollections}
        activityLogs={activityLogs}
        onActivityClick={(log) => {
          const found = transactions.find(
            (t) => t.id === log.transactionId || t.orderId === log.orderId
          );
          if (found) {
            setSelectedTx(found);
            setIsDrawerOpen(true);
          } else {
            setSelectedTx({
              id: log.transactionId,
              orderId: log.orderId,
              customerName: log.customerName,
              amount: log.amount,
              status:
                log.type === "success"
                  ? "Paid"
                  : log.type === "refund"
                  ? "Refunded"
                  : log.type === "failure"
                  ? "Failed"
                  : "Pending",
              date: log.timeAgo,
              paymentMethod: "UPI (PhonePe)",
            });
            setIsDrawerOpen(true);
          }
        }}
      />

      {/* 7. Transaction Details Drawer */}
      <TransactionDetailsDrawer
        transaction={selectedTx}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTx(null);
        }}
        onMarkPaid={handleMarkPaid}
        onRefund={handleRefund}
      />
    </div>
  );
}
