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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Update Stock Threshold</h3>
              <p className="text-xs text-slate-500 font-medium">Configure low stock alert trigger point</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-bold text-slate-800">{productName}</span>
            <span className="text-slate-500 font-mono text-[11px]">
              Available: {item.inventory.availableQuantity} {item.inventory.unitOfMeasure}
            </span>
          </div>

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
            <p className="text-[11px] text-slate-400 mt-1">
              When available stock drops to or below this quantity, a LOW_STOCK alert will be triggered automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
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
