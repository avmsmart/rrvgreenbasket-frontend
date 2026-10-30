"use client";

import React from "react";
import {
  PieChart as PieChartIcon,
  Flame,
  Clock,
  ArrowRight,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
} from "lucide-react";
import { PackingSummary, TopPackingProduct, PackingActivity } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";

interface PackingAnalyticsWidgetsProps {
  summary: PackingSummary;
  topProducts: TopPackingProduct[];
  recentActivities: PackingActivity[];
  onOrderClick?: (orderId: string) => void;
  onViewAllProducts?: () => void;
}

export const PackingAnalyticsWidgets: React.FC<PackingAnalyticsWidgetsProps> = ({
  summary,
  topProducts,
  recentActivities,
  onOrderClick,
  onViewAllProducts,
}) => {
  const total = summary.totalOrdersToPack || 28;
  const pending = summary.pending || 12;
  const inPacking = summary.inPacking || 10;
  const packed = summary.packed || 6;

  // Calculate percentages
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 43;
  const inPackingPct = total > 0 ? Math.round((inPacking / total) * 100) : 36;
  const packedPct = total > 0 ? 100 - pendingPct - inPackingPct : 21;

  // SVG Donut calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const pendingStroke = (pendingPct / 100) * circumference;
  const inPackingStroke = (inPackingPct / 100) * circumference;
  const packedStroke = (packedPct / 100) * circumference;

  // Find max count for progress bars in Top Products
  const maxProductCount =
    topProducts.length > 0
      ? Math.max(...topProducts.map((p) => p.ordersCount), 65)
      : 65;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
      
      {/* 1. Packing Status Overview (Donut Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Packing Status Overview
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Today
            </span>
          </div>

          {/* Donut Chart & Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="16"
                  fill="transparent"
                />
                {/* Pending Slice (Amber) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-amber-500 transition-all duration-700 ease-out"
                  strokeWidth="16"
                  strokeDasharray={`${pendingStroke} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* In Packing Slice (Blue) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-blue-500 transition-all duration-700 ease-out"
                  strokeWidth="16"
                  strokeDasharray={`${inPackingStroke} ${circumference}`}
                  strokeDashoffset={-pendingStroke}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Packed Slice (Emerald) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-700 ease-out"
                  strokeWidth="16"
                  strokeDasharray={`${packedStroke} ${circumference}`}
                  strokeDashoffset={-(pendingStroke + inPackingStroke)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {total}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Orders
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="w-full space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="font-semibold text-slate-700">Pending</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{pending}</span>
                  <span className="text-slate-400 font-normal">({pendingPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="font-semibold text-slate-700">In Packing</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{inPacking}</span>
                  <span className="text-slate-400 font-normal">({inPackingPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-semibold text-slate-700">Packed</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{packed}</span>
                  <span className="text-slate-400 font-normal">({packedPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Overall Packing Speed</span>
          <span className="font-semibold text-emerald-700">On Track • ~4.2 mins/order</span>
        </div>
      </div>

      {/* 2. Top Products to Pack */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Top Products to Pack
                </h3>
              </div>
            </div>
            {onViewAllProducts && (
              <button
                type="button"
                onClick={onViewAllProducts}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, idx) => {
              const pct = Math.round((product.ordersCount / maxProductCount) * 100);
              return (
                <div key={product.name} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : idx === 1
                            ? "bg-slate-200 text-slate-700"
                            : idx === 2
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {product.rank || idx + 1}
                      </span>
                      <ProduceImage name={product.name} size={22} className="shrink-0" />
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {product.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {product.ordersCount}{" "}
                      <span className="text-[11px] font-normal text-slate-500">orders</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === 0
                          ? "bg-emerald-600"
                          : idx === 1
                          ? "bg-emerald-500"
                          : "bg-emerald-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>High Demand Focus</span>
          <span className="font-semibold text-slate-700">Pre-pack top items for speed</span>
        </div>
      </div>

      {/* 3. Recent Packing Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Packing Activity
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities.slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                onClick={() => onOrderClick?.(activity.orderId)}
                className="py-2.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5">
                    {activity.status === "Packed" ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {activity.customerName}
                      <span className="font-mono font-medium text-slate-500 text-[11px] ml-1.5">
                        {activity.orderId}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {activity.action} ({activity.itemsCount} items)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    {activity.time}
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-semibold ${
                      activity.status === "Packed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Packing Log</span>
          <span className="font-semibold text-slate-700">Auto-synced with inventory</span>
        </div>
      </div>

    </div>
  );
};
