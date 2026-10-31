"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  Edit3,
  Star,
  Package,
  ShoppingBag,
  TrendingUp,
  Tag,
  Hash,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Sector } from "@/types/sector";
import { getCurrencySymbol } from "@/data/shared-store";

interface SectorDetailsDrawerProps {
  sector: Sector | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (sector: Sector) => void;
  onToggleStatus?: (id: string) => void;
  onToggleFeatured?: (id: string) => void;
}

export const SectorDetailsDrawer: React.FC<SectorDetailsDrawerProps> = ({
  sector,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onToggleFeatured,
}) => {
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol());
    const onSettingsUpdate = () => {
      setCurrencySymbol(getCurrencySymbol());
    };
    window.addEventListener("rrv:settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("rrv:settings:updated", onSettingsUpdate);
  }, []);

  if (!isOpen || !sector) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-[#00875a] flex items-center justify-center text-xl shadow-3xs overflow-hidden">
              {sector.image ? (
                <img src={sector.image} alt={sector.name} className="w-full h-full object-cover" />
              ) : (
                <span>{sector.icon || "📦"}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {sector.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sector.status === "Active"
                      ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {sector.status}
                </span>
                {sector.isFeatured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span>Featured</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Sector / Category Details
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Visual & Title Card */}
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-3xs overflow-hidden">
                {sector.image ? (
                  <img src={sector.image} alt={sector.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{sector.icon || "📦"}</span>
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#00875a] uppercase tracking-wider">
                  Store Sector #{sector.displayOrder}
                </span>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {sector.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {sector.description || "Active catalog sector for consumer ordering and procurement categorization."}
                </p>
              </div>
            </div>
          </div>

          {/* Performance & Revenue Metrics */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Sector Performance &amp; Orders</span>
            </h4>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Products
                </span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  {sector.productsCount || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Orders
                </span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  {sector.totalOrders || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Total Revenue
                </span>
                <span className="text-base font-black text-[#00875a] block mt-0.5">
                  {currencySymbol} {(sector.revenue || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration & Meta */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Sector Settings &amp; Display Rules</span>
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Sector ID</span>
                <span className="font-mono font-bold text-slate-800">{sector.id}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Display Priority Order</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 font-bold text-slate-800 text-xs">
                  {sector.displayOrder || 0}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">App Home Screen Featured</span>
                <button
                  type="button"
                  onClick={() => onToggleFeatured && onToggleFeatured(sector.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    sector.isFeatured
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  <Star className={`w-3 h-3 ${sector.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>{sector.isFeatured ? "Featured" : "Standard"}</span>
                </button>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Visibility Status</span>
                <button
                  type="button"
                  onClick={() => onToggleStatus && onToggleStatus(sector.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    sector.status === "Active"
                      ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {sector.status === "Active" ? "Active (Online)" : "Inactive (Hidden)"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
          >
            Close
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(sector);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold transition-all shadow-3xs flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Sector</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
