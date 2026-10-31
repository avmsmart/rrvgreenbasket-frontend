"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Settings,
  LogOut,
  Store,
  User,
} from "lucide-react";
import { MOCK_ADMIN_USER } from "@/data";
import { ProfileDetailsModal } from "./ProfileDetailsModal";
import { getSavedSettings } from "@/data/shared-store";
import { StoreSettings } from "@/types/settings";

export const ProfileDropdown: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [storeName, setStoreName] = useState("RRV Green Basket");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("rrv_admin_logged_in", "false");
      } catch (err) {
        console.error("Sign out storage error", err);
      }
    }
    router.push("/login");
  };

  useEffect(() => {
    const s = getSavedSettings();
    if (s.storeName) setStoreName(s.storeName);

    const onSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      const updated = customEvent.detail || getSavedSettings();
      if (updated.storeName) setStoreName(updated.storeName);
    };
    window.addEventListener("rrv:settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("rrv:settings:updated", onSettingsUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Trigger Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          aria-expanded={isOpen}
          title="Admin Profile Menu"
        >
          <div className="w-8 h-8 rounded-full bg-[#00875a] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
            {MOCK_ADMIN_USER.avatarInitial}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-[#0f2942]">
              {MOCK_ADMIN_USER.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
              {storeName}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#00875a]" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* User Header (Clickable to view details) */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsDetailsModalOpen(true);
              }}
              className="w-full text-left px-4 py-3 border-b border-slate-100 flex items-center gap-3 hover:bg-[#eaf8f0] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#00875a] group-hover:bg-[#00734d] text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0 transition-colors">
                {MOCK_ADMIN_USER.avatarInitial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#0f2942] group-hover:text-[#00875a]">
                  {MOCK_ADMIN_USER.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{MOCK_ADMIN_USER.email}</p>
              </div>
            </button>

            {/* Store Status Toggle */}
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-700 font-medium">Store Status</span>
              </div>
              <button
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                  isStoreOpen
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isStoreOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {isStoreOpen ? "Online" : "Paused"}
              </button>
            </div>

            {/* Menu Links */}
            <div className="py-1 text-xs text-slate-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsDetailsModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-emerald-700 transition-colors text-left"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>View Profile Details</span>
              </button>
              <Link
                href="/admin/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Store Settings</span>
              </Link>
            </div>

            {/* Logout */}
            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Dialog triggered from Header */}
      <ProfileDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </>
  );
};
