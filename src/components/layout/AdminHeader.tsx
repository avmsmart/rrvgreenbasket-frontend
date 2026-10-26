"use client";

import React from "react";
import { Menu, Search, PanelLeftClose, PanelLeft } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { DateFilterDropdown } from "./DateFilterDropdown";

interface AdminHeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  collapsed,
  onToggleSidebar,
  onOpenSearch,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Left Section: Sidebar Toggle & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {/* Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar navigation"
        >
          {/* Hamburger for mobile, PanelLeft/PanelLeftClose for desktop */}
          <span className="hidden md:inline-block">
            {collapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </span>
          <span className="md:hidden inline-block">
            <Menu className="w-5 h-5" />
          </span>
        </button>

        {/* Global Search Bar (Trigger for Search Modal) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full max-w-xs sm:max-w-md px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-left text-xs text-slate-400 hover:text-slate-600 transition-all group shadow-2xs"
          title="Press Ctrl + K to search"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
            <span className="truncate">
              Search products, orders, customers...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-3xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Section: Date & Time, Notifications, Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Interactive Date & Time Widget (Matching PDF Pages) */}
        <div className="hidden lg:block">
          <DateFilterDropdown />
        </div>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Vertical divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200" />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
};
