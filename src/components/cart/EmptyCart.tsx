"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

export const EmptyCart: React.FC = () => {
  return (
    <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs space-y-5 animate-in fade-in">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#00875a] border border-emerald-100 shadow-3xs">
        <ShoppingCart className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Your Cart is Empty!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
          Looks like you haven&apos;t added anything yet. Explore fresh vegetables and fruits harvested daily and delivered to your doorstep.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/?category=Vegetables"
          className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 px-5 py-2.5 text-xs font-bold text-[#00875a] transition-all cursor-pointer shadow-3xs"
        >
          <span>Explore Vegetables</span>
        </Link>

        <Link
          href="/?category=Fruits"
          className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 px-5 py-2.5 text-xs font-bold text-[#00875a] transition-all cursor-pointer shadow-3xs"
        >
          <span>Explore Fruits</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] px-6 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};
