"use client";

import React, { useState } from "react";
import { PieChart } from "lucide-react";

interface CategoryRevenue {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
}

const CATEGORY_DATA: CategoryRevenue[] = [
  { name: "Fresh Vegetables", icon: "🥦", amount: 53949, percentage: 42, color: "#00875a" },
  { name: "Fresh Fruits", icon: "🍎", amount: 35966, percentage: 28, color: "#10b981" },
  { name: "Groceries", icon: "🌾", amount: 19267, percentage: 15, color: "#3b82f6" },
  { name: "Snacks & Foods", icon: "🍪", amount: 12845, percentage: 10, color: "#f59e0b" },
  { name: "Others", icon: "🧼", amount: 6423, percentage: 5, color: "#8b5cf6" },
];

export const RevenueByCategoryDonut: React.FC = () => {
  const [hovered, setHovered] = useState<CategoryRevenue | null>(null);

  const total = CATEGORY_DATA.reduce((acc, c) => acc + c.amount, 0);

  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sector Contribution
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Revenue by Category
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <PieChart className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {CATEGORY_DATA.map((cat) => {
              const dashLength = (cat.percentage / 100) * circumference;
              const dashOffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += cat.percentage;
              const isSelected = hovered?.name === cat.name;

              return (
                <circle
                  key={cat.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHovered(cat)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hovered ? (
              <>
                <span className="text-xl mb-0.5">{hovered.icon}</span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[90px]">
                  {hovered.name}
                </span>
                <span className="text-sm font-black text-slate-900">
                  ₹ {hovered.amount.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] font-extrabold text-emerald-600">
                  {hovered.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-slate-500">Total</span>
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  ₹ {total.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] font-extrabold text-slate-400">
                  5 Categories
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="w-full sm:w-auto flex flex-col gap-1.5 flex-1">
          {CATEGORY_DATA.map((cat) => {
            const isSelected = hovered?.name === cat.name;
            return (
              <div
                key={cat.name}
                onMouseEnter={() => setHovered(cat)}
                onMouseLeave={() => setHovered(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                  isSelected ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-900">
                    ₹ {cat.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-slate-500 font-medium pt-3 border-t border-slate-100 flex items-center justify-between">
        <span>Fresh produce dominance</span>
        <span className="font-bold text-emerald-700">70% Total Sales</span>
      </div>
    </div>
  );
};
