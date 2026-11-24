"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  MapPin,
  Calendar,
  ArrowUpDown,
  Filter,
  Users,
} from "lucide-react";
import { CustomerTypeFilter } from "@/types";

interface CustomerFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  selectedType: CustomerTypeFilter;
  onTypeChange: (type: CustomerTypeFilter) => void;
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  sortDirection: "ASC" | "DESC";
  onSortDirectionChange: (dir: "ASC" | "DESC") => void;
  onResetFilters: () => void;
}

export const CustomerFiltersBar: React.FC<CustomerFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedLocation,
  onLocationChange,
  selectedType,
  onTypeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
  onResetFilters,
}) => {
  // Local debounced search input state (300ms)
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const statuses = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
  ];

  const locations = [
    "All Locations",
    "Kurnool",
    "Anna Nagar",
    "RTC Colony",
    "Nandyal Road",
    "Venkata Ramana Colony",
    "Bellary Road",
    "Autonagar",
    "Pragathi Nagar",
    "Bangalore Road",
    "518001",
    "518002",
    "518003",
    "518004",
  ];

  const customerTypes: { label: string; value: CustomerTypeFilter }[] = [
    { label: "All Customer Types", value: "ALL" },
    { label: "First-Time", value: "FIRST_TIME" },
    { label: "Repeat Customers", value: "REPEAT" },
    { label: "Top Customers", value: "TOP_CUSTOMER" },
  ];

  const sortOptions = [
    { label: "Joined Date", value: "createdAt" },
    { label: "Total Spent", value: "totalSpent" },
    { label: "Total Orders", value: "totalOrders" },
    { label: "Customer Name", value: "fullName" },
  ];

  const hasFilters =
    searchQuery.trim().length > 0 ||
    selectedStatus !== "ALL" ||
    (selectedLocation !== "All Locations" && selectedLocation.trim().length > 0) ||
    selectedType !== "ALL" ||
    fromDate.length > 0 ||
    toDate.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-3xs space-y-3">
      {/* Top Row: Search & Dropdowns */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        
        {/* Debounced Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by customer name, mobile number (+91...), or email..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200/80 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Location Select */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="pl-7 pr-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Customer Type Select */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value as CustomerTypeFilter)}
              className="pl-7 pr-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              {customerTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl border border-slate-200 p-0.5">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="pl-2.5 pr-2 py-1.5 text-xs font-semibold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSortDirectionChange(sortDirection === "ASC" ? "DESC" : "ASC")}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={`Sort direction: ${sortDirection} (Click to toggle)`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Date Range & Active Filter Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Date Range Inputs */}
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Registered:
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            title="Registration start date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            title="Registration end date"
          />
        </div>

        {/* Clear Filters indicator */}
        {hasFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Clear all active filters
          </button>
        )}
      </div>
    </div>
  );
};
