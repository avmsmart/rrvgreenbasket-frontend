"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Edit3,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FolderTree,
} from "lucide-react";
import { Category } from "@/types/category";
import { CategoryImage } from "./CategoryImage";

/* ── design tokens ── */
const T = {
  primary: "#0B8A4F",
  primaryDark: "#076B3D",
  primaryTint: "#E7F6EE",
  accent: "#F59E0B",
  danger: "#E23744",
  info: "#2563EB",
  bg: "#F6F8F7",
  card: "#FFFFFF",
  border: "#E6EBE8",
  text: "#111827",
  text2: "#5B6770",
  text3: "#9AA5AD",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

interface CategoryDetailsDrawerProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: Category) => void;
  onRequestToggleStatus: (category: Category) => void;
  isStatusLoading?: boolean;
}

export const CategoryDetailsDrawer: React.FC<CategoryDetailsDrawerProps> = ({
  category,
  isOpen,
  onClose,
  onEdit,
  onRequestToggleStatus,
  isStatusLoading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen, category]);

  if (!mounted || !category) return null;

  const handleCopyPublicId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(category.publicId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return dateStr; }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        visible ? "bg-[#111827]/60 backdrop-blur-sm" : "bg-[#111827]/0 backdrop-blur-none"
      }`}
      onClick={onClose}
    >
      {/* ── MOBILE: Bottom Sheet ── */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 rounded-t-3xl flex flex-col max-h-[92dvh] transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ backgroundColor: T.card, borderTop: `1px solid ${T.border}`, boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: T.border }} />
        </div>
        <div className="px-5 pb-3 pt-1 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.primaryTint }}>
              <FolderTree className="w-4 h-4" style={{ color: T.primary }} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight" style={{ color: T.text }}>Category Details</h3>
              <p className="text-[11px] font-medium" style={{ color: T.text3 }}>Product Service</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl transition-colors cursor-pointer" style={{ color: T.text3 }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          <DrawerBody category={category} copied={copied} onCopy={handleCopyPublicId} formatDateTime={formatDateTime} />
        </div>
        <div className="flex-shrink-0 px-5 pb-6 pt-3 flex items-center gap-3" style={{ borderTop: `1px solid ${T.border}`, backgroundColor: T.card }}>
          <DrawerFooter category={category} isStatusLoading={isStatusLoading} onEdit={() => { onClose(); onEdit(category); }} onToggle={() => onRequestToggleStatus(category)} />
        </div>
      </div>

      {/* ── DESKTOP: Right-Side Drawer ── */}
      <div
        className={`hidden md:flex absolute inset-y-0 right-0 w-full max-w-md flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: T.card, borderLeft: `1px solid ${T.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: T.bg }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: T.primaryTint }}>
              <FolderTree className="w-5 h-5" style={{ color: T.primary }} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight" style={{ color: T.text }}>Category Details</h3>
              <p className="text-xs font-medium" style={{ color: T.text3 }}>Product Service</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl transition-colors cursor-pointer" style={{ color: T.text3 }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <DrawerBody category={category} copied={copied} onCopy={handleCopyPublicId} formatDateTime={formatDateTime} />
        </div>
        <div className="p-6 flex items-center gap-3 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, backgroundColor: T.bg }}>
          <DrawerFooter category={category} isStatusLoading={isStatusLoading} onEdit={() => { onClose(); onEdit(category); }} onToggle={() => onRequestToggleStatus(category)} />
        </div>
      </div>
    </div>
  );
};

/* ─── Shared body ─── */
interface DrawerBodyProps { category: Category; copied: boolean; onCopy: () => void; formatDateTime: (d: string) => string; }

const DrawerBody: React.FC<DrawerBodyProps> = ({ category, copied, onCopy, formatDateTime }) => (
  <>
    {/* Hero */}
    <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }}>
      <CategoryImage name={category.name} imageUrl={category.imageUrl} size={56} className="rounded-2xl flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <h4 className="text-base font-black leading-tight" style={{ color: T.text }}>{category.name}</h4>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={category.isActive
              ? { backgroundColor: T.primaryTint, color: T.primaryDark }
              : { backgroundColor: "#FFF8EC", color: "#B45309" }}
          >
            {category.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{category.isActive ? "Active" : "Inactive"}</span>
          </span>
        </div>
      </div>
    </div>

    {/* Public ID */}
    <Field label="Public Identifier (UUID)">
      <div className="flex items-center justify-between p-3 rounded-2xl font-mono text-xs" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}`, color: T.text2 }}>
        <span className="truncate mr-2 select-all font-semibold">{category.publicId}</span>
        <button type="button" onClick={onCopy} className="p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0" style={{ color: T.text3 }} title="Copy UUID">
          {copied ? <Check className="w-4 h-4" style={{ color: T.primary }} /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </Field>

    {/* Slug */}
    <Field label="Slug (URL Identifier)">
      <div className="p-3 rounded-2xl font-mono text-xs font-semibold" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}`, color: T.text }}>{category.slug}</div>
    </Field>

    {/* Sort Order */}
    <Field label="Sort Order">
      <div className="p-3 rounded-2xl text-xs font-bold flex items-center justify-between" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}`, color: T.text }}>
        <span style={{ color: T.text2 }}>Display priority</span>
        <span className="px-3 py-1 rounded-xl font-black" style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, color: T.text }}>{category.sortOrder}</span>
      </div>
    </Field>

    {/* Description */}
    <Field label="Description">
      <div className="p-3.5 rounded-2xl text-xs font-medium whitespace-pre-wrap leading-relaxed min-h-[72px]" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}`, color: T.text2 }}>
        {category.description || <span className="italic" style={{ color: T.text3 }}>No description provided.</span>}
      </div>
    </Field>

    {/* Image URL */}
    <Field label="Image Asset URL">
      <div className="p-3 rounded-2xl text-xs break-all font-mono" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}`, color: T.text2 }}>
        {category.imageUrl ? (
          <a href={category.imageUrl} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1.5" style={{ color: T.info }}>
            <span className="truncate">{category.imageUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        ) : (
          <span className="italic" style={{ color: T.text3 }}>No image configured.</span>
        )}
      </div>
    </Field>

    {/* Timestamps */}
    <div className="grid grid-cols-2 gap-3 pt-2">
      <TimeBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Created" value={formatDateTime(category.createdAt)} />
      <TimeBlock icon={<Clock className="w-3.5 h-3.5" />} label="Updated" value={formatDateTime(category.updatedAt)} />
    </div>
  </>
);

