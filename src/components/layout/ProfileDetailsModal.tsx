"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { MOCK_ADMIN_USER } from "@/data";
import { apiClient } from "@/services/api-client";

interface ProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [storeStatus, setStoreStatus] = useState<"Online" | "Paused">("Online");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"idle" | "checking" | "online" | "offline">("idle");
  const [apiMessage, setApiMessage] = useState<string>("");

  const checkConnection = async () => {
    setApiStatus("checking");
    try {
      const res = await apiClient.checkHealth();
      if (res.online) {
        setApiStatus("online");
        setApiMessage("Connected (Spring Boot UP)");
      } else {
        setApiStatus("offline");
        setApiMessage("Local Fallback Active (Offline)");
      }
    } catch {
      setApiStatus("offline");
      setApiMessage("Local Fallback Active (Offline)");
    }
  };

  useEffect(() => {
    let active = true;
    if (isOpen) {
      apiClient.checkHealth().then((res) => {
        if (!active) return;
        if (res.online) {
          setApiStatus("online");
          setApiMessage("Connected (Spring Boot UP)");
        } else {
          setApiStatus("offline");
          setApiMessage("Local Fallback Active (Offline)");
        }
      });
    }
    return () => {
      active = false;
    };
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
        <div className="relative bg-gradient-to-r from-[#00875a] to-[#006b47] px-6 pt-6 pb-12 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d1f2e0]">
            <Shield className="w-4 h-4" />
            <span>Administrator Profile</span>
          </div>
          <h2 className="text-xl font-bold mt-1">RRV Green Basket Admin</h2>
        </div>

        {/* User Card overlapping header */}
        <div className="px-6 -mt-8">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-[#00875a] border-4 border-white text-white font-black text-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                {MOCK_ADMIN_USER.avatarInitial}
              </div>
              <div className="mb-1 leading-tight">
                <h3 className="text-lg font-bold text-[#0f2942] flex items-center gap-1.5">
                  {MOCK_ADMIN_USER.name}
                  <span className="w-2 h-2 rounded-full bg-[#00875a] animate-pulse"></span>
                </h3>
                <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-bold bg-[#eaf8f0] text-[#00875a]">
                  {MOCK_ADMIN_USER.role}
                </span>
              </div>
            </div>

            {/* Store Status Toggle */}
            <button
              type="button"
              onClick={() =>
                setStoreStatus((prev) => (prev === "Online" ? "Paused" : "Online"))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
                storeStatus === "Online"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
              title="Click to toggle store operating status"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>Store: {storeStatus}</span>
            </button>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-5">
          {/* Contact & Location Info (Interactive click to copy) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Email with copy */}
            <button
              type="button"
              onClick={() => handleCopy(MOCK_ADMIN_USER.email, "email")}
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
                    {MOCK_ADMIN_USER.email}
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
              onClick={() => handleCopy(MOCK_ADMIN_USER.phone, "phone")}
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
                    {MOCK_ADMIN_USER.phone}
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
                  {MOCK_ADMIN_USER.location}
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
                  {MOCK_ADMIN_USER.orderCutoff} Daily
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

          {/* Backend API Connection Status */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  apiStatus === "online"
                    ? "bg-emerald-500 animate-pulse"
                    : apiStatus === "checking"
                    ? "bg-blue-500 animate-spin"
                    : "bg-amber-500"
                }`} />
                <span className="text-xs font-bold text-slate-800">
                  Java Backend API Status
                </span>
              </div>
              <button
                type="button"
                onClick={checkConnection}
                disabled={apiStatus === "checking"}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-3xs transition-colors hover:bg-emerald-50"
              >
                {apiStatus === "checking" ? "Pinging..." : "Test Ping"}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono text-[10px] text-slate-600 truncate max-w-[200px]">
                {apiClient.getBaseUrl()}
              </span>
              <span className={`font-semibold ${
                apiStatus === "online" ? "text-emerald-600" : "text-amber-600"
              }`}>
                {apiMessage || "Local Fallback Active"}
              </span>
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
  );
};
