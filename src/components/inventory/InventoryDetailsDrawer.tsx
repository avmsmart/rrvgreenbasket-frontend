"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Sliders,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Product } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";
import { getCurrencySymbol } from "@/data/shared-store";

interface InventoryDetailsDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInwardModal?: (product: Product) => void;
  lowStockThreshold?: number;
}

export const InventoryDetailsDrawer: React.FC<InventoryDetailsDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onOpenInwardModal,
  lowStockThreshold = 10,
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

  if (!isOpen || !product) return null;

  const minThreshold = product.minStock || lowStockThreshold;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= minThreshold;
  const valuation = product.stock * product.price;

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
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-[#00875a] flex items-center justify-center shadow-3xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {product.erpCode || product.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOutOfStock
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : isLowStock
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock Alert" : "Optimal Stock"}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Inventory Stock Details
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
          {/* Main Visual & Item Names */}
          <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200/80">
            <ProduceImage
              name={product.name}
              src={product.imageUrl}
              size={64}
              className="rounded-2xl shadow-sm border border-slate-200/90"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[#00875a] uppercase tracking-wider">
                {product.category}
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {product.excelName || product.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ERP Title: {product.name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                  Unit: {product.unit}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
                  Code: {product.erpCode || product.id}
                </span>
              </div>
            </div>
          </div>

          {/* Current Stock Metrics */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Real-Time Warehouse Stock</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Available On Hand
                </span>
                <span
                  className={`text-xl font-black block mt-0.5 ${
                    isOutOfStock
                      ? "text-rose-600"
                      : isLowStock
                      ? "text-amber-600"
                      : "text-emerald-800"
                  }`}
                >
                  {product.stock} {product.unit}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Min Reorder Level
                </span>
                <span className="text-xl font-black text-slate-800 block mt-0.5">
                  {minThreshold} {product.unit}
                </span>
              </div>
            </div>

            {/* Threshold Status Alert */}
            {isOutOfStock ? (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Zero stock available! Immediate purchase order / inward required.</span>
              </div>
            ) : isLowStock ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Stock is below threshold ({product.stock} ≤ {minThreshold} {product.unit}). Reorder recommended.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#eaf8f0] border border-[#bbf7d0] text-[#00875a] text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#00875a] shrink-0" />
                <span>Stock level is healthy and ready for dispatch.</span>
              </div>
            )}
          </div>

          {/* Stock Valuation & Pricing */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Valuation &amp; Procurement Rates</span>
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Unit Price (Revised)</span>
                <span className="font-bold text-slate-900">
                  {currencySymbol} {product.price.toFixed(2)} / {product.unit}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Total Batch Valuation</span>
                <span className="text-sm font-black text-[#00875a]">
                  {currencySymbol} {valuation.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Category Tag</span>
                <span className="font-semibold text-slate-800">{product.category}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">HSN Classification</span>
                <span className="font-mono text-slate-700">{product.hsnCode || "07099990"}</span>
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

          {onOpenInwardModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInwardModal(product);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold transition-all shadow-3xs flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Inward / Adjust Stock</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
