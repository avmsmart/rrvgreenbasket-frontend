"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  IndianRupee,
  Star,
  TrendingUp,
} from "lucide-react";
import { CustomerSummary } from "@/types";

interface CustomerStatsCardsProps {
  summary: CustomerSummary;
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Customers */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Customers</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {summary.totalCustomers.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
          <TrendingUp className="w-3 h-3" />
          ↑ 12% from last month
        </p>
      </div>

      {/* 2. Active Customers */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900">Active Customers</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600 tracking-tight">
            {summary.activeCustomers.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] font-medium text-emerald-700/80 mt-0.5">
          72% of total
        </p>
      </div>

      {/* 3. New Customers */}
      <div className="bg-white rounded-2xl border border-blue-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-900">New Customers</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            {summary.newCustomers}
          </span>
        </div>
        <p className="text-[11px] font-medium text-blue-500 mt-0.5">
          This month
        </p>
      </div>

      {/* 4. Total Purchase Value */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Total Purchase Value</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-emerald-700 tracking-tight">
            ₹ 3,42,680
          </span>
        </div>
        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
          <TrendingUp className="w-3 h-3" />
          ↑ 18% from last month
        </p>
      </div>

      {/* 5. Repeat Customers */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">Repeat Customers</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600 tracking-tight">
            {summary.repeatCustomers}
          </span>
        </div>
        <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">
          25% of total
        </p>
      </div>
    </div>
  );
};
