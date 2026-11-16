"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ListPlus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import {
  EnrichedInventoryItem,
  InitializeInventoryPayload,
  BulkInitializePayload,
} from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";

interface InitializeStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: EnrichedInventoryItem | null;
  allItems?: EnrichedInventoryItem[];
  onSuccess: () => void;
  isLoadingCatalogue?: boolean;
}

export const InitializeStockModal: React.FC<InitializeStockModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  allItems = [],
  onSuccess,
  isLoadingCatalogue = false,
}) => {
  const [initMode, setInitMode] = useState<"single" | "bulk">("single");

  // Single mode state
  const [productPublicId, setProductPublicId] = useState("");
  const [initialQuantity, setInitialQuantity] = useState<number | "">(20);
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

  // Eligible uninitialized items from Product Service catalogue
  const uninitializedItems = allItems.filter((i) => !i.inventory.initialized);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setInitMode("single");

      if (selectedItem) {
        setProductPublicId(selectedItem.inventory.productPublicId);
        const configuredUnit =
          (selectedItem.product as any)?.quantityUnit ||
          (selectedItem.product as any)?.unit ||
          selectedItem.inventory.unitOfMeasure ||
          "KG";
        setUnitOfMeasure(configuredUnit);
        setLowStockThreshold(selectedItem.inventory.lowStockThreshold || 10);
      } else {
        // Default to empty so user sees placeholder "Select Product"
        setProductPublicId("");
        setUnitOfMeasure("KG");
        setLowStockThreshold(10);
      }

      setInitialQuantity(20);
      setSelectedBulkIds(uninitializedItems.map((i) => i.inventory.productPublicId));
    }
  }, [isOpen, selectedItem, allItems]);

  if (!isOpen) return null;

  // Selected product item for detailed preview card
  const selectedProductItem = allItems.find(
    (i) => i.inventory.productPublicId === productPublicId
  ) || selectedItem;

  const productName =
    selectedProductItem?.product?.name ||
    (selectedProductItem?.product as any)?.excelName ||
    (productPublicId ? `Product (${productPublicId.slice(0, 8)}...)` : "Select Product");

  const productCategory =
    typeof selectedProductItem?.product?.category === "string"
      ? selectedProductItem.product.category
      : (selectedProductItem?.product?.category as any)?.name || "Produce";

  const productPrice =
    selectedProductItem?.product?.pricePerKg ||
    selectedProductItem?.product?.price;

  const productImage =
    (selectedProductItem?.product as any)?.imageUrl ||
    (selectedProductItem?.product as any)?.image ||
    (selectedProductItem?.product as any)?.images?.[0]?.imageUrl;

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Rule: Do not allow submission without selecting a product
    if (!productPublicId || productPublicId.trim() === "") {
      setErrorMessage("Please select a product to initialize.");
      return;
    }

    const numQty = Number(initialQuantity);
    const numThreshold = Number(lowStockThreshold);

    // Rule: Validate opening quantity
    if (isNaN(numQty) || numQty < 0) {
      setErrorMessage("Initial opening quantity must be a non-negative number (0 or greater).");
      return;
    }

    // Rule: Validate low-stock threshold
    if (isNaN(numThreshold) || numThreshold < 0) {
      setErrorMessage("Low stock threshold must be a non-negative number (0 or greater).");
      return;
    }

    setIsLoading(true);
    try {
      const payload: InitializeInventoryPayload = {
        unitOfMeasure: unitOfMeasure || "KG",
        initialQuantity: numQty,
        lowStockThreshold: numThreshold,
        reason: reason || "INITIAL_STOCK",
        notes: notes.trim() || "Initial master product stock onboarding",
      };

      await inventoryService.initializeStock(productPublicId.trim(), payload);
      setSuccessMessage(`Stock initialized successfully for ${productName} (${numQty} ${unitOfMeasure}).`);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Single stock initialization failed:", err);
      setErrorMessage(
        err.message || "Failed to initialize product stock in Inventory Service."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitBulk = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedBulkIds.length === 0) {
      setErrorMessage("Please select at least one product for bulk initialization.");
      return;
    }

    const numQty = Number(bulkDefaultQty);
    const numThreshold = Number(bulkDefaultThreshold);

    if (isNaN(numQty) || numQty < 0) {
      setErrorMessage("Default opening quantity must be a non-negative number.");
      return;
    }

    if (isNaN(numThreshold) || numThreshold < 0) {
      setErrorMessage("Default low-stock threshold must be a non-negative number.");
      return;
    }

    setIsLoading(true);
    try {
      const itemsToInit = selectedBulkIds.map((id) => {
        const item = allItems.find((it) => it.inventory.productPublicId === id);
        const configuredUnit =
          (item?.product as any)?.quantityUnit ||
          (item?.product as any)?.unit ||
          item?.inventory.unitOfMeasure ||
          "KG";

        return {
          productPublicId: id,
          unitOfMeasure: configuredUnit,
          initialPhysicalQuantity: numQty,
          initialQuantity: numQty,
          lowStockThreshold: numThreshold,
          reason: "INITIAL_STOCK",
          notes: "Initial master product stock onboarding",
        };
      });

      const payload: BulkInitializePayload = { items: itemsToInit };
      await inventoryService.bulkInitializeStock(payload);

      setSuccessMessage(`Successfully initialized inventory for ${selectedBulkIds.length} products in bulk!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Bulk stock initialization failed:", err);
      setErrorMessage(err.message || "Failed to bulk initialize product stock.");
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
        aria-label="Initialize Product Stock"
        className="relative z-10 w-full max-h-[95dvh] sm:max-h-[92vh] sm:max-w-xl bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden border border-slate-200/90 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-3 flex-shrink-0" aria-hidden="true" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4.5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100 text-[#00875a] flex items-center justify-center shadow-xs flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                Initialize Product Stock
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Activate warehouse inventory tracking &amp; set baseline stock parameters
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

        {/* Mode Switch Tabs */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 flex-shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setInitMode("single")}
              className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                initMode === "single"
                  ? "bg-white text-slate-900 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Single Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setInitMode("bulk")}
              className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                initMode === "bulk"
                  ? "bg-white text-slate-900 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListPlus className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Bulk Mode ({uninitializedItems.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoadingCatalogue ? (
          <div className="py-16 text-center space-y-3 flex-1">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">
              Fetching product catalogue from Product Service...
            </p>
          </div>
        ) : initMode === "single" ? (
          /* Single Mode Form */
          <form onSubmit={handleSubmitSingle} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              {/* Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="leading-snug">{successMessage}</span>
                </div>
              )}

              {/* Product Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Product Item <span className="text-rose-500">*</span>
                </label>
                {selectedItem ? (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ProduceImage name={productName} src={productImage} size={32} />
                      <div className="min-w-0">
                        <span className="truncate block">{productName}</span>
                        <span className="block text-[10px] text-slate-500 font-semibold">{productCategory}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 bg-slate-100 rounded-lg flex-shrink-0">
                      UUID: {selectedItem.inventory.productPublicId.slice(0, 8)}...
                    </span>
                  </div>
                ) : uninitializedItems.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All products are initialized! All warehouse products have active stock records.</span>
                  </div>
                ) : (
                  <select
                    aria-label="Select Target Product Item"
                    value={productPublicId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setProductPublicId(selectedId);
                      setErrorMessage(null);
                      const found = allItems.find((i) => i.inventory.productPublicId === selectedId);
                      if (found) {
                        const prodUnit =
                          (found.product as any)?.quantityUnit ||
                          (found.product as any)?.unit ||
                          found.inventory.unitOfMeasure ||
                          "KG";
                        setUnitOfMeasure(prodUnit);
                        setLowStockThreshold(found.inventory.lowStockThreshold || 10);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="">Select Product</option>
                    {uninitializedItems.map((i) => {
                      const prodName =
                        i.product?.name ||
                        (i.product as any)?.excelName ||
                        `Product (${i.inventory.productPublicId.slice(0, 8)}...)`;
                      const cat =
                        typeof i.product?.category === "string"
                          ? i.product.category
                          : (i.product?.category as any)?.name;
                      const unit =
                        (i.product as any)?.quantityUnit ||
                        (i.product as any)?.unit ||
                        i.inventory.unitOfMeasure ||
                        "KG";
                      const label = cat ? `${prodName} (${cat} - ${unit})` : `${prodName} (${unit})`;
                      return (
                        <option key={i.inventory.productPublicId} value={i.inventory.productPublicId}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Selected Product Information Preview */}
              {selectedProductItem && productPublicId && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
                  <ProduceImage
                    name={productName}
                    src={productImage}
                    size={42}
                    className="rounded-xl border border-emerald-200 bg-white flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-xs truncate">
                        {productName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 shrink-0">
                        {productCategory}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[11px] text-slate-600 font-medium flex-wrap">
                      <span>Unit: <strong className="text-slate-800">{unitOfMeasure}</strong></span>
                      {productPrice !== undefined && (
                        <span>Rate: <strong className="text-slate-800">₹{productPrice}</strong></span>
                      )}
                      <span className="text-slate-400 font-mono text-[10px]">
                        UUID: {selectedProductItem.inventory.productPublicId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Initial Qty & Low Stock Threshold */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    Opening Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 20"
                    value={initialQuantity}
                    onChange={(e) =>
                      setInitialQuantity(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">In {unitOfMeasure}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    Low Stock Threshold <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 10"
                    value={lowStockThreshold}
                    onChange={(e) =>
                      setLowStockThreshold(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Alert trigger level</span>
                </div>
              </div>

              {/* Unit of Measure & Reason */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    Unit of Measure <span className="text-rose-500">*</span>
                  </label>
                  <select
                    aria-label="Select Unit of Measure"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="GRAM">GRAM (Grams)</option>
                    <option value="PIECE">PIECE</option>
                    <option value="BUNCH">BUNCH</option>
                    <option value="PACK">PACK</option>
                    <option value="DOZEN">DOZEN</option>
                    <option value="LITRE">LITRE</option>
                    <option value="ML">ML</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                    Initialization Reason
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
                  placeholder="Audit notes for stock onboarding..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium resize-none focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Sticky Actions Footer */}
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
                disabled={isLoading || (!selectedItem && uninitializedItems.length === 0)}
                className="flex-1 sm:flex-none justify-center px-5 py-2 sm:py-2 rounded-xl sm:rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? <span>Initializing...</span> : <span>Initialize Stock</span>}
              </button>
            </div>
          </form>
        ) : (
          /* Bulk Mode Container */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              {/* Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="leading-snug">{successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 truncate">
                    Default Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkDefaultQty}
                    onChange={(e) => setBulkDefaultQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 truncate">
                    Default Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkDefaultThreshold}
                    onChange={(e) => setBulkDefaultThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Product Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Select Products ({selectedBulkIds.length}/{uninitializedItems.length})
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

                <div className="max-h-52 sm:max-h-56 overflow-y-auto overscroll-contain space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                  {uninitializedItems.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">
                        All products are initialized!
                      </p>
                      <p className="text-[11px] text-slate-400">
                        All warehouse products in the catalogue already have initialized inventory records.
                      </p>
                    </div>
                  ) : (
                    uninitializedItems.map((item) => {
                      const isSelected = selectedBulkIds.includes(item.inventory.productPublicId);
                      const pName =
                        item.product?.name ||
                        (item.product as any)?.excelName ||
                        `Product (${item.inventory.productPublicId.slice(0, 8)}...)`;
                      const pCat =
                        typeof item.product?.category === "string"
                          ? item.product.category
                          : (item.product?.category as any)?.name;
                      const pUnit =
                        (item.product as any)?.quantityUnit ||
                        (item.product as any)?.unit ||
                        item.inventory.unitOfMeasure ||
                        "KG";

                      return (
                        <label
                          key={item.inventory.productPublicId}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 cursor-pointer text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
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
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 block truncate">
                                {pName}
                              </span>
                              {pCat && (
                                <span className="text-[10px] text-slate-500 font-medium block truncate">
                                  {pCat}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px] flex-shrink-0">
                            {pUnit}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Sticky Actions Footer */}
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
                type="button"
                onClick={handleSubmitBulk}
                disabled={isLoading || selectedBulkIds.length === 0}
                className="flex-1 sm:flex-none justify-center px-5 py-2 sm:py-2 rounded-xl sm:rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
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
  );
};