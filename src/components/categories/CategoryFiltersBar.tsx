"use client";

import React from "react";
import { Search, Plus, RefreshCw, X, FolderTree, CheckCircle2, AlertCircle } from "lucide-react";
import { CategoryStatusFilter, CategoryStatistics } from "@/types/category";

interface CategoryFiltersBarProps {
  activeStatus: CategoryStatusFilter;
  onStatusChange: (status: CategoryStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  stats: CategoryStatistics;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const CategoryFiltersBar: React.FC<CategoryFiltersBarProps> = ({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  stats,
  isLoading,
  onRefresh,
  onOpenAddModal,
}) => {
  const tabs: { id: CategoryStatusFilter; label: string; count: number; icon: React.ElementType }[] = [
    { id: "All", label: "All Categories", count: stats.total, icon: FolderTree },
    { id: "Active", label: "Active", count: stats.active, icon: CheckCircle2 },
    { id: "Inactive", label: "Inactive", count: stats.inactive, icon: AlertCircle },
  ];

  return (
    <div className="space-y-4">
      {/* Top row: Status filter tabs & Action buttons */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-3 flex-wrap gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#00875a] text-white shadow-md shadow-emerald-200"
                    : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Actions: Refresh + Add Category */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh category list from backend"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-[#00875a] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Search input */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search categories by name, slug, or description..."
            className="w-full pl-10 pr-9 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00875a] focus:ring-1 focus:ring-[#00875a] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="text-xs text-slate-500 font-medium">
            Filtering by keyword: <span className="font-bold text-slate-800">&quot;{searchQuery}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
};
