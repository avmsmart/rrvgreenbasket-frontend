"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PieChart, TrendingUp, Clock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { CouponActivity } from "@/types/coupon";

interface CouponsAnalyticsRowProps {
  activities: CouponActivity[];
}

export const CouponsAnalyticsRow: React.FC<CouponsAnalyticsRowProps> = ({
  activities,
}) => {
  // SVG Donut metrics
  // Total usages = 1,842
  // Active: 1210 (66%), Scheduled: 220 (12%), Inactive: 312 (17%), Expired: 100 (5%)
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89

  const slices = [
    { label: "Active", count: 1210, percentage: 66, color: "#00875a" },
    { label: "Scheduled", count: 220, percentage: 12, color: "#3b82f6" },
    { label: "Inactive", count: 312, percentage: 17, color: "#94a3b8" },
    { label: "Expired", count: 100, percentage: 5, color: "#ef4444" },
  ];

  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const topPerforming = [
    { rank: 1, code: "VEG15", usages: 320, saved: 4800, isFreeShip: false },
    { rank: 2, code: "WELCOME10", usages: 245, saved: 3920, isFreeShip: false },
    { rank: 3, code: "FESTIVE25", usages: 200, saved: 6250, isFreeShip: false },
    { rank: 4, code: "FRESH20", usages: 180, saved: 5400, isFreeShip: false },
    { rank: 5, code: "FREESHIP", usages: 512, saved: 0, isFreeShip: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Coupon Usage Overview (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#00875a]" />
              <span>Coupon Usage Overview</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Lifetime
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            {/* Donut SVG */}
            <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="12"
                  fill="transparent"
                />

                {slices.map((slice, idx) => {
                  const accumulatedPercent = slices
                    .slice(0, idx)
                    .reduce((sum, s) => sum + s.percentage, 0);
                  const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                  const isHovered = hoveredSlice === slice.label;

                  return (
                    <circle
                      key={slice.label}
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={slice.color}
                      strokeWidth={isHovered ? 15 : 12}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      strokeLinecap="round"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(slice.label)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Center text inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 leading-none">
                  1,842
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Total Usages
                </span>
              </div>
            </div>

            {/* Legend on right */}
            <div className="space-y-2 text-xs flex-1 min-w-0">
              {slices.map((slice) => {
                const isHovered = hoveredSlice === slice.label;
                return (
                  <div
                    key={slice.label}
                    onMouseEnter={() => setHoveredSlice(slice.label)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center justify-between p-1 rounded-xl transition-colors cursor-pointer ${
                      isHovered ? "bg-slate-50 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        style={{ backgroundColor: slice.color }}
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      />
                      <span className="text-slate-700 text-[11px] truncate">{slice.label}</span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-800 flex-shrink-0 whitespace-nowrap">
                      <span>{slice.count.toLocaleString("en-IN")}</span>
                      <span className="text-slate-400 font-medium ml-1">
                        ({slice.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Redemption rate: <strong className="text-emerald-700">66% Active</strong></span>
          <span className="text-slate-400">Monthly renewal</span>
        </div>
      </div>

      {/* 2. Top Performing Coupons (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00875a]" />
              <span>Top Performing Coupons</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              View All
            </span>
          </div>

          {/* Top 5 list */}
          <div className="space-y-2.5 divide-y divide-slate-100">
            {topPerforming.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between pt-2 first:pt-0 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      item.rank === 1
                        ? "bg-[#00875a] text-white"
                        : item.rank === 2
                        ? "bg-emerald-100 text-[#00875a]"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.rank}
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-900 block truncate">
                      {item.code}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.usages} usages
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-extrabold text-slate-900 block">
                    {item.isFreeShip ? "₹0 (Free Delivery)" : `₹${item.saved.toLocaleString("en-IN")} saved`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Top driver: <strong className="text-slate-800">VEG15 (Vegetables)</strong></span>
          <span className="text-emerald-700 font-bold">₹24,370 total saved</span>
        </div>
      </div>

      {/* 3. Recent Coupon Activity (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00875a]" />
              <span>Recent Coupon Activity</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Feed
            </span>
          </div>

          {/* Activity items */}
          <div className="space-y-3">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#00875a] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate">
                      {act.customerName} used <span className="font-mono text-[#00875a]">{act.couponCode}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {act.savingsText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Last redeemed: <strong className="text-slate-800">25 Aug 09:15 AM</strong></span>
          <span className="text-emerald-700 font-bold">100% verified</span>
        </div>
      </div>
    </div>
  );
};