/* ─── Shared footer ─── */
interface DrawerFooterProps { category: Category; isStatusLoading: boolean; onEdit: () => void; onToggle: () => void; }

const DrawerFooter: React.FC<DrawerFooterProps> = ({ category, isStatusLoading, onEdit, onToggle }) => (
  <>
    <button
      type="button" onClick={onEdit}
      className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, color: T.text2 }}
    >
      <Edit3 className="w-4 h-4" style={{ color: T.info }} />
      <span>Edit Category</span>
    </button>
    <button
      type="button" disabled={isStatusLoading} onClick={onToggle}
      className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      style={category.isActive
        ? { backgroundColor: "#FFF1F2", color: T.danger, border: `1px solid #FECDD3` }
        : { backgroundColor: T.primaryTint, color: T.primaryDark, border: `1px solid #BBF7D0` }}
    >
      {isStatusLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : category.isActive ? (
        <XCircle className="w-4 h-4" />
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      <span>{category.isActive ? "Deactivate" : "Activate"}</span>
    </button>
  </>
);

/* ─── Tiny helpers ─── */
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>{label}</label>
    {children}
  </div>
);

const TimeBlock: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="p-3 rounded-2xl space-y-1" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }}>
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>
      {icon}<span>{label}</span>
    </div>
    <div className="text-xs font-bold" style={{ color: T.text }}>{value}</div>
  </div>
);
