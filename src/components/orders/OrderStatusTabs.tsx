"use client";

import React from "react";
import { OrderStatsSummary } from "@/types";

interface OrderStatusTabsProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  stats: OrderStatsSummary;
}

export const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({
  currentTab,
  onSelectTab,
  stats,
}) => {
  const tabs = [
    { id: "All", label: "All Orders", count: stats.totalOrders },
    { id: "Pending", label: "Pending", count: stats.pending },
    { id: "Processing", label: "Processing", count: stats.processing },
    { id: "Out for Delivery", label: "Out for Delivery", count: stats.outForDelivery },
    { id: "Delivered", label: "Delivered", count: stats.delivered },
    { id: "Cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? "bg-[#00875a] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
