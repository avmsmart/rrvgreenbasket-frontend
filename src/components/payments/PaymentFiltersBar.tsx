"use client";

import React from "react";
import { Search, ChevronDown } from "lucide-react";

interface PaymentFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  methodFilter: string;
  onMethodChange: (method: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const PaymentFiltersBar: React.FC<PaymentFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  methodFilter,
  onMethodChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}) => {
  const methodOptions = [
    "All Methods",
    "UPI (PhonePe)",
    "UPI (Google Pay)",
    "Cash on Delivery",
    "Card (Razorpay)",
    "Wallet (Paytm)",
  ];

  const statusOptions = ["All Status", "Paid", "Pending", "Failed", "Refunded"];

  const sortOptions = [
    { label: "Sort by: Newest First", value: "Newest First" },
    { label: "Sort by: Oldest First", value: "Oldest First" },
    { label: "Sort by: Amount (High to Low)", value: "Amount: High to Low" },
    { label: "Sort by: Amount (Low to High)", value: "Amount: Low to High" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* 1. Search Bar */}
      <div className="relative flex-1 min-w-[260px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Order ID, Transaction ID, Customer..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all"
        />
      </div>

      {/* 2. Dropdown Filters */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* Method Dropdown */}
        <div className="relative min-w-[140px] flex-1 sm:flex-initial">
          <select
            value={methodFilter}
            onChange={(e) => onMethodChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all cursor-pointer"
          >
            {methodOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[120px] flex-1 sm:flex-initial">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[160px] flex-1 sm:flex-initial">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
