"use client";

import React from "react";
import { FolderTree, CheckCircle2, AlertCircle } from "lucide-react";
import { CategoryStatistics } from "@/types/category";

interface CategoryStatsCardsProps {
  stats: CategoryStatistics;
}

export const CategoryStatsCards: React.FC<CategoryStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: "Total Categories",
      value: stats.total,
      subtext: "Master catalog categories",
      icon: FolderTree,
      color: "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]",
    },
    {
      label: "Active Categories",
      value: stats.active,
      subtext: "Visible on storefront catalog",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      label: "Inactive Categories",
      value: stats.inactive,
      subtext: "Hidden from customer storefront",
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      isWarning: stats.inactive > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
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
