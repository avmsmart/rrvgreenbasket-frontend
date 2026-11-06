"use client";

import React from "react";
import { StoreSettings } from "@/types/settings";
import { Truck, CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";

interface DeliveryPaymentCardProps {
  settings: StoreSettings;
  onChange: (updated: Partial<StoreSettings>) => void;
}

export const DeliveryPaymentCard: React.FC<DeliveryPaymentCardProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Delivery Fee Settings */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-slate-900">Delivery Charges & Thresholds</h3>
          <p className="text-xs text-slate-500 font-medium">
            Configure delivery fees, free delivery basket targets, and tax settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Standard Delivery Fee */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Standard Delivery Fee (₹)
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min={0}
                value={settings.standardDeliveryFee ?? 20}
                onChange={(e) =>
                  onChange({ standardDeliveryFee: Number(e.target.value) || 0 })
                }
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20"
              />
            </div>
          </div>

          {/* Free Delivery Threshold */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Free Delivery Order Basket (₹)
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryThreshold ?? 299}
                onChange={(e) =>
                  onChange({ freeDeliveryThreshold: Number(e.target.value) || 0 })
                }
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20"
              />
            </div>
          </div>

          {/* Tax Percentage */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GST / Sales Tax (%)
            </label>
            <div className="relative mt-2">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                %
              </span>
              <input
                type="number"
                min={0}
                max={28}
                value={settings.taxPercentage ?? 0}
                onChange={(e) =>
                  onChange({ taxPercentage: Number(e.target.value) || 0 })
                }
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateways */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Supported Payment Gateways</h3>
          <p className="text-xs text-slate-500 font-medium">
            Active UPI, card processing, and cash settlement integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "UPI & QR (Razorpay / PhonePe)", desc: "GPay, PhonePe, Paytm, BHIM instant payments", status: "Active" },
            { name: "Cash on Delivery (COD)", desc: "Customer pays cash to delivery partner on arrival", status: "Active" },
            { name: "Credit / Debit Cards", desc: "Visa, Mastercard, RuPay card gateway integration", status: "Active" },
            { name: "Net Banking", desc: "All 50+ Indian commercial banks supported via netbanking", status: "Active" },
          ].map((gw) => (
            <div
              key={gw.name}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{gw.name}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{gw.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {gw.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
