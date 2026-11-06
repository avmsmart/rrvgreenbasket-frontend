"use client";

import React from "react";
import {
  Users,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Plus,
} from "lucide-react";
import { DeliveryPartnersSummary } from "@/types";

interface PartnerStatsCardsProps {
  summary: DeliveryPartnersSummary;
}

export const PartnerStatsCards: React.FC<PartnerStatsCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Partners */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Partners</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {summary.totalPartners}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
          <Plus className="w-3 h-3" />2 this month
        </p>
      </div>

      {/* 2. Active Partners */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900">Active Partners</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600 tracking-tight">
            {summary.activePartners}
          </span>
        </div>
        <p className="text-[11px] font-medium text-emerald-700/80 mt-0.5">
          78% of total
        </p>
      </div>

      {/* 3. On Delivery */}
      <div className="bg-white rounded-2xl border border-blue-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-900">On Delivery</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            {summary.onDelivery}
          </span>
        </div>
        <p className="text-[11px] font-medium text-blue-500 mt-0.5">
          Currently delivering
        </p>
      </div>

      {/* 4. Idle Partners */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">Idle Partners</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600 tracking-tight">
            {summary.idlePartners}
          </span>
        </div>
        <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">
          Available now
        </p>
      </div>

      {/* 5. Inactive Partners */}
      <div className="bg-white rounded-2xl border border-red-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-900">Inactive Partners</span>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-red-600 tracking-tight">
            {summary.inactivePartners}
          </span>
        </div>
        <p className="text-[11px] font-medium text-red-500 mt-0.5">
          Not active
        </p>
      </div>
    </div>
  );
};
