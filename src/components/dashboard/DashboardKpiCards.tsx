"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Users,
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { getCurrencySymbol } from "@/data/shared-store";

interface DashboardKpiCardsProps {
  totalOrders?: number;
  newCustomers?: number;
  totalProducts?: number;
  inventoryItems?: number;
  lowStockCount?: number;
  todayRevenue?: number;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  totalOrders = 128,
  newCustomers = 42,
  totalProducts = 156,
  inventoryItems = 78,
  lowStockCount = 5,
  todayRevenue = 24560,
}) => {
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol());
    const onSettingsUpdate = () => {
      setCurrencySymbol(getCurrencySymbol());
    };
    window.addEventListener("rrv:settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("rrv:settings:updated", onSettingsUpdate);
  }, []);
  const cards = [
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      subtext: "↑ 12% from yesterday",
      subtextColor: "text-[#00875a]",
      icon: ShoppingBag,
      iconBg: "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]",
      badgeTrend: true,
    },
    {
      label: "New Customers",
      value: newCustomers.toLocaleString(),
      subtext: "↑ 8% from yesterday",
      subtextColor: "text-[#00875a]",
      icon: Users,
      iconBg: "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]",
      badgeTrend: true,
    },
    {
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      subtext: "↑ 3% from last week",
      subtextColor: "text-[#00875a]",
      icon: Package,
      iconBg: "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]",
      badgeTrend: true,
    },
    {
      label: "Inventory Items",
      value: inventoryItems.toLocaleString(),
      subtext: `${lowStockCount} low stock items`,
      subtextColor: "text-amber-700 font-semibold",
      icon: Boxes,
      iconBg: "bg-amber-50 text-amber-700 border-amber-200",
      hasWarningBullet: true,
    },
    {
      label: "Today's Revenue",
      value: `${currencySymbol} ${todayRevenue.toLocaleString("en-IN")}`,
      subtext: "↑ 18% from yesterday",
      subtextColor: "text-[#00875a]",
      icon: DollarSign,
      iconBg: "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]",
      badgeTrend: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-3xs flex flex-col justify-between transition-all hover:shadow-xs hover:border-emerald-300 group"
          >
            {/* Top row: Icon and Trend/Badge */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 ${card.iconBg}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              {card.badgeTrend && (
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3" />
                </div>
              )}
              {card.hasWarningBullet && (
                <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Label and Big Value */}
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-0.5">
                {card.label}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </h3>
            </div>

            {/* Subtext info */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px]">
              {card.hasWarningBullet && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              )}
              <span className={card.subtextColor}>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
