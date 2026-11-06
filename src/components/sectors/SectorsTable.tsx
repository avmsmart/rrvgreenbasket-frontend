"use client";

import React from "react";
import { Sector } from "@/types/sector";
import { 
  Edit3, 
  Trash2, 
  Star, 
  Package, 
  ShoppingBag, 
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  TrendingUp
} from "lucide-react";

interface SectorsTableProps {
  sectors: Sector[];
  onEdit: (sector: Sector) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export const SectorsTable: React.FC<SectorsTableProps> = ({
  sectors,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
}) => {
  if (sectors.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl mb-3">
          🔍
        </div>
        <h4 className="text-base font-bold text-slate-800">No sectors found</h4>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ========================================================
          1. DESKTOP TABLE VIEW (Hidden on small screens)
          ======================================================== */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-3">Sector</th>
                <th className="py-3.5 px-3">Order</th>
                <th className="py-3.5 px-3">Products</th>
                <th className="py-3.5 px-3">Orders</th>
                <th className="py-3.5 px-3">Revenue</th>
                <th className="py-3.5 px-3">Featured</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
              {sectors.map((sector) => {
                const isActive = sector.status === "Active";
                return (
                  <tr
                    key={sector.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Sector Name & Icon */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-xl flex-shrink-0 shadow-3xs overflow-hidden">
                          {sector.image ? (
                            <img src={sector.image} alt={sector.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{sector.icon || "📦"}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-[#00875a] transition-colors">
                            {sector.name}
                          </div>
                          {sector.description && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {sector.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs">
                        {sector.displayOrder || 0}
                      </span>
                    </td>

                    {/* Products */}
                    <td className="py-4 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sector.productsCount || 0} items</span>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="py-4 px-3 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sector.totalOrders || 0}</span>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="py-4 px-3">
                      <span className="font-black text-slate-900">
                        ₹ {(sector.revenue || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Featured on App Toggle */}
                    <td className="py-4 px-3">
                      <button
                        onClick={() => onToggleFeatured(sector.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          sector.isFeatured
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200"
                        }`}
                      >
                        <Star className={`w-3 h-3 ${sector.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                        <span>{sector.isFeatured ? "Featured" : "Standard"}</span>
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-3">
                      <button
                        onClick={() => onToggleStatus(sector.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? "bg-emerald-50 text-[#00875a] border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#00875a]" : "bg-slate-400"}`} />
                        <span>{sector.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(sector)}
                          title="Edit Sector"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(sector.id)}
                          title="Delete Sector"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
          2. MOBILE CARDS VIEW (< md screens)
          ======================================================== */}
      <div className="md:hidden space-y-3">
        {sectors.map((sector) => {
          const isActive = sector.status === "Active";
          return (
            <div
              key={sector.id}
              className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-3xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-3xs overflow-hidden">
                    {sector.image ? (
                      <img src={sector.image} alt={sector.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{sector.icon || "📦"}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {sector.name}
                      </h4>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        #{sector.displayOrder}
                      </span>
                    </div>
                    {sector.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {sector.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(sector)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(sector.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-2xl text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400">Products</div>
                  <div className="text-xs font-black text-slate-900">
                    {sector.productsCount || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">Orders</div>
                  <div className="text-xs font-black text-slate-900">
                    {sector.totalOrders || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">Revenue</div>
                  <div className="text-xs font-black text-[#00875a]">
                    ₹ {(sector.revenue || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Badges / Quick toggles */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onToggleFeatured(sector.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    sector.isFeatured
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  <Star className={`w-3 h-3 ${sector.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>{sector.isFeatured ? "Featured" : "Standard"}</span>
                </button>

                <button
                  onClick={() => onToggleStatus(sector.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-emerald-50 text-[#00875a] border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#00875a]" : "bg-slate-400"}`} />
                  <span>{sector.status}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
