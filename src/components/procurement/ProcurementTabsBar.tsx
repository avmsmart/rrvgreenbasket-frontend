"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

export type ProcurementTabType =
  | "Procurement Plan"
  | "Supplier Orders"
  | "Received Stock"
  | "Pending Items"
  | "History";

interface ProcurementTabsBarProps {
  activeTab: ProcurementTabType;
  onTabChange: (tab: ProcurementTabType) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onGenerateFromOrders: () => void;
  tabCounts?: {
    total: number;
    supplierOrders: number;
    received: number;
    pending: number;
    history: number;
  };
}

const DATE_PRESETS = [
  { label: "Today (26 Oct 2026)", value: "26 Oct 2026" },
  { label: "Tomorrow (27 Oct 2026)", value: "27 Oct 2026" },
  { label: "Yesterday (25 Oct 2026)", value: "25 Oct 2026" },
  { label: "24 Oct 2026", value: "24 Oct 2026" },
  { label: "23 Oct 2026", value: "23 Oct 2026" },
];

const AVAILABLE_PROCUREMENT_DATES = [
  "23 Oct 2026",
  "24 Oct 2026",
  "25 Oct 2026",
  "26 Oct 2026",
  "27 Oct 2026",
];

export const ProcurementTabsBar: React.FC<ProcurementTabsBarProps> = ({
  activeTab,
  onTabChange,
  selectedDate,
  onDateChange,
  onGenerateFromOrders,
  tabCounts = {
    total: 35,
    supplierOrders: 3,
    received: 21,
    pending: 5,
    history: 120,
  },
}) => {
  // Calendar popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(9); // 9 = October (0-indexed)
  const [calendarYear, setCalendarYear] = useState(2026);

  const tabs: { id: ProcurementTabType; label: string; count: number }[] = [
    { id: "Procurement Plan", label: "Procurement Plan", count: tabCounts.total },
    { id: "Supplier Orders", label: "Supplier Orders", count: tabCounts.supplierOrders },
    { id: "Received Stock", label: "Received Stock", count: tabCounts.received },
    { id: "Pending Items", label: "Pending Items", count: tabCounts.pending },
    { id: "History", label: "History", count: tabCounts.history },
  ];

  // Calendar helpers matching OrderFiltersBar
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedDate = `${day} ${monthNames[calendarMonth].substring(0, 3)} ${calendarYear}`;
    onDateChange(formattedDate);
    setIsCalendarOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      {/* Left Pill Tabs - Exact same style as OrderStatusTabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-[#00875a] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Interactive Date Picker + Generate from Orders */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
        {/* Dynamic Interactive Calendar Date Picker - Exact same as OrderFiltersBar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all hover:border-slate-300 shadow-3xs cursor-pointer"
            title="Click to open calendar and select procurement date"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#00875a]" />
            <span className="font-bold text-slate-900">
              {selectedDate === "26 Oct 2026"
                ? "Today (26 Oct 2026)"
                : selectedDate === "27 Oct 2026"
                ? "Tomorrow (27 Oct 2026)"
                : selectedDate === "25 Oct 2026"
                ? "Yesterday (25 Oct 2026)"
                : selectedDate}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isCalendarOpen ? "rotate-180 text-[#00875a]" : ""
              }`}
            />
          </button>

          {/* Interactive Calendar Popover */}
          {isCalendarOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCalendarOpen(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
                {/* Calendar Header with Navigation */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <span className="text-xs font-black text-slate-900">
                      {monthNames[calendarMonth]} {calendarYear}
                    </span>
                    <span className="block text-[10px] text-[#00875a] font-bold">
                      Select date to view procurement
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <span
                      key={day}
                      className="text-[10px] font-bold text-slate-400 py-1"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Day Cells Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Blank offset cells */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-1" />
                  ))}

                  {/* Day numbers */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${day} ${monthNames[calendarMonth].substring(0, 3)} ${calendarYear}`;
                    const isSelected = selectedDate.includes(dateStr) || selectedDate === dateStr;
                    const isPastOrActive =
                      calendarYear < 2026 ||
                      (calendarYear === 2026 && calendarMonth < 9) ||
                      (calendarYear === 2026 && calendarMonth === 9 && day <= 27);
                    const hasData = isPastOrActive || AVAILABLE_PROCUREMENT_DATES.includes(dateStr);
                    const isToday =
                      day === 26 &&
                      calendarMonth === 9 &&
                      calendarYear === 2026;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`relative p-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-[#00875a] text-white font-black shadow-xs scale-105"
                            : hasData
                            ? "text-slate-900 font-bold hover:bg-[#eefcf2] hover:text-[#00875a]"
                            : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                        } ${
                          isToday && !isSelected
                            ? "ring-1.5 ring-[#00875a] ring-offset-1 font-black"
                            : ""
                        }`}
                      >
                        <span>{day}</span>
                        {/* Dot indicator for dates with procurement data */}
                        {hasData && (
                          <span
                            className={`w-1 h-1 rounded-full mt-0.5 ${
                              isSelected ? "bg-white" : "bg-[#00875a]"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Preset Chips */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Quick Select Presets
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DATE_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          onDateChange(preset.value);
                          setIsCalendarOpen(false);
                        }}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          selectedDate === preset.value
                            ? "bg-[#eefcf2] text-[#00875a] font-bold border border-emerald-200"
                            : "text-slate-600 hover:bg-slate-50 border border-slate-100"
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        {selectedDate === preset.value && (
                          <Check className="w-3 h-3 text-[#00875a] flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Generate from Orders Button */}
        <button
          type="button"
          onClick={onGenerateFromOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#00875a] bg-[#eefcf2] hover:bg-[#dcfce7] border border-[#bbf7d0] rounded-xl transition-all shadow-3xs cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00875a]" />
          <span>Generate from Orders</span>
        </button>
      </div>
    </div>
  );
};
