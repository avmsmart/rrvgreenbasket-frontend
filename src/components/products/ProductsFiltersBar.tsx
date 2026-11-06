
"use client";

import React from "react";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
  LayoutGrid,
  Plus,
} from "lucide-react";

export type ProductCategoryTab = "All" | string;

interface ProductsFiltersBarProps {
  activeTab: ProductCategoryTab;
  onTabChange: (tab: ProductCategoryTab) => void;
  counts: {
    all: number;
    english: number;
    indian: number;
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedUom: string;
  onUomChange: (uom: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedAvailability?: string;
  onAvailabilityChange?: (avail: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onOpenAddModal: () => void;
}

export const ProductsFiltersBar: React.FC<ProductsFiltersBarProps> = ({
  activeTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  selectedUom,
  onUomChange,
  selectedStatus,
  onStatusChange,
  selectedAvailability = "All",
  onAvailabilityChange,
  viewMode,
  onViewModeChange,
  onExportCsv,
  onExportPdf,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-3 flex-wrap gap-3">
        {/* All Products Tab */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange("All")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "All"
                ? "bg-[#00875a] text-white shadow-md shadow-emerald-200"
                : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80"
            }`}
          >
            <span>All Products</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "All"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts.all}
            </span>
          </button>
        </div>

        {/* Export and Add Product */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportCsv}
            title="Export CSV"
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={onExportPdf}
            title="Export PDF"
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Availability */}
          {onAvailabilityChange && (
            <select
              aria-label="Filter by product availability"
              value={selectedAvailability}
              onChange={(e) => onAvailabilityChange(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All">All Availability</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          )}

          {/* Product Status */}
          <select
            aria-label="Filter by product status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">In Stock (Active)</option>
            <option value="INACTIVE">Out of Stock (Inactive)</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* UOM */}
          <select
            aria-label="Filter by unit of measurement"
            value={selectedUom}
            onChange={(e) => onUomChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Units (UOM)</option>
            <option value="Kg">Kg</option>
            <option value="kg">kg</option>
            <option value="Nos">Nos</option>
            <option value="Pkt">Pkt</option>
            <option value="1 bunch">1 bunch</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => onViewModeChange("table")}
              title="Table View"
              aria-label="Table View"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-3xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => onViewModeChange("grid")}
              title="Grid Cards View"
              aria-label="Grid Cards View"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-3xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
