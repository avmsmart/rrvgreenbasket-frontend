"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/layout";
import {
  CouponsKpiCards,
  CouponsFilterBar,
  CouponsTable,
  CouponsAnalyticsRow,
  CreateCouponModal,
  EditCouponModal,
  CouponTab,
  CouponDetailsDrawer,
} from "@/components/coupons";
import { Coupon, CouponActivity } from "@/types/coupon";
import {
  getSavedCoupons,
  saveCoupons,
  getSavedCouponActivities,
} from "@/data/shared-store";

export default function CouponsManagementPage() {
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [activitiesList, setActivitiesList] = useState<CouponActivity[]>([]);
  const [activeTab, setActiveTab] = useState<CouponTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("created");

  // Modals & Drawer
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCouponForDrawer, setSelectedCouponForDrawer] = useState<Coupon | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Initialize from persistent repository
  useEffect(() => {
    setCouponsList(getSavedCoupons());
    setActivitiesList(getSavedCouponActivities());

    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("search");
      if (s) {
        setSearchQuery(s);
        setActiveTab("All");
      }
    }

    const handleSync = () => {
      setCouponsList(getSavedCoupons());
    };

    window.addEventListener("rrv:coupons:updated", handleSync);
    return () => window.removeEventListener("rrv:coupons:updated", handleSync);
  }, []);

  // Compute counts
  const counts = useMemo(() => {
    return {
      all: couponsList.length,
      active: couponsList.filter((c) => c.status === "Active").length,
      inactive: couponsList.filter((c) => c.status === "Inactive").length,
      scheduled: couponsList.filter((c) => c.status === "Scheduled").length,
      expired: couponsList.filter((c) => c.status === "Expired").length,
    };
  }, [couponsList]);

  // Compute totals
  const totalUsages = useMemo(() => {
    return couponsList.reduce((sum, c) => {
      const used = Number(c.usage.split("/")[0]?.trim()) || c.currentUsage || 0;
      return sum + used;
    }, 0);
  }, [couponsList]);

  const totalDiscountGiven = useMemo(() => {
    return couponsList.reduce((sum, c) => sum + (c.totalSaved || 0), 0);
  }, [couponsList]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return couponsList.filter((coupon) => {
      // Tab filter
      if (activeTab !== "All" && coupon.status !== activeTab) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = coupon.code.toLowerCase().includes(q);
        const matchesName = coupon.offerName.toLowerCase().includes(q);
        const matchesDesc = (coupon.description || "").toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesDesc) return false;
      }

      // Type filter
      if (selectedType !== "All") {
        if (selectedType === "free_shipping" && !coupon.discount.toLowerCase().includes("free")) {
          return false;
        }
        if (selectedType === "percentage" && !coupon.discount.includes("%")) {
          return false;
        }
        if (selectedType === "fixed" && !coupon.discount.includes("₹")) {
          return false;
        }
      }

      // Status dropdown filter
      if (selectedStatus !== "All" && coupon.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "usage") {
        const uA = Number(a.usage.split("/")[0]?.trim()) || 0;
        const uB = Number(b.usage.split("/")[0]?.trim()) || 0;
        return uB - uA;
      }
      if (sortBy === "discount") {
        const valA = a.discountValue || 0;
        const valB = b.discountValue || 0;
        return valB - valA;
      }
      return 0; // Default created order
    });
  }, [couponsList, activeTab, searchQuery, selectedType, selectedStatus, sortBy]);

  // Paginated items
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCoupons.slice(start, start + pageSize);
  }, [filteredCoupons, currentPage, pageSize]);

  // Handlers
  const handleToggleStatus = (couponId: string) => {
    const updated = couponsList.map((c) => {
      if (c.id === couponId) {
        const nextStatus = c.status === "Active" ? "Inactive" : "Active";
        return { ...c, status: nextStatus as Coupon["status"] };
      }
      return c;
    });

    setCouponsList(updated);
    saveCoupons(updated);
  };

  const handleCreateCoupon = (newCoupon: Coupon) => {
    const updated = [newCoupon, ...couponsList];
    setCouponsList(updated);
    saveCoupons(updated);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedCoupon: Coupon) => {
    const updated = couponsList.map((c) =>
      c.id === updatedCoupon.id ? updatedCoupon : c
    );
    setCouponsList(updated);
    saveCoupons(updated);
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (confirm("Are you sure you want to delete this promotional coupon?")) {
      const updated = couponsList.filter((c) => c.id !== couponId);
      setCouponsList(updated);
      saveCoupons(updated);
    }
  };

  const handleResetFilters = () => {
    setActiveTab("All");
    setSearchQuery("");
    setSelectedType("All");
    setSelectedStatus("All");
    setSortBy("created");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Coupons & Offers" },
        ]}
      />

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Coupons &amp; Offers Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Create and manage discount coupons, special offers, and promotional campaigns
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* KPI Cards */}
      <CouponsKpiCards
        totalCoupons={counts.all}
        activeCoupons={counts.active}
        totalUsages={totalUsages || 1842}
        totalDiscountGiven={totalDiscountGiven || 28450}
      />

      {/* Filter Bar */}
      <CouponsFilterBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        counts={counts}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        onTypeChange={(t) => {
          setSelectedType(t);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Table & Mobile Cards */}
      <CouponsTable
        coupons={paginatedCoupons}
        onToggleStatus={handleToggleStatus}
        onEditCoupon={handleOpenEdit}
        onDeleteCoupon={handleDeleteCoupon}
        onViewCoupon={(c) => {
          setSelectedCouponForDrawer(c);
          setIsDetailsDrawerOpen(true);
        }}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredCoupons.length}
        onPageChange={setCurrentPage}
      />

      {/* Analytics Row */}
      <CouponsAnalyticsRow activities={activitiesList} />

      {/* Modals & Drawer */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCouponCreated={handleCreateCoupon}
      />

      <EditCouponModal
        coupon={editingCoupon}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCouponSaved={handleSaveEdit}
      />

      <CouponDetailsDrawer
        coupon={selectedCouponForDrawer}
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
