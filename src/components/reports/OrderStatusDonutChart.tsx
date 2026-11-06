"use client";

import React, { useState } from "react";
import { ShoppingBag, CheckCircle2, Truck, Clock, XCircle, RotateCcw } from "lucide-react";

interface StatusSegment {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ORDER_SEGMENTS: StatusSegment[] = [
  { id: "delivered", label: "Delivered", count: 214, percentage: 66, color: "#00875a", icon: CheckCircle2 },
  { id: "out_for_delivery", label: "Out for Delivery", count: 55, percentage: 17, color: "#2563eb", icon: Truck },
  { id: "pending", label: "Pending", count: 32, percentage: 10, color: "#f59e0b", icon: Clock },
  { id: "cancelled", label: "Cancelled", count: 16, percentage: 5, color: "#e11d48", icon: XCircle },
  { id: "returned", label: "Returned", count: 7, percentage: 2, color: "#8b5cf6", icon: RotateCcw },
];

export const OrderStatusDonutChart: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<StatusSegment | null>(null);

  const totalOrders = ORDER_SEGMENTS.reduce((sum, s) => sum + s.count, 0);

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fulfillment Rate
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Order Status Breakdown
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <ShoppingBag className="w-4 h-4" />
        </div>
      </div>

      {/* Donut and Center Display */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {ORDER_SEGMENTS.map((segment) => {
              const dashLength = (segment.percentage / 100) * circumference;
              const dashOffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += segment.percentage;

              const isHovered = activeSegment?.id === segment.id;

              return (
                <circle
                  key={segment.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setActiveSegment(segment)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeSegment ? (
              <>
                <span className="text-xs font-bold text-slate-500 truncate max-w-[90px]">
                  {activeSegment.label}
                </span>
                <span className="text-xl font-black text-slate-900">
                  {activeSegment.count}
                </span>
                <span className="text-[11px] font-extrabold text-slate-400">
                  {activeSegment.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-slate-900">
                  {totalOrders}
                </span>
                <span className="text-xs font-bold text-slate-500">Total Orders</span>
                <span className="text-[10px] font-extrabold text-emerald-600">
                  83% Active/Deliv
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-auto flex flex-col gap-2 flex-1">
          {ORDER_SEGMENTS.map((seg) => {
            const Icon = seg.icon;
            const isHovered = activeSegment?.id === seg.id;
            return (
              <div
                key={seg.id}
                onMouseEnter={() => setActiveSegment(seg)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                  isHovered ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{seg.count}</span>
                  <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">
                    {seg.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-slate-500 font-medium pt-3 border-t border-slate-100 flex items-center justify-between">
        <span>Fulfillment efficiency</span>
        <span className="font-bold text-emerald-700">94.8% Success Rate</span>
      </div>
    </div>
  );
};
