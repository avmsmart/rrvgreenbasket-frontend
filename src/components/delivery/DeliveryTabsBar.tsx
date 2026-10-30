"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Check,
} from "lucide-react";
import { DeliveryStatus } from "@/types";
import { getSystemDateFormatted, getOffsetDateFormatted } from "@/utils";

export type DeliveryTabType =
  | "All Deliveries"
  | "Pending"
  | "Out for Delivery"
  | "Delivered"
  | "Failed";

interface DeliveryTabsBarProps {
  activeTab: DeliveryTabType;
  onTabChange: (tab: DeliveryTabType) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenFilter: () => void;
  onReset: () => void;
  isFiltered?: boolean;
  activeFiltersCount?: number;
  tabCounts?: {
    all: number;
    pending: number;
    outForDelivery: number;
    delivered: number;
    failed: number;
  };
}

export const DeliveryTabsBar: React.FC<DeliveryTabsBarProps> = ({
  activeTab,
  onTabChange,
  selectedDate,
  onDateChange,
  onOpenFilter,
  onReset,
  isFiltered = false,
  activeFiltersCount = 0,
  tabCounts = { all: 32, pending: 6, outForDelivery: 14, delivered: 10, failed: 2 },
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const todayFormatted = getSystemDateFormatted();
  const tomorrowFormatted = getOffsetDateFormatted(1);
  const yesterdayFormatted = getOffsetDateFormatted(-1);

  const datePresets = [
    { label: `Today (${todayFormatted})`, value: todayFormatted },
    { label: `Tomorrow (${tomorrowFormatted})`, value: tomorrowFormatted },
    { label: `Yesterday (${yesterdayFormatted})`, value: yesterdayFormatted },
    { label: getOffsetDateFormatted(-2), value: getOffsetDateFormatted(-2) },
    { label: getOffsetDateFormatted(-3), value: getOffsetDateFormatted(-3) },
  ];

  const tabs: { label: string; value: DeliveryTabType; count: number }[] = [
    { label: "All Deliveries", value: "All Deliveries", count: tabCounts.all },
    { label: "Pending", value: "Pending", count: tabCounts.pending },
    { label: "Out for Delivery", value: "Out for Delivery", count: tabCounts.outForDelivery },
    { label: "Delivered", value: "Delivered", count: tabCounts.delivered },
    { label: "Failed", value: "Failed", count: tabCounts.failed },
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${day} ${monthNames[viewMonth].slice(0, 3)} ${viewYear}`;
    onDateChange(formatted);
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

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

      {/* 2. Right: Date Selector & Filter Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto relative">
        {/* Date Selector Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-3xs transition-colors"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {selectedDate === todayFormatted
                ? `Today (${todayFormatted})`
                : selectedDate === tomorrowFormatted
                ? `Tomorrow (${tomorrowFormatted})`
                : selectedDate === yesterdayFormatted
                ? `Yesterday (${yesterdayFormatted})`
                : selectedDate}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isCalendarOpen && (
            <div className="absolute right-0 top-full mt-2 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-72 animate-in fade-in zoom-in-95 duration-150">
              {/* Presets */}
              <div className="border-b border-slate-100 pb-2 mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Presets
                </span>
                <div className="space-y-1">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        onDateChange(preset.value);
                        setIsCalendarOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedDate === preset.value
                          ? "bg-emerald-50 text-emerald-800 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span>{preset.label}</span>
                      {selectedDate === preset.value && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Navigator */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {monthNames[viewMonth]} {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: getFirstDayOfMonth(viewYear, viewMonth) }).map(
                  (_, i) => (
                    <span key={`empty-${i}`} className="p-1.5 text-transparent">
                      •
                    </span>
                  )
                )}
                {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }).map(
                  (_, i) => {
                    const day = i + 1;
                    const dateMatch = `${day} ${monthNames[viewMonth].slice(0, 3)} ${viewYear}` === selectedDate;
                    return (
                      <button
                        key={day}
                        onClick={() => handleSelectDay(day)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          dateMatch
                            ? "bg-[#00875a] text-white"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

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
