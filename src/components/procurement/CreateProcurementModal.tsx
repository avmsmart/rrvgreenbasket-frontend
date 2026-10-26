"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { ProcurementItem, ProcurementStatus } from "@/types";
import { ProduceImage } from "@/components/common";

interface CreateProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ProcurementItem, "id">) => void;
}

export const CreateProcurementModal: React.FC<CreateProcurementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [requiredQty, setRequiredQty] = useState<number>(50);
  const [procuredQty, setProcuredQty] = useState<number>(0);
  const [unit, setUnit] = useState("kg");
  const [supplier, setSupplier] = useState("Raju Traders");
  const [estimatedCost, setEstimatedCost] = useState<number>(1500);
  const [priority, setPriority] = useState<"High Priority" | "Medium" | "Low">("Medium");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const pendingQty = Math.max(0, requiredQty - procuredQty);
    const status: ProcurementStatus =
      pendingQty === 0
        ? "Completed"
        : procuredQty > 0
        ? "Partial"
        : "Not Started";

    onSubmit({
      productName: productName.trim(),
      category,
      requiredQty,
      procuredQty,
      pendingQty,
      unit,
      supplier,
      status,
      estimatedCost,
      priority,
      notes,
      date: "26 Aug 2025",
    });

    onClose();
  };

  const categories = ["Vegetables", "Fruits", "Leafy", "Others"];
  const units = ["kg", "bunch", "pcs", "dozen"];
  const suppliers = [
    "Raju Traders",
    "Fresh Farms",
    "Sri Sai Supplies",
    "Green Valley",
    "Local Market",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eefcf2] text-[#00875a] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Create Procurement Plan Item
              </h2>
              <p className="text-xs text-slate-500">
                Add item to tomorrow&apos;s Mandi procurement list
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Product Name & Visual Preview */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Tomato, Onion, Potato..."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              />
            </div>
            {productName && (
              <div className="pt-5">
                <ProduceImage name={productName} size={42} className="rounded-xl" />
              </div>
            )}
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantities: Required & Procured */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={requiredQty}
                onChange={(e) => setRequiredQty(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Already Procured Qty
              </label>
              <input
                type="number"
                min="0"
                value={procuredQty}
                onChange={(e) => setProcuredQty(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              />
            </div>
          </div>

          {/* Supplier & Estimated Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Supplier
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              >
                {suppliers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Cost (₹) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Procurement Priority
            </label>
            <div className="flex gap-2">
              {(["High Priority", "Medium", "Low"] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    priority === p
                      ? "bg-[#eefcf2] text-[#00875a] border-[#00875a]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mandi Notes & Quality Checks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Grade A fresh, washed, no blemishes"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#00875a] hover:bg-[#00704a] rounded-xl transition-all shadow-3xs cursor-pointer active:scale-95"
            >
              Create Plan Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
