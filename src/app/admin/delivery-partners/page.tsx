"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { deliveryPartnersService } from "@/services/delivery-partners.service";
import {
  DeliveryPartner,
  DeliveryPartnersSummary,
  AreaDeliveryStat,
} from "@/types";
import {
  PartnerStatsCards,
  PartnerTabsBar,
  PartnerTabType,
  PartnerFiltersBar,
  PartnerTable,
  PartnerDetailsCard,
  PartnerAnalyticsWidgets,
  PartnerFormModal,
} from "@/components/delivery-partners";
import {
  MOCK_DELIVERY_PARTNERS_PAGE19,
  MOCK_PARTNERS_SUMMARY_PAGE19,
  MOCK_AREA_DELIVERY_STATS,
} from "@/data";

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>(MOCK_DELIVERY_PARTNERS_PAGE19);
  const [summary, setSummary] = useState<DeliveryPartnersSummary>(MOCK_PARTNERS_SUMMARY_PAGE19);
  const [areaStats, setAreaStats] = useState<AreaDeliveryStat[]>(MOCK_AREA_DELIVERY_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<PartnerTabType>("All Partners");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [areaFilter, setAreaFilter] = useState("All Areas");
  const [sortBy, setSortBy] = useState("Rating");

  // Selection & Modal state
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(
    MOCK_DELIVERY_PARTNERS_PAGE19[0] || null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [modalTab, setModalTab] = useState<"details" | "vehicle" | "performance" | "documents">("details");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [partnersData, summaryData, statsData] = await Promise.all([
        deliveryPartnersService.getDeliveryPartners(),
        deliveryPartnersService.getPartnersSummary(),
        deliveryPartnersService.getAreaDeliveryStats(),
      ]);

      setPartners(partnersData);
      setSummary(summaryData);
      setAreaStats(statsData);

      // Select first partner by default if none selected
      if (!selectedPartner && partnersData.length > 0) {
        setSelectedPartner(partnersData[0]);
      }
    } catch (err) {
      console.error("Failed to load delivery partners:", err);
      setError("Failed to load delivery partners data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Sorted partners
  const filteredPartners = useMemo(() => {
    return partners
      .filter((p) => {
        // Tab filter
        if (activeTab === "Active" && p.status !== "Active" && p.status !== "On Delivery")
          return false;
        if (activeTab === "On Delivery" && p.status !== "On Delivery")
          return false;
        if (activeTab === "Idle" && p.status !== "Idle")
          return false;
        if (activeTab === "Inactive" && p.status !== "Inactive")
          return false;

        // Status dropdown filter
        if (statusFilter !== "All Status" && p.status !== statusFilter) {
          return false;
        }

        // Area dropdown filter
        if (areaFilter !== "All Areas" && !p.area.includes(areaFilter)) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.area.toLowerCase().includes(q) ||
            (p.vehicleDetails && p.vehicleDetails.toLowerCase().includes(q)) ||
            p.id.toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Rating") {
          return b.rating - a.rating;
        }
        if (sortBy === "Total Deliveries") {
          return b.totalDeliveries - a.totalDeliveries;
        }
        if (sortBy === "Name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [partners, activeTab, statusFilter, areaFilter, searchQuery, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, areaFilter, sortBy]);

  const totalPages = Math.ceil(filteredPartners.length / pageSize) || 1;

  const paginatedPartners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, currentPage, pageSize]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: partners.length,
      active: partners.filter((p) => p.status === "Active" || p.status === "On Delivery").length,
      onDelivery: partners.filter((p) => p.status === "On Delivery").length,
      idle: partners.filter((p) => p.status === "Idle").length,
      inactive: partners.filter((p) => p.status === "Inactive").length,
    };
  }, [partners]);

  // Top performing partners (sorted by rating and deliveries)
  const topPerformingPartners = useMemo(() => {
    return [...partners].sort((a, b) => b.rating - a.rating || b.totalDeliveries - a.totalDeliveries);
  }, [partners]);

  const handleResetFilters = () => {
    setActiveTab("All Partners");
    setSearchQuery("");
    setStatusFilter("All Status");
    setAreaFilter("All Areas");
    setSortBy("Rating");
  };

  const handleAddOrEditSubmit = async (
    partnerData: Partial<DeliveryPartner>
  ) => {
    try {
      if (editingPartner) {
        const updated = await deliveryPartnersService.updatePartner(
          editingPartner.id,
          partnerData
        );
        setPartners((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        if (selectedPartner?.id === updated.id) {
          setSelectedPartner(updated);
        }
        setEditingPartner(null);
      } else {
        const created = await deliveryPartnersService.addPartner(
          partnerData as Omit<DeliveryPartner, "id" | "totalDeliveries" | "rating">
        );
        setPartners((prev) => [created, ...prev]);
        setSelectedPartner(created);
      }
      // Refresh summary
      const updatedSummary = await deliveryPartnersService.getPartnersSummary();
      setSummary(updatedSummary);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to save partner:", err);
    }
  };

  const handleToggleStatus = async (partner: DeliveryPartner) => {
    try {
      const nextStatus = partner.status === "Inactive" ? "Active" : "Inactive";
      const updated = await deliveryPartnersService.updateStatus(
        partner.id,
        nextStatus
      );
      setPartners((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      if (selectedPartner?.id === updated.id) {
        setSelectedPartner(updated);
      }
      const updatedSummary = await deliveryPartnersService.getPartnersSummary();
      setSummary(updatedSummary);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const isFiltered =
    activeTab !== "All Partners" ||
    searchQuery !== "" ||
    statusFilter !== "All Status" ||
    areaFilter !== "All Areas";

  const activeFiltersCount =
    (activeTab !== "All Partners" ? 1 : 0) +
    (searchQuery !== "" ? 1 : 0) +
    (statusFilter !== "All Status" ? 1 : 0) +
    (areaFilter !== "All Areas" ? 1 : 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Delivery Partners Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage delivery partner profiles, availability, assignments, and performance.
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
            onClick={() => {
              setEditingPartner(null);
              setModalTab("details");
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00875a] hover:bg-[#00704a] text-white shadow-3xs transition-all duration-150"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Delivery Partner</span>
          </button>
        </div>
      </div>

      {/* Error state banner */}
      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Stats Cards (5 items matching Page 19) */}
      {summary && <PartnerStatsCards summary={summary} />}

      {/* 3. Tabs Bar */}
      <PartnerTabsBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenFilter={() => {}}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
        activeFiltersCount={activeFiltersCount}
        tabCounts={tabCounts}
      />

      {/* 4. Search and Filters Bar */}
      <PartnerFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        areaFilter={areaFilter}
        onAreaChange={setAreaFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* 5. Main Split View: Partner Table + Partner Details Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Table (8 cols on xl, 9 cols on 2xl to comfortably avoid horizontal scroll) */}
        <div className="xl:col-span-8 2xl:col-span-9 min-w-0 w-full">
          <PartnerTable
            partners={paginatedPartners}
            totalPartners={filteredPartners.length}
            totalPages={totalPages}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            selectedPartner={selectedPartner}
            onSelectPartner={(partner) => setSelectedPartner(partner)}
            onEditPartner={(partner) => {
              setEditingPartner(partner);
              setModalTab("details");
              setIsAddModalOpen(true);
            }}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Right: Partner Details Panel (sticky) */}
        <div className="xl:col-span-4 2xl:col-span-3 min-w-0 w-full xl:sticky xl:top-20">
          <PartnerDetailsCard
            partner={selectedPartner}
            onEdit={(partner, tab) => {
              setEditingPartner(partner);
              setModalTab(tab || "details");
              setIsAddModalOpen(true);
            }}
            onStatusChange={(partner, newStatus) =>
              deliveryPartnersService
                .updateStatus(partner.id, newStatus)
                .then((updated) => {
                  setPartners((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p))
                  );
                  if (selectedPartner?.id === updated.id) {
                    setSelectedPartner(updated);
                  }
                  deliveryPartnersService.getPartnersSummary().then(setSummary);
                })
            }
          />
        </div>
      </div>

      {/* 6. Bottom Analytics Widgets (3 cards matching Page 19) */}
      {summary && (
        <PartnerAnalyticsWidgets
          summary={summary}
          topPartners={topPerformingPartners}
          areaStats={areaStats}
          onSelectPartner={(partner) => setSelectedPartner(partner)}
        />
      )}

      {/* Add / Edit Partner Modal */}
      {isAddModalOpen && (
        <PartnerFormModal
          key={`${editingPartner?.id || "new"}-${modalTab}`}
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingPartner(null);
          }}
          onSubmit={handleAddOrEditSubmit}
          initialData={editingPartner}
          initialTab={modalTab}
        />
      )}
    </div>
  );
}
