"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  CustomerListItem,
  CustomerDetailResponse,
  CustomerDashboardSummary,
  CustomerAccountStatus,
  CustomerTypeFilter,
} from "@/types";
import { customerService } from "@/services/customer.service";
import { useAuth } from "@/context/AuthContext";
import {
  CustomerStatsCards,
  CustomerTabsBar,
  CustomerTabType,
  CustomerFiltersBar,
  CustomerTable,
  CustomerDetailsDrawer,
  CustomerFormModal,
} from "@/components/customers";

export default function CustomersAdminPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // --- Filter & Pagination States ---
  const [activeTab, setActiveTab] = useState<CustomerTabType>("All Customers");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("All Locations");
  const [selectedType, setSelectedType] = useState<CustomerTypeFilter>("ALL");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  // Spring Data Page (0-indexed)
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Data states
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Drawer & Modal states
  const [selectedDrawerCustomer, setSelectedDrawerCustomer] =
    useState<CustomerDetailResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState<boolean>(false);

  const [formCustomer, setFormCustomer] = useState<CustomerDetailResponse | CustomerListItem | null>(
    null
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  // Toast feedback state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3500);
    },
    []
  );

  // Check RBAC permissions: user must be ADMIN or SUPER_ADMIN
  const isAuthorized = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    const roleUpper = (user.role || "").toUpperCase();
    return (
      roleUpper.includes("ADMIN") ||
      roleUpper === "SUPER_ADMIN" ||
      roleUpper === "SUPER ADMIN"
    );
  }, [isAuthenticated, user]);

  // --- Fetch Customers Data ---
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const pageData = await customerService.getCustomersPage({
        query: searchQuery.trim() || undefined,
        status: selectedStatus !== "ALL" ? (selectedStatus as CustomerAccountStatus) : undefined,
        location:
          selectedLocation !== "All Locations" && selectedLocation.trim()
            ? selectedLocation
            : undefined,
        customerType: selectedType !== "ALL" ? selectedType : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDirection,
      });

      setCustomers(pageData.content);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch customer list:", err);
      showToast("Error loading customers. Using offline cache.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedStatus,
    selectedLocation,
    selectedType,
    fromDate,
    toDate,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    showToast,
  ]);

  // --- Fetch Summary Metrics ---
  const fetchSummary = useCallback(async () => {
    try {
      const summaryData = await customerService.getDashboardSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Tab change handler (updates status or customerType and resets page to 0)
  const handleTabChange = (tab: CustomerTabType) => {
    setActiveTab(tab);
    setCurrentPage(0);

    switch (tab) {
      case "All Customers":
        setSelectedStatus("ALL");
        setSelectedType("ALL");
        break;
      case "Active":
        setSelectedStatus("ACTIVE");
        setSelectedType("ALL");
        break;
      case "Inactive":
        setSelectedStatus("INACTIVE");
        setSelectedType("ALL");
        break;
      case "Suspended":
        setSelectedStatus("SUSPENDED");
        setSelectedType("ALL");
        break;
      case "New Customers":
        setSelectedStatus("ALL");
        setSelectedType("FIRST_TIME");
        break;
      case "Repeat Customers":
        setSelectedStatus("ALL");
        setSelectedType("REPEAT");
        break;
      case "Top Customers":
        setSelectedStatus("ALL");
        setSelectedType("TOP_CUSTOMER");
        break;
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedLocation("All Locations");
    setSelectedType("ALL");
    setFromDate("");
    setToDate("");
    setSortBy("createdAt");
    setSortDirection("DESC");
    setActiveTab("All Customers");
    setCurrentPage(0);
    showToast("Filters reset to default", "info");
  };

  // View Customer Details
  const handleViewCustomer = async (customer: CustomerListItem) => {
    setIsDrawerOpen(true);
    setIsDrawerLoading(true);
    try {
      const detail = await customerService.getCustomerDetail(customer.id);
      setSelectedDrawerCustomer(detail);
    } catch (err) {
      console.error("Failed to load customer details:", err);
      showToast("Failed to fetch full customer details", "error");
    } finally {
      setIsDrawerLoading(false);
    }
  };

  // Edit Customer Profile
  const handleEditCustomer = async (customer: CustomerListItem | CustomerDetailResponse) => {
    setFormCustomer(customer);
    setIsFormModalOpen(true);
  };

  // Save Customer Profile Changes
  const handleSaveCustomer = async (data: {
    fullName: string;
    email: string | null;
    profileImageUrl: string | null;
  }) => {
    if (!formCustomer) return;
    try {
      const updated = await customerService.updateCustomerProfile(formCustomer.id, data);
      showToast(`Customer profile for ${data.fullName} updated successfully`);

      // Refresh drawer if open
      if (selectedDrawerCustomer && selectedDrawerCustomer.id === formCustomer.id) {
        setSelectedDrawerCustomer(updated);
      }

      await fetchCustomers();
      await fetchSummary();
    } catch (err: any) {
      showToast(err?.message || "Failed to update profile", "error");
      throw err;
    }
  };

  // Status Patch Update
  const handleUpdateStatus = async (
    customerId: string,
    newStatus: CustomerAccountStatus
  ) => {
    try {
      await customerService.updateCustomerStatus(customerId, newStatus);
      showToast(`Customer status updated to ${newStatus}`);

      // Refresh drawer if open
      if (selectedDrawerCustomer && selectedDrawerCustomer.id === customerId) {
        setSelectedDrawerCustomer((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }

      await fetchCustomers();
      await fetchSummary();
    } catch (err: any) {
      showToast(err?.message || "Failed to update status", "error");
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await customerService.exportCustomersCsv({
        query: searchQuery.trim() || undefined,
        status: selectedStatus !== "ALL" ? (selectedStatus as CustomerAccountStatus) : undefined,
        location:
          selectedLocation !== "All Locations" && selectedLocation.trim()
            ? selectedLocation
            : undefined,
        customerType: selectedType !== "ALL" ? selectedType : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rrv_customers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("Customers CSV exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Failed to export customers CSV", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedStatus !== "ALL" ||
    (selectedLocation !== "All Locations" && selectedLocation.trim().length > 0) ||
    selectedType !== "ALL" ||
    fromDate.length > 0 ||
    toDate.length > 0;

  // Render Unauthorized state if authenticated user lacks ADMIN or SUPER_ADMIN role
  if (!isAuthLoading && isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            Customer management is restricted to authorized <strong>ADMIN</strong> and{" "}
            <strong>SUPER_ADMIN</strong> roles. Your account ({user?.email}) does not have permission
            to view or modify customer records.
          </p>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold transition-colors"
          >
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              notification.type === "success"
                ? "bg-emerald-900 text-white border-emerald-800"
                : notification.type === "error"
                ? "bg-rose-900 text-white border-rose-800"
                : "bg-slate-900 text-white border-slate-800"
            }`}
          >
            {notification.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {notification.type === "error" && <XCircle className="w-4 h-4 text-rose-400" />}
            {notification.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Breadcrumb & Screen Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Link href="/admin/dashboard" className="hover:text-emerald-700">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700 font-bold">Customer Management</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Customer Management & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor customer accounts, delivery addresses, order frequencies, and profile details.
            </p>
          </div>

          {/* Quick Refresh Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchSummary();
                fetchCustomers();
                showToast("Refreshed customer data", "info");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-3xs transition-colors cursor-pointer"
              title="Refresh customer data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 1. Top Summary Cards (4-8 Metric Cards) */}
        <CustomerStatsCards summary={summary} isLoading={isLoading && !summary} />

        {/* 2. Status & Segmentation Tabs Bar */}
        <CustomerTabsBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onExport={handleExportCSV}
          isExporting={isExporting}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          tabCounts={{
            all: summary?.totalCustomers,
            active: summary?.activeCustomers,
            inactive: summary?.inactiveCustomers,
            suspended: summary?.suspendedCustomers,
            new: summary?.newCustomersThisMonth,
            repeat: summary?.repeatCustomers,
          }}
        />

        {/* 3. Filter & Action Bar */}
        <CustomerFiltersBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(0);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(s) => {
            setSelectedStatus(s);
            setCurrentPage(0);
          }}
          selectedLocation={selectedLocation}
          onLocationChange={(l) => {
            setSelectedLocation(l);
            setCurrentPage(0);
          }}
          selectedType={selectedType}
          onTypeChange={(t) => {
            setSelectedType(t);
            setCurrentPage(0);
          }}
          fromDate={fromDate}
          onFromDateChange={(d) => {
            setFromDate(d);
            setCurrentPage(0);
          }}
          toDate={toDate}
          onToDateChange={(d) => {
            setToDate(d);
            setCurrentPage(0);
          }}
          sortBy={sortBy}
          onSortByChange={(s) => {
            setSortBy(s);
            setCurrentPage(0);
          }}
          sortDirection={sortDirection}
          onSortDirectionChange={(dir) => {
            setSortDirection(dir);
            setCurrentPage(0);
          }}
          onResetFilters={handleResetFilters}
        />

        {/* 4. Customer Data Table */}
        <CustomerTable
          customers={customers}
          isLoading={isLoading}
          totalElements={totalElements}
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setCurrentPage(0);
          }}
          onViewCustomer={handleViewCustomer}
          onEditCustomer={handleEditCustomer}
          onUpdateStatus={handleUpdateStatus}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Screen 2: Slide-Over Customer Details Drawer */}
      <CustomerDetailsDrawer
        customer={selectedDrawerCustomer}
        isOpen={isDrawerOpen}
        isLoading={isDrawerLoading}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEditCustomer}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Customer Profile Edit Modal */}
      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        customer={formCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
