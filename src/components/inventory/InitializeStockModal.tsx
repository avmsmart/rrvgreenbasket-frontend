"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, AlertCircle, CheckCircle2, ArrowRight, ListPlus } from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import { EnrichedInventoryItem, InitializeInventoryPayload, BulkInitializePayload } from "@/types";

interface InitializeStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: EnrichedInventoryItem | null;
  allItems?: EnrichedInventoryItem[];
  onSuccess: () => void;
}

export const InitializeStockModal: React.FC<InitializeStockModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  allItems = [],
  onSuccess,
}) => {
  const [initMode, setInitMode] = useState<"single" | "bulk">("single");

  // Single mode state
  const [productPublicId, setProductPublicId] = useState("");
  const [initialQuantity, setInitialQuantity] = useState<number | "">(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | "">(10);
  const [unitOfMeasure, setUnitOfMeasure] = useState("KG");
  const [reason, setReason] = useState("INITIAL_STOCK");
  const [notes, setNotes] = useState("Initial master product stock onboarding");

  // Bulk mode state
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [bulkDefaultQty, setBulkDefaultQty] = useState<number>(20);
  const [bulkDefaultThreshold, setBulkDefaultThreshold] = useState<number>(10);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Uninitialized items
  const uninitializedItems = allItems.filter((i) => !i.inventory.initialized);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setInitMode("single");

      if (selectedItem) {
        setProductPublicId(selectedItem.inventory.productPublicId);
        setUnitOfMeasure(selectedItem.inventory.unitOfMeasure || "KG");
        setLowStockThreshold(selectedItem.inventory.lowStockThreshold || 10);
      } else if (uninitializedItems.length > 0) {
        setProductPublicId(uninitializedItems[0].inventory.productPublicId);
        setUnitOfMeasure(uninitializedItems[0].inventory.unitOfMeasure || "KG");
        setLowStockThreshold(uninitializedItems[0].inventory.lowStockThreshold || 10);
      } else if (allItems.length > 0) {
        setProductPublicId(allItems[0].inventory.productPublicId);
        setUnitOfMeasure(allItems[0].inventory.unitOfMeasure || "KG");
      }

      setInitialQuantity(0);
      setSelectedBulkIds(uninitializedItems.map((i) => i.inventory.productPublicId));
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

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productPublicId) {
      setErrorMessage("Please select a product to initialize.");
      return;
    }

    const numQty = Number(initialQuantity);
    const numThreshold = Number(lowStockThreshold);

    if (isNaN(numQty) || numQty < 0) {
      setErrorMessage("Initial quantity must be a non-negative number.");
      return;
    }

    if (isNaN(numThreshold) || numThreshold < 0) {
      setErrorMessage("Low stock threshold must be a non-negative number.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: InitializeInventoryPayload = {
        unitOfMeasure,
        initialQuantity: numQty,
        lowStockThreshold: numThreshold,
        reason: reason || "INITIAL_STOCK",
        notes: notes.trim() || undefined,
      };

      await inventoryService.initializeStock(productPublicId, payload);
      setSuccessMessage(`Stock initialized successfully for ${productName}.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initialize stock. Please check parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitBulk = async () => {
    setErrorMessage(null);

    if (selectedBulkIds.length === 0) {
      setErrorMessage("Please select at least one product for bulk initialization.");
      return;
    }

    setIsLoading(true);
    try {
      const itemsToInit = selectedBulkIds.map((id) => {
        const item = allItems.find((it) => it.inventory.productPublicId === id);
        return {
          productPublicId: id,
          unitOfMeasure: item?.inventory.unitOfMeasure || "KG",
          initialPhysicalQuantity: bulkDefaultQty,
          lowStockThreshold: bulkDefaultThreshold,
          reason: "BULK_INITIALIZATION",
          notes: "Batch onboarding into inventory service",
        };
      });

      const payload: BulkInitializePayload = { items: itemsToInit };
      await inventoryService.bulkInitializeStock(payload);
      setSuccessMessage(`Successfully initialized ${selectedBulkIds.length} products in bulk.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to bulk initialize stock.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#00875a] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Initialize Product Stock</h3>
              <p className="text-xs text-slate-500 font-medium">Activate inventory tracking &amp; set baseline parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switch */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setInitMode("single")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                initMode === "single"
                  ? "bg-white text-slate-900 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Single Product Mode
            </button>
            <button
              type="button"
              onClick={() => setInitMode("bulk")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                initMode === "bulk"
                  ? "bg-white text-slate-900 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bulk Mode ({uninitializedItems.length} uninitialized)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {initMode === "single" ? (
            <form onSubmit={handleSubmitSingle} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Product Item <span className="text-rose-500">*</span>
                </label>
                {selectedItem ? (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{productName}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      UUID: {selectedItem.inventory.productPublicId.slice(0, 8)}
                    </span>
                  </div>
                ) : (
                  <select
                    aria-label="Select Target Product Item"
                    value={productPublicId}
                    onChange={(e) => {
                      setProductPublicId(e.target.value);
                      const found = allItems.find((i) => i.inventory.productPublicId === e.target.value);
                      if (found) {
                        setUnitOfMeasure(found.inventory.unitOfMeasure || "KG");
                        setLowStockThreshold(found.inventory.lowStockThreshold || 10);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {allItems.map((i) => (
                      <option key={i.inventory.productPublicId} value={i.inventory.productPublicId}>
                        {i.product?.name || `Product (${i.inventory.productPublicId.slice(0, 8)}...)`} {!i.inventory.initialized ? "(⚠️ Uninitialized)" : "(Active)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Initial Qty & Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Physical Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 25"
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Low Stock Threshold <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 10"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              {/* UOM & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit of Measure <span className="text-rose-500">*</span>
                  </label>
                  <select
                    aria-label="Select Unit of Measure"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Onboarding Notes
                </label>
                <textarea
                  rows={2}
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
                  className="px-5 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? <span>Initializing...</span> : <span>Initialize Stock</span>}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Default Initial Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkDefaultQty}
                    onChange={(e) => setBulkDefaultQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Default Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkDefaultThreshold}
                    onChange={(e) => setBulkDefaultThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Product Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Select Products to Initialize ({selectedBulkIds.length} selected)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBulkIds.length === uninitializedItems.length) {
                        setSelectedBulkIds([]);
                      } else {
                        setSelectedBulkIds(uninitializedItems.map((i) => i.inventory.productPublicId));
                      }
                    }}
                    className="text-[11px] font-bold text-[#00875a] hover:underline"
                  >
                    {selectedBulkIds.length === uninitializedItems.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                  {uninitializedItems.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      All products in warehouse inventory are already initialized!
                    </p>
                  ) : (
                    uninitializedItems.map((item) => {
                      const isSelected = selectedBulkIds.includes(item.inventory.productPublicId);
                      return (
                        <label
                          key={item.inventory.productPublicId}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 cursor-pointer text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBulkIds((prev) => [...prev, item.inventory.productPublicId]);
                                } else {
                                  setSelectedBulkIds((prev) =>
                                    prev.filter((id) => id !== item.inventory.productPublicId)
                                  );
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-bold text-slate-800">
                              {item.product?.name || `Product (${item.inventory.productPublicId.slice(0, 8)}...)`}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.inventory.unitOfMeasure}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
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
                  type="button"
                  onClick={handleSubmitBulk}
                  disabled={isLoading || selectedBulkIds.length === 0}
                  className="px-5 py-2 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Initializing {selectedBulkIds.length} items...</span>
                  ) : (
                    <>
                      <span>Initialize {selectedBulkIds.length} Items</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
