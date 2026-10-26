"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ShoppingBag, ShoppingCart, Leaf } from "lucide-react";
import { OrderStatsSummary } from "@/types";
import { MOCK_DATE_ANALYTICS } from "@/data";
import { ProduceImage } from "@/components/common";

interface OrderAnalyticsWidgetsProps {
  dateFilter: string;
  stats: OrderStatsSummary;
  onDateChange?: (date: string) => void;
}

export const OrderAnalyticsWidgets: React.FC<OrderAnalyticsWidgetsProps> = ({
  dateFilter,
  stats,
  onDateChange,
}) => {
  const [timelineDropdown, setTimelineDropdown] = useState(false);

  // Normalize date string to lookup analytics accurately
  const normalizedKey =
    dateFilter.includes("24") || dateFilter.toLowerCase().includes("yesterday")
      ? "24 Aug 2025"
      : dateFilter.includes("23")
      ? "23 Aug 2025"
      : dateFilter.includes("22")
      ? "22 Aug 2025"
      : "25 Aug 2025";

  const analytics =
    MOCK_DATE_ANALYTICS[normalizedKey] ||
    MOCK_DATE_ANALYTICS["25 Aug 2025"];

  const total = stats.totalOrders || 1;
  const deliveredPct = Math.round((stats.delivered / total) * 100) || 0;
  const outForDeliveryPct = Math.round((stats.outForDelivery / total) * 100) || 0;
  const processingPct = Math.round((stats.processing / total) * 100) || 0;
  const pendingPct = Math.round((stats.pending / total) * 100) || 0;
  const cancelledPct = Math.round((stats.cancelled / total) * 100) || 0;

  // SVG Circumference for radius 38: 2 * Math.PI * 38 ≈ 238.76
  const C = 238.76;
  const deliveredLength = (deliveredPct / 100) * C;
  const outForDeliveryLength = (outForDeliveryPct / 100) * C;
  const processingLength = (processingPct / 100) * C;
  const pendingLength = (pendingPct / 100) * C;
  const cancelledLength = (cancelledPct / 100) * C;

  // Timeline dropdown label matching screenshot
  const timelineLabel =
    normalizedKey === "25 Aug 2025"
      ? "Today"
      : normalizedKey === "24 Aug 2025"
      ? "Yesterday"
      : normalizedKey;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Orders by Status Donut Card - Matching Screenshot Exactly */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00875a] text-white flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Orders by Status
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200/90 px-2.5 py-1 rounded-xl">
            {dateFilter === "25 Aug 2025" ? "Today (25 Aug)" : dateFilter}
          </span>
        </div>

        {/* Side-by-Side: Donut on Left, Legend on Right */}
        <div className="flex items-center justify-between gap-4 py-2">
          {/* Donut Chart with All Status Colors matching screenshot */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="12"
              />
              {/* 1. Delivered Segment - Deep rich forest green */}
              {deliveredLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#00875a"
                  strokeWidth="12"
                  strokeDasharray={`${deliveredLength} ${C - deliveredLength}`}
                  strokeDashoffset="0"
                />
              )}
              {/* 2. Out for Delivery Segment - Bright light lime-green */}
              {outForDeliveryLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${outForDeliveryLength} ${C - outForDeliveryLength}`}
                  strokeDashoffset={`${-deliveredLength}`}
                />
              )}
              {/* 3. Processing Segment - Bright warm yellow */}
              {processingLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#facc15"
                  strokeWidth="12"
                  strokeDasharray={`${processingLength} ${C - processingLength}`}
                  strokeDashoffset={`${-(deliveredLength + outForDeliveryLength)}`}
                />
              )}
              {/* 4. Pending Segment - Vibrant orange */}
              {pendingLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="12"
                  strokeDasharray={`${pendingLength} ${C - pendingLength}`}
                  strokeDashoffset={`${-(deliveredLength + outForDeliveryLength + processingLength)}`}
                />
              )}
              {/* 5. Cancelled Segment - Red */}
              {cancelledLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={`${cancelledLength} ${C - cancelledLength}`}
                  strokeDashoffset={`${-(
                    deliveredLength +
                    outForDeliveryLength +
                    processingLength +
                    pendingLength
                  )}`}
                />
              )}
            </svg>

            {/* Center Label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 leading-none">
                {stats.totalOrders}
              </span>
              <span className="text-xs text-slate-500 font-semibold mt-1">
                Orders
              </span>
            </div>
          </div>

          {/* Legend List on Right Matching Reference Screenshot */}
          <div className="space-y-2.5 text-xs font-medium flex-1 pl-1">
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00875a]"></span>
                <span>Delivered</span>
              </div>
              <span className="font-medium text-slate-700">
                {stats.delivered} ({deliveredPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                <span>Out for Delivery</span>
              </div>
              <span className="font-medium text-slate-700">
                {stats.outForDelivery} ({outForDeliveryPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#facc15]"></span>
                <span>Processing</span>
              </div>
              <span className="font-medium text-slate-700">
                {stats.processing} ({processingPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                <span>Pending</span>
              </div>
              <span className="font-medium text-slate-700">
                {stats.pending} ({pendingPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                <span>Cancelled</span>
              </div>
              <span className="font-medium text-slate-700">
                {stats.cancelled} ({cancelledPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Order Timeline Card - Matching Screenshot Exactly */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        {/* Header with Shopping Cart Icon & Dropdown */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#00875a]" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Today&apos;s Order Timeline
            </h3>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setTimelineDropdown((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors shadow-3xs"
            >
              <span>{timelineLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {timelineDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setTimelineDropdown(false)}
                />
                <div className="absolute right-0 top-9 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { label: "Today (25 Aug)", value: "25 Aug 2025" },
                    { label: "Yesterday (24 Aug)", value: "24 Aug 2025" },
                    { label: "23 Aug 2025", value: "23 Aug 2025" },
                    { label: "22 Aug 2025", value: "22 Aug 2025" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        onDateChange?.(item.value);
                        setTimelineDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl font-medium transition-colors ${
                        normalizedKey === item.value
                          ? "bg-[#eefcf2] text-[#00875a] font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Timeline Chart Body with Floating Peak Tooltip & Mint Bars */}
        <div className="pt-2">
          {/* Chart Graphic Area */}
          <div className="relative h-28 flex items-end justify-between gap-1 px-2 pb-1">
            {/* Floating Tooltip directly above the peak bar */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10 flex flex-col items-center">
              <div className="bg-white border border-slate-100 rounded-xl shadow-md px-3 py-1.5 text-center min-w-[76px]">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {analytics.peakOrders || 12} orders
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {analytics.peakTime || "12:00 PM"}
                </span>
              </div>
              {/* Downward Caret */}
              <div className="w-2 h-2 bg-white border-r border-b border-slate-100 transform rotate-45 -mt-1 shadow-xs" />
            </div>

            {/* Vertical Rounded Bars Matching Screenshot */}
            {analytics.hourlyTimeline.map((slot, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end h-full group"
              >
                <div
                  style={{ height: slot.height }}
                  className={`w-full max-w-[12px] rounded-t-sm sm:rounded-t-md transition-all ${
                    slot.peak
                      ? "bg-[#10b981] shadow-3xs"
                      : "bg-[#6ee7b7]/80 group-hover:bg-[#10b981]"
                  }`}
                  title={`${slot.time}: ${slot.orders} orders`}
                />
              </div>
            ))}
          </div>

          {/* Horizontal Axis: 6AM, 9AM, 12PM, 3PM, 6PM, 9PM */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600">
            <span>6AM</span>
            <span>9AM</span>
            <span>12PM</span>
            <span>3PM</span>
            <span>6PM</span>
            <span>9PM</span>
          </div>
        </div>
      </div>

      {/* 3. Top Ordered Products Card - Matching Screenshot Exactly */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00875a] text-white flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Top Ordered Products
            </h3>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-[#00875a] hover:underline"
          >
            View All
          </Link>
        </div>

        {/* 5 Product Rows matching screenshot */}
        <div className="divide-y divide-slate-100/90">
          {analytics.topProducts.map((item) => (
            <div
              key={item.rank}
              className="py-1.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-1 transition-colors"
            >
              {/* Left: Rank, Produce Thumbnail, Name & Unit */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-slate-900 w-3 text-center flex-shrink-0">
                  {item.rank}
                </span>
                <ProduceImage name={item.name} size={32} />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {item.unit}
                  </span>
                </div>
              </div>

              {/* Right: Orders count */}
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-medium text-slate-600">
                  {item.orders} orders
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
