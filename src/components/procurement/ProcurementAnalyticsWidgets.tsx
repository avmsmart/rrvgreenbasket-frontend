"use client";

import React, { useState } from "react";
import {
  PieChart as PieIcon,
  Truck,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  CategoryProcurementSummary,
  SupplierOrder,
  PendingProcurementItem,
} from "@/types";
import { ProduceImage } from "@/components/common";

interface ProcurementAnalyticsWidgetsProps {
  categories: CategoryProcurementSummary[];
  supplierOrders: SupplierOrder[];
  pendingItems: PendingProcurementItem[];
  dateFilter?: string;
  onViewSupplierOrders?: () => void;
  onViewPendingItems?: () => void;
  onSelectPendingItem?: (item: PendingProcurementItem) => void;
}

export const ProcurementAnalyticsWidgets: React.FC<
  ProcurementAnalyticsWidgetsProps
> = ({
  categories,
  supplierOrders,
  pendingItems,
  dateFilter = "25 Aug 2025",
  onViewSupplierOrders,
  onViewPendingItems,
  onSelectPendingItem,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Calculate SVG donut stroke dash parameters
  const totalItems = categories.reduce((acc, c) => acc + c.count, 0) || 35;
  const radius = 58;
  const circumference = 2 * Math.PI * radius; // ~364.42

  const dateBadgeText =
    dateFilter === "26 Aug 2025"
      ? "Tomorrow (26 Aug)"
      : dateFilter === "25 Aug 2025"
      ? "Today (25 Aug)"
      : dateFilter === "24 Aug 2025"
      ? "Yesterday (24 Aug)"
      : dateFilter;

  const getSupplierStatusBadge = (status: SupplierOrder["status"]) => {
    switch (status) {
      case "Received":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#eefcf2] text-[#15803d] border border-[#bbf7d0]">
            <CheckCircle2 className="w-3 h-3 text-[#15803d]" />
            <span>Received</span>
          </span>
        );
      case "Partially Received":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Partially Received</span>
          </span>
        );
      case "Ordered":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Ordered</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: PendingProcurementItem["priority"]) => {
    switch (priority) {
      case "High Priority":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            High Priority
          </span>
        );
      case "Medium":
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Medium
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Category Wise Procurement Donut Card - Matching OrderAnalyticsWidgets styling */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#00875a] text-white flex items-center justify-center">
                <PieIcon className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Category Wise Procurement
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200/90 px-2.5 py-1 rounded-xl">
              {dateBadgeText}
            </span>
          </div>

          {/* Donut and Legend Layout */}
          <div className="flex items-center justify-between gap-4 py-2">
            {/* Donut Chart SVG with Center Text */}
            <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                {/* Background Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="14"
                  fill="transparent"
                />

                {/* Slices */}
                {categories.map((cat, idx) => {
                  const accumulatedPercent = categories
                    .slice(0, idx)
                    .reduce((sum, c) => sum + c.percentage, 0);
                  const strokeDasharray = `${
                    (cat.percentage / 100) * circumference
                  } ${circumference}`;
                  const strokeDashoffset = -(
                    (accumulatedPercent / 100) *
                    circumference
                  );
                  const isHovered = hoveredCategory === cat.category;

                  return (
                    <circle
                      key={cat.category}
                      cx="70"
                      cy="70"
                      r={radius}
                      stroke={cat.color}
                      strokeWidth={isHovered ? 18 : 14}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(cat.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Hole Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 leading-tight">
                  {hoveredCategory
                    ? categories.find((c) => c.category === hoveredCategory)?.count
                    : totalItems}
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {hoveredCategory || "Items"}
                </span>
              </div>
            </div>

            {/* Right Legend */}
            <div className="flex-1 space-y-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.category}
                  onMouseEnter={() => setHoveredCategory(cat.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between text-xs py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                    hoveredCategory === cat.category ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-700">
                      {cat.category}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {cat.count} ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Fresh Mandi Procurement</span>
          <span className="text-[#00875a] font-bold">100% Consolidated</span>
        </div>
      </div>

      {/* 2. Supplier Orders Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#00875a] text-white flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Supplier Orders
              </h3>
            </div>
            <button
              type="button"
              onClick={onViewSupplierOrders}
              className="text-xs font-bold text-[#00875a] hover:text-[#00704a] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* List of supplier orders */}
          <div className="space-y-3">
            {supplierOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active POs for this date.
              </div>
            ) : (
              supplierOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-[#eefcf2]/30 hover:border-emerald-200 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {order.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {order.supplierName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {order.date}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="text-xs font-bold text-slate-900">
                      <span className="text-slate-500 font-medium mr-1.5">
                        {order.itemCount} items
                      </span>
                      ₹ {order.totalAmount.toLocaleString("en-IN")}
                    </div>
                    {getSupplierStatusBadge(order.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          {supplierOrders.length} Active POs with Mandi & Consignment Vendors
        </div>
      </div>

      {/* 3. Pending Procurement Items Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Pending Procurement Items
              </h3>
            </div>
            <button
              type="button"
              onClick={onViewPendingItems}
              className="text-xs font-bold text-[#00875a] hover:text-[#00704a] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* List of pending items with photos */}
          <div className="space-y-2.5">
            {pendingItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-700 font-medium bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-[#00875a] mx-auto mb-1.5" />
                All items 100% procured for this date!
              </div>
            ) : (
              pendingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectPendingItem && onSelectPendingItem(item)}
                  className="p-2 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <ProduceImage
                      name={item.productName}
                      size={36}
                      className="rounded-xl shadow-3xs"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-[#00875a] transition-colors">
                        {item.productName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.pendingQty} {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
          <span>Priority Mandi Purchases</span>
          <span className={pendingItems.length > 0 ? "text-rose-600 font-bold" : "text-[#00875a] font-bold"}>
            {pendingItems.length > 0
              ? `${pendingItems.length} Items Require Action`
              : "0 Shortages"}
          </span>
        </div>
      </div>
    </div>
  );
};
