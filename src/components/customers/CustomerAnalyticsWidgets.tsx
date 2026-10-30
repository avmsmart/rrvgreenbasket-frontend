"use client";

import React from "react";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  UserPlus,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import {
  CustomerSummary,
  TopSpendingCustomer,
  NewCustomerActivity,
} from "@/types";

interface CustomerAnalyticsWidgetsProps {
  summary: CustomerSummary;
  topSpenders: TopSpendingCustomer[];
  newCustomers: NewCustomerActivity[];
  onCustomerClick?: (id: string) => void;
  onViewAllTop?: () => void;
  onViewAllNew?: () => void;
}

export const CustomerAnalyticsWidgets: React.FC<CustomerAnalyticsWidgetsProps> = ({
  summary,
  topSpenders,
  newCustomers,
  onCustomerClick,
  onViewAllTop,
  onViewAllNew,
}) => {
  const total = summary.totalCustomers || 1248;
  const active = summary.activeCustomers || 896;
  const inactive = summary.inactiveCustomers || 120;
  const newCust = summary.newCustomers || 86;
  const repeat = summary.repeatCustomers || 312;

  // Donut SVG circumference calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const activeStroke = (0.72) * circumference;
  const inactiveStroke = (0.10) * circumference;
  const newStroke = (0.07) * circumference;
  const repeatStroke = (0.11) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
      
      {/* 1. Customer Distribution (Donut Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Customer Distribution
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Overview
            </span>
          </div>

          {/* Donut and Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
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
                {/* Active (Emerald) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-700"
                  strokeWidth="16"
                  strokeDasharray={`${activeStroke} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Inactive (Slate) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-400 transition-all duration-700"
                  strokeWidth="16"
                  strokeDasharray={`${inactiveStroke} ${circumference}`}
                  strokeDashoffset={-activeStroke}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* New (Blue) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-blue-500 transition-all duration-700"
                  strokeWidth="16"
                  strokeDasharray={`${newStroke} ${circumference}`}
                  strokeDashoffset={-(activeStroke + inactiveStroke)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Repeat (Amber) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-amber-500 transition-all duration-700"
                  strokeWidth="16"
                  strokeDasharray={`${repeatStroke} ${circumference}`}
                  strokeDashoffset={-(activeStroke + inactiveStroke + newStroke)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Customers
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="w-full space-y-2 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-700 font-medium">Active</span>
                </div>
                <span className="font-bold text-slate-900">
                  {active} <span className="text-slate-400 font-normal">(72%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-slate-700 font-medium">Inactive</span>
                </div>
                <span className="font-bold text-slate-900">
                  {inactive} <span className="text-slate-400 font-normal">(10%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-700 font-medium">New (This Month)</span>
                </div>
                <span className="font-bold text-slate-900">
                  {newCust} <span className="text-slate-400 font-normal">(7%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700 font-medium">Repeat Customers</span>
                </div>
                <span className="font-bold text-slate-900">
                  {repeat} <span className="text-slate-400 font-normal">(25%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Retention Rate</span>
          <span className="font-semibold text-emerald-700">72% Active Customers</span>
        </div>
      </div>

      {/* 2. Top Customers by Spending */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Top Customers by Spending
              </h3>
            </div>
            {onViewAllTop && (
              <button
                type="button"
                onClick={onViewAllTop}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {topSpenders.map((cust, idx) => (
              <div
                key={cust.id}
                onClick={() => onCustomerClick?.(cust.id)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      idx === 0
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : idx === 1
                        ? "bg-slate-200 text-slate-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cust.rank || idx + 1}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {cust.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                      {cust.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {cust.totalOrders} orders
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black text-slate-900 shrink-0">
                  ₹ {cust.totalSpent.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>High Value Focus</span>
          <span className="font-semibold text-slate-700">Top 5 contribute ₹44,890</span>
        </div>
      </div>

      {/* 3. New Customers (This Month) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                New Customers (This Month)
              </h3>
            </div>
            {onViewAllNew && (
              <button
                type="button"
                onClick={onViewAllNew}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {newCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => onCustomerClick?.(cust.id)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {cust.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {cust.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {cust.joinedTime}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {cust.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Acquisition</span>
          <span className="font-semibold text-blue-600">+86 users in Aug</span>
        </div>
      </div>

    </div>
  );
};
