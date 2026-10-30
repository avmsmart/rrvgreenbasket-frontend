"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Filter, RotateCcw, ChevronDown, Check } from "lucide-react";
import { PaymentStatus } from "@/types";
import {
  getSystemDateFormatted,
  getOffsetDateFormatted,
  getCurrentMonthRangeFormatted,
} from "@/utils";

export type PaymentTabType = "All Transactions" | PaymentStatus;

interface PaymentTabsBarProps {
  activeTab: PaymentTabType;
  onTabChange: (tab: PaymentTabType) => void;
  tabCounts: {
    all: number;
    paid: number;
    pending: number;
    failed: number;
    refunded: number;
  };
  dateRange: string;
  onDateChange?: (date: string) => void;
  onDateRangeClick?: () => void;
  onReset: () => void;
  isFiltered?: boolean;
}

const getDynamicDateOptions = () => {
  const today = getSystemDateFormatted();
  const yesterday = getOffsetDateFormatted(-1);
  return [
    { label: `Today, ${today}`, value: `Today, ${today}` },
    { label: `Yesterday, ${yesterday}`, value: `Yesterday, ${yesterday}` },
    { label: getOffsetDateFormatted(-2), value: getOffsetDateFormatted(-2) },
    { label: getOffsetDateFormatted(-3), value: getOffsetDateFormatted(-3) },
    { label: getCurrentMonthRangeFormatted(), value: getCurrentMonthRangeFormatted() },
    { label: "All Dates", value: "All Dates" },
  ];
};

export const PaymentTabsBar: React.FC<PaymentTabsBarProps> = ({
  activeTab,
  onTabChange,
  tabCounts,
  dateRange,
  onDateChange,
  onDateRangeClick,
  onReset,
  isFiltered = false,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs: { label: string; value: PaymentTabType; count: number }[] = [
    { label: "All Transactions", value: "All Transactions", count: tabCounts.all },
    { label: "Paid", value: "Paid", count: tabCounts.paid },
    { label: "Pending", value: "Pending", count: tabCounts.pending },
    { label: "Failed", value: "Failed", count: tabCounts.failed },
    { label: "Refunded", value: "Refunded", count: tabCounts.refunded },
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
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Right: Date Range Selector & Reset */}
      <div className="flex items-center gap-2 self-end sm:self-auto relative" ref={dateDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsDateOpen(!isDateOpen);
            onDateRangeClick?.();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-3xs transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateRange}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDateOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Date Dropdown Popover */}
        {isDateOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Transaction Date
            </div>
            <div className="space-y-1">
              {getDynamicDateOptions().map((opt) => {
                const isSelected = dateRange === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onDateChange?.(opt.value);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
