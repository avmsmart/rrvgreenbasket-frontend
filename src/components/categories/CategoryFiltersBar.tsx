"use client";

import React, { useRef } from "react";
import {
  Search,
  X,
  FolderTree,
  CheckCircle2,
  AlertCircle,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
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
  /* view-mode is optional so older pages that don't pass it don't crash */
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
}

export const CategoryFiltersBar: React.FC<CategoryFiltersBarProps> = ({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  stats,
  isLoading,
  onRefresh,
  viewMode = "list",
  onViewModeChange,
}) => {
  const tabs: { id: CategoryStatusFilter; label: string; count: number; icon: React.ElementType }[] = [
    { id: "All",      label: "All",      count: stats.total,    icon: FolderTree    },
    { id: "Active",   label: "Active",   count: stats.active,   icon: CheckCircle2  },
    { id: "Inactive", label: "Inactive", count: stats.inactive, icon: AlertCircle   },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-2.5">
      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3,#9AA5AD)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search categories…"
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-[var(--border,#E6EBE8)] bg-white text-sm font-medium text-[var(--text,#111827)] placeholder:text-[var(--text-3,#9AA5AD)] focus:outline-none focus:border-[var(--primary,#0B8A4F)] focus:ring-2 focus:ring-[var(--primary,#0B8A4F)]/20 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3,#9AA5AD)] hover:text-[var(--text,#111827)] p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Single horizontally scrollable row: filter chips + view toggle + refresh ── */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5"
      >
        {/* Status filter chips */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[var(--primary,#0B8A4F)] text-white shadow-sm"
                  : "bg-white text-[var(--text-2,#5B6770)] border border-[var(--border,#E6EBE8)] hover:border-[var(--primary,#0B8A4F)] hover:text-[var(--primary,#0B8A4F)]"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-px rounded-full font-bold leading-none ${
                  isSelected
                    ? "bg-white/25 text-white"
                    : "bg-[var(--bg,#F6F8F7)] text-[var(--text-2,#5B6770)]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border,#E6EBE8)] flex-shrink-0 mx-0.5" />

        {/* List view toggle — only shown when onViewModeChange is provided */}
        {onViewModeChange && (
          <>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              title="List view"
              className={`p-1.5 rounded-xl flex-shrink-0 transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[var(--primary,#0B8A4F)] text-white"
                  : "text-[var(--text-3,#9AA5AD)] hover:text-[var(--text,#111827)] border border-[var(--border,#E6EBE8)] bg-white"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              title="Grid view"
              className={`p-1.5 rounded-xl flex-shrink-0 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[var(--primary,#0B8A4F)] text-white"
                  : "text-[var(--text-3,#9AA5AD)] hover:text-[var(--text,#111827)] border border-[var(--border,#E6EBE8)] bg-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-[var(--border,#E6EBE8)] flex-shrink-0 mx-0.5" />
          </>
        )}

        {/* Search result label */}
        {searchQuery && (
          <span className="text-xs text-[var(--text-2,#5B6770)] font-medium whitespace-nowrap flex-shrink-0 ml-1">
            Results for <span className="font-bold text-[var(--text,#111827)]">&quot;{searchQuery}&quot;</span>
          </span>
        )}
      </div>
    </div>
  );
};
