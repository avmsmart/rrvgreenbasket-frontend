"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
} from "lucide-react";
import { OrderStatus, PaymentStatus } from "@/types";
import { getSystemDateFormatted, getOffsetDateFormatted } from "@/utils";

interface OrderFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  paymentFilter: string;
  onPaymentChange: (payment: string) => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
  paymentMethodFilter?: string;
  onPaymentMethodChange?: (method: string) => void;
  amountFilter?: string;
  onAmountFilterChange?: (range: string) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export const OrderFiltersBar: React.FC<OrderFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentFilter,
  onPaymentChange,
  dateFilter,
  onDateChange,
  paymentMethodFilter = "All",
  onPaymentMethodChange,
  amountFilter = "All",
  onAmountFilterChange,
  onReset,
  isFiltered,
}) => {
  const todayFormatted = getSystemDateFormatted();
  const yesterdayFormatted = getOffsetDateFormatted(-1);
  const day2Formatted = getOffsetDateFormatted(-2);
  const day3Formatted = getOffsetDateFormatted(-3);

  const DATE_PRESETS = [
    { label: `Today (${todayFormatted})`, value: todayFormatted },
    { label: `Yesterday (${yesterdayFormatted})`, value: yesterdayFormatted },
    { label: day2Formatted, value: day2Formatted },
    { label: day3Formatted, value: day3Formatted },
    { label: "Last 7 Days", value: "Last 7 Days" },
    { label: "All Dates", value: "All Dates" },
  ];

  // Calendar popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Temporary state for the filter modal before applying
  const [tempStatus, setTempStatus] = useState<string>(statusFilter);
  const [tempPayment, setTempPayment] = useState<string>(paymentFilter);
  const [tempMethod, setTempMethod] = useState<string>(paymentMethodFilter);
  const [tempAmount, setTempAmount] = useState<string>(amountFilter);

  const statusOptions: (OrderStatus | "All")[] = [
    "All",
    "Pending",
    "Processing",
    "In Packing",
    "Packed",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const paymentOptions: (PaymentStatus | "All")[] = [
    "All",
    "Paid",
    "Pending",
    "Failed",
    "Refunded",
  ];

  const paymentMethodOptions = [
    "All",
    "UPI",
    "COD",
    "Credit / Debit Card",
    "Net Banking",
  ];

  const amountOptions = [
    "All",
    "Under ₹200",
    "₹200 - ₹500",
    "Above ₹500",
  ];

  // Calendar logic for August 2025
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedDate = `${day} ${monthNames[calendarMonth].substring(0, 3)} ${calendarYear}`;
    onDateChange(formattedDate);
    setIsCalendarOpen(false);
  };

  // Open modal and sync temp states
  const handleOpenFilterModal = () => {
    setTempStatus(statusFilter);
    setTempPayment(paymentFilter);
    setTempMethod(paymentMethodFilter);
    setTempAmount(amountFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyModalFilters = () => {
    onStatusChange(tempStatus);
    onPaymentChange(tempPayment);
    if (onPaymentMethodChange) onPaymentMethodChange(tempMethod);
    if (onAmountFilterChange) onAmountFilterChange(tempAmount);
    setIsFilterModalOpen(false);
  };

  const handleResetModalFilters = () => {
    setTempStatus("All");
    setTempPayment("All");
    setTempMethod("All");
    setTempAmount("All");
    onReset();
    setIsFilterModalOpen(false);
  };

  // Active filter count for badge
  const activeFiltersCount =
    (statusFilter !== "All" ? 1 : 0) +
    (paymentFilter !== "All" ? 1 : 0) +
    (paymentMethodFilter !== "All" ? 1 : 0) +
    (amountFilter !== "All" ? 1 : 0);

  return (
    <>
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-3xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders, customer name, phone number..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white cursor-pointer"
          >
            <option value="All">All Status</option>
            {statusOptions
              .filter((s) => s !== "All")
              .map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
          </select>

          {/* Payment Status Dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => onPaymentChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00875a] focus:bg-white cursor-pointer"
          >
            <option value="All">All Payment Status</option>
            {paymentOptions
              .filter((p) => p !== "All")
              .map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
          </select>

          {/* Dynamic Interactive Calendar Date Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all hover:border-slate-300 shadow-3xs"
              title="Click to open calendar and select date"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#00875a]" />
              <span className="font-bold text-slate-900">
                {dateFilter}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isCalendarOpen ? "rotate-180 text-[#00875a]" : ""
                }`}
              />
            </button>

            {/* Interactive Calendar Popover */}
            {isCalendarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCalendarOpen(false)}
                />
                <div className="absolute right-0 sm:right-auto sm:left-0 top-11 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
                  {/* Calendar Header with Navigation */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <span className="text-xs font-black text-slate-900">
                        {monthNames[calendarMonth]} {calendarYear}
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-bold">
                        Select date to view orders
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day of Week Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <span
                        key={day}
                        className="text-[10px] font-bold text-slate-400 py-1"
                      >
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Day Cells Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Blank offset cells */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-1" />
                    ))}

                    {/* Day numbers */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${day} ${monthNames[calendarMonth].substring(0, 3)} ${calendarYear}`;
                      const isSelected = dateFilter === dateStr;
                      const availableDates = [todayFormatted, yesterdayFormatted, day2Formatted, day3Formatted, "25 Aug 2025"];
                      const hasData = availableDates.includes(dateStr);
                      const now = new Date();
                      const isToday =
                        day === now.getDate() &&
                        calendarMonth === now.getMonth() &&
                        calendarYear === now.getFullYear();

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          className={`relative p-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? "bg-[#00875a] text-white font-black shadow-xs scale-105"
                              : hasData
                              ? "text-slate-900 font-bold hover:bg-[#eefcf2] hover:text-[#00875a]"
                              : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                          } ${
                            isToday && !isSelected
                              ? "ring-1.5 ring-[#00875a] ring-offset-1 font-black"
                              : ""
                          }`}
                        >
                          <span>{day}</span>
                          {/* Dot indicator for dates with orders */}
                          {hasData && (
                            <span
                              className={`w-1 h-1 rounded-full mt-0.5 ${
                                isSelected ? "bg-white" : "bg-[#00875a]"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Quick Select Presets
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DATE_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => {
                            onDateChange(preset.value);
                            setIsCalendarOpen(false);
                          }}
                          className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-between ${
                            dateFilter === preset.value
                              ? "bg-[#eefcf2] text-[#00875a] font-bold border border-emerald-200"
                              : "text-slate-600 hover:bg-slate-50 border border-slate-100"
                          }`}
                        >
                          <span className="truncate">{preset.label}</span>
                          {dateFilter === preset.value && (
                            <Check className="w-3 h-3 text-[#00875a] flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Interactive Filter Button (Opens Filter Modal) */}
          <button
            type="button"
            onClick={handleOpenFilterModal}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer ${
              activeFiltersCount > 0
                ? "bg-[#00734d] text-white ring-2 ring-emerald-300"
                : "bg-[#00875a] text-white hover:bg-[#00734d]"
            }`}
            title="Open advanced filter dialog"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-[#00875a] text-[10px] font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Reset Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Dialog / Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsFilterModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#eefcf2] text-[#00875a] flex items-center justify-center">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Filter Orders
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Refine orders by status, payment &amp; amount
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* 1. Status Filter */}
              <div>
                <label className="font-bold text-slate-800 mb-2 block">
                  Order Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTempStatus(st)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        tempStatus === st
                          ? "bg-[#00875a] text-white font-bold shadow-3xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Payment Status */}
              <div>
                <label className="font-bold text-slate-800 mb-2 block">
                  Payment Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {paymentOptions.map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setTempPayment(pm)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        tempPayment === pm
                          ? "bg-[#00875a] text-white font-bold shadow-3xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Payment Method */}
              <div>
                <label className="font-bold text-slate-800 mb-2 block">
                  Payment Method
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {paymentMethodOptions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTempMethod(m)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        tempMethod === m
                          ? "bg-[#00875a] text-white font-bold shadow-3xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Order Amount Range */}
              <div>
                <label className="font-bold text-slate-800 mb-2 block">
                  Order Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {amountOptions.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTempAmount(amt)}
                      className={`p-2.5 rounded-xl font-semibold transition-all border text-left flex items-center justify-between ${
                        tempAmount === amt
                          ? "border-[#00875a] bg-[#eefcf2] text-[#00875a] font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{amt}</span>
                      {tempAmount === amt && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00875a]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetModalFilters}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 text-xs font-bold transition-colors"
              >
                Reset All
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyModalFilters}
                  className="px-5 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-3xs transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
