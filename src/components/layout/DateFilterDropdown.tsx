"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  getSystemDateWithDay,
  getSystemTimeFormatted,
  getSystemDateFormatted,
  getOffsetDateFormatted,
  MONTH_NAMES,
  FULL_MONTH_NAMES,
} from "@/utils";

export const DateFilterDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("Today");

  // System dynamic dates
  const [selectedDate, setSelectedDate] = useState(() => getSystemDateWithDay());
  const [selectedTime, setSelectedTime] = useState(() => getSystemTimeFormatted());
  const [activeDay, setActiveDay] = useState(() => new Date().getDate());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with real-time system clock on mount
  useEffect(() => {
    const now = new Date();
    setSelectedDate(getSystemDateWithDay(now));
    setSelectedTime(getSystemTimeFormatted(now));
    setActiveDay(now.getDate());
    setCalendarMonth(now.getMonth());
    setCalendarYear(now.getFullYear());
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const now = new Date();
  const presets = [
    {
      label: "Today",
      date: getSystemDateWithDay(now),
      time: getSystemTimeFormatted(now),
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
    },
    {
      label: "Yesterday",
      date: getSystemDateWithDay(new Date(now.getTime() - 86400000)),
      time: "10:00 PM",
      day: new Date(now.getTime() - 86400000).getDate(),
      month: new Date(now.getTime() - 86400000).getMonth(),
      year: new Date(now.getTime() - 86400000).getFullYear(),
    },
    {
      label: "Last 7 Days",
      date: `${getOffsetDateFormatted(-6)} – ${getSystemDateFormatted(now)}`,
      time: "Custom Range",
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
    },
    {
      label: "This Month",
      date: `01 ${MONTH_NAMES[now.getMonth()]} – ${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`,
      time: "Full Month",
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
    },
  ];

  const handleSelectPreset = (p: (typeof presets)[0]) => {
    setSelectedPreset(p.label);
    setSelectedDate(p.date);
    setSelectedTime(p.time);
    setActiveDay(p.day);
    setCalendarMonth(p.month);
    setCalendarYear(p.year);
  };

  const handleSelectDay = (day: number) => {
    setActiveDay(day);
    setSelectedPreset("Custom");
    const d = new Date(calendarYear, calendarMonth, day);
    setSelectedDate(getSystemDateWithDay(d));
    setSelectedTime(getSystemTimeFormatted());
  };

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

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Date Card Trigger matching PDF design */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all shadow-3xs group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        title="Click to change date or view store operations cut-off"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-lg bg-[#eaf8f0] border border-[#d1f2e0] flex items-center justify-center text-[#00875a] flex-shrink-0 group-hover:bg-[#dff5e8] transition-colors">
          <CalendarIcon className="w-3.5 h-3.5" />
        </div>

        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-bold text-[#0f2942] tracking-tight group-hover:text-[#00875a] transition-colors">
            {selectedDate}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {selectedTime}
          </span>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ml-0.5 ${
            isOpen ? "rotate-180 text-[#00875a]" : ""
          }`}
        />
      </button>

      {/* Interactive Date & Store Operations Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#00875a]" />
              <span className="text-xs font-bold text-[#0f2942]">
                Operating Date &amp; Timeline
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eaf8f0] text-[#00875a]">
              Live Store Operations
            </span>
          </div>

          {/* Presets List */}
          <div className="grid grid-cols-2 gap-1.5 my-3">
            {presets.map((p) => {
              const isActive = selectedPreset === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between ${
                    isActive
                      ? "bg-[#00875a] text-white shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span>{p.label}</span>
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Dynamic Calendar */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 mb-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-800">
                {FULL_MONTH_NAMES[calendarMonth]} {calendarYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500"
                  title="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
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

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <span key={`empty-${i}`} className="p-1"></span>
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isSelected =
                  activeDay === day &&
                  calendarMonth === now.getMonth() &&
                  calendarYear === now.getFullYear();
                const isSystemToday =
                  day === now.getDate() &&
                  calendarMonth === now.getMonth() &&
                  calendarYear === now.getFullYear();

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-7 w-7 mx-auto rounded-lg font-medium transition-colors flex items-center justify-center text-[11px] ${
                      isSelected
                        ? "bg-[#00875a] text-white font-bold shadow-xs"
                        : isSystemToday
                        ? "bg-[#eaf8f0] text-[#00875a] font-bold border border-[#bbf7d0]"
                        : "hover:bg-slate-200/70 text-slate-700"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Order Cut-Off banner */}
          <div className="p-3 rounded-2xl bg-[#eaf8f0] border border-[#bbf7d0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#bbf7d0] flex items-center justify-center text-[#00875a] flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#0f2942]">
                    Order Cut-off: 10:00 PM
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00875a] animate-pulse"></span>
                </div>
                <span className="text-[10px] text-[#00875a] font-semibold">
                  Store Operations Open Today
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#00875a] bg-white border border-[#bbf7d0] px-2 py-0.5 rounded-full">
              Open
            </span>
          </div>

          {/* Footer with Apply button */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                handleSelectPreset(presets[0]);
              }}
              className="text-xs text-slate-500 hover:text-[#00875a] font-semibold"
            >
              Reset to Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
