"use client";

import React from "react";
import { 
  Sliders, 
  Store, 
  Clock, 
  Package, 
  CreditCard 
} from "lucide-react";

export type SettingsTabId = 
  | "general" 
  | "hours" 
  | "rules" 
  | "delivery_payment";

interface TabItem {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "general", label: "General & Branding", icon: Store },
  { id: "hours", label: "Business Hours", icon: Clock },
  { id: "rules", label: "Order & Inventory Rules", icon: Package },
  { id: "delivery_payment", label: "Delivery & Payment", icon: CreditCard },
];

interface SettingsTabsNavProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export const SettingsTabsNav: React.FC<SettingsTabsNavProps> = ({
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
