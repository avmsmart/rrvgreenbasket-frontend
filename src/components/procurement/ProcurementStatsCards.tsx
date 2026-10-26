"use client";

import React from "react";
import { ShoppingBag, ShoppingCart, IndianRupee, Truck } from "lucide-react";
import { ProcurementSummary } from "@/types";

interface ProcurementStatsCardsProps {
  summary: ProcurementSummary;
  selectedFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export const ProcurementStatsCards: React.FC<ProcurementStatsCardsProps> = ({
  summary,
  selectedFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: "items",
      label: "Total Items to Procure",
      value: `${summary.totalItems} items`,
      subtext: "For tomorrow's orders",
      subtextColor: "text-[#00875a]",
      icon: ShoppingBag,
      iconBg: "bg-[#eefcf2] text-[#00875a]",
    },
    {
      id: "quantity",
      label: "Total Quantity",
      value: `${summary.totalQuantity} kg`,
      subtext: `Across ${summary.productsCount} products`,
      subtextColor: "text-emerald-600",
      icon: ShoppingCart,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "cost",
      label: "Estimated Cost",
      value: `₹ ${summary.estimatedCost.toLocaleString("en-IN")}`,
      subtext: "Based on supplier rates",
      subtextColor: "text-teal-600",
      icon: IndianRupee,
      iconBg: "bg-teal-50 text-teal-600",
    },
    {
      id: "status",
      label: "Procurement Status",
      value: `${summary.procurementPercentage}%`,
      subtext: `${summary.completedItemsCount}/${summary.totalItemsCount} items planned`,
      subtextColor: "text-[#00875a]",
      icon: Truck,
      iconBg: "bg-[#eefcf2] text-[#00875a]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedFilter === c.id;

        return (
          <div
            key={c.id}
            onClick={() => onSelectFilter && onSelectFilter(c.id)}
            className={`p-4 rounded-2xl bg-white border text-left transition-all relative overflow-hidden group shadow-3xs ${
              onSelectFilter ? "cursor-pointer" : ""
            } ${
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

            {/* Subtitle Status / Details */}
            <p className={`text-[11px] font-semibold mt-1 truncate ${c.subtextColor}`}>
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
