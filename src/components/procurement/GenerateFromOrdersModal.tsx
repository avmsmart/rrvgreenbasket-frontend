"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, ShoppingBag, Scale, IndianRupee } from "lucide-react";

interface GenerateFromOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetDate: string;
}

export const GenerateFromOrdersModal: React.FC<GenerateFromOrdersModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetDate,
}) => {
  const [bufferPercent, setBufferPercent] = useState<number>(5);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eefcf2] text-[#00875a] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-[#00875a]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Generate Procurement from Orders
              </h2>
              <p className="text-xs text-slate-500">
                Mandi aggregation engine for {targetDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#eefcf2] border border-[#bbf7d0] text-xs text-[#00875a] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Order Cutoff Reached:</strong> Successfully parsed 24
              confirmed customer orders placed before the 10:00 PM cutoff window.
            </div>
          </div>

          {/* Aggregated Totals Preview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <ShoppingBag className="w-4 h-4 text-[#00875a] mx-auto mb-1" />
              <div className="text-lg font-black text-slate-900">35</div>
              <div className="text-[11px] font-semibold text-slate-500">Items</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <Scale className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-lg font-black text-slate-900">420 kg</div>
              <div className="text-[11px] font-semibold text-slate-500">Weight</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <IndianRupee className="w-4 h-4 text-teal-600 mx-auto mb-1" />
              <div className="text-lg font-black text-slate-900">₹ 28,450</div>
              <div className="text-[11px] font-semibold text-slate-500">Est. Cost</div>
            </div>
          </div>

          {/* Wastage / Sorting Buffer */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Wastage & Grading Safety Buffer</span>
              <span className="text-[#00875a]">+{bufferPercent}% Buffer</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={bufferPercent}
              onChange={(e) => setBufferPercent(Number(e.target.value))}
              className="w-full accent-[#00875a] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Automatically adjusts Mandi purchases to prevent morning delivery shortages.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#00875a] hover:bg-[#00704a] rounded-xl transition-all shadow-3xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? "Consolidating..." : "Consolidate & Apply Plan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
