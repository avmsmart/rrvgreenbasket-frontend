"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Edit3,
  Box,
  Tag,
  Hash,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Product } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";
import { getCurrencySymbol } from "@/data/shared-store";

interface ProductDetailsDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
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

  const quotRate = product.originalPrice || product.price;
  const revisedRate = product.price;
  const isDiscounted = quotRate > revisedRate;
  const diff = quotRate - revisedRate;

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
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {product.erpCode || product.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.status === "In Stock"
                      ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                      : product.status === "Low Stock"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Product Details
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
          {/* Main Visual & Names */}
          <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200/80">
            <ProduceImage
              name={product.name}
              src={product.imageUrl}
              size={72}
              className="rounded-2xl shadow-sm border border-slate-200/90"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[#00875a] uppercase tracking-wider">
                {product.category}
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {product.excelName || product.name}
              </h3>
              {product.excelName && product.name !== product.excelName && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  ERP Title: {product.name}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                  UOM: {product.unit}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
                  HSN: {product.hsnCode || "07099990"}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Pricing & Rate Revision</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Quotation Rate
                </span>
                <span className="text-sm font-bold text-slate-600 line-through">
                  {currencySymbol} {quotRate.toFixed(2)} / {product.unit}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-[11px] font-bold text-emerald-800 block">
                  SRM Revised Rate
                </span>
                <span className="text-base font-black text-[#00875a]">
                  {currencySymbol} {revisedRate.toFixed(2)} / {product.unit}
                </span>
              </div>
            </div>

            {isDiscounted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>
                  Save {currencySymbol} {diff.toFixed(2)} per {product.unit} vs quoted rate
                </span>
              </div>
            )}
          </div>

          {/* Stock & Inventory Levels */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Warehouse Stock Levels</span>
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Current Stock
                </span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  {product.stock} {product.unit}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Min Threshold
                </span>
                <span className="text-base font-black text-slate-700 block mt-0.5">
                  {product.minStock || 10} {product.unit}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Stock Value
                </span>
                <span className="text-base font-black text-[#00875a] block mt-0.5">
                  {currencySymbol} {(product.stock * product.price).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Stock Availability Ratio</span>
                <span
                  className={
                    product.stock <= (product.minStock || 10)
                      ? "text-amber-600 font-bold"
                      : "text-emerald-700 font-bold"
                  }
                >
                  {product.stock > 0
                    ? `${Math.min(100, Math.round((product.stock / ((product.minStock || 10) * 4)) * 100))}%`
                    : "0%"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(5, (product.stock / ((product.minStock || 10) * 4)) * 100)
                    )}%`,
                  }}
                  className={`h-full rounded-full transition-all ${
                    product.stock === 0
                      ? "bg-rose-500"
                      : product.stock <= (product.minStock || 10)
                      ? "bg-amber-500"
                      : "bg-[#00875a]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ERP Technical Specifications */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#00875a]" />
              <span>ERP Technical Meta</span>
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">ERP Item ID</span>
                <span className="font-mono font-bold text-slate-800">{product.id}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">ERP Product Code</span>
                <span className="font-mono font-bold text-[#00875a]">
                  {product.erpCode || product.id}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">HSN Classification</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {product.hsnCode || "07099990"}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">Procurement Category</span>
                <span className="font-semibold text-slate-800">{product.category}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">Default UOM</span>
                <span className="font-semibold text-slate-800">{product.unit}</span>
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
                onEdit(product);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold transition-all shadow-3xs flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Product &amp; Rates</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
