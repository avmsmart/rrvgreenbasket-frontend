"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Boxes,
  Plus,
  CheckCircle2,
  Trash2,
  Search,
  ArrowRight,
  Truck,
  Layers,
  Sparkles,
} from "lucide-react";
import { Product } from "@/types";

export interface BatchInwardItem {
  productId: string;
  qty: number;
}

interface StockAdjustmentModalProps {
  product: Product | null;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmInward?: (
    productId: string,
    addedQty: number,
    supplier: string,
    notes?: string
  ) => void;
  onConfirmBatchInward?: (
    items: BatchInwardItem[],
    supplier: string,
    notes?: string
  ) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  allProducts,
  isOpen,
  onClose,
  onConfirmInward,
  onConfirmBatchInward,
}) => {
  // Mode: "single" or "batch"
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Single Item State
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [singleQty, setSingleQty] = useState<number>(25);

  // Multi-Item Batch State
  const [batchItems, setBatchItems] = useState<BatchInwardItem[]>([]);

  // Common Meta
  const [supplier, setSupplier] = useState("Kurnool Wholesale Mandi");
  const [customSupplier, setCustomSupplier] = useState("");
  const [notes, setNotes] = useState("Morning mandi fresh arrival");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successSummary, setSuccessSummary] = useState("");

  // Sync initial state when opened or product changes
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setSearchProductQuery("");

      if (product) {
        setSelectedProductId(product.id);
        setMode("single");
        setSingleQty(25);
      } else if (allProducts && allProducts.length > 0) {
        setSelectedProductId(allProducts[0].id);
        setSingleQty(25);
      }

      // Initialize batch items with 2 default entries if empty
      if (allProducts && allProducts.length >= 2) {
        setBatchItems([
          { productId: product?.id || allProducts[0].id, qty: 30 },
          { productId: allProducts[1].id, qty: 20 },
        ]);
      } else if (allProducts && allProducts.length > 0) {
        setBatchItems([{ productId: allProducts[0].id, qty: 25 }]);
      }
    }
  }, [isOpen, product, allProducts]);

  // Current selected product object for single mode
  const currentSingleProduct = useMemo(() => {
    return allProducts.find((p) => p.id === selectedProductId) || allProducts[0] || product;
  }, [allProducts, selectedProductId, product]);

  // Filter products for search selector
  const filteredProducts = useMemo(() => {
    if (!searchProductQuery.trim()) return allProducts;
    const q = searchProductQuery.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.excelName && p.excelName.toLowerCase().includes(q)) ||
        (p.erpCode && p.erpCode.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }, [allProducts, searchProductQuery]);

  if (!isOpen) return null;

  // Batch item operations
  const handleAddBatchRow = () => {
    if (allProducts.length === 0) return;
    // Pick first unused product or first product
    const usedIds = new Set(batchItems.map((b) => b.productId));
    const nextAvailable = allProducts.find((p) => !usedIds.has(p.id)) || allProducts[0];
    setBatchItems((prev) => [...prev, { productId: nextAvailable.id, qty: 20 }]);
  };

  const handleUpdateBatchRowProduct = (index: number, newProductId: string) => {
    setBatchItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, productId: newProductId } : item))
    );
  };

  const handleUpdateBatchRowQty = (index: number, qty: number) => {
    setBatchItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, qty: Math.max(1, qty) } : item))
    );
  };

  const handleRemoveBatchRow = (index: number) => {
    if (batchItems.length <= 1) return;
    setBatchItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSupplier = supplier === "Other" ? customSupplier || "Direct Mandi" : supplier;

    if (mode === "single") {
      if (!currentSingleProduct) return;
      if (onConfirmBatchInward) {
        onConfirmBatchInward(
          [{ productId: currentSingleProduct.id, qty: singleQty }],
          finalSupplier,
          notes
        );
      } else if (onConfirmInward) {
        onConfirmInward(currentSingleProduct.id, singleQty, finalSupplier, notes);
      }

      setSuccessSummary(
        `Added +${singleQty} ${currentSingleProduct.unit} of ${currentSingleProduct.name} to warehouse inventory.`
      );
    } else {
      // Batch mode
      const validBatch = batchItems.filter((it) => it.qty > 0);
      if (validBatch.length === 0) return;

      if (onConfirmBatchInward) {
        onConfirmBatchInward(validBatch, finalSupplier, notes);
      } else if (onConfirmInward) {
        validBatch.forEach((item) => {
          onConfirmInward(item.productId, item.qty, finalSupplier, notes);
        });
      }

      const totalBatchQty = validBatch.reduce((sum, item) => sum + item.qty, 0);
      setSuccessSummary(
        `Batch successfully processed: +${totalBatchQty} units across ${validBatch.length} vegetable items.`
      );
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Inward Stock Batch
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Record fresh mandi arrivals &amp; warehouse produce consignments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Splash */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-3 animate-in fade-in my-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-black text-slate-900">
              Batch Inward Successfully Recorded!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {successSummary}
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Inventory Updated Live
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Mode Switcher Tabs */}
            <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2 flex-shrink-0 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === "single"
                    ? "bg-[#00875a] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Single Product Inward
              </button>
              <button
                type="button"
                onClick={() => setMode("batch")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mode === "batch"
                    ? "bg-[#00875a] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Produce Mandi Consignment</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* MODE 1: SINGLE PRODUCT */}
              {mode === "single" && currentSingleProduct && (
                <div className="space-y-4">
                  {/* Searchable Produce Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Produce from Master Catalog ({allProducts.length} items available)
                    </label>

                    {/* Search filter for products */}
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search product name, excel name, or code..."
                        value={searchProductQuery}
                        onChange={(e) => setSearchProductQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>

                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.erpCode ? `[${p.erpCode}] ` : ""}
                          {p.name} {p.excelName && p.excelName !== p.name ? `(${p.excelName})` : ""} • Stock: {p.stock} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Projection Display */}
                  <div className="p-3.5 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block font-medium">Current Stock</span>
                      <span className="text-base font-black text-slate-900">
                        {currentSingleProduct.stock} {currentSingleProduct.unit}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {currentSingleProduct.category}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-emerald-600" />

                    <div className="text-right">
                      <span className="text-slate-500 block font-medium">New Stock After Inward</span>
                      <span className="text-base font-black text-[#00875a]">
                        {currentSingleProduct.stock + (Number(singleQty) || 0)} {currentSingleProduct.unit}
                      </span>
                      <span className="text-[10px] text-emerald-600 block font-bold">
                        +{singleQty} {currentSingleProduct.unit} Added
                      </span>
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Received Quantity ({currentSingleProduct.unit}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        value={singleQty}
                        onChange={(e) => setSingleQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {currentSingleProduct.unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: MULTI-ITEM BATCH */}
              {mode === "batch" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Consignment Line Items
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Add every produce item received in this truck / mandi load
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddBatchRow}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#00875a] hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Produce</span>
                    </button>
                  </div>

                  {/* Table/List of Batch Items */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {batchItems.map((item, idx) => {
                      const itemProd = allProducts.find((p) => p.id === item.productId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-colors"
                        >
                          {/* Product Select */}
                          <div className="flex-1 min-w-0">
                            <select
                              value={item.productId}
                              onChange={(e) => handleUpdateBatchRowProduct(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl truncate focus:outline-hidden"
                            >
                              {allProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} {p.excelName && p.excelName !== p.name ? `(${p.excelName})` : ""} [{p.unit}]
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div className="w-24 relative flex-shrink-0">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleUpdateBatchRowQty(idx, Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-right pr-7"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                              {itemProd?.unit || "Kg"}
                            </span>
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchRow(idx)}
                            disabled={batchItems.length <= 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors flex-shrink-0"
                            title="Remove produce line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary badge */}
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">
                      Consignment Total: {batchItems.length} items
                    </span>
                    <span className="font-black text-[#00875a]">
                      +{batchItems.reduce((sum, b) => sum + (Number(b.qty) || 0), 0)} Total Units
                    </span>
                  </div>
                </div>
              )}

              {/* COMMON FIELDS: Supplier & Invoice notes */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supplier / Mandi Dispatch Source
                  </label>
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Kurnool Wholesale Mandi">Kurnool Wholesale Mandi (Main)</option>
                    <option value="Raju Traders (APMC Yard)">Raju Traders (APMC Yard)</option>
                    <option value="Sri Venkateswara Agro Farm">Sri Venkateswara Agro Farm</option>
                    <option value="Direct Organic Farm Harvest">Direct Organic Farm Harvest</option>
                    <option value="Bangalore Cold Chain Logistics">Bangalore Cold Chain Logistics</option>
                    <option value="Other">Other / Custom Supplier</option>
                  </select>

                  {supplier === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter supplier or farm source name..."
                      value={customSupplier}
                      onChange={(e) => setCustomSupplier(e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Challan / Invoice Reference &amp; Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Mandi Gate Pass #4092, Truck AP-21-X-9002, Grade A"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                {mode === "single"
                  ? `Inwarding: ${currentSingleProduct?.name}`
                  : `Inwarding: ${batchItems.length} Produce items`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {mode === "single" ? "Confirm Stock Inward" : `Confirm Batch (${batchItems.length})`}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
