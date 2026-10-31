"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Shield,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Settings,
  Lock,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import { MOCK_ADMIN_USER } from "@/data";
import { getSavedSettings } from "@/data/shared-store";
import { StoreSettings } from "@/types/settings";

interface ProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [storeStatus, setStoreStatus] = useState<"Online" | "Paused">("Online");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getSavedSettings());

  const handleSignOut = () => {
    onClose();
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
    setStoreSettings(getSavedSettings());
    const onSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      setStoreSettings(customEvent.detail || getSavedSettings());
    };
    window.addEventListener("rrv:settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("rrv:settings:updated", onSettingsUpdate);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Green Gradient banner */}
        <div className="bg-gradient-to-r from-[#00875a] to-[#006b47] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d1f2e0]">
              <Shield className="w-4 h-4" />
              <span>Administrator Profile</span>
            </div>
            <h2 className="text-xl font-bold mt-1">{storeSettings.storeName || "RRV Green Basket"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile User Info Row on clean white background */}
        <div className="px-6 pt-5 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#00875a] text-white font-black text-2xl flex items-center justify-center shadow-md flex-shrink-0">
              {MOCK_ADMIN_USER.avatarInitial}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Admin
                <span className="w-2 h-2 rounded-full bg-[#00875a] animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Full System Administrator
              </p>
            </div>
          </div>

          {/* Store Status Toggle */}
          <button
            type="button"
            onClick={() =>
              setStoreStatus((prev) => (prev === "Online" ? "Paused" : "Online"))
            }
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
              storeStatus === "Online"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
            title="Click to toggle store operating status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Store: {storeStatus}</span>
          </button>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-5">
          {/* Contact & Location Info (Interactive click to copy) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Email with copy */}
            <button
              type="button"
              onClick={() => handleCopy(storeSettings.supportEmail || MOCK_ADMIN_USER.email, "email")}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 transition-all text-left group"
              title="Click to copy email"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:bg-emerald-50">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px] font-medium">Email Address</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {storeSettings.supportEmail || MOCK_ADMIN_USER.email}
                  </span>
                </div>
              </div>
              <span className="p-1 text-slate-400 group-hover:text-emerald-600">
                {copiedField === "email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* Phone with copy */}
            <button
              type="button"
              onClick={() => handleCopy(storeSettings.supportPhone || MOCK_ADMIN_USER.phone, "phone")}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 transition-all text-left group"
              title="Click to copy phone number"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:bg-emerald-50">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px] font-medium">Contact Phone</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {storeSettings.supportPhone || MOCK_ADMIN_USER.phone}
                  </span>
                </div>
              </div>
              <span className="p-1 text-slate-400 group-hover:text-emerald-600">
                {copiedField === "phone" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* Operating Hub */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px] font-medium">Operating Hub</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {storeSettings.address || MOCK_ADMIN_USER.location}
                </span>
              </div>
            </div>

            {/* Daily Cut-off */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px] font-medium">Cut-off Time</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {storeSettings.orderCutoffTime ? `${storeSettings.orderCutoffTime} Daily` : `${MOCK_ADMIN_USER.orderCutoff}`}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions & Roles */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assigned Administrative Permissions</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              {MOCK_ADMIN_USER.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/admin/settings"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Open Store Settings</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
