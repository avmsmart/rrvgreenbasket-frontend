"use client";

import React from "react";
import { StoreSettings } from "@/types/settings";
import { Globe, DollarSign, Calendar, Languages } from "lucide-react";

interface CurrencyRegionalCardProps {
  settings: StoreSettings;
  onChange: (updated: Partial<StoreSettings>) => void;
}

export const CurrencyRegionalCard: React.FC<CurrencyRegionalCardProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900">Currency & Regional Preferences</h3>
        <p className="text-xs text-slate-500 font-medium">
          Set base operational currency, regional formats, and localization conventions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Currency */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Store Base Currency
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={settings.currency || "INR (₹) - Indian Rupee"}
              onChange={(e) => onChange({ currency: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white"
            >
              <option value="INR (₹) - Indian Rupee">INR (₹) - Indian Rupee</option>
              <option value="USD ($) - US Dollar">USD ($) - US Dollar</option>
              <option value="EUR (€) - Euro">EUR (€) - Euro</option>
            </select>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Primary Store Language
          </label>
          <div className="relative">
            <Languages className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={settings.language || "English"}
              onChange={(e) => onChange({ language: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white"
            >
              <option value="English">English (India)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Date Presentation Format
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={settings.dateFormat || "DD/MM/YYYY"}
              onChange={(e) => onChange({ dateFormat: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 25/08/2025)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/25/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            </select>
          </div>
        </div>

        {/* Preview formatting */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Live Format Preview</span>
          <div className="text-base font-black text-slate-900 mt-0.5">
            ₹ 1,28,450.00 • 25/08/2025
          </div>
        </div>
      </div>
    </div>
  );
};
