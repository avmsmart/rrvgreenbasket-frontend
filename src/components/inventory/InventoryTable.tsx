"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";

interface InventoryTableProps {
  items: Product[];
  onAdjustStock: (productId: string, delta: number) => void;
  onOpenInwardModal: (product: Product) => void;
  onViewItem?: (product: Product) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onAdjustStock,
  onOpenInwardModal,
  onViewItem,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-3xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Inventory Items Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No stock items match your search. Adjust or clear the filters above.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-bold text-center w-12">S.No</th>
              <th className="py-3 px-4 font-bold">Product Item</th>
              <th className="py-3 px-4 font-bold font-mono">ERP Code</th>
              <th className="py-3 px-4 font-bold">Category</th>
              <th className="py-3 px-4 font-bold text-center">Unit</th>
              <th className="py-3 px-4 font-bold text-center">Current Stock</th>
              <th className="py-3 px-4 font-bold text-center">Min Threshold</th>
              <th className="py-3 px-4 font-bold text-center">Status</th>
              <th className="py-3 px-4 font-bold text-right">Quick Adjust</th>
              <th className="py-3 px-4 font-bold text-right">Batch Inward</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {items.map((p, idx) => {
              const sNo = (currentPage - 1) * pageSize + idx + 1;
              const isLowStock = p.stock <= (p.minStock || 10);
              const isOut = p.stock === 0;

              return (
                <tr
                  key={p.id}
                  onClick={() => (onViewItem ? onViewItem(p) : onOpenInwardModal(p))}
                  title="Click to view full inventory and stock details"
                  className="border-l-4 border-transparent hover:border-[#00875a] hover:bg-[#eefcf2]/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 text-center font-bold text-slate-400">
                    {sNo}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <ProduceImage name={p.name} src={p.imageUrl} size={32} />
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-[#00875a] transition-colors">
                          {p.excelName || p.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.name !== p.excelName ? p.name : p.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {p.erpCode || p.id}
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-semibold">
                    {p.category}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px]">
                      {p.unit}
                    </span>
                  </td>

                  {/* Current Stock */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                        isOut
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : isLowStock
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-[#00875a] border border-[#bbf7d0]"
                      }`}
                    >
                      {p.stock} {p.unit}
                    </span>
                  </td>

                  {/* Min Threshold */}
                  <td className="py-3 px-4 text-center text-slate-500 font-semibold">
                    {p.minStock || 10} {p.unit}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        <span>Out of Stock</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>In Stock</span>
                      </span>
                    )}
                  </td>

                  {/* Quick Adjust Buttons */}
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                      <button
                        onClick={() => onAdjustStock(p.id, -5)}
                        disabled={p.stock <= 0}
                        title="Deduct 5"
                        className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onAdjustStock(p.id, 5)}
                        title="Add 5"
                        className="p-1 rounded-lg hover:bg-white text-[#00875a] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Batch Inward */}
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onOpenInwardModal(p)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[#00875a] hover:bg-emerald-50 text-[11px] font-bold shadow-3xs transition-colors"
                    >
                      + Inward Batch
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> tracked items
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs"
          >
            Previous
          </button>
          <span className="font-bold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
