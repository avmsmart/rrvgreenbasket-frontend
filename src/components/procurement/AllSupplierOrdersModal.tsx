"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  IndianRupee,
  Layers,
} from "lucide-react";
import { SupplierOrder } from "@/types";

interface AllSupplierOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierOrders: SupplierOrder[];
  dateFilter?: string;
}

export const AllSupplierOrdersModal: React.FC<AllSupplierOrdersModalProps> = ({
  isOpen,
  onClose,
  supplierOrders,
  dateFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredOrders = useMemo(() => {
    return supplierOrders.filter((order) => {
      if (statusFilter !== "All" && order.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesSupplier = order.supplierName.toLowerCase().includes(q);
        return matchesId || matchesSupplier;
      }
      return true;
    });
  }, [supplierOrders, statusFilter, searchQuery]);

  const totalValue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [filteredOrders]);

  if (!isOpen) return null;

  const getStatusBadge = (status: SupplierOrder["status"]) => {
    switch (status) {
      case "Received":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#eefcf2] text-[#15803d] border border-[#bbf7d0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
            <span>Received</span>
          </span>
        );
      case "Partially Received":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Partially Received</span>
          </span>
        );
      case "Ordered":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Ordered</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Supplier Purchase Orders (POs)
                </h2>
                {dateFilter && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eefcf2] text-[#00875a] border border-[#bbf7d0]">
                    {dateFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Consolidated purchase orders for Mandi & consignment suppliers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PO ID, supplier name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(["All", "Ordered", "Partially Received", "Received"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List / Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No purchase orders found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#00875a]/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-[#00875a]" />
                      <h4 className="text-sm font-bold text-slate-900">
                        {order.supplierName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.itemCount} Items</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Purchase Value</span>
                    <span className="text-sm font-black text-[#00875a] flex items-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-4">
            <span>
              Showing <strong className="text-slate-900">{filteredOrders.length}</strong> of{" "}
              <strong className="text-slate-900">{supplierOrders.length}</strong> POs
            </span>
            <span>
              Total Value: <strong className="text-[#00875a]">₹ {totalValue.toLocaleString("en-IN")}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
