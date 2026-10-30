"use client";

import React from "react";
import { Package, Leaf, Globe, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

interface ProductsStatsCardsProps {
  totalCount: number;
  englishVegCount: number;
  indianVegCount: number;
  inStockCount: number;
  lowStockCount: number;
}

export const ProductsStatsCards: React.FC<ProductsStatsCardsProps> = ({
  totalCount,
  englishVegCount,
  indianVegCount,
  inStockCount,
  lowStockCount,
}) => {
  const cards = [
    {
      label: "Total Products",
      value: totalCount,
      subtext: "Master ERP Price Catalog",
      icon: Package,
      color: "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]",
    },
    {
      label: "English Vegetables",
      value: englishVegCount,
      subtext: "Section A (Hotel & RC)",
      icon: Globe,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Indian Vegetables",
      value: indianVegCount,
      subtext: "Section B (Fresh Daily)",
      icon: Leaf,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      label: "In Stock Items",
      value: inStockCount,
      subtext: "Ready for customer orders",
      icon: CheckCircle2,
      color: "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]",
    },
    {
      label: "Low Stock Alert",
      value: lowStockCount,
      subtext: "Needs mandi procurement",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      isWarning: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((c, idx) => {
        const IconComponent = c.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-3xs flex flex-col justify-between transition-all hover:border-emerald-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 ${c.color}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              {c.isWarning && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>

            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-0.5">
                {c.label}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {c.value}
              </h3>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
