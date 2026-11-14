"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Edit3,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FolderTree,
} from "lucide-react";
import { Category } from "@/types/category";
import { CategoryImage } from "./CategoryImage";

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

  if (!isOpen || !category) return null;

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
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200/90 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Category Details
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Product Service Microservice
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Category Hero / Header */}
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/80 border border-slate-200/80">
              <CategoryImage
                name={category.name}
                imageUrl={category.imageUrl}
                size={56}
                className="rounded-2xl"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-slate-900 leading-tight">
                  {category.name}
                </h4>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      category.isActive
                        ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
                        : "bg-rose-50 text-rose-600 border-rose-200"
                    }`}
                  >
                    {category.isActive ? (
                      <CheckCircle2 className="w-3 h-3 text-[#00875a]" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-600" />
                    )}
                    <span>{category.isActive ? "Active (Storefront Visible)" : "Inactive (Hidden)"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Field: Public ID (UUID) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Public Identifier (UUID)
              </label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700">
                <span className="truncate mr-2 select-all font-semibold">
                  {category.publicId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPublicId}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  title="Copy UUID to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Field: Slug */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Slug (URL Identifier)
              </label>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs font-semibold text-slate-800">
                {category.slug}
              </div>
            </div>

            {/* Field: Sort Order */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Sort Order (Display Priority)
              </label>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Display priority index</span>
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-900 font-black">
                  {category.sortOrder}
                </span>
              </div>
            </div>

            {/* Field: Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed min-h-[72px]">
                {category.description || (
                  <span className="text-slate-400 italic">No description provided for this category.</span>
                )}
              </div>
            </div>

            {/* Field: Image Asset */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Image Asset URL
              </label>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 break-all font-mono">
                {category.imageUrl ? (
                  <a
                    href={category.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1.5"
                  >
                    <span className="truncate">{category.imageUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No image URL configured.</span>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created At</span>
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {formatDateTime(category.createdAt)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated At</span>
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {formatDateTime(category.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(category);
              }}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Edit Category</span>
            </button>

            <button
              type="button"
              disabled={isStatusLoading}
              onClick={() => onRequestToggleStatus(category)}
              className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                category.isActive
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {isStatusLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : category.isActive ? (
                <XCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>{category.isActive ? "Deactivate" : "Activate"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
