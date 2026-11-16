"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
  LayoutGrid,
  Plus,
  ArrowUpDown,
  ChevronDown,
  Check,
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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const activeCategoryLabel = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") return "All Categories";
    const matched = categories.find(
      (c) =>
        c.publicId === selectedCategory ||
        c.name.toLowerCase() === selectedCategory.toLowerCase() ||
        c.slug === selectedCategory
    );
    return matched?.name || selectedCategory;
  }, [selectedCategory, categories]);

  const sortOptions = [
    { value: "category-asc", label: "Category (A-Z)" },
    { value: "category-desc", label: "Category (Z-A)" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "price-asc", label: "Price (Low → High)" },
    { value: "price-desc", label: "Price (High → Low)" },
  ];

  const currentSortLabel =
    sortOptions.find((s) => s.value === sortBy)?.label || "Sort: Name (A-Z)";

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* 1. Dynamic Backend Category Badges (మొబైల్ వ్యూలో పూర్తిగా REMOVE చేయబడింది - hidden sm:flex) */}
      <div className="hidden sm:flex flex-wrap items-center gap-1.5 sm:gap-2 py-1">
        <button
          type="button"
          onClick={() => onCategoryChange("All")}
          className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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
              type="button"
              key={cat.publicId}
              onClick={() => onCategoryChange(cat.publicId)}
              className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
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

      {/* 2. Action Buttons Row (CSV, PDF, Add Product) */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200/90 pb-3">
        <div className="text-xs font-bold text-slate-500 hidden sm:block">
          Active: <span className="text-[#00875a] font-extrabold">{activeCategoryLabel}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onExportCsv}
            title="Export CSV"
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            title="Export PDF"
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 3. Search and Category Sorting Row */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-3xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
        {/* Search Bar + Mobile View Toggle */}
        <div className="flex items-center gap-2 flex-1 w-full min-w-0">
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

          {/* Mobile View Toggle */}
          <div className="flex sm:hidden items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/70 shrink-0">
            <button
              type="button"
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
              type="button"
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

        {/* Dropdowns Row: 50% Category & 50% Sort */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto relative">
          
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-auto">
            {isCategoryDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCategoryDropdownOpen(false)}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                setIsSortDropdownOpen(false);
              }}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span className="truncate">{activeCategoryLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180 text-[#00875a]" : ""
                }`}
              />
            </button>

            {/* Custom Modern Dropdown Card */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full min-w-[170px] sm:min-w-[190px] max-h-60 overflow-y-auto z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange("All");
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === "All"
                      ? "bg-[#eaf8f0] text-[#00875a]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === "All" && (
                    <Check className="w-3.5 h-3.5 text-[#00875a] shrink-0" />
                  )}
                </button>
                {categories.map((cat) => {
                  const isSelected =
                    selectedCategory === cat.publicId ||
                    selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                    (cat.slug && selectedCategory === cat.slug);

                  return (
                    <button
                      type="button"
                      key={cat.publicId}
                      onClick={() => {
                        onCategoryChange(cat.publicId);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#eaf8f0] text-[#00875a]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#00875a] shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto">
            {isSortDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsSortDropdownOpen(false)}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsCategoryDropdownOpen(false);
              }}
              className="w-full sm:w-auto pl-3 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentSortLabel}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  isSortDropdownOpen ? "rotate-180 text-[#00875a]" : ""
                }`}
              />
            </button>

            {/* Custom Modern Sort Menu */}
            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-full min-w-[170px] sm:min-w-[190px] z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 animate-in fade-in duration-100">
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        onSortByChange(opt.value);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#eaf8f0] text-[#00875a]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#00875a] shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop View Toggle */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/70 shrink-0">
            <button
              type="button"
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
              type="button"
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

export default ProductsFiltersBar;