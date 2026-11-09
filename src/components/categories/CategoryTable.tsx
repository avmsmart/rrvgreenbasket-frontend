"use client";

import React from "react";
import {
  Edit3,
  Eye,
  CheckCircle2,
  XCircle,
  FolderTree,
  Calendar,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { Category } from "@/types/category";
import { CategoryImage } from "./CategoryImage";

interface CategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
  onViewDetails: (category: Category) => void;
  onEdit: (category: Category) => void;
  onRequestToggleStatus: (category: Category) => void;
  statusLoadingId?: string | null;
  onOpenAddModal?: () => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading = false,
  onViewDetails,
  onEdit,
  onRequestToggleStatus,
  statusLoadingId = null,
  onOpenAddModal,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-3xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto">
          <FolderTree className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Categories Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No categories match your active search or filter criteria. Create your first category to get started.
        </p>
        {onOpenAddModal && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-2xl bg-[#00875a] hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 transition-all cursor-pointer"
            >
              + Add New Category
            </button>
          </div>
        )}
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================
          1. DESKTOP TABLE VIEW (Hidden on small screens)
          ======================================================== */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-200/70 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold text-center w-12">#</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Slug</th>
                <th className="py-3 px-4 font-bold max-w-xs">Description</th>
                <th className="py-3 px-4 font-bold text-center">Sort Order</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-center">Active Switch</th>
                <th className="py-3 px-4 font-bold text-center">Updated</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {categories.map((cat, idx) => {
                const sNo = idx + 1;
                const isOperating = statusLoadingId === cat.publicId;

                return (
                  <tr
                    key={cat.publicId}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* S.No */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {sNo}
                    </td>

                    {/* Category Image & Name */}
                    <td className="py-3.5 px-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => onViewDetails(cat)}
                      >
                        <CategoryImage name={cat.name} imageUrl={cat.imageUrl} size={36} />
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-[#00875a] transition-colors leading-tight">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {cat.publicId.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {cat.slug}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-500 truncate" title={cat.description || "No description provided"}>
                        {cat.description || <span className="text-slate-300 italic">No description</span>}
                      </p>
                    </td>

                    {/* Sort Order */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                        {cat.sortOrder}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          cat.isActive
                            ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                        }`}
                      >
                        {cat.isActive ? (
                          <CheckCircle2 className="w-3 h-3 text-[#00875a]" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{cat.isActive ? "Active" : "Inactive"}</span>
                      </span>
                    </td>

                    {/* Active Toggle Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={cat.isActive}
                          aria-label={`${cat.isActive ? "Deactivate" : "Activate"} ${cat.name}`}
                          title={cat.isActive ? "Click to deactivate category" : "Click to activate category"}
                          disabled={isOperating}
                          onClick={() => onRequestToggleStatus(cat)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer ${
                            cat.isActive ? "bg-[#00875a]" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                              cat.isActive ? "translate-x-4.5" : "translate-x-0.5"
                            }`}
                          />
                          {isOperating && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="h-2 w-2 rounded-full border border-white border-t-transparent animate-spin" />
                            </span>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Updated Date */}
                    <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                      {formatDate(cat.updatedAt || cat.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(cat)}
                          title="View category details"
                          className="p-1.5 text-slate-500 hover:text-[#00875a] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(cat)}
                          title="Edit category"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          2. MOBILE CARD VIEW (Shown on small screens)
          ======================================================== */}
      <div className="md:hidden space-y-3">
        {categories.map((cat, idx) => {
          const sNo = idx + 1;
          const isOperating = statusLoadingId === cat.publicId;

          return (
            <div
              key={cat.publicId}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-3xs flex flex-col justify-between group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                  #{sNo}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    cat.isActive
                      ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}
                >
                  {cat.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{cat.isActive ? "Active" : "Inactive"}</span>
                </span>
              </div>

              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onViewDetails(cat)}
              >
                <CategoryImage name={cat.name} imageUrl={cat.imageUrl} size={44} />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#00875a] transition-colors leading-tight truncate">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">slug: {cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Sort Order:</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                    {cat.sortOrder}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {cat.isActive ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={cat.isActive}
                    disabled={isOperating}
                    onClick={() => onRequestToggleStatus(cat)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      cat.isActive ? "bg-[#00875a]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                        cat.isActive ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Updated {formatDate(cat.updatedAt || cat.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onViewDetails(cat)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(cat)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
