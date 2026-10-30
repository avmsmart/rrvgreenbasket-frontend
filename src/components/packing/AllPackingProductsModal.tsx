"use client";

import React, { useState } from "react";
import { X, Package, Search, Filter, ChevronRight, CheckCircle2 } from "lucide-react";
import { TopPackingProduct, PackingOrder } from "@/types";
import { ProduceImage } from "@/components/common";

interface AllPackingProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topProducts: TopPackingProduct[];
  selectedDate: string;
  onFilterByProduct?: (productName: string) => void;
}

export const AllPackingProductsModal: React.FC<AllPackingProductsModalProps> = ({
  isOpen,
  onClose,
  topProducts,
  selectedDate,
  onFilterByProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filtered = topProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const totalOrders = topProducts.reduce((sum, p) => sum + (p.ordersCount || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eefcf2] text-[#00875a] flex items-center justify-center shadow-3xs">
              <Package className="w-5 h-5 text-[#00875a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  All Products to Pack Today
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  {topProducts.length} Items
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidated packing requirements for <span className="font-semibold text-slate-700">{selectedDate}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name (e.g. Tomato, Potato, Onion)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Total Demand: <strong className="text-slate-900">{totalOrders} order items</strong>
          </span>
        </div>

        {/* Products List */}
        <div className="p-6 space-y-2.5 overflow-y-auto max-h-[60vh]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No products matching search</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword</p>
            </div>
          ) : (
            filtered.map((product, idx) => (
              <div
                key={product.name}
                className="p-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/80 hover:border-slate-200 transition-all flex items-center justify-between gap-3 shadow-3xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <ProduceImage name={product.name} size={40} className="rounded-xl shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Category: <span className="font-semibold text-slate-700">{product.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                      {product.ordersCount} orders
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      High Demand
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Showing all high-demand produce items for today&apos;s packing schedule.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
