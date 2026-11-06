"use client";

import React from "react";
import { TrendingUp, BarChart3, ShoppingBag, Users, Package } from "lucide-react";

interface ReportsKpiCardsProps {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
}

export const ReportsKpiCards: React.FC<ReportsKpiCardsProps> = ({
  totalRevenue,
  totalOrders,
  totalCustomers,
  totalProductsSold,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Revenue */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Total Revenue</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00875a] flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ₹ {totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+18% from last month</span>
          </div>
        </div>
      </div>

      {/* 2. Total Orders */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Total Orders</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalOrders.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+12% from last month</span>
          </div>
        </div>
      </div>

      {/* 3. Total Customers */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Total Customers</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalCustomers.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+15% from last month</span>
          </div>
        </div>
      </div>

      {/* 4. Total Products Sold */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Total Products Sold</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalProductsSold.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+20% from last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};
