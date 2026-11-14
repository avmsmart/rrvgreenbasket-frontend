"use client";

import React, { useState } from "react";
import { Tag, Check, AlertCircle, Sparkles, Info } from "lucide-react";

export const CartCouponSection: React.FC = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{
    type: "info" | "warning";
    text: string;
  } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage({
        type: "warning",
        text: "Please enter a valid coupon code.",
      });
      return;
    }

    // Backend Cart Service currently does not expose customer coupon validation.
    // Display clear, honest notice without calculating fake discounts.
    setMessage({
      type: "info",
      text: `Coupon code "${code.trim().toUpperCase()}" received. Backend promotion service integration is currently pending on the API Gateway. Discounts will be verified upon order placement.`,
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Tag className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">
            Have a Promo or Coupon Code?
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Enter your code to apply seasonal savings
          </p>
        </div>
      </div>

      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (message) setMessage(null);
            }}
            placeholder="e.g. WELCOME10, FRESH20"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#00875a] focus:bg-white transition-all uppercase"
          />
        </div>

        <button
          type="submit"
          disabled={!code.trim()}
          className="h-11 px-5 rounded-xl bg-[#00875a] hover:bg-[#00734d] active:scale-95 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </form>

      {message && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-semibold animate-in fade-in ${
            message.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-sky-50 border-sky-200 text-sky-800"
          }`}
        >
          {message.type === "warning" ? (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed font-medium">{message.text}</p>
        </div>
      )}
    </div>
  );
};
