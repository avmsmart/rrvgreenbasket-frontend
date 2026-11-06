"use client";

import React from "react";
import { Edit3, Trash2, Eye, Ticket, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Coupon } from "@/types/coupon";

interface CouponsTableProps {
  coupons: Coupon[];
  onToggleStatus: (couponId: string) => void;
  onEditCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const CouponsTable: React.FC<CouponsTableProps> = ({
  coupons,
  onToggleStatus,
  onEditCoupon,
  onDeleteCoupon,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-3xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto">
          <Ticket className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Coupons Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No promotional codes match your active filters. Try adjusting your search query or create a new coupon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. MOBILE CARD VIEW (sm:hidden) matching PDF Phone Mockup */}
      <div className="sm:hidden space-y-3">
        {coupons.map((coupon, idx) => {
          const sNo = (currentPage - 1) * pageSize + idx + 1;
          const [used, total] = coupon.usage.split("/").map((s) => Number(s.trim()) || 0);
          const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

          return (
            <div
              key={coupon.id}
              className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-3xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">#{sNo}</span>
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                    {coupon.code}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      coupon.status === "Active"
                        ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                        : coupon.status === "Scheduled"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : coupon.status === "Inactive"
                        ? "bg-slate-100 text-slate-600 border border-slate-200"
                        : "bg-rose-50 text-rose-600 border border-rose-200"
                    }`}
                  >
                    {coupon.status}
                  </span>

                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(coupon.id)}
                    aria-label={`Toggle active status for ${coupon.code}`}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                      coupon.status === "Active" ? "bg-[#00875a]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                        coupon.status === "Active" ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Offer Name & Discount */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-900">{coupon.offerName}</h4>
                  <span className="text-[11px] text-slate-500">
                    Min. Order: ₹{coupon.minOrder}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#00875a] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 inline-block">
                    {coupon.discount}
                  </span>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">{coupon.usage}</span> used
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-[#00875a] rounded-full"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span>Valid till {coupon.validTill}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEditCoupon(coupon)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCoupon(coupon.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DESKTOP TABLE VIEW (hidden sm:block) matching PDF Page 11 */}
      <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold text-center w-12">#</th>
                <th className="py-3 px-4 font-bold">Coupon Code</th>
                <th className="py-3 px-4 font-bold">Offer Name</th>
                <th className="py-3 px-4 font-bold">Discount</th>
                <th className="py-3 px-4 font-bold text-center">Min. Order</th>
                <th className="py-3 px-4 font-bold">Usage</th>
                <th className="py-3 px-4 font-bold">Valid Till</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {coupons.map((coupon, idx) => {
                const sNo = (currentPage - 1) * pageSize + idx + 1;
                const [used, total] = coupon.usage.split("/").map((s) => Number(s.trim()) || 0);
                const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

                return (
                  <tr
                    key={coupon.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* # */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {sNo}
                    </td>

                    {/* Coupon Code */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 group-hover:bg-emerald-50 group-hover:text-[#00875a] px-2.5 py-1 rounded-xl transition-colors">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Offer Name */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {coupon.offerName}
                    </td>

                    {/* Discount */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-[#00875a] border border-emerald-200">
                        {coupon.discount}
                      </span>
                    </td>

                    {/* Min. Order */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      ₹ {coupon.minOrder}
                    </td>

                    {/* Usage Progress */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          {coupon.usage}
                        </span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-[#00875a] rounded-full"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Valid Till */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {coupon.validTill}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          coupon.status === "Active"
                            ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                            : coupon.status === "Scheduled"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : coupon.status === "Inactive"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle switch */}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(coupon.id)}
                          title={`Toggle ${coupon.status === "Active" ? "Inactive" : "Active"}`}
                          aria-label={`Toggle active status for ${coupon.code}`}
                          className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 mr-1 ${
                            coupon.status === "Active" ? "bg-[#00875a]" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${
                              coupon.status === "Active" ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditCoupon(coupon)}
                          title="Edit Coupon"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteCoupon(coupon.id)}
                          title="Delete Coupon"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pagination Footer */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{totalItems > 0 ? startItem : 0}</strong> to{" "}
          <strong className="text-slate-800">{endItem}</strong> of{" "}
          <strong className="text-slate-800">{totalItems}</strong> coupons
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                currentPage === p
                  ? "bg-[#00875a] text-white shadow-xs"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
