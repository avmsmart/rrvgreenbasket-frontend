"use client";

import React from "react";
import {
  Package,
  Clock,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { PackingSummary } from "@/types";

interface PackingStatsCardsProps {
  summary: PackingSummary;
  onFilterByStatus?: (status: string) => void;
  activeStatus?: string;
}

export const PackingStatsCards: React.FC<PackingStatsCardsProps> = ({
  summary,
  onFilterByStatus,
  activeStatus,
}) => {
  const cards = [
    {
      id: "Total",
      title: "Total Orders to Pack",
      value: summary.totalOrdersToPack,
      subText: "Today's orders",
      icon: Package,
      statusFilter: "All Orders",
      iconBg: "bg-emerald-50 text-[#00875a]",
      borderHover: "hover:border-[#00875a]",
    },
    {
      id: "Pending",
      title: "Pending",
      value: summary.pending,
      subText: "Not started",
      icon: Clock,
      statusFilter: "Pending",
      iconBg: "bg-amber-50 text-amber-500",
      borderHover: "hover:border-amber-400",
      dotColor: "bg-amber-500",
    },
    {
      id: "In Packing",
      title: "In Packing",
      value: summary.inPacking,
      subText: "Being packed",
      icon: RefreshCw,
      statusFilter: "In Packing",
      iconBg: "bg-blue-50 text-blue-600",
      borderHover: "hover:border-blue-400",
      dotColor: "bg-blue-600",
    },
    {
      id: "Packed",
      title: "Packed",
      value: summary.packed,
      subText: "Ready for delivery",
      icon: CheckCircle2,
      statusFilter: "Packed",
      iconBg: "bg-emerald-50 text-[#15803d]",
      borderHover: "hover:border-emerald-500",
      dotColor: "bg-[#15803d]",
    },
    {
      id: "Progress",
      title: "Packing Progress",
      value: `${summary.packingPercentage}%`,
      subText: `${summary.packedOrdersCount || 16} / ${summary.totalOrdersToPack} orders packed`,
      icon: TrendingUp,
      statusFilter: "All Orders",
      iconBg: "bg-emerald-50 text-[#00875a]",
      borderHover: "hover:border-[#00875a]",
      showProgressBar: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.statusFilter;

        return (
          <div
            key={card.id}
            onClick={() => onFilterByStatus && onFilterByStatus(card.statusFilter)}
            className={`bg-white rounded-2xl p-4 border transition-all duration-200 shadow-3xs flex flex-col justify-between cursor-pointer ${
              isActive
                ? "border-[#00875a] ring-2 ring-[#00875a]/15 shadow-xs"
                : `border-slate-200/80 ${card.borderHover} hover:shadow-xs`
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block truncate">
                  {card.title}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 block">
                  {card.value}
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col justify-end">
              {card.showProgressBar ? (
                <div className="space-y-1.5">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#00875a] rounded-full transition-all duration-300"
                      style={{ width: `${summary.packingPercentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {card.subText}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {card.dotColor && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`}
                    />
                  )}
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    {card.subText}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
