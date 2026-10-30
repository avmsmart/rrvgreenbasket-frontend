"use client";

import React from "react";
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
  LayoutGrid,
  Plus,
} from "lucide-react";

export type ProductCategoryTab = "All" | "English Vegetables" | "Indian Vegetables";

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
  viewMode,
  onViewModeChange,
  onExportCsv,
  onExportPdf,
  onOpenAddModal,
}) => {
  const tabs: { key: ProductCategoryTab; label: string; count: number }[] = [
    { key: "All", label: "All Products", count: counts.all },
    { key: "English Vegetables", label: "Section A: English Vegetables", count: counts.english },
    { key: "Indian Vegetables", label: "Section B: Indian Vegetables", count: counts.indian },
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#00875a] text-white shadow-md shadow-emerald-200"
                    : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Add Product, Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={onExportPdf}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Search and Dropdown Filter Row */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Product Name, ERP Code (e.g. VGEV000904), Excel Name, or HSN Code..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* UOM Filter */}
          <select
            aria-label="Filter by unit of measurement"
            value={selectedUom}
            onChange={(e) => onUomChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Units (UOM)</option>
            <option value="Kg">Kg</option>
            <option value="Nos">Nos</option>
            <option value="Pkt">Pkt</option>
            <option value="1 bunch">1 bunch</option>
          </select>

          {/* Stock Status Filter */}
          <select
            aria-label="Filter by stock availability status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => onViewModeChange("table")}
              title="Table View"
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-3xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              title="Grid Cards View"
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-3xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
