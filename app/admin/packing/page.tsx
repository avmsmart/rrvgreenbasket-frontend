"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  Printer,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";
import {
  PackingOrder,
  PackingSummary,
  PackingStatus,
  TopPackingProduct,
  PackingActivity,
} from "@/types";
import { packingService } from "@/services/packing.service";
import {
  PackingStatsCards,
  PackingTabsBar,
  PackingTabType,
  PackingFiltersBar,
  PackingTable,
  PackingDetailsDrawer,
  PackingAnalyticsWidgets,
  AllPackingProductsModal,
} from "@/components/packing";
import { ProduceImage } from "@/components/common/ProduceImage";
import { getSystemDateFormatted } from "@/utils";

export default function PackingPage() {
  // --- States ---
  const [selectedDate, setSelectedDate] = useState<string>(() => getSystemDateFormatted());
  const [activeTab, setActiveTab] = useState<PackingTabType>("All Orders");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("All Delivery Areas");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("All Payment Status");
  const [sortBy, setSortBy] = useState<string>("Sort by: Order Time");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Drawer & Slip Modal
  const [selectedDrawerOrder, setSelectedDrawerOrder] = useState<PackingOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [printModalOrder, setPrintModalOrder] = useState<PackingOrder | null>(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState<boolean>(false);

  // Data states
  const [orders, setOrders] = useState<PackingOrder[]>([]);
  const [summary, setSummary] = useState<PackingSummary>({
    totalOrdersToPack: 28,
    pending: 12,
    inPacking: 10,
    packed: 6,
    packingPercentage: 57,
    packedOrdersCount: 16,
  });
  const [topProducts, setTopProducts] = useState<TopPackingProduct[]>([]);
  const [recentActivities, setRecentActivities] = useState<PackingActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Trigger flash notification
  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // --- Load Data ---
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Convert activeTab to status filter
      let statusParam: string | undefined = undefined;
      if (activeTab === "Pending") statusParam = "Pending";
      else if (activeTab === "In Packing") statusParam = "In Packing";
      else if (activeTab === "Packed") statusParam = "Packed";

      const [ordersData, summaryData, productsData, activitiesData] = await Promise.all([
        packingService.getPackingOrders({
          date: selectedDate,
          status: statusParam,
          area: selectedArea,
          paymentStatus: selectedPaymentStatus,
          sortBy: sortBy,
          search: searchQuery,
        }),
        packingService.getPackingSummary(selectedDate),
        packingService.getTopProducts(selectedDate),
        packingService.getRecentActivities(selectedDate),
      ]);

      setOrders(ordersData);
      setSummary(summaryData);
      setTopProducts(productsData);
      setRecentActivities(activitiesData);

      // Keep drawer order in sync if currently open
      if (selectedDrawerOrder) {
        const refreshedCurrent = ordersData.find((o) => o.id === selectedDrawerOrder.id);
        if (refreshedCurrent) {
          setSelectedDrawerOrder(refreshedCurrent);
        }
      }
    } catch (err) {
      console.error("Failed to load packing data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, activeTab, selectedArea, selectedPaymentStatus, sortBy, searchQuery, selectedDrawerOrder]);

  // Load when filters or date change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedArea, selectedPaymentStatus]);

  // --- Handlers ---
  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const pageOrderIds = paginatedOrders.map((o) => o.id);
    const allSelected = pageOrderIds.every((id) => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !pageOrderIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...pageOrderIds])));
    }
  };

  const handleOpenDrawer = (order: PackingOrder) => {
    setSelectedDrawerOrder(order);
    setIsDrawerOpen(true);
  };

  const handleActionClick = (order: PackingOrder) => {
    // If pending, start packing and open drawer
    if (order.status === "Pending") {
      packingService.updatePackingStatus(order.id, "In Packing", selectedDate).then(() => {
        showToast(`Started packing order ${order.id}`);
        loadData();
      });
    }
    setSelectedDrawerOrder(order);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: PackingStatus) => {
    await packingService.updatePackingStatus(orderId, newStatus, selectedDate);
    showToast(`Order ${orderId} status changed to ${newStatus}`);
    await loadData();
  };

  const handleItemToggle = async (orderId: string, itemId: string) => {
    const updated = await packingService.toggleOrderItemPacked(orderId, itemId, undefined, selectedDate);
    if (updated) {
      setSelectedDrawerOrder({ ...updated });
      await loadData();
    }
  };

  const handlePackAllItems = async (orderId: string) => {
    const updated = await packingService.packAllOrderItems(orderId, selectedDate);
    if (updated) {
      setSelectedDrawerOrder({ ...updated });
      showToast(`All items marked packed for ${orderId}`);
      await loadData();
    }
  };

  const handlePrintSlip = (order: PackingOrder) => {
    setPrintModalOrder(order);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedArea("All Delivery Areas");
    setSelectedPaymentStatus("All Payment Status");
    setSortBy("Sort by: Order Time");
    setActiveTab("All Orders");
    showToast("Filters reset to default", "info");
  };

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return orders.slice(startIndex, startIndex + pageSize);
  }, [orders, currentPage, pageSize]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedArea !== "All Delivery Areas") count++;
    if (selectedPaymentStatus !== "All Payment Status") count++;
    if (sortBy !== "Sort by: Order Time") count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedArea, selectedPaymentStatus, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-blue-50 text-blue-900 border-blue-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* 1. Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
          <Link href="/admin/orders" className="hover:text-emerald-700 transition-colors">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">Packing Management</span>
        </nav>

        {/* 2. Header (Matching Page 13 of PDF) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Packing Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Prepare and pack customer orders for delivery. Track packing status and manage order items.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadData();
                showToast("Refreshed packing data", "info");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-3xs transition-colors"
              title="Refresh packing data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* 3. Five KPI Stats Cards (Page 13) */}
        <PackingStatsCards summary={summary} />

        {/* 4. Tabs Bar with Date Selector and Filter button (Page 13) */}
        <div className="mt-6">
          <PackingTabsBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedDate={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date);
              showToast(`Viewing packing orders for ${date}`, "info");
            }}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            onReset={handleResetFilters}
            isFiltered={activeFiltersCount > 0}
            activeFiltersCount={activeFiltersCount}
            tabCounts={{
              all: summary.totalOrdersToPack,
              pending: summary.pending,
              inPacking: summary.inPacking,
              packed: summary.packed,
            }}
          />
        </div>

        {/* 5. Filters Bar (Search, Delivery Areas, Payment Status, Sort) */}
        <div className="mt-4">
          <PackingFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedArea={selectedArea}
            onAreaChange={setSelectedArea}
            selectedPaymentStatus={selectedPaymentStatus}
            onPaymentStatusChange={setSelectedPaymentStatus}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            isFilterModalOpen={isFilterModalOpen}
            onCloseFilterModal={() => setIsFilterModalOpen(false)}
            onApplyFilters={() => {
              setIsFilterModalOpen(false);
              loadData();
              showToast("Filters applied successfully");
            }}
            onResetFilters={() => {
              handleResetFilters();
              setIsFilterModalOpen(false);
            }}
          />
        </div>

        {/* 6. Packing Orders Table (Page 13) */}
        <div className="mt-4">
          <PackingTable
            orders={paginatedOrders}
            selectedOrderIds={selectedOrderIds}
            onToggleSelectOrder={handleToggleSelectOrder}
            onToggleSelectAll={handleToggleSelectAll}
            onClearSelection={() => setSelectedOrderIds([])}
            onViewOrder={handleOpenDrawer}
            onActionClick={handleActionClick}
            onStatusChange={handleStatusChange}
            onPrintSlip={handlePrintSlip}
            currentPage={currentPage}
            pageSize={pageSize}
            totalOrders={orders.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* 7. Bottom Three Analytics Widgets (Page 13) */}
        <PackingAnalyticsWidgets
          summary={summary}
          topProducts={topProducts}
          recentActivities={recentActivities}
          onOrderClick={(orderId) => {
            const found = orders.find((o) => o.id === orderId);
            if (found) {
              handleOpenDrawer(found);
            }
          }}
          onViewAllProducts={() => {
            setIsProductsModalOpen(true);
          }}
        />

      </div>

      {/* 8. Slide-Over Packing Details Drawer (Page 13 Right Panel) */}
      <PackingDetailsDrawer
        order={selectedDrawerOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onItemToggle={handleItemToggle}
        onPackAllItems={handlePackAllItems}
        onStatusChange={handleStatusChange}
        onPrintSlip={handlePrintSlip}
      />

      {/* 9. Print Packing Slip Modal */}
      {printModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Packing Slip</h3>
                  <p className="text-xs text-slate-500 font-mono">{printModalOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setPrintModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Content Preview */}
            <div className="my-5 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm text-emerald-800">RRV GREEN BASKET</p>
                <p className="text-[11px] text-slate-500">Fresh Farm-to-Door Delivery</p>
                <p className="text-[10px] text-slate-400 mt-1">Date: {printModalOrder.orderDate}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800">Customer: {printModalOrder.customerName}</p>
                <p className="text-slate-600">Phone: {printModalOrder.customerPhone}</p>
                <p className="text-slate-600">Area: {printModalOrder.area}</p>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
                <p className="font-bold text-slate-800">Items to Pack:</p>
                {printModalOrder.items.map((item, idx) => (
                  <div key={item.id} className="flex justify-between text-slate-700">
                    <span>
                      [ {item.isPacked ? "✓" : " "} ] {idx + 1}. {item.productName} ({item.quantity} {item.unit})
                    </span>
                    <span>₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between font-bold text-slate-900">
                <span>Total Amount:</span>
                <span>₹{printModalOrder.amount}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPrintModalOrder(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast(`Printed slip for ${printModalOrder.id}`);
                  setPrintModalOrder(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] shadow-3xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. All Packing Products Modal */}
      <AllPackingProductsModal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        topProducts={topProducts}
        selectedDate={selectedDate}
      />

    </div>
  );
}
