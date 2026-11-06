"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldAlert, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { EnrichedInventoryItem, CorrectInitialStockPayload } from "@/types";

interface CorrectInitialStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EnrichedInventoryItem | null;
  onSuccess: () => void;
}

export const CorrectInitialStockModal: React.FC<CorrectInitialStockModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const [correctedQuantity, setCorrectedQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("INITIAL_ENTRY_MISTAKE");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setCorrectedQuantity(item.inventory.physicalQuantity);
      setReason("INITIAL_ENTRY_MISTAKE");
      setCustomReason("");
      setNotes("");
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

    const numQty = Number(correctedQuantity);
    if (isNaN(numQty) || numQty < 0) {
      setErrorMessage("Corrected quantity must be a non-negative number.");
      return;
    }

    const effectiveReason = reason === "CUSTOM" ? customReason.trim() : reason;
    if (!effectiveReason) {
      setErrorMessage("Please enter an audit reason for correcting initial stock.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: CorrectInitialStockPayload = {
        productPublicId: item.inventory.productPublicId,
        correctedQuantity: numQty,
        reason: effectiveReason,
        notes: notes.trim() || undefined,
      };

      await inventoryService.correctInitialStock(item.inventory.productPublicId, payload);
      setSuccessMessage(`Initial stock corrected successfully to ${numQty} ${item.inventory.unitOfMeasure}.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to correct initial stock.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Correct Initial Stock</h3>
              <p className="text-xs text-slate-500 font-medium">Audit override for onboarding data entry errors</p>
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
          {/* Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold block">Audit Sensitive Action</span>
              <span className="text-amber-800/90 text-[11px]">
                This will overwrite the baseline initial opening stock. All adjustments will be recorded in the immutable stock movement audit log.
              </span>
            </div>
          </div>

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
              Current Physical: {item.inventory.physicalQuantity} {item.inventory.unitOfMeasure}
            </span>
          </div>

          {/* Corrected Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corrected Baseline Quantity ({item.inventory.unitOfMeasure}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 50"
              value={correctedQuantity}
              onChange={(e) => setCorrectedQuantity(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correction Reason <span className="text-rose-500">*</span>
            </label>
            <select
              aria-label="Select Correction Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="INITIAL_ENTRY_MISTAKE">Initial Data Entry Typing Error</option>
              <option value="MISCOUNTED_CRATES">Initial Opening Stock Miscount</option>
              <option value="UNIT_CONVERSION_ERROR">Incorrect Unit Sizing (e.g. Gram vs Kg)</option>
              <option value="CUSTOM">Other (Custom Reason)</option>
            </select>
          </div>

          {reason === "CUSTOM" && (
            <div>
              <input
                type="text"
                placeholder="Enter specific audit correction reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Audit Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approved by warehouse supervisor during baseline verification"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium resize-none"
            />
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
              className="px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Applying Correction...</span>
              ) : (
                <>
                  <span>Save Correction</span>
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
