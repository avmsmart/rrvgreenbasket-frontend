"use client";

import React, { useState } from "react";
import { Search, X, Filter, Check } from "lucide-react";

interface PackingFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
  selectedPaymentStatus: string;
  onPaymentStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const PackingFiltersBar: React.FC<PackingFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedArea,
  onAreaChange,
  selectedPaymentStatus,
  onPaymentStatusChange,
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

  const paymentStatuses = [
    "All Payment Status",
    "Paid (UPI)",
    "Paid (Card)",
    "Paid (COD)",
    "COD",
  ];

  const sortOptions = [
    "Sort by: Order Time",
    "Sort by: Amount (High to Low)",
    "Sort by: Customer Name",
    "Sort by: Order ID",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input - Page 13: "Search by order ID, customer name, phone..." */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by order ID, customer name, phone..."
          className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3 Dropdown Controls matching Page 13 */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Dropdown 1: All Delivery Areas */}
        <select
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/90 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] cursor-pointer"
        >
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Dropdown 2: All Payment Status */}
        <select
          value={selectedPaymentStatus}
          onChange={(e) => onPaymentStatusChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/90 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] cursor-pointer"
        >
          {paymentStatuses.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Dropdown 3: Sort by: Order Time */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/90 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] cursor-pointer"
        >
          {sortOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Interactive Filter Modal Dialog */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#eefcf2] flex items-center justify-center text-[#00875a]">
                  <Filter className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  Filter Packing Orders
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseFilterModal}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Delivery Areas */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Delivery Area
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {areas.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => onAreaChange(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedArea === a
                          ? "bg-[#00875a] text-white shadow-xs font-bold"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <span>{a}</span>
                      {selectedArea === a && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Statuses */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Payment Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {paymentStatuses.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPaymentStatusChange(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedPaymentStatus === p
                          ? "bg-[#00875a] text-white shadow-xs font-bold"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <span>{p}</span>
                      {selectedPaymentStatus === p && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Clear All
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCloseFilterModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onApplyFilters}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00875a] hover:bg-[#00704a] shadow-xs transition-all cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
