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
import { EnrichedInventoryItem } from "@/types";
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
    <div className="space-y-4">
      {/* 1. DESKTOP TABLE VIEW (Visible on >= md screens) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
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
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {sNo}
                    </td>

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

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px]">
                        {inv.unitOfMeasure || "KG"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {isInitialized ? `${inv.physicalQuantity} ${inv.unitOfMeasure}` : "—"}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-semibold ${
                          inv.reservedQuantity > 0 ? "text-amber-600 font-bold" : "text-slate-400"
                        }`}
                      >
                        {isInitialized ? `${inv.reservedQuantity} ${inv.unitOfMeasure}` : "—"}
                      </span>
                    </td>

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

                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(inv.stockStatus, isInitialized)}
                    </td>

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

                            <button
                              onClick={() =>
                                setActiveMenuId(activeMenuId === inv.publicId ? null : inv.publicId)
                              }
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>

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
      </div>

      {/* 2. MOBILE RESPONSIVE SEPARATED CARDS (Visible on < md screens) */}
      <div className="md:hidden space-y-3">
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
            <div
              key={inv.publicId || inv.productPublicId || idx}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-3xs flex flex-col justify-between space-y-3 transition-all hover:border-emerald-300"
            >
              {/* SECTION 1: Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                    #{sNo}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100 truncate">
                    {categoryName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold px-1.5 py-0.5 bg-slate-100 rounded shrink-0">
                    {inv.unitOfMeasure || "KG"}
                  </span>
                </div>
                {getStatusBadge(inv.stockStatus, isInitialized)}
              </div>

              {/* SECTION 2: Product Info */}
              <div className="flex items-center gap-3">
                <ProduceImage name={productName} src={productImage} size={44} />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                    {productName}
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">
                    ID: {inv.productPublicId.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* SECTION 3: Quantity Details */}
              {isInitialized ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">Physical</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">
                      {inv.physicalQuantity}
                    </span>
                  </div>
                  <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">Reserved</span>
                    <span
                      className={`text-xs font-bold mt-0.5 block ${
                        inv.reservedQuantity > 0 ? "text-amber-600 font-black" : "text-slate-400"
                      }`}
                    >
                      {inv.reservedQuantity}
                    </span>
                  </div>
                  <div
                    className={`p-2 rounded-2xl border ${
                      isOut
                        ? "bg-rose-50 border-rose-200"
                        : isLowStock
                        ? "bg-amber-50 border-amber-200"
                        : "bg-emerald-50 border-[#bbf7d0]"
                    }`}
                  >
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">Available</span>
                    <span
                      className={`text-xs font-black mt-0.5 block ${
                        isOut ? "text-rose-600" : isLowStock ? "text-amber-700" : "text-[#00875a]"
                      }`}
                    >
                      {inv.availableQuantity}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Threshold:</span>
                  <span className="text-xs font-bold text-slate-700">
                    {inv.lowStockThreshold} {inv.unitOfMeasure}
                  </span>
                </div>
              )}

              {/* SECTION 4: Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                {!isInitialized ? (
                  <button
                    onClick={() => onInitialize(entry)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Initialize Stock</span>
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onStockIn(entry)}
                        title="Stock In (+)"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#00875a] text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>In</span>
                      </button>
                      <button
                        onClick={() => onStockOut(entry)}
                        title="Stock Out (-)"
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Out</span>
                      </button>
                      <button
                        onClick={() => onAdjust(entry)}
                        title="Stock Adjustment (+/-)"
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </div>

                    <div className="relative inline-block text-left">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === inv.publicId ? null : inv.publicId)
                        }
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === inv.publicId && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-30 text-left">
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
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 text-center sm:text-left">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{totalElements}</strong> tracked items
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs cursor-pointer"
          >
            Previous
          </button>
          <span className="font-bold text-slate-700 px-2">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage + 1 >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;