"use client";

import React from "react";

export const CartLoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl bg-slate-200" />
          <div className="h-4 w-32 rounded-lg bg-slate-100" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-slate-100" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left items */}
        <div className="lg:col-span-8 space-y-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-xs"
            >
              <div className="h-20 w-20 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 rounded-md w-1/2" />
                <div className="h-4 bg-slate-100 rounded-md w-1/4" />
                <div className="h-4 bg-slate-50 rounded-md w-1/5" />
              </div>
              <div className="h-9 w-28 bg-slate-100 rounded-xl" />
              <div className="h-8 w-16 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Right summary */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 bg-slate-200 rounded-md w-1/2" />
          <div className="space-y-3 pt-2">
            <div className="h-4 bg-slate-100 rounded-md w-full" />
            <div className="h-4 bg-slate-100 rounded-md w-full" />
            <div className="h-4 bg-slate-100 rounded-md w-full" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <div className="h-12 bg-slate-200 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
