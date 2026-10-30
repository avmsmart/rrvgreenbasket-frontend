"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  ChevronRight,
  User,
  Clock,
  Phone,
  ArrowRight,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";
import { DeliveryIssue, DeliveryOrder } from "@/types";

interface DeliveryIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: DeliveryIssue[];
  orders: DeliveryOrder[];
  selectedDate: string;
  onViewOrder: (order: DeliveryOrder) => void;
  onReassignOrder: (order: DeliveryOrder) => void;
  onFilterFailedInTable: () => void;
}

export const DeliveryIssuesModal: React.FC<DeliveryIssuesModalProps> = ({
  isOpen,
  onClose,
  issues,
  orders,
  selectedDate,
  onViewOrder,
  onReassignOrder,
  onFilterFailedInTable,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredIssues = issues.filter((issue) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      issue.orderId.toLowerCase().includes(q) ||
      (issue.customerName && issue.customerName.toLowerCase().includes(q)) ||
      (issue.partnerName && issue.partnerName.toLowerCase().includes(q)) ||
      issue.reason.toLowerCase().includes(q)
    );
  });

  const getReasonColor = (reason: string) => {
    const lower = reason.toLowerCase();
    if (lower.includes("not reachable") || lower.includes("phone")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (lower.includes("wrong address") || lower.includes("address")) {
      return "bg-red-50 text-red-800 border-red-200";
    }
    if (lower.includes("payment") || lower.includes("cod")) {
      return "bg-purple-50 text-purple-800 border-purple-200";
    }
    return "bg-rose-50 text-rose-800 border-rose-200";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50/60 to-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100/80 text-red-700 flex items-center justify-center shadow-3xs">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  All Delivery Issues & Exceptions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-700">
                  {issues.length} Issues
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active delivery exceptions requiring admin resolution for <span className="font-semibold text-slate-700">{selectedDate}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer, partner, or reason..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onFilterFailedInTable();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#00875a] text-white hover:bg-[#00704a] transition-colors cursor-pointer shadow-3xs whitespace-nowrap"
            title="Filter the main table to show Failed orders"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Show In Table</span>
          </button>
        </div>

        {/* Issues List */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No issues matching search</p>
              <p className="text-xs text-slate-400 mt-1">Try another search keyword</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const matchedOrder = orders.find(
                (o) => o.id.toLowerCase() === issue.orderId.toLowerCase()
              );

              return (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl border border-red-100 bg-red-50/30 hover:bg-red-50/60 hover:border-red-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono font-bold text-xs text-red-800 bg-red-100/80 px-2 py-0.5 rounded-md">
                        {issue.orderId}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {issue.time}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${getReasonColor(
                          issue.reason
                        )}`}
                      >
                        {issue.reason}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      {issue.customerName && (
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <User className="w-3 h-3 text-slate-400" />
                          {issue.customerName}
                        </span>
                      )}
                      {issue.partnerName && (
                        <span className="text-slate-500">
                          Assigned: <span className="font-semibold text-slate-700">{issue.partnerName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const targetOrder = matchedOrder || {
                          id: issue.orderId,
                          customerName: issue.customerName || "Customer",
                          customerPhone: "+91 98765 43210",
                          customerAddress: "Main Road, Kurnool",
                          area: "Kurnool Town",
                          itemsCount: 4,
                          amount: 320,
                          paymentMethod: "UPI" as const,
                          paymentStatus: "Paid" as const,
                          status: "Failed" as const,
                          orderTime: issue.time,
                          orderDate: selectedDate,
                          assignedPartnerName: issue.partnerName || "Delivery Team",
                          failureReason: issue.reason,
                        };
                        onReassignOrder(targetOrder);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      Reassign
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetOrder = matchedOrder || {
                          id: issue.orderId,
                          customerName: issue.customerName || "Customer",
                          customerPhone: "+91 98765 43210",
                          customerAddress: "Main Road, Kurnool",
                          area: "Kurnool Town",
                          itemsCount: 4,
                          amount: 320,
                          paymentMethod: "UPI" as const,
                          paymentStatus: "Paid" as const,
                          status: "Failed" as const,
                          orderTime: issue.time,
                          orderDate: selectedDate,
                          assignedPartnerName: issue.partnerName || "Delivery Team",
                          failureReason: issue.reason,
                        };
                        onViewOrder(targetOrder);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-3xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Tip: You can reassign or mark redeliver directly from order details.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
