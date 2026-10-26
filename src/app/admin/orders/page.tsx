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
import { Order, OrderStatus, OrderStatsSummary } from "@/types";

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStatsSummary>({
    totalOrders: 128,
    pending: 18,
    processing: 28,
    outForDelivery: 32,
    delivered: 116,
    cancelled: 10,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("All");
  const [amountFilter, setAmountFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("25 Aug 2025");

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
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateFilter]);

  // Client-side filtering & sorting for instant snappy interactivity
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by Date
    if (dateFilter && dateFilter !== "All Dates" && dateFilter !== "All") {
      if (dateFilter !== "Last 7 Days") {
        const normalizedDate =
          dateFilter.includes("24") || dateFilter.toLowerCase().includes("yesterday")
            ? "24 Aug 2025"
            : dateFilter.includes("23")
            ? "23 Aug 2025"
            : dateFilter.includes("22")
            ? "22 Aug 2025"
            : "25 Aug 2025";
        result = result.filter((o) => o.orderDate === normalizedDate);
      }
    }

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
      return a.orderTime.localeCompare(b.orderTime) * order;
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
    setDateFilter("25 Aug 2025");
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
      const created = await orderService.createManualOrder(newOrderData);
      setOrders((prev) => [created, ...prev]);
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
