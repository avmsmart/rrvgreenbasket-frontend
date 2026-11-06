"use client";

import React from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Sector } from "@/types/sector";

export type SectorFilterTab = "all" | "active" | "inactive" | "featured";
export type SectorSortKey = "displayOrder" | "name" | "productsCount" | "revenue";

interface SectorsFilterBarProps {
  sectors: Sector[];
  activeTab: SectorFilterTab;
  onTabChange: (tab: SectorFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortKey: SectorSortKey;
  onSortChange: (sort: SectorSortKey) => void;
}

export const SectorsFilterBar: React.FC<SectorsFilterBarProps> = ({
  sectors,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
}) => {
  const counts = {
    all: sectors.length,
    active: sectors.filter((s) => s.status === "Active").length,
    inactive: sectors.filter((s) => s.status === "Inactive").length,
    featured: sectors.filter((s) => s.isFeatured).length,
  };

  const tabs: { id: SectorFilterTab; label: string; count: number }[] = [
    { id: "all", label: "All Sectors", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "inactive", label: "Inactive", count: counts.inactive },
    { id: "featured", label: "Featured", count: counts.featured },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-3xs">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 bg-slate-100 rounded-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? "bg-emerald-100 text-[#00875a]" : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sectors..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SectorSortKey)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold pl-8 pr-7 py-2 rounded-xl hover:bg-slate-100 focus:outline-none"
          >
            <option value="displayOrder">Order (1-8)</option>
            <option value="name">Name (A-Z)</option>
            <option value="productsCount">Most Products</option>
            <option value="revenue">Top Revenue</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
