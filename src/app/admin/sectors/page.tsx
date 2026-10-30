"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Sector } from "@/types/sector";
import {
  getSavedSectors,
  saveSectors,
} from "@/data/shared-store";
import {
  SectorsKpiCards,
  SectorsFilterBar,
  SectorFilterTab,
  SectorSortKey,
  SectorsTable,
  SectorsAnalyticsRow,
  AddSectorModal,
  EditSectorModal,
} from "@/components/sectors";

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>(() =>
    typeof window !== "undefined" ? getSavedSectors() : []
  );
  const [activeTab, setActiveTab] = useState<SectorFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<SectorSortKey>("displayOrder");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Initialize from shared store & subscribe to cross-page events
  useEffect(() => {
    setSectors(getSavedSectors());

    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("search");
      if (s) setSearchQuery(s);
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<Sector[]>;
      if (customEvent.detail) {
        setSectors(customEvent.detail);
      } else {
        setSectors(getSavedSectors());
      }
    };

    window.addEventListener("rrv:sectors:updated", handleSync);
    return () => {
      window.removeEventListener("rrv:sectors:updated", handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddSector = (newSectorData: Omit<Sector, "id">) => {
    const newSector: Sector = {
      ...newSectorData,
      id: `SEC-${String(sectors.length + 1).padStart(2, "0")}`,
    };
    const updated = [...sectors, newSector];
    setSectors(updated);
    saveSectors(updated);
    showToast(`Sector "${newSector.name}" created successfully!`);
  };

  const handleSaveSector = (updatedSector: Sector) => {
    const updated = sectors.map((s) => (s.id === updatedSector.id ? updatedSector : s));
    setSectors(updated);
    saveSectors(updated);
    showToast(`Sector "${updatedSector.name}" updated!`);
  };

  const handleDeleteSector = (id: string) => {
    const target = sectors.find((s) => s.id === id);
    if (!target) return;
    if (confirm(`Are you sure you want to delete "${target.name}"?`)) {
      const updated = sectors.filter((s) => s.id !== id);
      setSectors(updated);
      saveSectors(updated);
      showToast(`Sector "${target.name}" deleted.`);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = sectors.map((s) => {
      if (s.id === id) {
        const nextStatus = s.status === "Active" ? ("Inactive" as const) : ("Active" as const);
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setSectors(updated);
    saveSectors(updated);
  };

  const handleToggleFeatured = (id: string) => {
    const updated = sectors.map((s) => {
      if (s.id === id) {
        return { ...s, isFeatured: !s.isFeatured };
      }
      return s;
    });
    setSectors(updated);
    saveSectors(updated);
  };

  // Filter & Sort
  const filteredSectors = sectors
    .filter((sector) => {
      if (activeTab === "active" && sector.status !== "Active") return false;
      if (activeTab === "inactive" && sector.status !== "Inactive") return false;
      if (activeTab === "featured" && !sector.isFeatured) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sector.name.toLowerCase().includes(q);
        const matchesDesc = sector.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "displayOrder") return (a.displayOrder || 0) - (b.displayOrder || 0);
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "productsCount") return (b.productsCount || 0) - (a.productsCount || 0);
      if (sortKey === "revenue") return (b.revenue || 0) - (a.revenue || 0);
      return 0;
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sectors Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Organize store categories or sectors, control visibility, and view category performance.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00875a] hover:bg-[#00704a] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sector</span>
        </button>
      </div>

      {/* KPI Cards */}
      <SectorsKpiCards sectors={sectors} />

      {/* Filter and Search Bar */}
      <SectorsFilterBar
        sectors={sectors}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortKey={sortKey}
        onSortChange={setSortKey}
      />

      {/* Sectors Table & Mobile Cards */}
      <SectorsTable
        sectors={filteredSectors}
        onEdit={(sec) => setEditingSector(sec)}
        onDelete={handleDeleteSector}
        onToggleStatus={handleToggleStatus}
        onToggleFeatured={handleToggleFeatured}
      />

      {/* Sector Analytics Breakdown Row */}
      <SectorsAnalyticsRow sectors={sectors} />

      {/* Add Sector Modal */}
      <AddSectorModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSector}
        nextDisplayOrder={sectors.length + 1}
      />

      {/* Edit Sector Modal */}
      <EditSectorModal
        isOpen={!!editingSector}
        onClose={() => setEditingSector(null)}
        sector={editingSector}
        onSave={handleSaveSector}
      />
    </div>
  );
}
