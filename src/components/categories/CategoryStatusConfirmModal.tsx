"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Category } from "@/types/category";

const T = {
  primary: "#0B8A4F", primaryDark: "#076B3D", primaryTint: "#E7F6EE",
  accent: "#F59E0B", danger: "#E23744",
  bg: "#F6F8F7", card: "#FFFFFF", border: "#E6EBE8",
  text: "#111827", text2: "#5B6770", text3: "#9AA5AD",
};

interface CategoryStatusConfirmModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: Category, nextStatus: boolean) => Promise<void>;
}

export const CategoryStatusConfirmModal: React.FC<CategoryStatusConfirmModalProps> = ({
  category, isOpen, onClose, onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !category) return null;

  const willBeActive = !category.isActive;

  const handleConfirm = async () => {
    setIsSubmitting(true); setErrorMessage(null);
    try { await onConfirm(category, willBeActive); onClose(); }
    catch (err: unknown) { setErrorMessage(err instanceof Error ? err.message : "Failed to update."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: T.bg }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: willBeActive ? T.primaryTint : "#FFF8EC" }}>
              {willBeActive
                ? <CheckCircle2 className="w-5 h-5" style={{ color: T.primary }} />
                : <AlertTriangle className="w-5 h-5" style={{ color: T.accent }} />}
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight" style={{ color: T.text }}>
                {willBeActive ? "Activate Category" : "Deactivate Category"}
              </h3>
              <p className="text-xs font-medium" style={{ color: T.text3 }}>Confirm status change</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="p-2 rounded-xl cursor-pointer" style={{ color: T.text3 }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl text-xs font-medium" style={{ backgroundColor: "#FFF1F2", border: `1px solid #FECDD3`, color: T.danger }}>
              {errorMessage}
            </div>
          )}
          <p className="text-xs leading-relaxed" style={{ color: T.text2 }}>
            {willBeActive ? (
              <>Are you sure you want to activate <strong style={{ color: T.text }}>&quot;{category.name}&quot;</strong>? It will become visible on the storefront.</>
            ) : (
              <>Are you sure you want to deactivate <strong style={{ color: T.text }}>&quot;{category.name}&quot;</strong>? It will be hidden from customers.</>
            )}
          </p>
          <div className="p-3 rounded-2xl text-xs space-y-1" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }}>
            <Row label="Category" value={category.name} />
            <Row label="Slug" value={category.slug} mono />
            <Row label="Current"
              value={category.isActive ? "Active" : "Inactive"}
              valueColor={category.isActive ? T.primary : T.accent}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${T.border}`, backgroundColor: T.bg }}>
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs cursor-pointer"
            style={{ border: `1px solid ${T.border}`, color: T.text2 }}>
            Cancel
          </button>
          <button type="button" disabled={isSubmitting} onClick={handleConfirm}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: willBeActive ? T.primary : T.danger }}>
            {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{willBeActive ? "Yes, Activate" : "Yes, Deactivate"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean; valueColor?: string }> = ({
  label, value, mono, valueColor,
}) => (
  <div className="flex items-center justify-between" style={{ color: T.text2 }}>
    <span>{label}:</span>
    <span className={`font-bold ${mono ? "font-mono text-[11px]" : ""}`} style={{ color: valueColor || T.text }}>
      {value}
    </span>
  </div>
);
