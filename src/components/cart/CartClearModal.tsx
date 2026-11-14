"use client";

import React from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export interface CartClearModalProps {
  isOpen: boolean;
  itemCount: number;
  isClearing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CartClearModal: React.FC<CartClearModalProps> = ({
  isOpen,
  itemCount,
  isClearing,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-slate-900">
            Clear Shopping Cart?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Are you sure you want to remove all {itemCount} items from your cart? You will need to add them again to pre-order.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isClearing}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isClearing}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors cursor-pointer shadow-sm shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Clearing...</span>
              </>
            ) : (
              <span>Yes, Clear All</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
