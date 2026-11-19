"use client";

import React, { useState } from "react";
import { Tag, AlertCircle, Info } from "lucide-react";

export const CartCouponSection: React.FC = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ type: "info" | "warning"; text: string } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage({ type: "warning", text: "Please enter a valid coupon code." });
      return;
    }
    setMessage({
      type: "info",
      text: `Coupon code "${code.trim().toUpperCase()}" received. Backend promotion service integration is currently pending on the API Gateway. Discounts will be verified upon order placement.`,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(20,70,45,0.04)] sm:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#00875a]">
          <Tag className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Coupons</h3>
          <p className="text-[11px] text-slate-400">Have a promo code?</p>
        </div>
      </div>

      <form onSubmit={handleApply} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (message) setMessage(null);
          }}
          placeholder="Enter coupon code"
          aria-label="Coupon code"
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#00875a] focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="h-10 shrink-0 rounded-lg bg-[#2f6f5e] px-4 text-[11px] font-extrabold text-white transition hover:bg-[#255b4d] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply
        </button>
      </form>

      {message && (
        <div className={`mt-3 flex items-start gap-2 rounded-lg border p-2.5 text-[11px] font-medium ${message.type === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-sky-200 bg-sky-50 text-sky-800"}`}>
          {message.type === "warning" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
          <p>{message.text}</p>
        </div>
      )}
    </section>
  );
};
