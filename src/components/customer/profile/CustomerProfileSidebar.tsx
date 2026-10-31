"use client";

import React from "react";
import {
  LayoutDashboard,
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { CustomerUser } from "@/types/customer-auth";

export type ProfileTab =
  | "overview"
  | "profile"
  | "orders"
  | "addresses"
  | "wishlist"
  | "settings"
  | "support";

interface CustomerProfileSidebarProps {
  currentTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  customer: CustomerUser | null;
  onLogoutClick: () => void;
}

const NAV_ITEMS: {
  id: ProfileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  { id: "overview", label: "My Overview", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "addresses", label: "My Addresses", icon: MapPin },
  { id: "wishlist", label: "My Wishlist", icon: Heart },
  { id: "settings", label: "Account Settings", icon: Settings },
  { id: "support", label: "Help & Support", icon: HelpCircle },
];

export const CustomerProfileSidebar: React.FC<CustomerProfileSidebarProps> = ({
  currentTab,
  onTabChange,
  customer,
  onLogoutClick,
}) => {
  const displayName = customer?.fullName?.trim() || "Valued Customer";
  const initials = (displayName || "C")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Customer User Info Card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          {/* Avatar with initials or icon */}
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-green-800 text-sm font-bold text-white shadow-md ring-4 ring-emerald-50">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-gray-900 truncate tracking-tight">
              {displayName}
            </h2>
            <p className="text-xs text-gray-500 font-mono truncate">
              {customer?.mobileNumber || "No phone added"}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
              <span>Green Basket Member</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Card */}
      <nav className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-gray-700 hover:bg-emerald-50/60 hover:text-emerald-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white text-emerald-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="my-3 border-t border-gray-100" />

        <button
          type="button"
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default CustomerProfileSidebar;
