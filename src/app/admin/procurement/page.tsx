"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Check, AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/layout";
import {
  ProcurementStatsCards,
  ProcurementTabsBar,
  ProcurementTabType,
  ProcurementFiltersBar,
  ProcurementTable,
  ProcurementAnalyticsWidgets,
  CreateProcurementModal,
  EditProcurementModal,
  ProcurementDetailsDrawer,
  GenerateFromOrdersModal,
} from "@/components/procurement";
import { procurementService } from "@/services/procurement.service";
import {
  ProcurementItem,
  ProcurementStatus,
  SupplierOrder,
  PendingProcurementItem,
  CategoryProcurementSummary,
  ProcurementSummary,
} from "@/types";

export default function ProcurementManagementPage() {
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [summary, setSummary] = useState<ProcurementSummary>({
    totalItems: 35,
    totalQuantity: 420,
    productsCount: 18,
    estimatedCost: 28450,
    procurementPercentage: 60,
    completedItemsCount: 21,
    totalItemsCount: 35,
  });
  const [categories, setCategories] = useState<CategoryProcurementSummary[]>([]);
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingProcurementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tabs & Dates state
  const [activeTab, setActiveTab] = useState<ProcurementTabType>("Procurement Plan");
  const [selectedDate, setSelectedDate] = useState<string>("26 Oct 2026");

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("All Suppliers");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");

  // Selection state
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals & Drawer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementItem | null>(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load procurement data on mount & date change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      procurementService.getProcurementItems({ date: selectedDate }),
      procurementService.getProcurementSummary(selectedDate),
      procurementService.getCategoryBreakdown(selectedDate),
      procurementService.getSupplierOrders(selectedDate),
      procurementService.getPendingItems(selectedDate),
    ])
      .then(([itemsData, summaryData, catData, supData, pendData]) => {
        if (!isMounted) return;
        setItems(itemsData);
        setSummary(summaryData);
        setCategories(catData);
        setSupplierOrders(supData);
        setPendingItems(pendData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading procurement data:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Client-side filtering & tab logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "Received Stock" && item.status !== "Completed") {
        return false;
      }
      if (activeTab === "Pending Items" && item.status === "Completed") {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.productName.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesSupplier = item.supplier.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesSupplier && !matchesId) {
          return false;
        }
      }

      // Category filter
      if (
        selectedCategory !== "All Categories" &&
        item.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Supplier filter
      if (
        selectedSupplier !== "All Suppliers" &&
        item.supplier.toLowerCase() !== selectedSupplier.toLowerCase()
      ) {
        return false;
      }

      // Status filter
      if (
        selectedStatus !== "All Status" &&
        item.status.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  }, [items, activeTab, searchQuery, selectedCategory, selectedSupplier, selectedStatus]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Handlers
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const currentPageIds = paginatedItems.map((i) => i.id);
    const areAllSelected = currentPageIds.every((id) =>
      selectedItemIds.includes(id)
    );

    if (areAllSelected) {
      setSelectedItemIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedSupplier("All Suppliers");
    setSelectedStatus("All Status");
    setCurrentPage(1);
    showToast("Filters reset to default view");
  };

  const handleViewItem = (item: ProcurementItem) => {
    setSelectedItem(item);
    setIsDetailsDrawerOpen(true);
  };

  const handleEditItem = (item: ProcurementItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (id: string, status: ProcurementStatus) => {
    try {
      const updated = await procurementService.updateProcurementItem(id, { status });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(updated);
      }
      showToast(`Updated ${updated.productName} status to ${status}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status");
    }
  };

  const handleSaveItemUpdates = async (
    id: string,
    updates: Partial<ProcurementItem>
  ) => {
    try {
      const updated = await procurementService.updateProcurementItem(id, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(updated);
      }
      showToast(`Saved changes for ${updated.productName}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to save changes");
    }
  };

  const handleCreateItem = async (newItem: Omit<ProcurementItem, "id">) => {
    try {
      const created = await procurementService.createProcurementItem(newItem);
      setItems((prev) => [created, ...prev]);
      showToast(`Added ${created.productName} to procurement plan`);
    } catch (err) {
      console.error(err);
      showToast("Failed to create item");
    }
  };

  const handleGenerateConfirm = () => {
    showToast("Procurement requirement successfully consolidated from cutoff orders!");
  };

  const handleSelectPendingItem = (pItem: PendingProcurementItem) => {
    const fullItem = items.find(
      (i) => i.productName.toLowerCase() === pItem.productName.toLowerCase()
    );
    if (fullItem) {
      handleViewItem(fullItem);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#00875a] flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Procurement Management" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Procurement Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Plan, create and track procurement based on customer orders and stock levels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Procurement Plan</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <ProcurementStatsCards summary={summary} />

      {/* Tabs & Date Actions Bar */}
      <ProcurementTabsBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        selectedDate={selectedDate}
        onDateChange={(date) => {
          setSelectedDate(date);
          setCurrentPage(1);
          setSelectedItemIds([]);
          showToast(`Loaded procurement data for ${date}`);
        }}
        onGenerateFromOrders={() => setIsGenerateModalOpen(true)}
        tabCounts={{
          total: items.length,
          supplierOrders: supplierOrders.length,
          received: items.filter((i) => i.status === "Completed").length,
          pending: items.filter((i) => i.status !== "Completed").length,
          history: 120,
        }}
      />

      {/* Active Date Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-[#00875a] flex-shrink-0 animate-pulse" />
          <span className="font-bold text-slate-800">
            Procurement Plan: <span className="text-[#00875a] font-black">{selectedDate}</span>
          </span>
          <span className="text-slate-500 hidden md:inline">
            {selectedDate === "26 Oct 2026"
              ? "• Today's execution (planned yesterday night from cutoff orders)"
              : selectedDate === "27 Oct 2026"
              ? "• Tomorrow's morning plan (consolidating requirements for mandi purchase)"
              : "• Historical procurement plan (fulfilled & closed)"}
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-[#00875a] bg-white px-2.5 py-0.5 rounded-lg border border-[#bbf7d0] shadow-3xs">
            {selectedDate === "27 Oct 2026"
              ? "Planning Stage"
              : selectedDate === "26 Oct 2026"
              ? "In Progress"
              : "Completed History"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Backend API: <code className="bg-white/80 px-1.5 py-0.5 rounded text-slate-600 font-mono">?date={selectedDate}</code>
          </span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <ProcurementFiltersBar
        onSearch={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        onCategoryChange={(c) => {
          setSelectedCategory(c);
          setCurrentPage(1);
        }}
        onSupplierChange={(s) => {
          setSelectedSupplier(s);
          setCurrentPage(1);
        }}
        onStatusChange={(st) => {
          setSelectedStatus(st);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        selectedCategory={selectedCategory}
        selectedSupplier={selectedSupplier}
        selectedStatus={selectedStatus}
      />

      {/* Main Procurement Table */}
      <ProcurementTable
        items={paginatedItems}
        selectedItemIds={selectedItemIds}
        onToggleSelectItem={handleToggleSelectItem}
        onToggleSelectAll={handleToggleSelectAll}
        onViewItem={handleViewItem}
        onEditItem={handleEditItem}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredItems.length}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Bottom 3 Analytics Cards (Category Donut, Supplier Orders, Pending Items) */}
      <ProcurementAnalyticsWidgets
        categories={categories}
        supplierOrders={supplierOrders}
        pendingItems={pendingItems}
        dateFilter={selectedDate}
        onViewSupplierOrders={() => setActiveTab("Supplier Orders")}
        onViewPendingItems={() => setActiveTab("Pending Items")}
        onSelectPendingItem={handleSelectPendingItem}
      />

      {/* Modals & Drawers */}
      <CreateProcurementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
      />

      <EditProcurementModal
        item={selectedItem}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveItemUpdates}
      />

      <ProcurementDetailsDrawer
        item={selectedItem}
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        onEdit={(item) => {
          setIsDetailsDrawerOpen(false);
          handleEditItem(item);
        }}
        onStatusChange={handleStatusChange}
      />

      <GenerateFromOrdersModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onConfirm={handleGenerateConfirm}
        targetDate={selectedDate}
      />
    </div>
  );
}
