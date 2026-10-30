"use client";

import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  Truck, 
  Store,
  Layers
} from "lucide-react";

export type ReportTabId = 
  | "overview" 
  | "sales" 
  | "orders" 
  | "products" 
  | "customers" 
  | "delivery" 
  | "procurement";

interface TabItem {
  id: ReportTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "sales", label: "Sales & Revenue", icon: TrendingUp },
  { id: "orders", label: "Orders Analytics", icon: ShoppingBag },
  { id: "products", label: "Products Performance", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "delivery", label: "Delivery Metrics", icon: Truck },
  { id: "procurement", label: "Procurement & Mandi", icon: Store },
];

interface ReportsTabsBarProps {
  activeTab: ReportTabId;
  onTabChange: (tab: ReportTabId) => void;
}

export const ReportsTabsBar: React.FC<ReportsTabsBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-1.5 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 min-w-max">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                isActive
                  ? "bg-[#00875a] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
