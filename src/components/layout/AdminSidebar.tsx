"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Box,
  Package,
  ShoppingCart,
  ShoppingBasket,
  PackageCheck,
  Truck,
  UserCheck,
  Share2,
  CreditCard,
  Ticket,
  BarChart3,
  Layers,
  Settings,
  X,
} from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { RRVLogo } from "./RRVLogo";
import { MOCK_ADMIN_USER } from "@/data";
import { ProfileDetailsModal } from "./ProfileDetailsModal";

interface AdminSidebarProps {
  collapsed?: boolean;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Box,
  Package,
  ShoppingCart,
  ShoppingBasket,
  PackageCheck,
  Truck,
  UserCheck,
  Share2,
  CreditCard,
  Ticket,
  BarChart3,
  Layers,
  Settings,
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed = false,
  isMobile = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <aside
        className={`h-full flex flex-col bg-white border-r border-slate-200/80 select-none transition-all duration-300 ease-in-out ${
          collapsed && !isMobile ? "w-20" : "w-64"
        }`}
      >
        {/* Top Header: Brand Logo with Perforated Basket & Leaves */}
        <div
          className={`h-24 flex items-center border-b border-slate-100 flex-shrink-0 px-5 ${
            collapsed && !isMobile ? "justify-center px-2" : "justify-between"
          }`}
        >
          <RRVLogo collapsed={collapsed && !isMobile} />

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links matching user's exact screenshot (No chevrons, left green indicator bar) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.iconName] || Home;
            const isActive =
              Boolean(pathname) &&
              (pathname === item.path ||
                (item.path !== "/admin/dashboard" && pathname!.startsWith(item.path + "/")));

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => {
                  if (isMobile && onCloseMobile) {
                    onCloseMobile();
                  }
                }}
                title={collapsed && !isMobile ? item.label : undefined}
                className={`group flex items-center transition-all duration-150 ${
                  collapsed && !isMobile
                    ? "justify-center p-2.5 rounded-xl"
                    : "px-3.5 py-2.5 rounded-xl"
                } ${
                  isActive
                    ? "bg-[#eefcf2] text-[#15803d] font-bold border-l-4 border-[#16a34a] shadow-3xs"
                    : "text-[#1e293b] hover:bg-slate-50 hover:text-slate-900 font-semibold border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon
                    strokeWidth={isActive ? 2.1 : 1.85}
                    className={`w-[19px] h-[19px] flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-[#15803d]"
                        : "text-[#475569] group-hover:text-[#0f172a]"
                    }`}
                  />
                  {(!collapsed || isMobile) && (
                    <span className="text-[13.5px] tracking-tight truncate">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area: Administrator Profile Card (Click displays complete details) */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-[#eefcf2] border border-transparent hover:border-[#bbf7d0] transition-all text-left group ${
              collapsed && !isMobile ? "justify-center" : "justify-start"
            }`}
            title="Click to view full Admin Profile details"
            aria-label="View Admin Profile Details"
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#16a34a] text-white font-extrabold text-sm flex items-center justify-center shadow-xs group-hover:bg-[#15803d] transition-colors">
                {MOCK_ADMIN_USER.avatarInitial}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>

            {(!collapsed || isMobile) && (
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[13px] font-bold text-[#0f2942] group-hover:text-[#16a34a] transition-colors truncate">
                  {MOCK_ADMIN_USER.name}
                </span>
                <span className="text-[11px] text-[#64748b] font-medium truncate mt-0.5">
                  {MOCK_ADMIN_USER.role}
                </span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Admin Profile Details Dialog */}
      <ProfileDetailsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
