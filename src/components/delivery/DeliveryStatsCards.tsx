"use client";

import React from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { DeliverySummary } from "@/types";

interface DeliveryStatsCardsProps {
  summary: DeliverySummary;
}

export const DeliveryStatsCards: React.FC<DeliveryStatsCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Orders */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Orders</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {summary.totalOrders}
          </span>
        </div>
        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
          Today&apos;s deliveries
        </p>
      </div>

      {/* 2. Pending Assignment */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">Pending Assignment</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600 tracking-tight">
            {summary.pendingAssignment}
          </span>
        </div>
        <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">
          Need delivery partner
        </p>
      </div>

      {/* 3. Out for Delivery */}
      <div className="bg-white rounded-2xl border border-blue-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-900">Out for Delivery</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            {summary.outForDelivery}
          </span>
        </div>
        <p className="text-[11px] font-medium text-blue-500 mt-0.5">
          On the way
        </p>
      </div>

      {/* 4. Delivered */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900">Delivered</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600 tracking-tight">
            {summary.delivered}
          </span>
        </div>
        <p className="text-[11px] font-medium text-emerald-600/80 mt-0.5">
          Completed today
        </p>
      </div>

      {/* 5. Failed / Returned */}
      <div className="bg-white rounded-2xl border border-red-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-900">Failed/Returned</span>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-red-600 tracking-tight">
            {summary.failed}
          </span>
        </div>
        <p className="text-[11px] font-medium text-red-500 mt-0.5">
          Delivery failed
        </p>
      </div>
    </div>
  );
};
