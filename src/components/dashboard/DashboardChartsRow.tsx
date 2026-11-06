"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Zap,
  Plus,
  Boxes,
  ReceiptText,
  Tag,
  Bike,
  ArrowRight,
} from "lucide-react";

interface DashboardChartsRowProps {
  onOpenAddProductModal: () => void;
}

interface DayBarData {
  day: string;
  delivered: number;
  processing: number;
  cancelled: number;
}

const BAR_CHART_7_DAYS: DayBarData[] = [
  { day: "19 Aug", delivered: 28, processing: 8, cancelled: 4 },
  { day: "20 Aug", delivered: 27, processing: 9, cancelled: 3 },
  { day: "21 Aug", delivered: 31, processing: 11, cancelled: 4 },
  { day: "22 Aug", delivered: 35, processing: 10, cancelled: 2 },
  { day: "23 Aug", delivered: 38, processing: 12, cancelled: 5 },
  { day: "24 Aug", delivered: 32, processing: 9, cancelled: 3 },
  { day: "25 Aug", delivered: 34, processing: 11, cancelled: 4 },
];

export const DashboardChartsRow: React.FC<DashboardChartsRowProps> = ({
  onOpenAddProductModal,
}) => {
  const [selectedBarFilter, setSelectedBarFilter] = useState("Last 7 Days");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("Today");
  const [hoveredDay, setHoveredDay] = useState<DayBarData | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Status breakdown matching PDF (Delivered 84 / 66%, Processing 28 / 22%, Cancelled 10 / 8%, Pending 6 / 4%)
  const statusSlices = [
    { label: "Delivered", count: 84, percentage: 66, color: "#00875a", hoverColor: "#00734d" },
    { label: "Processing", count: 28, percentage: 22, color: "#4ade80", hoverColor: "#22c55e" },
    { label: "Cancelled", count: 10, percentage: 8, color: "#fb923c", hoverColor: "#f97316" },
    { label: "Pending", count: 6, percentage: 4, color: "#facc15", hoverColor: "#eab308" },
  ];

  const totalOrdersCount = 128;
  const radius = 56;
  const circumference = 2 * Math.PI * radius; // ~351.86

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Order Overview Bar Chart (lg:col-span-5) */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Order Overview
            </h3>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                aria-label="Filter order overview by time range"
                value={selectedBarFilter}
                onChange={(e) => setSelectedBarFilter(e.target.value)}
                className="appearance-none text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3 py-1.5 pr-7 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 14 Days">Last 14 Days</option>
                <option value="This Month">This Month</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3.5 mb-5 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00875a]" />
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
              <span>Processing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c]" />
              <span>Cancelled</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-48 sm:h-52 w-full pt-4">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300 pb-6 pr-2">
              <div className="border-b border-dashed border-slate-100 w-full flex justify-between">
                <span>40</span>
              </div>
              <div className="border-b border-dashed border-slate-100 w-full flex justify-between">
                <span>30</span>
              </div>
              <div className="border-b border-dashed border-slate-100 w-full flex justify-between">
                <span>20</span>
              </div>
              <div className="border-b border-dashed border-slate-100 w-full flex justify-between">
                <span>10</span>
              </div>
              <div className="border-b border-slate-200 w-full flex justify-between">
                <span>0</span>
              </div>
            </div>

            {/* Bars */}
            <div className="relative z-10 h-full flex items-end justify-between px-3 pb-6">
              {BAR_CHART_7_DAYS.map((item, idx) => {
                const total = item.delivered + item.processing + item.cancelled;
                const max = 45;
                const heightDelivered = (item.delivered / max) * 100;
                const heightProcessing = (item.processing / max) * 100;
                const heightCancelled = (item.cancelled / max) * 100;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center flex-1 group cursor-pointer"
                    onMouseEnter={() => setHoveredDay(item)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Tooltip */}
                    <div className="relative flex flex-col items-center">
                      {hoveredDay?.day === item.day && (
                        <div className="absolute -top-16 z-20 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                          <p>{item.day}: {total} orders</p>
                          <p className="text-emerald-400">{item.delivered} delivered</p>
                        </div>
                      )}

                      {/* Grouped Bar Column */}
                      <div className="flex items-end gap-1 h-36">
                        <div
                          style={{ height: `${heightDelivered}%` }}
                          className="w-2 sm:w-2.5 bg-[#00875a] rounded-t-sm group-hover:brightness-110 transition-all"
                        />
                        <div
                          style={{ height: `${heightProcessing}%` }}
                          className="w-2 sm:w-2.5 bg-[#4ade80] rounded-t-sm group-hover:brightness-110 transition-all"
                        />
                        <div
                          style={{ height: `${heightCancelled}%` }}
                          className="w-2 sm:w-2.5 bg-[#fb923c] rounded-t-sm group-hover:brightness-110 transition-all"
                        />
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-500 mt-2 truncate w-full text-center">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Weekly total: <strong className="text-slate-800">229 Delivered</strong></span>
          <span className="text-[#00875a] font-bold">92.4% success rate</span>
        </div>
      </div>

      {/* 2. Order Status SVG Donut Chart (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Order Status
            </h3>

            <div className="relative">
              <select
                aria-label="Filter order status by timeframe"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="appearance-none text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3 py-1.5 pr-7 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Donut and Legend Layout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* Donut SVG */}
            <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="14"
                  fill="transparent"
                />

                {/* Slices */}
                {statusSlices.map((slice, idx) => {
                  const accumulatedPercent = statusSlices
                    .slice(0, idx)
                    .reduce((sum, s) => sum + s.percentage, 0);
                  const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                  const isHovered = hoveredSlice === slice.label;

                  return (
                    <circle
                      key={slice.label}
                      cx="70"
                      cy="70"
                      r={radius}
                      stroke={slice.color}
                      strokeWidth={isHovered ? 18 : 14}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(slice.label)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Text inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {totalOrdersCount}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Orders
                </span>
              </div>
            </div>

            {/* Legend on right */}
            <div className="space-y-2.5 w-full">
              {statusSlices.map((slice) => {
                const isHovered = hoveredSlice === slice.label;
                return (
                  <div
                    key={slice.label}
                    onMouseEnter={() => setHoveredSlice(slice.label)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center justify-between p-1.5 px-2 rounded-xl transition-colors cursor-pointer ${
                      isHovered ? "bg-slate-50 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: slice.color }}
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {slice.label}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 flex-shrink-0 whitespace-nowrap">
                      <span>{slice.count}</span>
                      <span className="text-slate-400 text-[10px] font-medium ml-1">
                        ({slice.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active fulfillment</span>
          <span className="text-emerald-700 font-bold">112 / 128 Handled</span>
        </div>
      </div>

      {/* 3. Quick Actions Panel matching PDF (lg:col-span-3) */}
      <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center border border-emerald-100">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Quick Actions
            </h3>
          </div>

          {/* Action Buttons List */}
          <div className="space-y-2.5">
            <button
              onClick={onOpenAddProductModal}
              className="w-full text-left p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 text-[#00875a] border border-[#bbf7d0] font-bold text-xs flex items-center justify-between group transition-all shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <Link
              href="/admin/inventory"
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80 font-bold text-xs flex items-center justify-between group transition-all shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 text-slate-500" />
                <span>Manage Inventory</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500" />
            </Link>

            <Link
              href="/admin/orders"
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80 font-bold text-xs flex items-center justify-between group transition-all shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <ReceiptText className="w-4 h-4 text-slate-500" />
                <span>View Today&apos;s Orders</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500" />
            </Link>

            <Link
              href="/admin/coupons"
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80 font-bold text-xs flex items-center justify-between group transition-all shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-slate-500" />
                <span>Create Offer / Coupon</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500" />
            </Link>

            <Link
              href="/admin/delivery-partners"
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80 font-bold text-xs flex items-center justify-between group transition-all shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Bike className="w-4 h-4 text-slate-500" />
                <span>Assign Delivery Partner</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500" />
            </Link>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          Instant operations panel
        </div>
      </div>
    </div>
  );
};
