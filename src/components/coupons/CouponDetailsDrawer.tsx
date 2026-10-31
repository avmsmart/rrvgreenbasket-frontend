"use client";

import React, { useState } from "react";
import {
  X,
  Ticket,
  Percent,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Edit3,
  TrendingUp,
  Tag,
  DollarSign,
  Users,
} from "lucide-react";
import { Coupon } from "@/types/coupon";

interface CouponDetailsDrawerProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (coupon: Coupon) => void;
  onToggleStatus?: (id: string) => void;
}

export const CouponDetailsDrawer: React.FC<CouponDetailsDrawerProps> = ({
  coupon,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !coupon) return null;

  const [used, total] = coupon.usage.split("/").map((s) => Number(s.trim()) || 0);
  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-[#00875a] flex items-center justify-center shadow-3xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {coupon.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Coupon &amp; Offer Details
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Voucher Preview Card */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#00875a] to-[#006644] p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  Promotional Voucher
                </span>
                <h3 className="text-xl font-black mt-1 leading-tight">{coupon.offerName}</h3>
                <p className="text-xs text-emerald-100/90 mt-1 max-w-xs">
                  {coupon.description || `Special discount offer valid on orders above ₹${coupon.minOrder}`}
                </p>
              </div>
              <span className="text-2xl font-black bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                {coupon.discount}
              </span>
            </div>

            {/* Voucher Code Strip */}
            <div className="mt-5 pt-4 border-t border-dashed border-white/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-200">Code:</span>
                <span className="font-mono text-base font-black tracking-widest bg-white/10 px-3 py-1 rounded-xl border border-white/20">
                  {coupon.code}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-[#00875a] text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Usage & Redemptions Progress */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Redemption &amp; Quota Progress</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Times Redeemed
                </span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  {used} <span className="text-xs font-normal text-slate-400">/ {total || "∞"}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-[11px] font-bold text-emerald-800 block uppercase">
                  Total Customer Savings
                </span>
                <span className="text-base font-black text-[#00875a] block mt-0.5">
                  ₹ {(coupon.totalSaved || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Quota Consumption</span>
                <span className="text-[#00875a] font-bold">{percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${percent}%` }}
                  className="h-full rounded-full bg-[#00875a] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions Details */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00875a]" />
              <span>Offer Rules &amp; Validity</span>
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Discount Structure</span>
                <span className="font-bold text-slate-900">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% Percentage Discount`
                    : `Flat ₹${coupon.discountValue} Off`}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Minimum Order Value</span>
                <span className="font-bold text-slate-900">₹ {coupon.minOrder}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Expiry Date</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Valid till {coupon.validTill}</span>
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Current Status</span>
                <span className="font-bold text-[#00875a]">{coupon.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
          >
            Close
          </button>

          {onToggleStatus && (
            <button
              type="button"
              onClick={() => onToggleStatus(coupon.id)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                coupon.status === "Active"
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
              }`}
            >
              {coupon.status === "Active" ? "Pause Coupon" : "Activate Coupon"}
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(coupon);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold transition-all shadow-3xs flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Coupon</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
