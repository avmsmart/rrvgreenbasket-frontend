"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { EnrichedInventoryItem, StockInPayload } from "@/types";

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: EnrichedInventoryItem | null;
  allItems?: EnrichedInventoryItem[];
  onSuccess: () => void;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  allItems = [],
  onSuccess,
}) => {
  const [productPublicId, setProductPublicId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("KG");
  const [reason, setReason] = useState("PURCHASE");
  const [customReason, setCustomReason] = useState("");
  const [referenceType, setReferenceType] = useState("PURCHASE");
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const eligibleItems = allItems.filter((i) => i.inventory.initialized);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      if (selectedItem && selectedItem.inventory.initialized) {
        setProductPublicId(selectedItem.inventory.productPublicId);
        setUnitOfMeasure(selectedItem.inventory.unitOfMeasure || "KG");
      } else if (eligibleItems.length > 0) {
        setProductPublicId(eligibleItems[0].inventory.productPublicId);
        setUnitOfMeasure(eligibleItems[0].inventory.unitOfMeasure || "KG");
      } else {
        setProductPublicId("");
        setUnitOfMeasure("KG");
      }
      setQuantity("");
      setReason("PURCHASE");
      setCustomReason("");
      setReferenceType("PURCHASE");
      setReferenceId("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productPublicId) {
      setErrorMessage("Please select a product.");
      return;
    }

    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) {
      setErrorMessage("Please enter a valid positive quantity greater than 0.");
      return;
    }

    const effectiveReason = reason === "CUSTOM" ? customReason.trim() : reason;
    if (!effectiveReason) {
      setErrorMessage("Please specify a reason for this stock inward.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: StockInPayload = {
        productPublicId,
        quantity: numQty,
        unitOfMeasure,
        reason: effectiveReason,
        notes: notes.trim() || undefined,
        referenceType: referenceType || undefined,
        referenceId: referenceId.trim() || undefined,
      };

      await inventoryService.stockIn(payload);
      setSuccessMessage(`Successfully recorded inward of ${numQty} ${unitOfMeasure} for ${productName}.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record stock inward. Please verify details.");
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
        aria-label="Record Stock Inward"
        className="relative z-10 w-full max-h-[95dvh] sm:max-h-[92vh] sm:max-w-lg bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden border border-slate-200/90 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-3 flex-shrink-0" aria-hidden="true" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4.5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100 text-[#00875a] flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                Record Stock Inward
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Add received batch into physical warehouse stock
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
          {/* Scrollable Form Fields */}
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

            {/* Product Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Product Item <span className="text-rose-500">*</span>
              </label>
              {selectedItem ? (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="truncate">{productName}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Current: {selectedItem.inventory.physicalQuantity} {selectedItem.inventory.unitOfMeasure}
                  </span>
                </div>
              ) : eligibleItems.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  No initialized products available. Please initialize stock for products before recording inward stock.
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
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="">Select Initialized Product</option>
                  {eligibleItems.map((i) => (
                    <option key={i.inventory.productPublicId} value={i.inventory.productPublicId}>
                      {i.product?.name || `Product (${i.inventory.productPublicId.slice(0, 8)}...)`} ({i.inventory.unitOfMeasure})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity & UOM */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                  Quantity Inward <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                  Unit of Measure
                </label>
                <select
                  aria-label="Select Unit of Measure"
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="KG">KG</option>
                  <option value="GRAM">GRAM</option>
                  <option value="PIECE">PIECE</option>
                  <option value="BUNCH">BUNCH</option>
                  <option value="PACK">PACK</option>
                  <option value="DOZEN">DOZEN</option>
                  <option value="LITRE">LITRE</option>
                  <option value="ML">ML</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Source <span className="text-rose-500">*</span>
              </label>
              <select
                aria-label="Select Reason or Source"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                <option value="PURCHASE">Wholesale Purchase / Mandi Sourcing</option>
                <option value="HARVEST">Direct Farm Cluster Harvest</option>
                <option value="RETURN">Customer Return / Pack Cancellation</option>
                <option value="AUDIT">Physical Audit Stock Addition</option>
                <option value="TRANSFER">Inter-Hub Transfer In</option>
                <option value="CUSTOM">Other (Custom Reason)</option>
              </select>
            </div>

            {reason === "CUSTOM" && (
              <div>
                <input
                  type="text"
                  placeholder="Enter specific inward reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                  required
                />
              </div>
            )}

            {/* Reference Type & ID */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                  Ref Type (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PURCHASE_ORDER"
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                  Ref ID / Invoice # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-0042"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Morning fresh batch from Kurnool Mandi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium resize-none"
              />
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
              className="flex-1 sm:flex-none justify-center px-5 py-2 sm:py-2 rounded-xl sm:rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Recording Inward...</span>
              ) : (
                <>
                  <span>Confirm Inward</span>
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