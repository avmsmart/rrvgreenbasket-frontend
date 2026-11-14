"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/layout";
import {
  OrderStatsCards,
  OrderStatusTabs,
  OrderFiltersBar,
  OrdersTable,
  OrderDetailsDrawer,
  CreateManualOrderModal,
  OrderAnalyticsWidgets,
} from "@/components/orders";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus, OrderStatsSummary, OrderBusinessSettingsResponse } from "@/types";
import { getSystemDateFormatted } from "@/utils";
import { recordCouponRedemption } from "@/data/shared-store";
import { Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStatsSummary>({
    totalOrders: 0,
    pending: 0,
    processing: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [settings, setSettings] = useState<OrderBusinessSettingsResponse | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("All");
  const [amountFilter, setAmountFilter] = useState<string>("All");
 const [dateFilter, setDateFilter] = useState<string>("");
 useEffect(() => {
  setDateFilter(getSystemDateFormatted());
}, []);

  // Sorting state
  const [sortBy, setSortBy] = useState<"orderTime" | "amount" | "itemsCount" | "customerName">("orderTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Order Details Selection & Drawer state (Only opens when 3 dots -> View Details is clicked)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Load orders & stats asynchronously on mount and whenever dateFilter changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      orderService.getOrders({ date: dateFilter }),
      orderService.getOrderStats(dateFilter),
    ])
      .then(([orderList, statsData]) => {
        if (!isMounted) return;
        setOrders(orderList);
        setStats(statsData);
        setLoading(false);
        setCurrentPage(1);

        if (typeof window !== "undefined") {
          const s = new URLSearchParams(window.location.search).get("search");
          if (s) {
            setSearchQuery(s);
            setStatusFilter("All");
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateFilter]);

  // Load Order Acceptance & Business Window Settings
  useEffect(() => {
    orderService
      .getOrderSettings()
      .then((s) => {
        if (s) setSettings(s);
      })
      .catch((e) => {
        console.warn("Failed to load order settings:", e);
      });
  }, []);

  const handleToggleAcceptance = async () => {
    if (!settings || isUpdatingSettings) return;
    setIsUpdatingSettings(true);
    try {
      const next = !settings.orderAcceptanceEnabled;
      const updated = await orderService.updateOrderAcceptanceStatus(next);
      setSettings(updated);
    } catch (e) {
      console.error("Failed to toggle order acceptance:", e);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Client-side filtering & sorting for instant snappy interactivity
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter && statusFilter !== "All") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (paymentFilter && paymentFilter !== "All") {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }

    if (paymentMethodFilter && paymentMethodFilter !== "All") {
      const pm = paymentMethodFilter.toLowerCase();
      result = result.filter((o) => o.paymentMethod.toLowerCase().includes(pm));
    }

    if (amountFilter && amountFilter !== "All") {
      if (amountFilter === "Under ₹200") {
        result = result.filter((o) => o.amount < 200);
      } else if (amountFilter === "₹200 - ₹500") {
        result = result.filter((o) => o.amount >= 200 && o.amount <= 500);
      } else if (amountFilter === "Above ₹500") {
        result = result.filter((o) => o.amount > 500);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.customerAddress && o.customerAddress.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const order = sortOrder === "desc" ? -1 : 1;
      if (sortBy === "amount") {
        return (a.amount - b.amount) * order;
      }
      if (sortBy === "itemsCount") {
        return (a.itemsCount - b.itemsCount) * order;
      }
      if (sortBy === "customerName") {
        return a.customerName.localeCompare(b.customerName) * order;
      }
      if (sortBy === "orderTime") {
        const toMinutes = (timeStr: string) => {
          if (!timeStr) return 0;
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (!match) return 0;
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const period = match[3]?.toUpperCase();
          if (period === "PM" && hours < 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };
        const diff = toMinutes(a.orderTime) - toMinutes(b.orderTime);
        if (diff !== 0) return diff * order;
      }
      return 0;
    });

    return result;
  }, [
    orders,
    dateFilter,
    statusFilter,
    paymentFilter,
    paymentMethodFilter,
    amountFilter,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Handle Sort Toggle
  const handleSort = (col: "orderTime" | "amount" | "itemsCount" | "customerName") => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setPaymentMethodFilter("All");
    setAmountFilter("All");
    setDateFilter(getSystemDateFormatted());
    setCurrentPage(1);
  };

  // Order Selection: Triggered ONLY when clicking 3 dots -> "View Details" (or Eye icon)
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDrawerOpen(true);
  };

  // Status Update Action
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Cancel Order Action
  const handleCancelOrder = async (orderId: string) => {
    try {
      const cancelled = await orderService.cancelOrder(orderId, "Cancelled by Admin");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? cancelled : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(cancelled);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  };

  // Manual Order Creation
  const handleCreateOrder = async (newOrderData: Partial<Order>) => {
    try {
      const activeDate =
        dateFilter && dateFilter !== "All Dates" && dateFilter !== "Last 7 Days"
          ? dateFilter
          : getSystemDateFormatted();
      const created = await orderService.createManualOrder({
        ...newOrderData,
        orderDate: activeDate,
      });

      // Cross-page link: if coupon was applied, record its redemption in shared-store
      if (newOrderData.couponCode && newOrderData.discount) {
        recordCouponRedemption(
          newOrderData.couponCode,
          newOrderData.discount,
          created.id,
          newOrderData.customerName || "Customer"
        );
      }

      setOrders((prev) => [created, ...prev]);
      setStatusFilter("All");
      setPaymentFilter("All");
      setPaymentMethodFilter("All");
      setAmountFilter("All");
      setSearchQuery("");
      setCurrentPage(1);
      setSelectedOrder(created);
      setIsDetailsDrawerOpen(true);
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pending: prev.pending + 1,
      }));
    } catch (err) {
      console.error("Failed to create manual order:", err);
    }
  };

  const isFiltered =
    searchQuery !== "" ||
    statusFilter !== "All" ||
    paymentFilter !== "All" ||
    paymentMethodFilter !== "All" ||
    amountFilter !== "All" ||
    dateFilter !== "25 Aug 2025";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Orders Management" },
        ]}
      />

      {/* 2. Page Header matching Page 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View, manage and track all customer orders from order placement to delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#00875a] hover:bg-[#00734d] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto hover:shadow-sm hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Manual Order</span>
        </button>
      </div>

      {/* Operating Window & Acceptance Control Banner */}
      {settings && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                settings.orderAcceptanceEnabled
                  ? "bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"
                  : "bg-amber-500 ring-4 ring-amber-100"
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Store Order Acceptance:
                </span>
                <span
                  className={`text-xs font-extrabold ${
                    settings.orderAcceptanceEnabled ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {settings.orderAcceptanceEnabled ? "ACTIVE (ACCEPTING ORDERS)" : "PAUSED"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3" />
                <span>
                  Operating Hours: {settings.openingTime?.slice(0, 5) || "06:00"} – {settings.closingTime?.slice(0, 5) || "22:00"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isUpdatingSettings}
            onClick={handleToggleAcceptance}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs disabled:opacity-50 ${
              settings.orderAcceptanceEnabled
                ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
          >
            {isUpdatingSettings ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : settings.orderAcceptanceEnabled ? (
              <span>Pause Orders</span>
            ) : (
              <span>Resume Orders</span>
            )}
          </button>
        </div>
      )}

      {/* 3. 6 Summary Metric Cards */}
      <OrderStatsCards
        stats={stats}
        selectedStatus={statusFilter}
        onSelectStatus={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
      />

      {/* 4. Status Filter Tabs */}
      <OrderStatusTabs
        currentTab={statusFilter}
        onSelectTab={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        stats={stats}
      />

      {/* 5. Search & Filters Bar with Calendar and Filter Dialog */}
      <OrderFiltersBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        paymentFilter={paymentFilter}
        onPaymentChange={(p) => {
          setPaymentFilter(p);
          setCurrentPage(1);
        }}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        paymentMethodFilter={paymentMethodFilter}
        onPaymentMethodChange={setPaymentMethodFilter}
        amountFilter={amountFilter}
        onAmountFilterChange={setAmountFilter}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 6. Main Orders Table (Full width; Details open only via 3 dots menu) */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-8 h-8 rounded-full border-2 border-[#00875a] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Loading orders data...</p>
        </div>
      ) : (
        <OrdersTable
          orders={paginatedOrders}
          totalOrders={filteredOrders.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          onSelectOrder={handleSelectOrder}
          onUpdateStatus={handleUpdateStatus}
          onCancelOrder={handleCancelOrder}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* 7. Bottom Analytics Widgets: Donut Chart with Date Badge, Timeline, Top Products with real produce images */}
      <OrderAnalyticsWidgets
        dateFilter={dateFilter}
        stats={stats}
        onDateChange={setDateFilter}
      />

      {/* 8. Slide-Over Order Details Drawer (Opens ONLY when 3 dots -> View Details is clicked) */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* 9. Create Manual Order Modal */}
      <CreateManualOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}
