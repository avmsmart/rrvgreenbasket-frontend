"use client";

import React, { useState } from "react";
import { TrendingUp, ArrowUpRight, Calendar } from "lucide-react";

interface SalesPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

const DAILY_SALES: SalesPoint[] = [
  { date: "19 Aug", label: "19 Aug 2025", revenue: 14200, orders: 22 },
  { date: "20 Aug", label: "20 Aug 2025", revenue: 18400, orders: 28 },
  { date: "21 Aug", label: "21 Aug 2025", revenue: 16900, orders: 26 },
  { date: "22 Aug", label: "22 Aug 2025", revenue: 22100, orders: 34 },
  { date: "23 Aug", label: "23 Aug 2025", revenue: 28450, orders: 42 },
  { date: "24 Aug", label: "24 Aug 2025", revenue: 24800, orders: 38 },
  { date: "25 Aug", label: "25 Aug 2025", revenue: 27300, orders: 41 },
];

const WEEKLY_SALES: SalesPoint[] = [
  { date: "W1", label: "Week 1 (01-07 Aug)", revenue: 98400, orders: 154 },
  { date: "W2", label: "Week 2 (08-14 Aug)", revenue: 112500, orders: 182 },
  { date: "W3", label: "Week 3 (15-21 Aug)", revenue: 124800, orders: 198 },
  { date: "W4", label: "Week 4 (22-28 Aug)", revenue: 142150, orders: 224 },
];

const MONTHLY_SALES: SalesPoint[] = [
  { date: "Mar", label: "March 2025", revenue: 280000, orders: 490 },
  { date: "Apr", label: "April 2025", revenue: 320000, orders: 560 },
  { date: "May", label: "May 2025", revenue: 380000, orders: 670 },
  { date: "Jun", label: "June 2025", revenue: 410000, orders: 720 },
  { date: "Jul", label: "July 2025", revenue: 460000, orders: 810 },
  { date: "Aug", label: "August 2025", revenue: 521450, orders: 924 },
];

export const SalesOverviewChart: React.FC = () => {
  const [granularity, setGranularity] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [selectedIndex, setSelectedIndex] = useState<number>(4); // Default to 23 Aug

  const data = 
    granularity === "Daily" 
      ? DAILY_SALES 
      : granularity === "Weekly" 
      ? WEEKLY_SALES 
      : MONTHLY_SALES;

  const activePoint = data[Math.min(selectedIndex, data.length - 1)] || data[0];

  const maxVal = Math.max(...data.map((d) => d.revenue)) * 1.15;
  const minVal = 0;

  // Chart dimensions
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartW;
    const y = height - paddingY - ((d.revenue - minVal) / (maxVal - minVal)) * chartH;
    return { ...d, x, y };
  });

  // Build smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Revenue Analytics
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              +18.4%
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Sales & Revenue Overview
          </h3>
        </div>

        {/* Granularity switch */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          {(["Daily", "Weekly", "Monthly"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setGranularity(mode);
                setSelectedIndex(mode === "Daily" ? 4 : 2);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                granularity === mode
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Metric highlight banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 mb-4">
        <div>
          <div className="text-xs text-slate-500 font-semibold">{activePoint.label}</div>
          <div className="text-xl sm:text-2xl font-black text-[#00875a]">
            ₹ {activePoint.revenue.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-slate-500 font-medium">Orders Count</div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {activePoint.orders} Orders
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Avg Order Value</div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              ₹ {Math.round(activePoint.revenue / (activePoint.orders || 1)).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div className="w-full relative overflow-x-auto select-none pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00875a" stopOpacity="0.25" />
              <stop offset="90%" stopColor="#00875a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = height - paddingY - r * chartH;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#salesGradient)" />

          {/* Main stroke curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#00875a"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <g
                key={idx}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedIndex(idx)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? "#00875a" : "#ffffff"}
                  stroke="#00875a"
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200"
                />
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={10}
                    fill="#00875a"
                    fillOpacity="0.2"
                  />
                )}
                {/* X-axis label */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-bold ${
                    isSelected ? "fill-slate-900 font-extrabold" : "fill-slate-400"
                  }`}
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 mt-2">
        <span className="flex items-center gap-1 font-medium text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          Click any point to view daily breakdown
        </span>
        <span className="font-semibold text-emerald-700">Live POS & Online Synced</span>
      </div>
    </div>
  );
};
