"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { ProcurementItem, ProcurementStatus } from "@/types";
import { ProduceImage } from "@/components/common";

interface EditProcurementModalProps {
  item: ProcurementItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ProcurementItem>) => void;
}

export const EditProcurementModal: React.FC<EditProcurementModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  const [requiredQty, setRequiredQty] = useState(0);
  const [procuredQty, setProcuredQty] = useState(0);
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState<ProcurementStatus>("Not Started");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setRequiredQty(item.requiredQty);
      setProcuredQty(item.procuredQty);
      setSupplier(item.supplier);
      setStatus(item.status);
      setEstimatedCost(item.estimatedCost);
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const pendingQty = Math.max(0, requiredQty - procuredQty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, {
      requiredQty,
      procuredQty,
      pendingQty,
      supplier,
      status,
      estimatedCost,
      notes,
    });
    onClose();
  };

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
          <div className="flex items-center gap-3">
            <ProduceImage name={item.productName} size={40} className="rounded-xl shadow-3xs" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Edit {item.productName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-500">{item.id} • Mandi Plan</p>
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
          {/* Quantities Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Required ({item.unit})
              </label>
              <input
                type="number"
                min="0"
                value={requiredQty}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRequiredQty(val);
                  if (procuredQty >= val && val > 0) setStatus("Completed");
                  else if (procuredQty > 0) setStatus("Partial");
                  else setStatus("Not Started");
                }}
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-700 mb-1">
                Procured ({item.unit})
              </label>
              <input
                type="number"
                min="0"
                value={procuredQty}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProcuredQty(val);
                  if (val >= requiredQty && requiredQty > 0) setStatus("Completed");
                  else if (val > 0) setStatus("Partial");
                  else setStatus("Not Started");
                }}
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-emerald-300 rounded-lg font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-700 mb-1">
                Pending ({item.unit})
              </label>
              <div className="px-2.5 py-1.5 text-sm font-black text-amber-800 bg-amber-50/50 rounded-lg border border-amber-200">
                {pendingQty}
              </div>
            </div>
          </div>

          {/* Supplier & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcurementStatus)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
              >
                <option value="Completed">Completed</option>
                <option value="Partial">Partial</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estimated Total Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Procurement & Mandi Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add specific notes or quality instructions"
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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#00875a] hover:bg-[#00704a] rounded-xl transition-all shadow-3xs cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
