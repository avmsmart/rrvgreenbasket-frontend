"use client";

import React, { useState } from "react";
import { Search, Filter, RotateCcw, X, Check } from "lucide-react";

interface ProcurementFiltersBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSupplierChange: (supplier: string) => void;
  onStatusChange: (status: string) => void;
  onReset: () => void;
  selectedCategory: string;
  selectedSupplier: string;
  selectedStatus: string;
}

export const ProcurementFiltersBar: React.FC<ProcurementFiltersBarProps> = ({
  onSearch,
  onCategoryChange,
  onSupplierChange,
  onStatusChange,
  onReset,
  selectedCategory,
  selectedSupplier,
  selectedStatus,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Temporary states for the Filter Modal
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempSupplier, setTempSupplier] = useState(selectedSupplier);
  const [tempStatus, setTempStatus] = useState(selectedStatus);

  const categories = ["All Categories", "Fruits", "Vegetables", "Leafy", "Others"];

  const suppliers = [
    "All Suppliers",
    "Raju Traders",
    "Fresh Farms",
    "Sri Sai Supplies",
    "Green Valley",
    "Local Market",
  ];

  const statuses = ["All Status", "Completed", "Partial", "Not Started"];

  const isFiltered =
    searchInput.trim().length > 0 ||
    selectedCategory !== "All Categories" ||
    selectedSupplier !== "All Suppliers" ||
    selectedStatus !== "All Status";

  const activeFiltersCount =
    (searchInput.trim().length > 0 ? 1 : 0) +
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (selectedSupplier !== "All Suppliers" ? 1 : 0) +
    (selectedStatus !== "All Status" ? 1 : 0);

  const handleOpenFilterModal = () => {
    setTempCategory(selectedCategory);
    setTempSupplier(selectedSupplier);
    setTempStatus(selectedStatus);
    setIsFilterModalOpen(true);
  };

  const handleApplyModalFilters = () => {
    onCategoryChange(tempCategory);
    onSupplierChange(tempSupplier);
    onStatusChange(tempStatus);
    setIsFilterModalOpen(false);
  };

  const handleResetModalFilters = () => {
    setTempCategory("All Categories");
    setTempSupplier("All Suppliers");
    setTempStatus("All Status");
    onReset();
    setIsFilterModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchInput);
    }
  };

  return (
    <>
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-3xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input - Matching OrderFiltersBar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                onSearch(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search products, suppliers, categories..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  onSearch("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Supplier Dropdown */}
            <select
              value={selectedSupplier}
              onChange={(e) => onSupplierChange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white cursor-pointer"
            >
              {suppliers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Interactive Filter Button (Opens Filter Modal Dialog) */}
            <button
              type="button"
              onClick={handleOpenFilterModal}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeFiltersCount > 0
                  ? "bg-[#00734d] text-white ring-2 ring-emerald-300"
                  : "bg-[#00875a] text-white hover:bg-[#00734d]"
              }`}
              title="Click to open advanced filter options"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#00875a] text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Reset Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  onReset();
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">
              Active Filters:
            </span>

            {searchInput && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00875a] font-semibold text-[11px] border border-emerald-200">
                Keyword: &quot;{searchInput}&quot;
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    onSearch("");
                  }}
                  className="hover:text-emerald-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== "All Categories" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00875a] font-semibold text-[11px] border border-emerald-200">
                Category: {selectedCategory}
                <button
                  type="button"
                  onClick={() => onCategoryChange("All Categories")}
                  className="hover:text-emerald-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSupplier !== "All Suppliers" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00875a] font-semibold text-[11px] border border-emerald-200">
                Supplier: {selectedSupplier}
                <button
                  type="button"
                  onClick={() => onSupplierChange("All Suppliers")}
                  className="hover:text-emerald-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStatus !== "All Status" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00875a] font-semibold text-[11px] border border-emerald-200">
                Status: {selectedStatus}
                <button
                  type="button"
                  onClick={() => onStatusChange("All Status")}
                  className="hover:text-emerald-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filter Dialog / Modal (Exact same style as OrderFiltersBar) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsFilterModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#eefcf2] text-[#00875a] flex items-center justify-center">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Filter Procurement Items
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Refine procurement by category, supplier &amp; status
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* 1. Status Filter */}
              <div>
                <label className="font-bold text-slate-800 mb-2 block">
                  Procurement Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTempStatus(st)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        tempStatus === st
                          ? "bg-[#00875a] text-white font-bold shadow-3xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Category Filter */}
              <div>
                <label className="font-bold text-slate-800 mb-2 block">
                  Product Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTempCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        tempCategory === cat
                          ? "bg-[#00875a] text-white font-bold shadow-3xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Supplier Filter */}
              <div>
                <label className="font-bold text-slate-800 mb-2 block">
                  Supplier / Vendor
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {suppliers.map((sup) => (
                    <button
                      key={sup}
                      type="button"
                      onClick={() => setTempSupplier(sup)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        tempSupplier === sup
                          ? "bg-[#00875a] text-white font-bold shadow-3xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {sup}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
              <button
                type="button"
                onClick={handleResetModalFilters}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyModalFilters}
                  className="px-5 py-2 bg-[#00875a] hover:bg-[#00704a] text-white rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
