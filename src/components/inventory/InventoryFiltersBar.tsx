"use client";

import React from "react";
import {
  Search,
  Plus,
  Minus,
  FileSpreadsheet,
  AlertTriangle,
  History,
  Sliders,
  Layers,
  RefreshCw,
} from "lucide-react";
import { StockStatus } from "@/types";

interface InventoryFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  selectedInitialized: string;
  onInitializedChange: (val: string) => void;
  activeAlertsCount?: number;
  onOpenStockIn: () => void;
  onOpenStockOut: () => void;
  onOpenAdjustment: () => void;
  onOpenInitialize: () => void;
  onOpenMovements: () => void;
  onOpenAlerts: () => void;
  onExportCsv: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const InventoryFiltersBar: React.FC<InventoryFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedUnit,
  onUnitChange,
  selectedInitialized,
  onInitializedChange,
  activeAlertsCount = 0,
  onOpenStockIn,
  onOpenStockOut,
  onOpenAdjustment,
  onOpenInitialize,
  onOpenMovements,
  onOpenAlerts,
  onExportCsv,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col gap-3.5">
      {/* Top row: Search and Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name, category, or UUID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh inventory data"
              className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          )}

          {/* Alerts Drawer Button */}
          <button
            onClick={onOpenAlerts}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold shadow-3xs flex items-center gap-1.5 transition-colors ${
              activeAlertsCount > 0
                ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeAlertsCount > 0 ? "text-amber-600" : "text-slate-400"}`} />
            <span>Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Movements History Drawer */}
          <button
            onClick={onOpenMovements}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Movements Log</span>
          </button>

          {/* Stock In Button */}
          <button
            onClick={onOpenStockIn}
            className="px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-[#00875a] hover:bg-emerald-100 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Stock In</span>
          </button>

          {/* Stock Out Button */}
          <button
            onClick={onOpenStockOut}
            className="px-3 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>Stock Out</span>
          </button>

          {/* Stock Adjustment Button */}
          <button
            onClick={onOpenAdjustment}
            className="px-3 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Adjustment</span>
          </button>

          {/* Initialize Stock Button */}
          <button
            onClick={onOpenInitialize}
            className="px-4 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Initialize Stock</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExportCsv}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter Selects Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Filters:
        </span>

        {/* Stock Status Filter */}
        <select
          aria-label="Filter inventory by stock status"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="All">All Stock Status</option>
          <option value="IN_STOCK">🟢 In Stock Only</option>
          <option value="LOW_STOCK">⚠️ Low Stock Only</option>
          <option value="OUT_OF_STOCK">✕ Out of Stock Only</option>
        </select>

        {/* Initialization Status Filter */}
        <select
          aria-label="Filter inventory by initialized status"
          value={selectedInitialized}
          onChange={(e) => onInitializedChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="All">All Initialization States</option>
          <option value="true">Initialized Products Only</option>
          <option value="false">Uninitialized Products Only</option>
        </select>

        {/* Unit of Measure Filter */}
        <select
          aria-label="Filter inventory by unit of measure"
          value={selectedUnit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="All">All Units of Measure</option>
          <option value="KG">KG (Kilograms)</option>
          <option value="GRAM">GRAM (Grams)</option>
          <option value="PIECE">PIECE</option>
          <option value="BUNCH">BUNCH</option>
          <option value="PACK">PACK</option>
          <option value="DOZEN">DOZEN</option>
          <option value="LITRE">LITRE</option>
          <option value="ML">ML</option>
        </select>
      </div>
    </div>
  );
};
