"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Leaf,
  Bike,
  Menu,
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMore }) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", path: "/admin/dashboard", icon: Home },
    { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { label: "Procure", path: "/admin/procurement", icon: Leaf },
    { label: "Delivery", path: "/admin/delivery", icon: Bike },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl px-2 py-1 flex items-center justify-around"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          Boolean(pathname) &&
          (pathname === item.path ||
            (item.path !== "/admin/dashboard" && pathname!.startsWith(item.path)));

        return (
          <Link
            key={item.label}
            href={item.path}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer select-none ${
              isActive
                ? "text-[#00875a] font-black"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isActive ? "bg-[#eefcf2] text-[#00875a] scale-105" : "text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}

      {/* More / Menu Button to open drawer */}
      <button
        type="button"
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-500 hover:text-slate-900 font-medium transition-all cursor-pointer select-none"
      >
        <div className="p-1 rounded-xl text-slate-500 hover:bg-slate-100">
          <Menu className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">More</span>
      </button>
    </nav>
  );
};
