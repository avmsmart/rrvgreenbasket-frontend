"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Layers,
} from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { StockMovementResponse, StockMovementsQueryParams } from "@/types";

interface StockMovementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productPublicId?: string;
  productName?: string;
}

export const StockMovementsDrawer: React.FC<StockMovementsDrawerProps> = ({
  isOpen,
  onClose,
  productPublicId,
  productName,
}) => {
  const [movements, setMovements] = useState<StockMovementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 15;

  const loadMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: StockMovementsQueryParams = {
        page: currentPage,
        size: pageSize,
        sort: "createdAt,desc",
      };
      if (productPublicId) {
        params.productPublicId = productPublicId;
      }
      if (selectedType !== "All") {
        params.movementType = selectedType;
      }

      const res = await inventoryService.getStockMovements(params);
      setMovements(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error("Failed to load stock movements:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productPublicId, selectedType, currentPage]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      loadMovements();
    }
  }, [isOpen, loadMovements]);

  if (!isOpen) return null;

  const getMovementBadge = (type: string) => {
    const upper = (type || "").toUpperCase();
    if (upper === "STOCK_IN" || upper === "INITIAL_STOCK") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowDownRight className="w-3 h-3 text-emerald-600" />
          <span>{upper}</span>
        </span>
      );
    }
    if (upper === "STOCK_OUT" || upper === "RESERVATION") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ArrowUpRight className="w-3 h-3 text-rose-600" />
          <span>{upper}</span>
        </span>
      );
    }
    if (upper === "ADJUSTMENT" || upper === "INITIAL_CORRECTION") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <span>{upper}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
        {upper}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Stock Movements Audit Log
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {productName ? `Audit ledger for ${productName}` : "Master warehouse inventory transaction trail"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadMovements}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Type:</span>
            <select
              aria-label="Filter Movements by Type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="All">All Movement Types</option>
              <option value="STOCK_IN">STOCK_IN (Inward)</option>
              <option value="STOCK_OUT">STOCK_OUT (Deduction)</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
              <option value="INITIAL_STOCK">INITIAL_STOCK</option>
              <option value="INITIAL_CORRECTION">INITIAL_CORRECTION</option>
              <option value="RESERVATION">RESERVATION</option>
              <option value="RELEASE">RELEASE</option>
              <option value="CONFIRMATION">CONFIRMATION</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Total Logged Events: <strong>{totalElements}</strong>
          </span>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl w-full" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Movements Recorded</p>
              <p className="text-xs text-slate-400">
                There are no stock movements recorded matching your criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/90 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-center">Physical (B → A)</th>
                    <th className="py-2.5 px-3 text-center">Avail (B → A)</th>
                    <th className="py-2.5 px-3">Reason &amp; Ref</th>
                    <th className="py-2.5 px-3">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {movements.map((m) => {
                    const isPositive =
                      m.movementType === "STOCK_IN" ||
                      m.movementType === "INITIAL_STOCK" ||
                      m.movementType === "RELEASE";

                    return (
                      <tr key={m.publicId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {new Date(m.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3">{getMovementBadge(m.movementType)}</td>
                        <td className="py-2.5 px-3 text-right font-black">
                          <span className={isPositive ? "text-emerald-700" : "text-slate-800"}>
                            {isPositive ? "+" : ""}
                            {m.quantity} {m.unitOfMeasure}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {m.physicalQuantityBefore} →{" "}
                          <strong className="text-slate-900">{m.physicalQuantityAfter}</strong>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {m.availableQuantityBefore} →{" "}
                          <strong className="text-slate-900">{m.availableQuantityAfter}</strong>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">{m.reason}</div>
                          {m.referenceId && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              Ref: {m.referenceId}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                          {m.performedBy || "SYSTEM"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-100"
            >
              Previous
            </button>
            <button
              disabled={currentPage + 1 >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
