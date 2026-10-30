"use client";

import React from "react";
import { Download, X, CheckSquare, FileText } from "lucide-react";

interface SelectionToolbarProps {
  selectedCount: number;
  entityName: string; // e.g. "orders", "procurement records", "packing orders", "deliveries", "customers", "delivery partners", "payments"
  onExportSelected: () => void;
  onExportPdf?: () => void;
  onClearSelection: () => void;
  isExporting?: boolean;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  entityName,
  onExportSelected,
  onExportPdf,
  onClearSelection,
  isExporting = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/90 rounded-2xl text-xs shadow-3xs animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2 text-emerald-950 font-bold">
        <div className="w-5 h-5 rounded-lg bg-[#00875a] text-white flex items-center justify-center shrink-0 shadow-3xs">
          <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span>
          <span className="font-black text-slate-900">{selectedCount}</span>{" "}
          {selectedCount === 1 ? entityName.replace(/s$/, "") : entityName} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* PDF Download Button (Preferred by User) */}
        {onExportPdf && (
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold transition-all shadow-3xs active:scale-95 disabled:opacity-50"
            title="Download selected records as PDF document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        )}

        {/* CSV Export Button */}
        <button
          type="button"
          onClick={onExportSelected}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#00875a] border border-emerald-300 font-bold transition-all shadow-3xs hover:border-[#00875a] active:scale-95 disabled:opacity-50"
          title="Export selected records to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200 font-semibold transition-all active:scale-95"
          title="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};
