"use client";

import React from "react";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { PaymentsSummary } from "@/types";

interface PaymentStatsCardsProps {
  summary: PaymentsSummary;
}

export const PaymentStatsCards: React.FC<PaymentStatsCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Revenue */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            ₹ {summary.totalRevenue.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
          <TrendingUp className="w-3 h-3" />
          <span>{summary.revenueGrowth} vs last week</span>
        </p>
      </div>

      {/* 2. Paid Orders */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900">Paid Orders</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600 tracking-tight">
            {summary.paidOrders}
          </span>
        </div>
        <p className="text-[11px] font-medium text-emerald-700/80 mt-0.5">
          {summary.paidSuccessRate} success rate
        </p>
      </div>

      {/* 3. Pending Payments */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">Pending Payments</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600 tracking-tight">
            {summary.pendingPayments}
          </span>
        </div>
        <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">
          Awaiting confirmation
        </p>
      </div>

      {/* 4. Failed Payments */}
      <div className="bg-white rounded-2xl border border-red-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-900">Failed Payments</span>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-red-600 tracking-tight">
            {summary.failedPayments}
          </span>
        </div>
        <p className="text-[11px] font-medium text-red-500 mt-0.5">
          Needs retry / attention
        </p>
      </div>

      {/* 5. Refunded Amount */}
      <div className="bg-white rounded-2xl border border-purple-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-900">Refunded Amount</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-purple-700 tracking-tight">
            ₹ {summary.refundedAmount.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] font-medium text-purple-600/80 mt-0.5">
          {summary.refundedCount} orders refunded
        </p>
      </div>
    </div>
  );
};
