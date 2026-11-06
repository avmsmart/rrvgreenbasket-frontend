"use client";

import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";

interface MonthData {
  month: string;
  actual: number; // in thousands
  target: number;
}

const MONTHS: MonthData[] = [
  { month: "Apr", actual: 82, target: 75 },
  { month: "May", actual: 94, target: 85 },
  { month: "Jun", actual: 108, target: 100 },
  { month: "Jul", actual: 118, target: 110 },
  { month: "Aug", actual: 128, target: 120 },
  { month: "Sep (Proj)", actual: 142, target: 130 },
];

export const MonthlyComparisonChart: React.FC = () => {
  const maxVal = 160;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Target vs Realized
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Monthly Performance (₹k)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#00875a]" />
            <span className="text-slate-600">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-200" />
            <span className="text-slate-400">Target</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6 pb-2 px-1 sm:px-4 border-b border-slate-100">
        {MONTHS.map((m) => {
          const actualHeight = (m.actual / maxVal) * 100;
          const targetHeight = (m.target / maxVal) * 100;

          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ₹{m.actual}k
              </div>
              <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                {/* Actual Bar */}
                <div
                  className="w-1/2 max-w-[20px] bg-[#00875a] rounded-t-lg transition-all duration-300 group-hover:bg-[#00704a]"
                  style={{ height: `${actualHeight}%` }}
                />
                {/* Target Bar */}
                <div
                  className="w-1/2 max-w-[20px] bg-slate-200 rounded-t-lg transition-all duration-300"
                  style={{ height: `${targetHeight}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-600 mt-2 truncate w-full text-center">
                {m.month}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-500 font-medium pt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-emerald-700 font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          Exceeded August target by +6.6%
        </span>
        <span className="text-slate-400 font-medium">H1 Fiscal Review</span>
      </div>
    </div>
  );
};
