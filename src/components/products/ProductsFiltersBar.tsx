"use client";

import React from "react";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
  LayoutGrid,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { BackendCategory } from "@/types";

interface ProductsFiltersBarProps {
  categories: BackendCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  totalProductsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onOpenAddModal: () => void;
}

export const ProductsFiltersBar: React.FC<ProductsFiltersBarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  totalProductsCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onExportCsv,
  onExportPdf,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Actions & Backend Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-3 flex-wrap gap-3">
        {/* Dynamic Backend Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 max-w-full">
          <button
            onClick={() => onCategoryChange("All")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              selectedCategory === "All"
                ? "bg-[#00875a] text-white shadow-md shadow-emerald-200"
                : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80"
            }`}
          >
            <span>All Products</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedCategory === "All"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected =
              selectedCategory === cat.publicId ||
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              (cat.slug && selectedCategory === cat.slug);

            return (
              <button
                key={cat.publicId}
                onClick={() => onCategoryChange(cat.publicId)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#00875a] text-white shadow-md shadow-emerald-200"
                    : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Export and Add Product */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={onExportCsv}
            title="Export CSV"
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={onExportPdf}
            title="Export PDF"
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* Search and Category Sorting Row */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3">
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

        {/* Category Filter & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown Selector */}
          <select
            aria-label="Filter by Category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.publicId} value={cat.publicId}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort based upon Category and attributes */}
          <div className="relative flex items-center">
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="category-asc">Sort: Category (A-Z)</option>
              <option value="category-desc">Sort: Category (Z-A)</option>
              <option value="name-asc">Sort: Product Name (A-Z)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          </div>

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
