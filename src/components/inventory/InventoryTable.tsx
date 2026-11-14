"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Sliders,
  History,
  Edit2,
  Layers,
  ShoppingBag,
  MoreVertical,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { EnrichedInventoryItem, StockStatus } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";

interface InventoryTableProps {
  items: EnrichedInventoryItem[];
  isLoading?: boolean;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onStockIn: (item: EnrichedInventoryItem) => void;
  onStockOut: (item: EnrichedInventoryItem) => void;
  onAdjust: (item: EnrichedInventoryItem) => void;
  onInitialize: (item: EnrichedInventoryItem) => void;
  onUpdateThreshold: (item: EnrichedInventoryItem) => void;
  onCorrectInitial: (item: EnrichedInventoryItem) => void;
  onViewMovements: (item: EnrichedInventoryItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  isLoading = false,
  currentPage,
  pageSize,
  totalElements,
  onPageChange,
  onStockIn,
  onStockOut,
  onAdjust,
  onInitialize,
  onUpdateThreshold,
  onCorrectInitial,
  onViewMovements,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const getStatusBadge = (status: string, initialized?: boolean) => {
    if (initialized === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Not Initialized</span>
        </span>
      );
    }
    const upper = (status || "").toUpperCase();
    if (upper === "IN_STOCK" || upper === "IN STOCK") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]">
          <CheckCircle2 className="w-3 h-3" />
          <span>In Stock</span>
        </span>
      );
    }
    if (upper === "LOW_STOCK" || upper === "LOW STOCK") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          <span>Low Stock</span>
        </span>
      );
    }
    if (upper === "NOT_INITIALIZED" || upper === "UNINITIALIZED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Not Initialized</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
        <XCircle className="w-3 h-3" />
        <span>Out of Stock</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-3xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Inventory Records Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No inventory stock records match your selected criteria. Try adjusting your search query or filters above.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold text-center w-12">S.No</th>
              <th className="py-3.5 px-4 font-bold">Product Item</th>
              <th className="py-3.5 px-4 font-bold text-center">Unit</th>
              <th className="py-3.5 px-4 font-bold text-center">Physical</th>
              <th className="py-3.5 px-4 font-bold text-center">Reserved</th>
              <th className="py-3.5 px-4 font-bold text-center">Available</th>
              <th className="py-3.5 px-4 font-bold text-center">Threshold</th>
              <th className="py-3.5 px-4 font-bold text-center">Status</th>
              <th className="py-3.5 px-4 font-bold text-center">Initialized</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {items.map((entry, idx) => {
              const inv = entry.inventory;
              const prod = entry.product;
              const sNo = currentPage * pageSize + idx + 1;

              const productName =
                prod?.name ||
                (prod as any)?.excelName ||
                `Product (${inv.productPublicId.slice(0, 8)}...)`;

              const categoryName =
                typeof prod?.category === "string"
                  ? prod.category
                  : (prod?.category as any)?.name || "Produce";

              const productImage =
                (prod as any)?.imageUrl ||
                (prod as any)?.image ||
                (prod as any)?.images?.[0]?.imageUrl;

              const isInitialized = inv.initialized;
              const isLowStock = inv.availableQuantity <= inv.lowStockThreshold;
              const isOut = inv.availableQuantity <= 0;

              return (
                <tr
                  key={inv.publicId || inv.productPublicId || idx}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* S.No */}
                  <td className="py-3 px-4 text-center font-bold text-slate-400">
                    {sNo}
                  </td>

                  {/* Product Details */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <ProduceImage
                        name={productName}
                        src={productImage}
                        size={36}
                      />
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-[#00875a] transition-colors line-clamp-1">
                          {productName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {categoryName}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 px-1 py-0.2 bg-slate-100 rounded">
                            {inv.productPublicId.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Unit of Measure */}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px]">
                      {inv.unitOfMeasure || "KG"}
                    </span>
                  </td>

                  {/* Physical Quantity */}
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {isInitialized ? `${inv.physicalQuantity} ${inv.unitOfMeasure}` : "—"}
                  </td>

                  {/* Reserved Quantity */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-semibold ${
                        inv.reservedQuantity > 0 ? "text-amber-600 font-bold" : "text-slate-400"
                      }`}
                    >
                      {isInitialized ? `${inv.reservedQuantity} ${inv.unitOfMeasure}` : "—"}
                    </span>
                  </td>

                  {/* Available Quantity */}
                  <td className="py-3 px-4 text-center">
                    {isInitialized ? (
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl inline-block ${
                          isOut
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : isLowStock
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-[#00875a] border border-[#bbf7d0]"
                        }`}
                      >
                        {inv.availableQuantity} {inv.unitOfMeasure}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded-lg bg-slate-100">
                        Uninitialized
                      </span>
                    )}
                  </td>

                  {/* Low Stock Threshold */}
                  <td className="py-3 px-4 text-center">
                    {isInitialized ? (
                      <button
                        onClick={() => onUpdateThreshold(entry)}
                        title="Click to update threshold"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold group/btn"
                      >
                        <span>{inv.lowStockThreshold} {inv.unitOfMeasure}</span>
                        <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-100 transition-opacity text-slate-400" />
                      </button>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">
                        {inv.lowStockThreshold} {inv.unitOfMeasure}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(inv.stockStatus, isInitialized)}
                  </td>

                  {/* Initialized Badge */}
                  <td className="py-3 px-4 text-center">
                    {isInitialized ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Yes</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>No</span>
                      </span>
                    )}
                  </td>

                  {/* Actions Dropdown / Buttons */}
                  <td className="py-3 px-4 text-right">
                    {!isInitialized ? (
                      <button
                        onClick={() => onInitialize(entry)}
                        className="px-2.5 py-1 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-[11px] font-bold shadow-3xs transition-colors"
                      >
                        Initialize
                      </button>
                    ) : (
                      <div className="relative inline-block text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onStockIn(entry)}
                            title="Stock In (+)"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#00875a] border border-emerald-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onStockOut(entry)}
                            title="Stock Out (-)"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onAdjust(entry)}
                            title="Stock Adjustment (+/-)"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* More Options Dropdown Toggle */}
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === inv.publicId ? null : inv.publicId)
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Dropdown Menu */}
                        {activeMenuId === inv.publicId && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-30 text-left">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onViewMovements(entry);
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <History className="w-4 h-4 text-indigo-600" />
                                <span>Movements History</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onUpdateThreshold(entry);
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4 text-slate-600" />
                                <span>Update Threshold</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onCorrectInitial(entry);
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 border-t border-slate-100"
                              >
                                <ShieldAlert className="w-4 h-4 text-amber-600" />
                                <span>Correct Initial Stock</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
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
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{totalElements}</strong> tracked items
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs"
          >
            Previous
          </button>
          <span className="font-bold text-slate-700 px-2">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage + 1 >= totalPages}
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
