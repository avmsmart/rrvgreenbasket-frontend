"use client";

import React from "react";
import { Users, UserCheck, RefreshCw, UserPlus, HeartHandshake } from "lucide-react";

export const CustomersTrendChart: React.FC = () => {
  const metrics = [
    { label: "Active Customers", count: 896, percentage: 71.8, color: "bg-emerald-500", text: "text-emerald-700", icon: UserCheck },
    { label: "Repeat Buyers", count: 312, percentage: 25.0, color: "bg-blue-500", text: "text-blue-700", icon: RefreshCw },
    { label: "New Signups", count: 140, percentage: 11.2, color: "bg-purple-500", text: "text-purple-700", icon: UserPlus },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            User Base & Retention
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Customer Demographics
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Main Big Stats */}
      <div className="flex items-baseline justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
        <div>
          <div className="text-xs text-slate-500 font-semibold">Total Registered Customers</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            1,248
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
            <HeartHandshake className="w-3.5 h-3.5" />
            71.8% Retention
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3.5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {m.label}
                </span>
                <span className="text-slate-900">
                  {m.count} <span className="text-slate-400 font-medium">({m.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-500`}
                  style={{ width: `${m.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-500 font-medium pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
        <span>Average Customer Lifetime Value</span>
        <span className="font-bold text-slate-900">₹ 2,840</span>
      </div>
    </div>
  );
};
