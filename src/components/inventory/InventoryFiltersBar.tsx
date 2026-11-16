"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Upload,
  AlertTriangle,
  History,
  Sliders,
  Layers,
  RefreshCw,
  ChevronDown,
  Check,
} from "lucide-react";

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

const STATUS_OPTIONS = [
  { label: "All Stock Status", value: "All" },
  { label: "🟢 In Stock Only", value: "IN_STOCK" },
  { label: "⚠️ Low Stock Only", value: "LOW_STOCK" },
  { label: "✕ Out of Stock Only", value: "OUT_OF_STOCK" },
];

const INIT_OPTIONS = [
  { label: "All Initialization States", value: "All" },
  { label: "Initialized Products Only", value: "true" },
  { label: "Uninitialized Products Only", value: "false" },
];

const UNIT_OPTIONS = [
  { label: "All Units of Measure", value: "All" },
  { label: "KG (Kilograms)", value: "KG" },
  { label: "GRAM (Grams)", value: "GRAM" },
  { label: "PIECE", value: "PIECE" },
  { label: "BUNCH", value: "BUNCH" },
  { label: "PACK", value: "PACK" },
  { label: "DOZEN", value: "DOZEN" },
  { label: "LITRE", value: "LITRE" },
  { label: "ML", value: "ML" },
];

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
  // Dropdown states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isInitOpen, setIsInitOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const initRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (initRef.current && !initRef.current.contains(event.target as Node)) {
        setIsInitOpen(false);
      }
      if (unitRef.current && !unitRef.current.contains(event.target as Node)) {
        setIsUnitOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStatusLabel =
    STATUS_OPTIONS.find((o) => o.value === selectedStatus)?.label || "All Stock Status";
  const currentInitLabel =
    INIT_OPTIONS.find((o) => o.value === selectedInitialized)?.label || "All Initialization States";
  const currentUnitLabel =
    UNIT_OPTIONS.find((o) => o.value === selectedUnit)?.label || "All Units of Measure";

  return (
    <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col gap-3">
      {/* Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name, category, or UUID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Desktop Action Buttons (lg and up) */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh inventory data"
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          )}

          <button
            onClick={onOpenAlerts}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors ${
              activeAlertsCount > 0
                ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeAlertsCount > 0 ? "text-amber-600" : "text-slate-400"}`} />
            <span>Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black leading-none">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenMovements}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Movements Log</span>
          </button>

          <button
            onClick={onOpenStockIn}
            className="px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-[#00875a] hover:bg-emerald-100 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Stock In</span>
          </button>

          <button
            onClick={onOpenStockOut}
            className="px-3 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>Stock Out</span>
          </button>

          <button
            onClick={onOpenAdjustment}
            className="px-3 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Adjustment</span>
          </button>

          <button
            onClick={onOpenInitialize}
            className="px-4 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Initialize Stock</span>
          </button>

          {/* Desktop Export Green Icon Button */}
          <button
            onClick={onExportCsv}
            title="Export to CSV"
            aria-label="Export to CSV"
            className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 shadow-sm flex items-center justify-center transition-all active:scale-95"
          >
            <Upload className="w-4 h-4 text-[#00875a] stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Mobile Primary Actions — 2x2 grid (below lg) */}
      <div className="lg:hidden grid grid-cols-2 gap-2">
        <button
          onClick={onOpenStockIn}
          className="px-3 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-[#00875a] hover:bg-emerald-100 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Stock In</span>
        </button>

        <button
          onClick={onOpenStockOut}
          className="px-3 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 hover:bg-rose-100 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <Minus className="w-4 h-4" />
          <span>Stock Out</span>
        </button>

        <button
          onClick={onOpenAdjustment}
          className="px-3 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700 hover:bg-blue-100 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sliders className="w-4 h-4" />
          <span>Adjust</span>
        </button>

        <button
          onClick={onOpenInitialize}
          className="px-3 py-2.5 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-[11px] font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5"
        >
          <Layers className="w-4 h-4" />
          <span>Initialize</span>
        </button>
      </div>

      {/* Mobile Secondary Actions — Clean Row without horizontal scroll */}
      <div className="lg:hidden flex items-center gap-2 pt-1 border-t border-slate-100">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh inventory data"
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        )}

        <button
          onClick={onOpenAlerts}
          className={`flex-1 py-2 px-2.5 rounded-2xl border text-[11px] font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors ${
            activeAlertsCount > 0
              ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? "text-amber-600" : "text-slate-400"}`} />
          <span>Alerts</span>
          {activeAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
              {activeAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenMovements}
          className="flex-1 py-2 px-2.5 rounded-2xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-indigo-600" />
          <span>Movements</span>
        </button>

        {/* Mobile Green Export Icon (Image Match) */}
        <button
          onClick={onExportCsv}
          title="Export CSV"
          aria-label="Export CSV"
          className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 shadow-sm flex items-center justify-center transition-all shrink-0 active:scale-95"
        >
          <Upload className="w-4 h-4 text-[#00875a] stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Dropdowns — Exactly like Image 2 */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100">
        <span className="hidden sm:block text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Filters:
        </span>

        {/* 1. Status Custom Dropdown */}
        <div className="relative w-full sm:w-auto" ref={statusRef}>
          <button
            type="button"
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsInitOpen(false);
              setIsUnitOpen(false);
            }}
            className="w-full sm:w-auto min-w-[170px] flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 hover:bg-white active:bg-slate-100 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-left"
          >
            <span className="truncate">{currentStatusLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                isStatusOpen ? "rotate-180 text-emerald-600" : ""
              }`}
            />
          </button>

          {isStatusOpen && (
            <div className="absolute left-0 mt-1.5 w-full sm:w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = selectedStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onStatusChange(opt.value);
                      setIsStatusOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-semibold"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Initialized Custom Dropdown */}
        <div className="relative w-full sm:w-auto" ref={initRef}>
          <button
            type="button"
            onClick={() => {
              setIsInitOpen(!isInitOpen);
              setIsStatusOpen(false);
              setIsUnitOpen(false);
            }}
            className="w-full sm:w-auto min-w-[190px] flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 hover:bg-white active:bg-slate-100 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-left"
          >
            <span className="truncate">{currentInitLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                isInitOpen ? "rotate-180 text-emerald-600" : ""
              }`}
            />
          </button>

          {isInitOpen && (
            <div className="absolute left-0 mt-1.5 w-full sm:w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              {INIT_OPTIONS.map((opt) => {
                const isSelected = selectedInitialized === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onInitializedChange(opt.value);
                      setIsInitOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-semibold"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Unit Custom Dropdown */}
        <div className="relative w-full sm:w-auto" ref={unitRef}>
          <button
            type="button"
            onClick={() => {
              setIsUnitOpen(!isUnitOpen);
              setIsStatusOpen(false);
              setIsInitOpen(false);
            }}
            className="w-full sm:w-auto min-w-[180px] flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 hover:bg-white active:bg-slate-100 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-left"
          >
            <span className="truncate">{currentUnitLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                isUnitOpen ? "rotate-180 text-emerald-600" : ""
              }`}
            />
          </button>

          {isUnitOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-full sm:w-56 max-h-60 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              {UNIT_OPTIONS.map((opt) => {
                const isSelected = selectedUnit === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onUnitChange(opt.value);
                      setIsUnitOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-semibold"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryFiltersBar;