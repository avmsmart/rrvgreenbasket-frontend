"use client";

import React from "react";
import { Ticket, Users, IndianRupee, Sparkles, TrendingUp } from "lucide-react";

interface CouponsKpiCardsProps {
  totalCoupons: number;
  activeCoupons: number;
  totalUsages: number;
  totalDiscountGiven: number;
}

export const CouponsKpiCards: React.FC<CouponsKpiCardsProps> = ({
  totalCoupons,
  activeCoupons,
  totalUsages,
  totalDiscountGiven,
}) => {
  const activePercent = totalCoupons > 0 ? Math.round((activeCoupons / totalCoupons) * 100) : 50;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Coupons */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Total Coupons</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center">
            <Ticket className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalCoupons}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{activeCoupons} active</span>
          </div>
        </div>
      </div>

      {/* 2. Total Usages */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Total Usages</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalUsages.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+18% this month</span>
          </div>
        </div>
      </div>

      {/* 3. Total Discount Given */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Total Discount Given</span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ₹ {totalDiscountGiven.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+15% this month</span>
          </div>
        </div>
      </div>

      {/* 4. Active Coupons */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Active Coupons</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeCoupons}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700">
            <span>{activePercent}% of total</span>
          </div>
        </div>
      </div>
    </div>
  );
};
