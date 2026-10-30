"use client";

import React from "react";
import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";

interface PartnerFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  areaFilter: string;
  onAreaChange: (area: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const PartnerFiltersBar: React.FC<PartnerFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  areaFilter,
  onAreaChange,
  sortBy,
  onSortChange,
}) => {
  const statusOptions = ["All Status", "Active", "On Delivery", "Idle", "Inactive"];
  const areaOptions = [
    "All Areas",
    "Sector 1-4",
    "Sector 5-8",
    "Sector 9-12",
    "Sector 13-16",
    "Kurnool City",
    "Old City",
    "New City",
    "Industrial Area",
  ];
  const sortOptions = [
    { label: "Sort by: Rating", value: "Rating" },
    { label: "Sort by: Total Deliveries", value: "Total Deliveries" },
    { label: "Sort by: Name", value: "Name" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* 1. Search Box */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search delivery partner by name, phone, area, vehicle..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all"
        />
      </div>

      {/* 2. Filter Dropdowns */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* Status Dropdown */}
        <div className="relative min-w-[120px] flex-1 sm:flex-initial">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Area Dropdown */}
        <div className="relative min-w-[130px] flex-1 sm:flex-initial">
          <select
            value={areaFilter}
            onChange={(e) => onAreaChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all cursor-pointer"
          >
            {areaOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[140px] flex-1 sm:flex-initial">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
