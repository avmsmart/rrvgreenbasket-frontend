"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Calendar, Clock, ShoppingBag } from "lucide-react";
import { getSystemDateWithDay, getSystemTimeFormatted } from "@/utils";
import { getSavedSettings } from "@/data/shared-store";
import { StoreSettings } from "@/types/settings";

export const DashboardWelcomeBanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState("Monday, 25 Aug 2025");
  const [currentTime, setCurrentTime] = useState("09:30 AM");
  const [storeName, setStoreName] = useState("RRV Green Basket");

  useEffect(() => {
    const s = getSavedSettings();
    if (s.storeName) setStoreName(s.storeName);

    const onSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      const updated = customEvent.detail || getSavedSettings();
      if (updated.storeName) setStoreName(updated.storeName);
    };
    window.addEventListener("rrv:settings:updated", onSettingsUpdate);

    const now = new Date();
    setCurrentDate(getSystemDateWithDay(now));
    setCurrentTime(getSystemTimeFormatted(now));

    const interval = setInterval(() => {
      const liveNow = new Date();
      setCurrentTime(getSystemTimeFormatted(liveNow));
    }, 60000);

    return () => {
      window.removeEventListener("rrv:settings:updated", onSettingsUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#eaf8f0] via-[#edfcf2] to-[#e6f7ec] border border-[#bbf7d0]/80 p-6 sm:p-7 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Decorative background blurs */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 right-24 w-40 h-40 bg-teal-200/30 rounded-full blur-xl pointer-events-none" />

      {/* Left Greeting & Context */}
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[#00875a] text-[11px] font-bold tracking-wide uppercase mb-3 border border-emerald-200/60">
          <Sparkles className="w-3.5 h-3.5 text-[#00875a]" />
          <span>Daily Store Operations • Live Monitor</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Welcome back, Admin!</span>
          <span className="inline-block animate-bounce duration-1000">👋</span>
        </h1>

        <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
          Here&apos;s what&apos;s happening with {storeName} today.
        </p>

        {/* Date and Time Badges (matching PDF reference) */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-emerald-200/90 shadow-3xs text-slate-800 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#00875a]" />
            <span>{currentDate}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-emerald-200/90 shadow-3xs text-slate-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-[#00875a]" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Right Feature Card matching PDF Screenshot: "Fresh Food Happier Families" with produce basket */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-end">
        <div className="relative bg-white/90 backdrop-blur-xs rounded-2xl border border-emerald-200/80 shadow-3xs p-3.5 sm:p-4 flex items-center gap-4 max-w-xs transition-transform hover:scale-[1.02]">
          {/* Fresh Produce Graphic */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-transparent" />
            <span className="text-3xl sm:text-4xl filter drop-shadow-sm select-none">
              🧺
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <ShoppingBag className="w-3 h-3 text-[#00875a]" />
              <span>RRV Green Basket</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug tracking-tight">
              &ldquo;Fresh Food Happier Families&rdquo;
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">
              Direct farm-to-doorstep produce
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
