"use client";

import React from "react";
import { Download, RotateCcw, Filter, UserCheck, UserX, ShieldAlert, Users, Sparkles, Repeat, Award } from "lucide-react";

export type CustomerTabType =
  | "All Customers"
  | "Active"
  | "Inactive"
  | "Suspended"
  | "New Customers"
  | "Repeat Customers"
  | "Top Customers";

interface CustomerTabsBarProps {
  activeTab: CustomerTabType;
  onTabChange: (tab: CustomerTabType) => void;
  onExport: () => void;
  isExporting?: boolean;
  onReset: () => void;
  hasActiveFilters?: boolean;
  tabCounts?: {
    all?: number;
    active?: number;
    inactive?: number;
    suspended?: number;
    new?: number;
    repeat?: number;
  };
}

export const CustomerTabsBar: React.FC<CustomerTabsBarProps> = ({
  activeTab,
  onTabChange,
  onExport,
  isExporting = false,
  onReset,
  hasActiveFilters = false,
  tabCounts,
}) => {
  const tabs: {
    label: CustomerTabType;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeStyle?: string;
  }[] = [
    { label: "All Customers", icon: Users, count: tabCounts?.all },
    {
      label: "Active",
      icon: UserCheck,
      count: tabCounts?.active,
      badgeStyle: "bg-emerald-100 text-emerald-800",
    },
    {
      label: "Inactive",
      icon: UserX,
      count: tabCounts?.inactive,
      badgeStyle: "bg-amber-100 text-amber-800",
    },
    {
      label: "Suspended",
      icon: ShieldAlert,
      count: tabCounts?.suspended,
      badgeStyle: "bg-rose-100 text-rose-800",
    },
    {
      label: "New Customers",
      icon: Sparkles,
      count: tabCounts?.new,
      badgeStyle: "bg-blue-100 text-blue-800",
    },
    {
      label: "Repeat Customers",
      icon: Repeat,
      count: tabCounts?.repeat,
      badgeStyle: "bg-indigo-100 text-indigo-800",
    },
    {
      label: "Top Customers",
      icon: Award,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      {/* 1. Left: Status & Segmentation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => onTabChange(tab.label)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#00875a] text-white shadow-3xs"
                  : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/90"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : tab.badgeStyle || "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Right: Action Buttons (Reset, Export) */}
      <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-3xs transition-colors cursor-pointer"
            title="Reset filters to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}

        {/* CSV Export Button */}
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100/80 text-[#00875a] text-xs font-bold shadow-3xs transition-colors disabled:opacity-60 cursor-pointer"
          title="Export customer records to CSV with current filters"
        >
          <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
          <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
        </button>
      </div>
    </div>
  );
};
