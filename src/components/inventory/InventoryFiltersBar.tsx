"use client";

import React from "react";
import { Search, Plus, FileSpreadsheet, AlertTriangle } from "lucide-react";

interface InventoryFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onOpenStockInward: () => void;
  onExportCsv: () => void;
}

export const InventoryFiltersBar: React.FC<InventoryFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  onOpenStockInward,
  onExportCsv,
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search inventory by product name or ERP code..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Filter Selects & Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          aria-label="Filter inventory by category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="English Vegetables">English Vegetables</option>
          <option value="Indian Vegetables">Indian Vegetables</option>
        </select>

        <select
          aria-label="Filter inventory by stock status"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="All">All Stock Status</option>
          <option value="In Stock">In Stock Only</option>
          <option value="Low Stock">⚠️ Low Stock Only</option>
          <option value="Out of Stock">✕ Out of Stock</option>
        </select>

        <button
          onClick={onExportCsv}
          className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onOpenStockInward}
          className="px-4 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Inward New Batch</span>
        </button>
      </div>
    </div>
  );
};
