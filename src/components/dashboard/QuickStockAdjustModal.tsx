"use client";

import React, { useState } from "react";
import { X, Boxes, Plus, CheckCircle2 } from "lucide-react";
import { LowStockItem } from "./DashboardMiddleRow";

interface QuickStockAdjustModalProps {
  item: LowStockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestockApplied: (itemName: string, addedQty: number) => void;
}

export const QuickStockAdjustModal: React.FC<QuickStockAdjustModalProps> = ({
  item,
  isOpen,
  onClose,
  onRestockApplied,
}) => {
  const [restockQty, setRestockQty] = useState<number>(10);
  const [source, setSource] = useState("Kurnool Wholesale Mandi");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRestockApplied(item.name, restockQty);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Restock {item.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {item.currentStock}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Stock Updated!</h4>
            <p className="text-xs text-slate-500">
              +{restockQty} {item.unit} added to active inventory.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Restock Quantity ({item.unit})
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Source Supply
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-hidden"
              >
                <option value="Kurnool Wholesale Mandi">Kurnool Wholesale Mandi</option>
                <option value="Raju Traders Direct">Raju Traders Direct</option>
                <option value="Local Greenhouse Farmer">Local Greenhouse Farmer</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Confirm Stock</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
