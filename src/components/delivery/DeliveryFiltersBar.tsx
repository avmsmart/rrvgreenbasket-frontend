"use client";

import React from "react";
import { Search, X, Filter, Check } from "lucide-react";

interface DeliveryFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
  selectedPartner: string;
  onPartnerChange: (partner: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const DeliveryFiltersBar: React.FC<DeliveryFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedArea,
  onAreaChange,
  selectedPartner,
  onPartnerChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortByChange,
  isFilterModalOpen,
  onCloseFilterModal,
  onApplyFilters,
  onResetFilters,
}) => {
  const areas = [
    "All Delivery Areas",
    "Anna Nagar",
    "RTC Colony",
    "Nandyal Road",
    "Bellary Road",
    "Gandhi Nagar",
    "Venkata Ramana Colony",
    "Autonagar",
    "Pragathi Nagar",
    "Bangalore Road",
    "Kurnool Town",
  ];

  const partners = [
    "All Delivery Partners",
    "Ramesh",
    "Suresh",
    "Manoj",
    "Raju V",
    "Imran S",
    "Unassigned",
  ];

  const statuses = [
    "All Status",
    "Delivered",
    "Out for Delivery",
    "Pending",
    "Failed",
  ];

  const sortOptions = [
    "Sort by: Order Time",
    "Sort by: Amount (High to Low)",
    "Sort by: Customer Name",
    "Sort by: Delivery Time",
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order ID, customer, phone, partner..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200/80 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Areas */}
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          >
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Partners */}
          <select
            value={selectedPartner}
            onChange={(e) => onPartnerChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          >
            {partners.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Modal Dialog */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Filter Delivery Orders
                </h3>
              </div>
              <button
                onClick={onCloseFilterModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Delivery Area
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => onAreaChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 text-slate-800"
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Delivery Partner
                </label>
                <select
                  value={selectedPartner}
                  onChange={(e) => onPartnerChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 text-slate-800"
                >
                  {partners.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Delivery Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 text-slate-800"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 text-slate-800"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onResetFilters}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={onApplyFilters}
                className="flex-1 px-4 py-2 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] shadow-3xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
