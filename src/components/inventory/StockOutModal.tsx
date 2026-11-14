"use client";

import React, { useState, useEffect } from "react";
import { X, Minus, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { EnrichedInventoryItem, StockOutPayload } from "@/types";

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: EnrichedInventoryItem | null;
  allItems?: EnrichedInventoryItem[];
  onSuccess: () => void;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  allItems = [],
  onSuccess,
}) => {
  const [productPublicId, setProductPublicId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("KG");
  const [reason, setReason] = useState("SPOILAGE");
  const [customReason, setCustomReason] = useState("");
  const [referenceType, setReferenceType] = useState("DAMAGE");
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
      setReason("SPOILAGE");
      setCustomReason("");
      setReferenceType("DAMAGE");
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

  const currentAvailable = currentProduct?.inventory?.availableQuantity ?? 0;
  const currentPhysical = currentProduct?.inventory?.physicalQuantity ?? 0;
  const currentReserved = currentProduct?.inventory?.reservedQuantity ?? 0;

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

    if (numQty > currentAvailable) {
      setErrorMessage(
        `Cannot deduct ${numQty} ${unitOfMeasure}. Only ${currentAvailable} ${unitOfMeasure} is currently available (${currentReserved} ${unitOfMeasure} is reserved).`
      );
      return;
    }

    const effectiveReason = reason === "CUSTOM" ? customReason.trim() : reason;
    if (!effectiveReason) {
      setErrorMessage("Please specify a reason for this stock deduction.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: StockOutPayload = {
        productPublicId,
        quantity: numQty,
        unitOfMeasure,
        reason: effectiveReason,
        notes: notes.trim() || undefined,
        referenceType: referenceType || undefined,
        referenceId: referenceId.trim() || undefined,
      };

      await inventoryService.stockOut(payload);
      setSuccessMessage(`Successfully deducted ${numQty} ${unitOfMeasure} from ${productName}.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record stock outward. Please check parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Minus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Record Stock Outward</h3>
              <p className="text-xs text-slate-500 font-medium">Deduct damaged, spoiled, or written-off produce</p>
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

          {/* Product Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Product Item <span className="text-rose-500">*</span>
            </label>
            {selectedItem ? (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{productName}</span>
                <span className="text-[11px] font-mono text-emerald-700">
                  Available: {currentAvailable} {unitOfMeasure} (Physical: {currentPhysical})
                </span>
              </div>
            ) : eligibleItems.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                No initialized products available. Please initialize stock for products before recording stock-out movements.
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
              >
                <option value="">Select Initialized Product</option>
                {eligibleItems.map((i) => (
                  <option key={i.inventory.productPublicId} value={i.inventory.productPublicId}>
                    {i.product?.name || `Product (${i.inventory.productPublicId.slice(0, 8)}...)`} (Avail: {i.inventory.availableQuantity} {i.inventory.unitOfMeasure})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity & UOM */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity to Deduct <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                max={currentAvailable}
                placeholder="e.g. 5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit of Measure
              </label>
              <select
                aria-label="Select Unit of Measure"
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
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
              Deduction Reason <span className="text-rose-500">*</span>
            </label>
            <select
              aria-label="Select Deduction Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="SPOILAGE">Spoilage / Perishable Rot</option>
              <option value="DAMAGE">Transit / Handling Damage</option>
              <option value="EXPIRED">Shelf-Life Expired</option>
              <option value="THEFT">Shrinkage / Inventory Discrepancy</option>
              <option value="INTERNAL_USE">Internal Warehouse Sampling / Testing</option>
              <option value="RETURN_TO_SUPPLIER">Return to Farmer / Vendor</option>
              <option value="CUSTOM">Other (Custom Reason)</option>
            </select>
          </div>

          {reason === "CUSTOM" && (
            <div>
              <input
                type="text"
                placeholder="Enter specific deduction reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                required
              />
            </div>
          )}

          {/* Reference Type & ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ref Type (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. DAMAGE_REPORT"
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ref ID / Incident # (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. DMG-2026-081"
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
              placeholder="e.g. Discarded overripe batch during morning sorting"
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
              className="px-5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Deducting Stock...</span>
              ) : (
                <>
                  <span>Confirm Deduction</span>
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
