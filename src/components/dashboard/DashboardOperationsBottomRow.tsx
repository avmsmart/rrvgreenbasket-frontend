"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const DashboardOperationsBottomRow: React.FC = () => {
  const [countdownText, setCountdownText] = useState("12h 30m remaining");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(22, 0, 0, 0); // 10:00 PM

      let diff = cutoff.getTime() - now.getTime();
      if (diff < 0) {
        // Next day 10 PM
        diff += 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdownText(`${hours}h ${mins}m remaining`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Today's Order Timeline (lg:col-span-5) */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00875a]" />
              <span>Today&apos;s Order Timeline</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Live Stage Flow
            </span>
          </div>

          {/* Stepper with connecting line matching PDF design */}
          <div className="py-4 px-1 sm:px-2">
            <div className="relative flex items-center justify-between">
              {/* Horizontal Connecting Progress Line anchored to circle center */}
              <div className="absolute top-4 left-4 right-4 -translate-y-1/2 h-1 bg-slate-100 z-0">
                <div className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-[#00875a] w-[88%]" />
              </div>

              {/* Step 1: Pending */}
              <div className="relative z-10 flex flex-col items-center group w-1/4">
                <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-xs font-black text-amber-700 shadow-xs group-hover:scale-110 transition-transform">
                  6
                </div>
                <div className="hidden sm:flex flex-col items-center text-center mt-2">
                  <span className="text-[11px] font-bold text-slate-600">Pending</span>
                  <span className="text-[10px] text-slate-400 font-medium">New</span>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="relative z-10 flex flex-col items-center group w-1/4">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-xs font-black text-emerald-700 shadow-xs group-hover:scale-110 transition-transform">
                  28
                </div>
                <div className="hidden sm:flex flex-col items-center text-center mt-2">
                  <span className="text-[11px] font-bold text-slate-600">Processing</span>
                  <span className="text-[10px] text-slate-400 font-medium">In Packing</span>
                </div>
              </div>

              {/* Step 3: Out for Delivery */}
              <div className="relative z-10 flex flex-col items-center group w-1/4">
                <div className="w-8 h-8 rounded-full bg-[#eaf8f0] border-2 border-[#00875a] flex items-center justify-center text-xs font-black text-[#00875a] shadow-xs group-hover:scale-110 transition-transform">
                  52
                </div>
                <div className="hidden sm:flex flex-col items-center text-center mt-2">
                  <span className="text-[11px] font-bold text-slate-600">Out for Delivery</span>
                  <span className="text-[10px] text-slate-400 font-medium">On Transit</span>
                </div>
              </div>

              {/* Step 4: Delivered */}
              <div className="relative z-10 flex flex-col items-center group w-1/4">
                <div className="w-8 h-8 rounded-full bg-[#00875a] border-2 border-[#00875a] flex items-center justify-center text-xs font-black text-white shadow-xs group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="hidden sm:flex flex-col items-center text-center mt-2">
                  <span className="text-[11px] font-bold text-[#00875a]">Delivered</span>
                  <span className="text-[10px] text-emerald-700 font-bold">84 orders</span>
                </div>
              </div>
            </div>

            {/* Mobile-Only Stage Breakdown (Zero collisions on small screens) */}
            <div className="sm:hidden grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
              <div className="p-2 bg-amber-50/70 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold block">Pending</span>
                  <span className="text-[9px] text-slate-400">New arrivals</span>
                </div>
                <span className="text-xs font-black text-amber-700">6</span>
              </div>

              <div className="p-2 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold block">Processing</span>
                  <span className="text-[9px] text-slate-400">In packing</span>
                </div>
                <span className="text-xs font-black text-emerald-700">28</span>
              </div>

              <div className="p-2 bg-teal-50/70 rounded-xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-teal-800 font-bold block">In Transit</span>
                  <span className="text-[9px] text-slate-400">Out for delivery</span>
                </div>
                <span className="text-xs font-black text-[#00875a]">52</span>
              </div>

              <div className="p-2 bg-green-50/70 rounded-xl border border-green-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-green-800 font-bold block">Delivered</span>
                  <span className="text-[9px] text-emerald-600 font-bold">Completed</span>
                </div>
                <span className="text-xs font-black text-[#00875a]">84</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target cutoff: <strong className="text-slate-800">11:00 AM slots</strong></span>
          <Link href="/admin/delivery" className="font-bold text-[#00875a] hover:underline flex items-center gap-1">
            <span>Live Map</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. Upcoming Order Cut-off (lg:col-span-3) */}
      <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#00875a]" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Upcoming Order Cut-off
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Today&apos;s order cut-off time
          </p>

          <div className="my-5">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              10:00 PM
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00875a] animate-pulse" />
                <span>Open for orders</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <span>⏱</span>
                <span>{countdownText}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          Early morning delivery dispatch at 05:30 AM
        </div>
      </div>

      {/* 3. Procurement Reminder (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00875a]" />
              <span>Procurement Reminder</span>
            </h3>
            <Link
              href="/admin/procurement"
              className="text-xs font-bold text-[#00875a] hover:text-[#00734d] flex items-center gap-0.5 group"
            >
              <span>View Items</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Based on today&apos;s orders, please plan procurement for tomorrow.
          </p>

          {/* Callout matching PDF */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white text-[#00875a] flex items-center justify-center flex-shrink-0 shadow-3xs border border-emerald-200">
              <Package className="w-5 h-5" />
            </div>

            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                35 items
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                need to be procured for tomorrow&apos;s stock
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Estimated budget: ₹28,450</span>
          <Link
            href="/admin/procurement"
            className="font-bold text-[#00875a] hover:underline"
          >
            Review PO →
          </Link>
        </div>
      </div>
    </div>
  );
};
