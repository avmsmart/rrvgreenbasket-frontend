"use client";

import React from "react";
import { StoreSettings, DaySchedule } from "@/types/settings";
import { Clock, CheckCircle2, Copy } from "lucide-react";

interface BusinessHoursCardProps {
  settings: StoreSettings;
  onChange: (updated: Partial<StoreSettings>) => void;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: "Monday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { day: "Tuesday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { day: "Wednesday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { day: "Thursday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { day: "Friday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { day: "Saturday", openTime: "06:00 AM", closeTime: "10:00 PM", isOpen: true },
  { day: "Sunday", openTime: "07:00 AM", closeTime: "09:00 PM", isOpen: true },
];

export const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({
  settings,
  onChange,
}) => {
  const schedule = settings.businessHours && settings.businessHours.length > 0
    ? settings.businessHours
    : DEFAULT_SCHEDULE;

  const handleDayUpdate = (index: number, updates: Partial<DaySchedule>) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], ...updates };
    onChange({ businessHours: updated });
  };

  const handleApplyToAll = () => {
    const base = schedule[0];
    const updated = schedule.map((s) => ({
      ...s,
      openTime: base.openTime,
      closeTime: base.closeTime,
      isOpen: true,
    }));
    onChange({ businessHours: updated });
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Operating & Delivery Hours</h3>
          <p className="text-xs text-slate-500 font-medium">
            Define daily store opening and closing times for order dispatch and customer support.
          </p>
        </div>

        <button
          type="button"
          onClick={handleApplyToAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Apply Mon Hours to All</span>
        </button>
      </div>

      {/* Schedule Table/Cards */}
      <div className="space-y-2.5">
        {schedule.map((item, idx) => (
          <div
            key={item.day}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors ${
              item.isOpen
                ? "bg-slate-50/70 border-slate-200/80"
                : "bg-slate-100/50 border-slate-200 opacity-60"
            }`}
          >
            {/* Day and Open toggle */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-44">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {item.day}
              </span>
              <button
                type="button"
                onClick={() => handleDayUpdate(idx, { isOpen: !item.isOpen })}
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full transition-all ${
                  item.isOpen
                    ? "bg-emerald-100 text-[#00875a]"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {item.isOpen ? "Open" : "Closed"}
              </button>
            </div>

            {/* Time Pickers */}
            {item.isOpen ? (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="text"
                  value={item.openTime}
                  onChange={(e) => handleDayUpdate(idx, { openTime: e.target.value })}
                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00875a]"
                  placeholder="06:00 AM"
                />
                <span className="text-slate-400 font-bold">to</span>
                <input
                  type="text"
                  value={item.closeTime}
                  onChange={(e) => handleDayUpdate(idx, { closeTime: e.target.value })}
                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00875a]"
                  placeholder="10:00 PM"
                />
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400 italic">
                Store closed on {item.day}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Timezone */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-700">Platform Timezone</span>
          <p className="text-[11px] text-slate-400">
            Used for delivery slot scheduling and daily order cutoff calculations.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          {settings.timeZone || "(GMT+05:30) India Standard Time (IST)"}
        </div>
      </div>
    </div>
  );
};
