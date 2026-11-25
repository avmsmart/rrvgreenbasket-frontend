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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
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
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const NAV_ITEMS: {
  id: ProfileTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  group: "MAIN" | "ACCOUNT";
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "MAIN" },
  { id: "orders", label: "My Orders", icon: Package, group: "MAIN" },
  { id: "wishlist", label: "My Wishlist", icon: Heart, group: "MAIN" },
  { id: "addresses", label: "Address Book", icon: MapPin, group: "MAIN" },
  { id: "profile", label: "Personal Information", icon: User, group: "ACCOUNT" },
  { id: "settings", label: "Account Settings", icon: Settings, group: "ACCOUNT" },
  { id: "support", label: "Help & Support", icon: HelpCircle, group: "ACCOUNT" },
];

const NAV_ICON_STYLES: Record<ProfileTab, string> = {
  overview: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100",
  profile: "bg-blue-50 text-blue-700 group-hover:bg-blue-100",
  orders: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
  addresses: "bg-violet-50 text-violet-700 group-hover:bg-violet-100",
  wishlist: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
  settings: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
  support: "bg-sky-50 text-sky-700 group-hover:bg-sky-100",
};

export const CustomerProfileSidebar: React.FC<CustomerProfileSidebarProps> = ({
  currentTab,
  onTabChange,
  customer,
  onLogoutClick,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const displayName = customer?.fullName?.trim() || "Valued Customer";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={`sticky top-20 flex h-[calc(100vh-5rem)] flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ${
        collapsed ? "w-[76px]" : "w-full"
      }`}
    >
      {/* Customer identity */}
      <div
        className={`flex min-h-[76px] shrink-0 items-center border-b border-slate-100 ${
          collapsed ? "justify-center px-2" : "gap-3 px-4"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
          {initials || "C"}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">
              {customer?.mobileNumber || "Customer account"}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-emerald-700">
              RRV Green Basket
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={`min-h-0 flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Main menu
          </p>
        )}

        <nav aria-label="Customer account sections" className="space-y-1">
          {NAV_ITEMS.map((item, index) => {
            const active = currentTab === item.id;
            const Icon = item.icon;
            const showAccountLabel =
              !collapsed &&
              item.group === "ACCOUNT" &&
              NAV_ITEMS[index - 1]?.group !== "ACCOUNT";

            return (
              <React.Fragment key={item.id}>
                {showAccountLabel && (
                  <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Account
                  </p>
                )}

                <button
                  type="button"
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onTabChange(item.id)}
                  className={`group flex min-h-[44px] w-full items-center gap-3 rounded-lg text-left transition-colors ${
                    collapsed ? "justify-center px-2" : "px-3"
                  } ${
                    active
                      ? "bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-100"
                      : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      NAV_ICON_STYLES[item.id]
                    }`}
                  >
                    <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
                  </span>

                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-[12px]">
                        {item.label}
                      </span>
                      {active && (
                        <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                    </>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-slate-100 px-3 py-3">
        <button
          type="button"
          title={collapsed ? "Sign out" : undefined}
          onClick={onLogoutClick}
          className={`group flex min-h-[42px] w-full items-center gap-3 rounded-lg text-left text-rose-600 transition-colors hover:bg-rose-50 ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100">
            <LogOut className="h-[17px] w-[17px]" strokeWidth={2} />
          </span>
          {!collapsed && <span className="text-[12px] font-medium">Sign out</span>}
        </button>

        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-2 flex min-h-[38px] w-full items-center gap-3 rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 ${
              collapsed ? "justify-center px-2" : "px-3"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="text-[11px] font-medium">Collapse menu</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};

export default CustomerProfileSidebar;
