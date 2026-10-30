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
import { PackingStatus } from "@/types";
import { getSystemDateFormatted, getOffsetDateFormatted } from "@/utils";

export type PackingTabType = "All Orders" | "Pending" | "In Packing" | "Packed";

interface PackingTabsBarProps {
  activeTab: PackingTabType;
  onTabChange: (tab: PackingTabType) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenFilter: () => void;
  onReset: () => void;
  isFiltered?: boolean;
  activeFiltersCount?: number;
  tabCounts?: {
    all: number;
    pending: number;
    inPacking: number;
    packed: number;
  };
}

export const PackingTabsBar: React.FC<PackingTabsBarProps> = ({
  activeTab,
  onTabChange,
  selectedDate,
  onDateChange,
  onOpenFilter,
  onReset,
  isFiltered = false,
  activeFiltersCount = 0,
  tabCounts = {
    all: 28,
    pending: 12,
    inPacking: 10,
    packed: 6,
  },
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

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

  const tabs: { id: PackingTabType; label: string; count: number }[] = [
    { id: "All Orders", label: "All Orders", count: tabCounts.all },
    { id: "Pending", label: "Pending", count: tabCounts.pending },
    { id: "In Packing", label: "In Packing", count: tabCounts.inPacking },
    { id: "Packed", label: "Packed", count: tabCounts.packed },
  ];

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Left Pill Tabs - matching Page 13 */}
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

      {/* Right Controls: Date Selector + Filter + Reset */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
        {/* Date Selector with Calendar Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all hover:border-slate-300 shadow-3xs cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#00875a]" />
            <span className="font-bold text-slate-900">
              {selectedDate === todayFormatted
                ? `Today (${todayFormatted})`
                : selectedDate === tomorrowFormatted
                ? `Tomorrow (${tomorrowFormatted})`
                : selectedDate === yesterdayFormatted
                ? `Yesterday (${yesterdayFormatted})`
                : selectedDate}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isCalendarOpen ? "rotate-180 text-[#00875a]" : ""
              }`}
            />
          </button>

          {isCalendarOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCalendarOpen(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <span className="text-xs font-black text-slate-900">
                      {monthNames[calendarMonth]} {calendarYear}
                    </span>
                    <span className="block text-[10px] text-[#00875a] font-bold">
                      Select date to view packing orders
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

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

                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-1" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${day} ${monthNames[calendarMonth].substring(0, 3)} ${calendarYear}`;
                    const isSelected = selectedDate.includes(dateStr) || selectedDate === dateStr;
                    const now = new Date();
                    const isToday =
                      day === now.getDate() &&
                      calendarMonth === now.getMonth() &&
                      calendarYear === now.getFullYear();

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`relative p-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-[#00875a] text-white font-black shadow-xs scale-105"
                            : "text-slate-800 font-bold hover:bg-[#eefcf2] hover:text-[#00875a]"
                        } ${
                          isToday && !isSelected
                            ? "ring-1.5 ring-[#00875a] ring-offset-1 font-black"
                            : ""
                        }`}
                      >
                        <span>{day}</span>
                        <span
                          className={`w-1 h-1 rounded-full mt-0.5 ${
                            isSelected ? "bg-white" : "bg-[#00875a]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Quick Presets */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Quick Select
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {datePresets.map((preset) => (
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

        {/* Filter Button */}
        <button
          type="button"
          onClick={onOpenFilter}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            activeFiltersCount > 0
              ? "bg-[#00875a] text-white border-[#00875a] shadow-xs"
              : "bg-[#00875a] hover:bg-[#00704a] text-white border-transparent shadow-xs"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-[#00875a] text-[10px] flex items-center justify-center font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Reset Link Button */}
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-2 transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
