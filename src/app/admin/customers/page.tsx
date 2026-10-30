"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  X,
  Download,
} from "lucide-react";
import {
  Customer,
  CustomerSummary,
  TopSpendingCustomer,
  NewCustomerActivity,
  CustomerStatus,
} from "@/types";
import { customerService } from "@/services/customer.service";
import {
  CustomerStatsCards,
  CustomerTabsBar,
  CustomerTabType,
  CustomerFiltersBar,
  CustomerTable,
  CustomerAnalyticsWidgets,
  CustomerDetailsDrawer,
  CustomerFormModal,
} from "@/components/customers";

export default function CustomersPage() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<CustomerTabType>("All Customers");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [selectedLocation, setSelectedLocation] = useState<string>("All Locations");
  const [selectedType, setSelectedType] = useState<string>("All Customer Types");
  const [sortBy, setSortBy] = useState<string>("Sort by: Joined Date");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Pagination & Row selection
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Modals & Drawers
  const [selectedDrawerCustomer, setSelectedDrawerCustomer] = useState<Customer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [formCustomer, setFormCustomer] = useState<Customer | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  const tableSectionRef = useRef<HTMLDivElement>(null);

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<CustomerSummary>({
    totalCustomers: 1248,
    activeCustomers: 896,
    inactiveCustomers: 120,
    newCustomers: 86,
    repeatCustomers: 312,
    totalPurchaseValue: 342680,
  });
  const [topSpenders, setTopSpenders] = useState<TopSpendingCustomer[]>([]);
  const [newCustomers, setNewCustomers] = useState<NewCustomerActivity[]>([]);
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
      const [customersData, summaryData, topSpendersData, newCustData] =
        await Promise.all([
          customerService.getCustomers({
            tab: activeTab,
            search: searchQuery,
            status: selectedStatus,
            location: selectedLocation,
            customerType: selectedType,
            sortBy: sortBy,
          }),
          customerService.getCustomerSummary(),
          customerService.getTopSpendingCustomers(),
          customerService.getNewCustomersActivity(),
        ]);

      setCustomers(customersData);
      setSummary(summaryData);
      setTopSpenders(topSpendersData);
      setNewCustomers(newCustData);

      // Keep drawer in sync if open
      if (selectedDrawerCustomer) {
        const refreshed = customersData.find((c) => c.id === selectedDrawerCustomer.id);
        if (refreshed) setSelectedDrawerCustomer(refreshed);
      }
    } catch (err) {
      console.error("Failed to load customer data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTab,
    searchQuery,
    selectedStatus,
    selectedLocation,
    selectedType,
    sortBy,
    selectedDrawerCustomer,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("search");
      if (s) {
        setSearchQuery(s);
        setActiveTab("All Customers");
      }
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedStatus, selectedLocation, selectedType]);

  // --- Handlers ---
  const handleToggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const pageIds = paginatedCustomers.map((c) => c.id);
    const allSelected = pageIds.every((id) => selectedCustomerIds.includes(id));
    if (allSelected) {
      setSelectedCustomerIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedCustomerIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedDrawerCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setFormCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleCreateCustomerClick = () => {
    setFormCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleSaveCustomer = async (data: {
    name: string;
    phone: string;
    email: string;
    location: string;
    address?: string;
    status: CustomerStatus;
  }) => {
    if (formCustomer) {
      await customerService.updateCustomer(formCustomer.id, data);
      showToast(`Customer ${data.name} updated successfully`);
    } else {
      await customerService.addCustomer(data);
      showToast(`New customer ${data.name} created successfully`);
    }
    await loadData();
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await customerService.toggleCustomerStatus(id);
    showToast(`Customer status updated to ${updated.status}`);
    await loadData();
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Name,Phone,Email,Location,Total Orders,Total Spent,Status,Joined On"]
        .concat(
          customers.map(
            (c) =>
              `"${c.id}","${c.name}","${c.phone}","${c.email}","${c.location}",${c.totalOrders},${c.totalSpent},"${c.status}","${c.joinedOn}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rrv_customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Customers list exported to CSV successfully");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All Status");
    setSelectedLocation("All Locations");
    setSelectedType("All Customer Types");
    setSortBy("Sort by: Joined Date");
    setActiveTab("All Customers");
    showToast("Filters reset to default", "info");
  };

  // Paginated slice
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return customers.slice(startIndex, startIndex + pageSize);
  }, [customers, currentPage, pageSize]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStatus !== "All Status") count++;
    if (selectedLocation !== "All Locations") count++;
    if (selectedType !== "All Customer Types") count++;
    if (sortBy !== "Sort by: Joined Date") count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedStatus, selectedLocation, selectedType, sortBy, searchQuery]);

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
          <Link href="/admin/dashboard" className="hover:text-emerald-700 transition-colors">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">Customers Management</span>
        </nav>

        {/* 2. Header (Matching Page 17 of PDF) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customers Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View, manage and analyze your customers. Track orders, spending, and engagement.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCreateCustomerClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold shadow-3xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Customer</span>
            </button>

            <button
              onClick={() => {
                loadData();
                showToast("Refreshed customer data", "info");
              }}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-3xs transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 3. Five KPI Summary Cards (Page 17) */}
        <CustomerStatsCards summary={summary} />

        {/* 4. Tabs Bar with Export, Filter & Reset (Page 17) */}
        <div className="mt-6">
          <CustomerTabsBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            onReset={handleResetFilters}
            onExport={handleExportCSV}
            isFiltered={activeFiltersCount > 0}
            activeFiltersCount={activeFiltersCount}
            tabCounts={{
              all: summary.totalCustomers,
              active: summary.activeCustomers,
              inactive: summary.inactiveCustomers,
              new: summary.newCustomers,
              repeat: summary.repeatCustomers,
            }}
          />
        </div>

        {/* 5. Filters Bar (Page 17) */}
        <div className="mt-4">
          <CustomerFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
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

        {/* 6. Customers Table (Page 17) */}
        <div ref={tableSectionRef} className="mt-4">
          <CustomerTable
            customers={paginatedCustomers}
            selectedCustomerIds={selectedCustomerIds}
            onToggleSelectCustomer={handleToggleSelectCustomer}
            onToggleSelectAll={handleToggleSelectAll}
            onClearSelection={() => setSelectedCustomerIds([])}
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onToggleStatus={handleToggleStatus}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCustomers={summary.totalCustomers}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* 7. Bottom 3 Analytics Widgets (Page 17) */}
        <CustomerAnalyticsWidgets
          summary={summary}
          topSpenders={topSpenders}
          newCustomers={newCustomers}
          onCustomerClick={(id) => {
            const found = customers.find((c) => c.id === id);
            if (found) handleViewCustomer(found);
          }}
          onViewAllTop={() => {
            setActiveTab("Top Customers");
            tableSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            showToast("Showing top spenders list in table", "info");
          }}
          onViewAllNew={() => {
            setActiveTab("New");
            tableSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            showToast("Showing new customer signups in table", "info");
          }}
        />

      </div>

      {/* 8. Modals & Drawers */}
      {/* Customer Details Drawer */}
      <CustomerDetailsDrawer
        customer={selectedDrawerCustomer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(customer) => {
          setIsDrawerOpen(false);
          handleEditCustomer(customer);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        customer={formCustomer}
        onSave={handleSaveCustomer}
      />

    </div>
  );
}
