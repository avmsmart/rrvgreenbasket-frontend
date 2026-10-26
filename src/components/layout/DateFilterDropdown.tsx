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

export const DateFilterDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("Today");
  const [selectedDate, setSelectedDate] = useState("Mon, 26 Oct 2026");
  const [selectedTime, setSelectedTime] = useState("09:30 AM");
  const [activeDay, setActiveDay] = useState(26);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const presets = [
    { label: "Today", date: "Mon, 26 Oct 2026", time: "09:30 AM", day: 26 },
    { label: "Yesterday", date: "Sun, 25 Oct 2026", time: "10:00 PM", day: 25 },
    { label: "Last 7 Days", date: "20 Oct – 26 Oct 2026", time: "Custom Range", day: 26 },
    { label: "This Month", date: "01 Oct – 31 Oct 2026", time: "Full Month", day: 26 },
  ];

  const handleSelectPreset = (p: (typeof presets)[0]) => {
    setSelectedPreset(p.label);
    setSelectedDate(p.date);
    setSelectedTime(p.time);
    setActiveDay(p.day);
  };

  const handleSelectDay = (day: number) => {
    setActiveDay(day);
    setSelectedPreset("Custom");
    // Format selected day in October 2026
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const d = new Date(2026, 9, day); // October is month index 9
    const dayStr = dayNames[d.getDay()];
    setSelectedDate(`${dayStr}, ${day} Oct 2026`);
    setSelectedTime("09:30 AM");
  };

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

          {/* Quick Preset Buttons */}
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

          {/* Mini Calendar (August 2025) */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 mb-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-800">October 2026</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
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

            {/* Days Grid (October 2026 starts on Thursday, 1 Oct) */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Empty offset for Thu (4 empty cells: Su, Mo, Tu, We) */}
              <span className="p-1"></span>
              <span className="p-1"></span>
              <span className="p-1"></span>
              <span className="p-1"></span>

              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const isSelected = activeDay === day;
                const isToday = day === 26;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-7 w-7 mx-auto rounded-lg font-medium transition-colors flex items-center justify-center text-[11px] ${
                      isSelected
                        ? "bg-[#00875a] text-white font-bold shadow-xs"
                        : isToday
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

          {/* Today's Order Cut-Off banner matching PDF Page 3 & 9 */}
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
                  12h 30m remaining today
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
