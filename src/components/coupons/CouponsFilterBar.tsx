"use client";

import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";

export type CouponTab = "All" | "Active" | "Inactive" | "Scheduled" | "Expired";

interface CouponsFilterBarProps {
  activeTab: CouponTab;
  onTabChange: (tab: CouponTab) => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
    scheduled: number;
    expired: number;
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onReset: () => void;
}

export const CouponsFilterBar: React.FC<CouponsFilterBarProps> = ({
  activeTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortByChange,
  onReset,
}) => {
  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          type="button"
          onClick={() => onTabChange("All")}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
            activeTab === "All"
              ? "border-[#00875a] text-[#00875a] bg-emerald-50/60"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          All Coupons ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("Active")}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
            activeTab === "Active"
              ? "border-[#00875a] text-[#00875a] bg-emerald-50/60"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Active ({counts.active})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("Inactive")}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
            activeTab === "Inactive"
              ? "border-[#00875a] text-[#00875a] bg-emerald-50/60"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Inactive ({counts.inactive})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("Scheduled")}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
            activeTab === "Scheduled"
              ? "border-[#00875a] text-[#00875a] bg-emerald-50/60"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Scheduled ({counts.scheduled})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("Expired")}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
            activeTab === "Expired"
              ? "border-[#00875a] text-[#00875a] bg-emerald-50/60"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Expired ({counts.expired})
        </button>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by coupon code, name, description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Dropdowns & Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <select
            aria-label="Filter coupon by discount type"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="percentage">Percentage (10%, 20%)</option>
            <option value="fixed">Fixed Amount (₹50, ₹100)</option>
            <option value="free_shipping">Free Shipping</option>
          </select>

          <select
            aria-label="Filter coupon by status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            aria-label="Sort coupons"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="created">Sort by: Created Date</option>
            <option value="usage">Sort by: Usage Count</option>
            <option value="discount">Sort by: Discount</option>
            <option value="expiry">Sort by: Expiring Soon</option>
          </select>

          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-3xs flex items-center gap-1.5 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
