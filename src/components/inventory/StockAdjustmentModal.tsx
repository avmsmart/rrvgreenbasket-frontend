"use client";

import React, { useState, useEffect } from "react";
import { X, Sliders, AlertCircle, CheckCircle2, ArrowRight, ArrowUpDown, Scale } from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { EnrichedInventoryItem, StockAdjustmentPayload } from "@/types";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: EnrichedInventoryItem | null;
  allItems?: EnrichedInventoryItem[];
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  allItems = [],
  onSuccess,
}) => {
  // Mode: "relative" (+/- delta) or "absolute" (set exact count)
  const [adjustmentMode, setAdjustmentMode] = useState<"relative" | "absolute">("relative");

  const [productPublicId, setProductPublicId] = useState("");
  const [relativeQty, setRelativeQty] = useState<number | "">("");
  const [absoluteQty, setAbsoluteQty] = useState<number | "">("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("KG");
  const [reason, setReason] = useState("AUDIT");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const eligibleItems = allItems.filter((i) => i.inventory.initialized);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setAdjustmentMode("relative");
      if (selectedItem && selectedItem.inventory.initialized) {
        setProductPublicId(selectedItem.inventory.productPublicId);
        setUnitOfMeasure(selectedItem.inventory.unitOfMeasure || "KG");
        setAbsoluteQty(selectedItem.inventory.physicalQuantity);
      } else if (eligibleItems.length > 0) {
        setProductPublicId(eligibleItems[0].inventory.productPublicId);
        setUnitOfMeasure(eligibleItems[0].inventory.unitOfMeasure || "KG");
        setAbsoluteQty(eligibleItems[0].inventory.physicalQuantity);
      } else {
        setProductPublicId("");
        setUnitOfMeasure("KG");
        setAbsoluteQty(0);
      }
      setRelativeQty("");
      setReason("AUDIT");
      setCustomReason("");
      setNotes("");
    }
  }, [isOpen, selectedItem, allItems]);

  if (!isOpen) return null;

  const currentProduct = allItems.find(
    (i) => i.inventory.productPublicId === productPublicId
  ) || selectedItem;

  const productName =
    currentProduct?.product?.name ||
    (currentProduct?.product as any)?.excelName ||
    (productPublicId ? `Product (${productPublicId.slice(0, 8)}...)` : "Select Product");

  const currentPhysical = currentProduct?.inventory?.physicalQuantity ?? 0;
  const currentReserved = currentProduct?.inventory?.reservedQuantity ?? 0;
  const currentAvailable = currentProduct?.inventory?.availableQuantity ?? 0;

  // Projected new physical quantity
  const projectedPhysical =
    adjustmentMode === "relative"
      ? typeof relativeQty === "number"
        ? currentPhysical + relativeQty
        : currentPhysical
      : typeof absoluteQty === "number"
      ? absoluteQty
      : currentPhysical;

  const projectedAvailable = Math.max(0, projectedPhysical - currentReserved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productPublicId) {
      setErrorMessage("Please select a product.");
      return;
    }

    const effectiveReason = reason === "CUSTOM" ? customReason.trim() : reason;
    if (!effectiveReason) {
      setErrorMessage("Please enter an adjustment reason.");
      return;
    }

    let payload: StockAdjustmentPayload;

    if (adjustmentMode === "relative") {
      const numRel = Number(relativeQty);
      if (relativeQty === "" || isNaN(numRel) || numRel === 0) {
        setErrorMessage("Please enter a non-zero adjustment delta (positive to add, negative to deduct).");
        return;
      }

      if (currentPhysical + numRel < currentReserved) {
        setErrorMessage(
          `Adjustment would result in ${currentPhysical + numRel} ${unitOfMeasure}, which is less than the ${currentReserved} ${unitOfMeasure} currently reserved.`
        );
        return;
      }

      payload = {
        productPublicId,
        adjustmentQuantity: numRel,
        unitOfMeasure,
        reason: effectiveReason,
        notes: notes.trim() || undefined,
      };
    } else {
      const numAbs = Number(absoluteQty);
      if (absoluteQty === "" || isNaN(numAbs) || numAbs < 0) {
        setErrorMessage("Please enter a valid non-negative physical stock count.");
        return;
      }

      if (numAbs < currentReserved) {
        setErrorMessage(
          `Physical count (${numAbs} ${unitOfMeasure}) cannot be less than currently reserved quantity (${currentReserved} ${unitOfMeasure}).`
        );
        return;
      }

      payload = {
        productPublicId,
        newPhysicalQuantity: numAbs,
        unitOfMeasure,
        reason: effectiveReason,
        notes: notes.trim() || undefined,
      };
    }

    setIsLoading(true);
    try {
      await inventoryService.adjustStock(payload);
      setSuccessMessage(`Stock adjustment successfully applied to ${productName}.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to adjust stock. Please check parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative z-10 w-full max-h-[95dvh] sm:max-h-[92vh] sm:max-w-lg bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden border border-slate-200/90">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-3 flex-shrink-0" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4.5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">Adjust Stock Quantity</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">Reconcile physical counts vs inventory book records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body + Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
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

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setAdjustmentMode("relative")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  adjustmentMode === "relative"
                    ? "bg-white text-slate-900 shadow-3xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>Relative (+ / - Delta)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustmentMode("absolute");
                  if (currentProduct) {
                    setAbsoluteQty(currentProduct.inventory.physicalQuantity);
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  adjustmentMode === "absolute"
                    ? "bg-white text-slate-900 shadow-3xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Absolute (New Total)</span>
              </button>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Product Item <span className="text-rose-500">*</span>
              </label>
              {selectedItem ? (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span>{productName}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Physical: {currentPhysical} | Reserved: {currentReserved}
                  </span>
                </div>
              ) : eligibleItems.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  No initialized products available. Please initialize stock for products before recording stock adjustments.
                </div>
              ) : (
                <select
                  aria-label="Select Target Product Item"
                  value={productPublicId}
                  onChange={(e) => {
                    setProductPublicId(e.target.value);
                    const found = eligibleItems.find((i) => i.inventory.productPublicId === e.target.value);
                    if (found) {
                      setUnitOfMeasure(found.inventory.unitOfMeasure || "KG");
                      setAbsoluteQty(found.inventory.physicalQuantity);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">Select Initialized Product</option>
                  {eligibleItems.map((i) => (
                    <option key={i.inventory.productPublicId} value={i.inventory.productPublicId}>
                      {i.product?.name || `Product (${i.inventory.productPublicId.slice(0, 8)}...)`} (Phys: {i.inventory.physicalQuantity} {i.inventory.unitOfMeasure})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mode-specific Input */}
            {adjustmentMode === "relative" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    Delta (+/- Quantity) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. +10 or -5"
                    value={relativeQty}
                    onChange={(e) => setRelativeQty(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={unitOfMeasure}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    New Physical Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min={currentReserved}
                    placeholder={`Min ${currentReserved}`}
                    value={absoluteQty}
                    onChange={(e) => setAbsoluteQty(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={unitOfMeasure}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Live Projection Box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <span className="text-slate-500 font-medium">Projected Physical Stock:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">{currentPhysical}</span>
                <span className="text-slate-400">→</span>
                <span className="font-black text-slate-900">
                  {projectedPhysical} {unitOfMeasure}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  (Avail: {projectedAvailable})
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adjustment Reason <span className="text-rose-500">*</span>
              </label>
              <select
                aria-label="Select Adjustment Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="AUDIT">Periodic Warehouse Audit</option>
                <option value="RECONCILIATION">Discrepancy Reconciliation</option>
                <option value="DAMAGED_COUNT">Damaged Stock Write-off</option>
                <option value="SCALE_CALIBRATION">Scale / Unit Calibration Correction</option>
                <option value="CUSTOM">Other (Custom Reason)</option>
              </select>
            </div>

            {reason === "CUSTOM" && (
              <div>
                <input
                  type="text"
                  placeholder="Enter specific adjustment reason..."
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
                Audit Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Recounted warehouse crates after evening shipment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium resize-none"
              />
            </div>
          </div>

          {/* Actions Footer */}
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
              className="flex-1 sm:flex-none justify-center px-5 py-2 sm:py-2 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Adjusting Stock...</span>
              ) : (
                <>
                  <span>Apply Adjustment</span>
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