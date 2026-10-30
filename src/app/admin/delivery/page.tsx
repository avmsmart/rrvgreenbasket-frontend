"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Map as MapIcon,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  DeliveryOrder,
  DeliveryPartner,
  DeliverySummary,
  DeliveryTimelineItem,
  DeliveryIssue,
  DeliveryStatus,
} from "@/types";
import { deliveryService } from "@/services/delivery.service";
import {
  DeliveryStatsCards,
  DeliveryTabsBar,
  DeliveryTabType,
  DeliveryFiltersBar,
  DeliveryTable,
  LiveDeliveryMap,
  DeliveryAnalyticsWidgets,
  AssignPartnerModal,
  LiveTrackingModal,
  DeliveryDetailsDrawer,
  DeliveryIssuesModal,
  AllPartnersModal,
} from "@/components/delivery";
import { getSystemDateFormatted } from "@/utils";

export default function DeliveryPage() {
  // --- States ---
  const [selectedDate, setSelectedDate] = useState<string>(() => getSystemDateFormatted());
  const [activeTab, setActiveTab] = useState<DeliveryTabType>("All Deliveries");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("All Delivery Areas");
  const [selectedPartner, setSelectedPartner] = useState<string>("All Delivery Partners");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [sortBy, setSortBy] = useState<string>("Sort by: Order Time");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Pagination & Row selection
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Modals & Drawers
  const [selectedDrawerOrder, setSelectedDrawerOrder] = useState<DeliveryOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [assignModalOrder, setAssignModalOrder] = useState<DeliveryOrder | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const [trackModalOrder, setTrackModalOrder] = useState<DeliveryOrder | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);

  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [selectedMapOrderId, setSelectedMapOrderId] = useState<string | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Bottom Analytics Modals
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState<boolean>(false);
  const [isAllPartnersModalOpen, setIsAllPartnersModalOpen] = useState<boolean>(false);

  // Data states
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [allOrders, setAllOrders] = useState<DeliveryOrder[]>([]);
  const [summary, setSummary] = useState<DeliverySummary>({
    totalOrders: 32,
    pendingAssignment: 6,
    outForDelivery: 14,
    delivered: 10,
    failed: 2,
  });
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [timeline, setTimeline] = useState<DeliveryTimelineItem[]>([]);
  const [issues, setIssues] = useState<DeliveryIssue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Toast feedback
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
      else if (activeTab === "Out for Delivery") statusParam = "Out for Delivery";
      else if (activeTab === "Delivered") statusParam = "Delivered";
      else if (activeTab === "Failed") statusParam = "Failed";

      // Override if specific status filter selected
      if (selectedStatus !== "All Status") {
        statusParam = selectedStatus;
      }

      const [ordersData, allOrdersData, summaryData, partnersData, timelineData, issuesData] =
        await Promise.all([
          deliveryService.getDeliveryOrders({
            date: selectedDate,
            status: statusParam,
            area: selectedArea,
            partner: selectedPartner,
            search: searchQuery,
            sortBy: sortBy,
          }),
          deliveryService.getAllDeliveryOrdersUnfiltered(selectedDate),
          deliveryService.getDeliverySummary(selectedDate),
          deliveryService.getDeliveryPartners(),
          deliveryService.getDeliveryTimeline(selectedDate),
          deliveryService.getDeliveryIssues(selectedDate),
        ]);

      setOrders(ordersData);
      setAllOrders(allOrdersData);
      setSummary(summaryData);
      setPartners(partnersData);
      setTimeline(timelineData);
      setIssues(issuesData);

      // Keep drawer in sync if open
      if (selectedDrawerOrder) {
        const refreshed = ordersData.find((o) => o.id === selectedDrawerOrder.id);
        if (refreshed) setSelectedDrawerOrder(refreshed);
      }
    } catch (err) {
      console.error("Failed to load delivery data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedDate,
    activeTab,
    selectedArea,
    selectedPartner,
    selectedStatus,
    searchQuery,
    sortBy,
    selectedDrawerOrder,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedArea, selectedPartner, selectedStatus]);

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

  const handleViewOrder = (order: DeliveryOrder) => {
    setSelectedDrawerOrder(order);
    setIsDrawerOpen(true);
  };

  const handleIssueOrderClick = async (orderId: string) => {
    // 1. Check in currently loaded orders
    let found = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());

    // 2. Check in all unfiltered orders
    if (!found) {
      found = allOrders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
    }

    // 3. Check directly in service
    if (!found) {
      found = await deliveryService.getOrderById(orderId, selectedDate);
    }

    // 4. Guaranteed fallback matching issue metadata
    if (!found) {
      const issue = issues.find((i) => i.orderId.toLowerCase() === orderId.toLowerCase());
      found = {
        id: orderId,
        customerName: issue?.customerName || "Customer",
        customerPhone: "+91 98765 43210",
        customerAddress: "Main Road, Kurnool",
        area: "Kurnool Town",
        itemsCount: 4,
        amount: 320,
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        status: "Failed",
        orderTime: issue?.time || "09:00 AM",
        orderDate: selectedDate,
        assignedPartnerName: issue?.partnerName || "Delivery Team",
        failureReason: issue?.reason || "Delivery Exception",
      };
    }

    handleViewOrder(found);
  };

  const handleTrackOrder = (order: DeliveryOrder) => {
    setSelectedMapOrderId(order.id);
    if (!order.coordinates?.lat || !order.coordinates?.lng) {
      showToast(`Location coordinates currently unavailable for Order ${order.id}`, "info");
    } else {
      showToast(`Focused Order ${order.id} on map`);
      if (typeof window !== "undefined" && window.innerWidth < 1280) {
        mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    setTrackModalOrder(order);
    setIsTrackModalOpen(true);
  };

  const handleOpenAssignModal = (order: DeliveryOrder) => {
    setAssignModalOrder(order);
    setIsAssignModalOpen(true);
  };

  const handleTopAssignClick = () => {
    // Find first unassigned or pending order
    const pendingOrder = orders.find((o) => o.status === "Pending" || !o.assignedPartnerName) || orders[0];
    if (pendingOrder) {
      setAssignModalOrder(pendingOrder);
      setIsAssignModalOpen(true);
    }
  };

  const handleAssignPartnerConfirm = async (
    orderId: string,
    partnerId: string,
    partnerName: string,
    partnerPhone?: string
  ) => {
    await deliveryService.assignDeliveryPartner(
      orderId,
      partnerId,
      partnerName,
      partnerPhone,
      selectedDate
    );
    showToast(`Assigned ${partnerName} to Order ${orderId}`);
    await loadData();
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: DeliveryStatus,
    reason?: string
  ) => {
    await deliveryService.updateDeliveryStatus(
      orderId,
      newStatus,
      reason,
      selectedDate
    );
    showToast(`Order ${orderId} marked as ${newStatus}`);
    await loadData();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedArea("All Delivery Areas");
    setSelectedPartner("All Delivery Partners");
    setSelectedStatus("All Status");
    setSortBy("Sort by: Order Time");
    setActiveTab("All Deliveries");
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
    if (selectedPartner !== "All Delivery Partners") count++;
    if (selectedStatus !== "All Status") count++;
    if (sortBy !== "Sort by: Order Time") count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedArea, selectedPartner, selectedStatus, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      
      {/* Toast Notification */}
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
        
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
          <Link href="/admin/orders" className="hover:text-emerald-700 transition-colors">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">Delivery Management</span>
        </nav>

        {/* 2. Header (Matching Page 15 of PDF) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Delivery Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Assign orders, track delivery partners, and monitor real-time delivery status.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View on Map Button */}
            <button
              type="button"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors shadow-3xs ${
                isMapExpanded
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <span>{isMapExpanded ? "Hide Map" : "View on Map"}</span>
            </button>

            {/* + Assign Delivery Partner Button */}
            <button
              type="button"
              onClick={handleTopAssignClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold shadow-3xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Assign Delivery Partner</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                loadData();
                showToast("Refreshed delivery status", "info");
              }}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-3xs transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 3. Five KPI Summary Cards (Page 15) */}
        <DeliveryStatsCards summary={summary} />

        {/* 4. Tabs Bar with Date Selector & Calendar (Page 15) */}
        <div className="mt-6">
          <DeliveryTabsBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedDate={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date);
              showToast(`Viewing deliveries for ${date}`, "info");
            }}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            onReset={handleResetFilters}
            isFiltered={activeFiltersCount > 0}
            activeFiltersCount={activeFiltersCount}
            tabCounts={{
              all: summary.totalOrders,
              pending: summary.pendingAssignment,
              outForDelivery: summary.outForDelivery,
              delivered: summary.delivered,
              failed: summary.failed,
            }}
          />
        </div>

        {/* 5. Filters Bar (Page 15) */}
        <div className="mt-4">
          <DeliveryFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedArea={selectedArea}
            onAreaChange={setSelectedArea}
            selectedPartner={selectedPartner}
            onPartnerChange={setSelectedPartner}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
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

        {/* 6. Main Content Area (Split Table + Live Delivery Map on Page 15) */}
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          {/* Left Table Section: Takes 7-8 cols on xl screens */}
          <div className={`${isMapExpanded ? "xl:col-span-12" : "xl:col-span-7 2xl:col-span-8"} space-y-4 min-w-0 w-full`}>
            <DeliveryTable
              orders={paginatedOrders}
              selectedOrderIds={selectedOrderIds}
              selectedMapOrderId={selectedMapOrderId}
              onToggleSelectOrder={handleToggleSelectOrder}
              onToggleSelectAll={handleToggleSelectAll}
              onClearSelection={() => setSelectedOrderIds([])}
              onViewOrder={handleViewOrder}
              onTrackOrder={handleTrackOrder}
              onAssignPartner={handleOpenAssignModal}
              onStatusChange={handleStatusChange}
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

          {/* Right Live Delivery Map: Takes 4-5 cols on xl screens */}
          <div ref={mapSectionRef} className={`${isMapExpanded ? "xl:col-span-12" : "xl:col-span-5 2xl:col-span-4"} min-w-0 w-full`}>
            <LiveDeliveryMap
              orders={orders}
              partners={partners}
              selectedOrderId={selectedMapOrderId}
              onSelectOrder={(order) => {
                setSelectedMapOrderId(order.id);
                setSelectedDrawerOrder(order);
                setIsDrawerOpen(true);
              }}
              onSelectPartner={(partner) => {
                showToast(`Viewing partner ${partner.name}'s deliveries`, "info");
              }}
              isExpanded={isMapExpanded}
              onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
            />
          </div>

        </div>

        {/* 7. Bottom 4 Analytics Widgets (Page 15) */}
        <DeliveryAnalyticsWidgets
          summary={summary}
          partners={partners}
          timeline={timeline}
          issues={issues}
          onOrderClick={handleIssueOrderClick}
          onPartnerClick={(partner) => {
            setSelectedPartner(partner.name);
            showToast(`Filtering deliveries for ${partner.name}`, "info");
          }}
          onViewAllPartners={() => {
            setIsAllPartnersModalOpen(true);
          }}
          onViewAllIssues={() => {
            setIsIssuesModalOpen(true);
          }}
        />

      </div>

      {/* 8. Modals & Drawers */}
      {/* Assign Partner Modal */}
      <AssignPartnerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        order={assignModalOrder}
        partners={partners}
        onAssign={handleAssignPartnerConfirm}
      />

      {/* Live Route Tracking Modal */}
      <LiveTrackingModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        order={trackModalOrder}
        onMarkDelivered={(orderId) => handleStatusChange(orderId, "Delivered")}
      />

      {/* Delivery Order Details Slide-over Drawer */}
      <DeliveryDetailsDrawer
        order={selectedDrawerOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onOpenAssignModal={(order) => {
          setIsDrawerOpen(false);
          handleOpenAssignModal(order);
        }}
      />

      {/* All Delivery Issues Modal */}
      <DeliveryIssuesModal
        isOpen={isIssuesModalOpen}
        onClose={() => setIsIssuesModalOpen(false)}
        issues={issues}
        orders={allOrders.length > 0 ? allOrders : orders}
        selectedDate={selectedDate}
        onViewOrder={handleViewOrder}
        onReassignOrder={handleOpenAssignModal}
        onFilterFailedInTable={() => {
          setActiveTab("Failed");
          setSelectedStatus("Failed");
          showToast("Filtered table to show failed/issue orders", "info");
        }}
      />

      {/* All Delivery Partners Modal */}
      <AllPartnersModal
        isOpen={isAllPartnersModalOpen}
        onClose={() => setIsAllPartnersModalOpen(false)}
        partners={partners}
        onSelectPartner={(partner) => {
          setSelectedPartner(partner.name);
          showToast(`Filtered deliveries for ${partner.name}`, "info");
        }}
      />

    </div>
  );
}
