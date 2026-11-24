"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  UserPlus,
  Repeat,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { CustomerDashboardSummary } from "@/types";

interface CustomerStatsCardsProps {
  summary: CustomerDashboardSummary | null;
  isLoading?: boolean;
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="mt-3 h-7 w-20 bg-slate-200 rounded" />
            <div className="mt-2 h-2.5 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: "Total Customers",
      value: summary.totalCustomers.toLocaleString(),
      subtext: "↑ 12% from last month",
      icon: Users,
      iconBg: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-200/90",
      textColor: "text-slate-900",
      trendColor: "text-emerald-600",
    },
    {
      title: "Active Customers",
      value: summary.activeCustomers.toLocaleString(),
      subtext: `${Math.round((summary.activeCustomers / (summary.totalCustomers || 1)) * 100)}% of total`,
      icon: UserCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-200/80",
      textColor: "text-emerald-700",
      badge: "ACTIVE",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Inactive Customers",
      value: summary.inactiveCustomers.toLocaleString(),
      subtext: "Dormant 30+ days",
      icon: UserX,
      iconBg: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-200/80",
      textColor: "text-amber-700",
      badge: "INACTIVE",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      title: "Suspended Customers",
      value: summary.suspendedCustomers.toLocaleString(),
      subtext: "Account flagged",
      icon: ShieldAlert,
      iconBg: "bg-rose-50 text-rose-600",
      borderColor: "border-rose-200/80",
      textColor: "text-rose-700",
      badge: "SUSPENDED",
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      title: "New Customers",
      value: summary.newCustomersThisMonth.toLocaleString(),
      subtext: "Joined this month",
      icon: UserPlus,
      iconBg: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200/80",
      textColor: "text-blue-700",
    },
    {
      title: "Repeat Customers",
      value: summary.repeatCustomers.toLocaleString(),
      subtext: "> 5 completed orders",
      icon: Repeat,
      iconBg: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-200/80",
      textColor: "text-indigo-700",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders.toLocaleString(),
      subtext: "Across all customers",
      icon: ShoppingBag,
      iconBg: "bg-violet-50 text-violet-600",
      borderColor: "border-violet-200/80",
      textColor: "text-violet-700",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalPurchaseValue),
      subtext: "↑ 18% overall GMV",
      icon: IndianRupee,
      iconBg: "bg-emerald-50 text-emerald-700",
      borderColor: "border-emerald-200/80",
      textColor: "text-emerald-800",
      trendColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl border ${card.borderColor} p-4 shadow-3xs hover:shadow-xs transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${card.textColor} tracking-tight`}>
                {card.value}
              </span>
              {card.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              )}
            </div>
            <p
              className={`text-[11px] font-semibold ${
                card.trendColor || "text-slate-500"
              } flex items-center gap-1 mt-1`}
            >
              {card.subtext.startsWith("↑") && <TrendingUp className="w-3 h-3" />}
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
