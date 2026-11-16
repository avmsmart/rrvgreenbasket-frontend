"use client";

import React, { useState, useEffect } from "react";
import { X, Edit2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { EnrichedInventoryItem } from "@/types";

interface UpdateThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EnrichedInventoryItem | null;
  onSuccess: () => void;
}

export const UpdateThresholdModal: React.FC<UpdateThresholdModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const [threshold, setThreshold] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setThreshold(item.inventory.lowStockThreshold ?? 10);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const productName =
    item.product?.name ||
    (item.product as any)?.excelName ||
    `Product (${item.inventory.productPublicId.slice(0, 8)}...)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numThreshold = Number(threshold);
    if (isNaN(numThreshold) || numThreshold < 0) {
      setErrorMessage("Threshold must be a valid non-negative number.");
      return;
    }

    setIsLoading(true);
    try {
      await inventoryService.updateThreshold(
        item.inventory.productPublicId,
        numThreshold
      );
      setSuccessMessage(
        `Threshold updated to ${numThreshold} ${item.inventory.unitOfMeasure} for ${productName}.`
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update threshold.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog / Mobile Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Update Stock Threshold"
        className="relative z-10 w-full max-h-[95dvh] sm:max-h-[92vh] sm:max-w-md bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden border border-slate-200/90 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-3 flex-shrink-0" aria-hidden="true" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Edit2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                Update Stock Threshold
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Configure low stock alert trigger point
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors flex-shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body + Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* Product Info Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="font-bold text-slate-800 truncate">{productName}</span>
              <span className="text-slate-500 font-mono text-[11px] flex-shrink-0">
                Available: {item.inventory.availableQuantity} {item.inventory.unitOfMeasure}
              </span>
            </div>

            {/* Threshold Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Low Stock Alert Level ({item.inventory.unitOfMeasure}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 10"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                When available stock drops to or below this quantity, a LOW_STOCK alert will be triggered automatically.
              </p>
            </div>
          </div>

          {/* Sticky Actions Footer (Mobile Safe-Area + Flexible Buttons) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 pt-3 border-t border-slate-100 bg-slate-50/70 sm:bg-white flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none justify-center px-4 py-2 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none justify-center px-5 py-2 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>Save Threshold</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};