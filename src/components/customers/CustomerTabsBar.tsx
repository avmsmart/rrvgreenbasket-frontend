"use client";

import React from "react";
import { Download, Filter, RotateCcw } from "lucide-react";

export type CustomerTabType =
  | "All Customers"
  | "Active"
  | "Inactive"
  | "New"
  | "Repeat"
  | "Top Customers";

interface CustomerTabsBarProps {
  activeTab: CustomerTabType;
  onTabChange: (tab: CustomerTabType) => void;
  onOpenFilter: () => void;
  onReset: () => void;
  onExport: () => void;
  isFiltered?: boolean;
  activeFiltersCount?: number;
  tabCounts?: {
    all: number;
    active: number;
    inactive: number;
    new: number;
    repeat: number;
  };
}

export const CustomerTabsBar: React.FC<CustomerTabsBarProps> = ({
  activeTab,
  onTabChange,
  onOpenFilter,
  onReset,
  onExport,
  isFiltered = false,
  activeFiltersCount = 0,
  tabCounts = { all: 1248, active: 896, inactive: 120, new: 86, repeat: 312 },
}) => {
  const tabs: { label: string; value: CustomerTabType; count?: number }[] = [
    { label: "All Customers", value: "All Customers", count: tabCounts.all },
    { label: "Active", value: "Active", count: tabCounts.active },
    { label: "Inactive", value: "Inactive", count: tabCounts.inactive },
    { label: "New", value: "New", count: tabCounts.new },
    { label: "Repeat", value: "Repeat", count: tabCounts.repeat },
    { label: "Top Customers", value: "Top Customers" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* 1. Left: Pill Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#00875a] text-white shadow-3xs"
                  : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/90"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Right: Export, Filter & Reset */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-3xs transition-colors"
          title="Export customer records to CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        {/* Filter Button */}
        <button
          type="button"
          onClick={onOpenFilter}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer ${
            activeFiltersCount > 0 || isFiltered
              ? "bg-[#00734d] text-white ring-2 ring-emerald-300"
              : "bg-[#00875a] text-white hover:bg-[#00734d]"
          }`}
          title="Open filters"
        >
          <Filter className="w-3.5 h-3.5 text-white" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-[#00875a] text-[10px] font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
};
