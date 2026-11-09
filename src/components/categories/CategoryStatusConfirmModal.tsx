"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Category } from "@/types/category";

interface CategoryStatusConfirmModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: Category, nextStatus: boolean) => Promise<void>;
}

export const CategoryStatusConfirmModal: React.FC<CategoryStatusConfirmModalProps> = ({
  category,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !category) return null;

  const willBeActive = !category.isActive;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onConfirm(category, willBeActive);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update category status.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                willBeActive
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {willBeActive ? (
                <CheckCircle2 className="w-5 h-5 text-[#00875a]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                {willBeActive ? "Activate Category" : "Deactivate Category"}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                PATCH /api/admin/products/categories/status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            {willBeActive ? (
              <>
                Are you sure you want to activate category{" "}
                <strong className="text-slate-900">&quot;{category.name}&quot;</strong>? It will
                immediately become visible in the customer storefront catalog and search filters.
              </>
            ) : (
              <>
                Are you sure you want to deactivate category{" "}
                <strong className="text-slate-900">&quot;{category.name}&quot;</strong>? This
                category will be hidden from the customer storefront.
              </>
            )}
          </p>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>Category:</span>
              <strong className="text-slate-800">{category.name}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Slug:</span>
              <code className="text-[11px] font-mono text-slate-700">{category.slug}</code>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Current Status:</span>
              <span className={`font-bold ${category.isActive ? "text-emerald-700" : "text-rose-600"}`}>
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs text-white shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
              willBeActive
                ? "bg-[#00875a] hover:bg-emerald-700 shadow-emerald-200"
                : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
            }`}
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{willBeActive ? "Yes, Activate Category" : "Yes, Deactivate Category"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
