"use client";

import React from "react";
import {
  ShoppingBag,
  Clock,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { OrderStatsSummary } from "@/types";

interface OrderStatsCardsProps {
  stats: OrderStatsSummary;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: "All",
      label: "Total Orders",
      value: stats.totalOrders,
      changeText: "↑ 12% from yesterday",
      changeColor: "text-[#00875a]",
      icon: ShoppingBag,
      iconBg: "bg-[#eefcf2] text-[#00875a]",
    },
    {
      id: "Pending",
      label: "Pending",
      value: stats.pending,
      changeText: "Needs processing",
      changeColor: "text-amber-600",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      id: "Processing",
      label: "Processing",
      value: stats.processing,
      changeText: "Being processed",
      changeColor: "text-blue-600",
      icon: RefreshCw,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "Out for Delivery",
      label: "Out for Delivery",
      value: stats.outForDelivery,
      changeText: "On the way",
      changeColor: "text-teal-600",
      icon: Truck,
      iconBg: "bg-teal-50 text-teal-600",
    },
    {
      id: "Delivered",
      label: "Delivered",
      value: stats.delivered,
      changeText: "Completed orders",
      changeColor: "text-[#00875a]",
      icon: CheckCircle2,
      iconBg: "bg-[#eefcf2] text-[#00875a]",
    },
    {
      id: "Cancelled",
      label: "Cancelled",
      value: stats.cancelled,
      changeText: "Cancelled orders",
      changeColor: "text-rose-600",
      icon: XCircle,
      iconBg: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedStatus === c.id;

        return (
          <button
            type="button"
            key={c.id}
            onClick={() => onSelectStatus(c.id)}
            className={`p-4 rounded-2xl bg-white border text-left transition-all relative overflow-hidden group shadow-3xs cursor-pointer ${
              isSelected
                ? "border-[#00875a] ring-2 ring-[#00875a]/20 shadow-xs scale-[1.01]"
                : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            {/* Top Row: Label and Colored Icon Squircle */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 truncate block">
                {c.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${c.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Big Crisp Bold Number */}
            <div className="text-2xl sm:text-[28px] font-black text-slate-900 leading-tight tracking-tight">
              {c.value}
            </div>

            {/* Subtitle Status / Percentage */}
            <p className={`text-[11px] font-semibold mt-1 truncate ${c.changeColor}`}>
              {c.changeText}
            </p>
          </button>
        );
      })}
    </div>
  );
};
