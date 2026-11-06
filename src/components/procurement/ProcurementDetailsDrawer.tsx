"use client";

import React from "react";
import {
  X,
  Edit3,
  CheckCircle2,
  Clock,
  IndianRupee,
  Building,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
} from "lucide-react";
import { ProcurementItem, ProcurementStatus } from "@/types";
import { ProduceImage } from "@/components/common";

interface ProcurementDetailsDrawerProps {
  item: ProcurementItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: ProcurementItem) => void;
  onStatusChange: (id: string, status: ProcurementStatus) => void;
}

export const ProcurementDetailsDrawer: React.FC<
  ProcurementDetailsDrawerProps
> = ({ item, isOpen, onClose, onEdit, onStatusChange }) => {
  if (!isOpen || !item) return null;

  const progressPercent =
    item.requiredQty > 0
      ? Math.min(100, Math.round((item.procuredQty / item.requiredQty) * 100))
      : 0;

  const unitRate =
    item.requiredQty > 0 ? (item.estimatedCost / item.requiredQty).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <ProduceImage name={item.productName} size={48} className="rounded-2xl shadow-3xs" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {item.productName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {item.id} • Procurement Plan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status & Priority Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Current Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  item.status === "Completed"
                    ? "bg-[#e6f9ed] text-[#12783d]"
                    : item.status === "Partial"
                    ? "bg-[#fef9c3] text-[#a16207]"
                    : "bg-[#fee2e2] text-[#b91c1c]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.status === "Completed"
                      ? "bg-[#12783d]"
                      : item.status === "Partial"
                      ? "bg-[#a16207]"
                      : "bg-[#b91c1c]"
                  }`}
                />
                {item.status}
              </span>
            </div>

            {item.priority && (
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Priority
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                    item.priority === "High Priority"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            )}
          </div>

          {/* Fulfillment Progress */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700">Procurement Fulfillment</span>
              <span className="text-[#00875a]">{progressPercent}% Fulfilled</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[#00875a]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5 mt-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Required
                </span>
                <span className="text-base font-black text-slate-900">
                  {item.requiredQty} {item.unit}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 block">
                  Procured
                </span>
                <span className="text-base font-black text-emerald-800">
                  {item.procuredQty} {item.unit}
                </span>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-700 block">
                  Pending
                </span>
                <span className="text-base font-black text-amber-800">
                  {item.pendingQty} {item.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Cost & Commercials */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#00875a]" />
              Commercials & Pricing
            </h3>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3xs space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Total Cost:</span>
                <span className="font-bold text-slate-900 text-base">
                  ₹ {item.estimatedCost.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Unit Rate:</span>
                <span className="font-semibold text-slate-700">
                  ₹ {unitRate} per {item.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Billing Basis:</span>
                <span className="text-slate-600 font-medium">
                  Morning APMC Auction Average
                </span>
              </div>
            </div>
          </div>

          {/* Supplier & Logistics Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#00875a]" />
              Vendor & Sourcing
            </h3>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3xs space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Supplier Name:</span>
                <span className="font-bold text-[#00875a]">{item.supplier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Planned Date:</span>
                <span className="font-medium text-slate-700">
                  {item.date || "26 Aug 2025"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mandi Cutoff:</span>
                <span className="text-slate-600 font-medium">06:00 AM Yard Arrival</span>
              </div>
            </div>
          </div>

          {/* Mandi & Quality Notes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#00875a]" />
              Quality Inspection & Notes
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {item.notes ||
                "Standard Mandi procurement protocol applies. Check for freshness, absence of pest markings, and appropriate moisture levels during morning unloading."}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit Item</span>
          </button>

          {item.status !== "Completed" ? (
            <button
              type="button"
              onClick={() => onStatusChange(item.id, "Completed")}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-3xs cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Completed</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStatusChange(item.id, "Partial")}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-3xs cursor-pointer active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>Mark Partial</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
