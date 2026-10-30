"use client";

import React from "react";
import { Truck, CheckCircle2, AlertTriangle, XCircle, Clock, Zap } from "lucide-react";

export const DeliveryPerformanceReport: React.FC = () => {
  const riders = [
    { name: "Raju V.", deliveries: 68, onTime: "98%", avgTime: "28m", rating: "4.9" },
    { name: "Suresh K.", deliveries: 54, onTime: "96%", avgTime: "31m", rating: "4.8" },
    { name: "Vignesh P.", deliveries: 48, onTime: "92%", avgTime: "35m", rating: "4.7" },
    { name: "Ramesh M.", deliveries: 44, onTime: "90%", avgTime: "38m", rating: "4.6" },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Last-Mile Operations
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Delivery Performance
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Truck className="w-4 h-4" />
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-center">
          <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            On-Time
          </div>
          <div className="text-lg font-black text-emerald-900 mt-1">214</div>
          <div className="text-[10px] font-extrabold text-emerald-600">92.2%</div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl text-center">
          <div className="text-[11px] font-bold text-amber-800 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Delayed
          </div>
          <div className="text-lg font-black text-amber-900 mt-1">12</div>
          <div className="text-[10px] font-extrabold text-amber-600">5.2%</div>
        </div>

        <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl text-center">
          <div className="text-[11px] font-bold text-rose-800 flex items-center justify-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            Failed
          </div>
          <div className="text-lg font-black text-rose-900 mt-1">6</div>
          <div className="text-[10px] font-extrabold text-rose-600">2.6%</div>
        </div>
      </div>

      {/* Rider Leaderboard */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          Top Performing Delivery Partners
        </div>
        {riders.map((r, i) => (
          <div
            key={r.name}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black flex items-center justify-center text-[10px]">
                {i + 1}
              </span>
              <div>
                <span className="font-bold text-slate-900">{r.name}</span>
                <div className="text-[10px] text-slate-400 font-medium">Avg {r.avgTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">{r.deliveries} trips</span>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                {r.onTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500 font-medium pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Avg Fulfillment Speed
        </span>
        <span className="font-bold text-slate-900">32 minutes</span>
      </div>
    </div>
  );
};
