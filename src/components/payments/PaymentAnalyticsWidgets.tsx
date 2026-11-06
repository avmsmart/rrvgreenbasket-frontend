"use client";

import React from "react";
import {
  PieChart,
  BarChart3,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  PaymentMethodShare,
  DailyCollectionStat,
  PaymentActivityLog,
} from "@/types";

interface PaymentAnalyticsWidgetsProps {
  methodShares: PaymentMethodShare[];
  dailyCollections: DailyCollectionStat[];
  activityLogs: PaymentActivityLog[];
  onActivityClick?: (log: PaymentActivityLog) => void;
}

export const PaymentAnalyticsWidgets: React.FC<PaymentAnalyticsWidgetsProps> = ({
  methodShares,
  dailyCollections,
  activityLogs,
  onActivityClick,
}) => {
  const maxCollection = Math.max(...dailyCollections.map((d) => d.amount), 1);

  const getActivityIcon = (type: PaymentActivityLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "failure":
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case "refund":
        return <RotateCcw className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Payment Method Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-3xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Payment Method Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Share of total transaction volume</p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-700">UPI 57%</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="my-4">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {methodShares.map((m) => (
              <div
                key={m.method}
                className="h-full transition-all"
                style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                title={`${m.method}: ${m.percentage}% (₹ ${m.amount.toLocaleString()})`}
              />
            ))}
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2 text-xs">
          {methodShares.map((m) => (
            <div
              key={m.method}
              className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span className="font-semibold text-slate-700">{m.method}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">
                  ₹ {m.amount.toLocaleString()}
                </span>
                <span className="font-black text-slate-800 w-8 text-right">
                  {m.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Daily Payment Summary (Weekly Bar Visual) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-3xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Daily Payment Collection
              </h3>
              <p className="text-[11px] text-slate-400">Total revenue by day of the week</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            7 Days
          </span>
        </div>

        {/* Weekly Bar Chart Visual */}
        <div className="my-3 flex items-end justify-between gap-2 h-36 px-2 pt-4">
          {dailyCollections.map((stat) => {
            const heightPct = Math.round((stat.amount / maxCollection) * 100);
            return (
              <div
                key={stat.day}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded whitespace-nowrap">
                  ₹ {(stat.amount / 1000).toFixed(1)}k
                </div>
                <div
                  className="w-full max-w-[28px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:from-emerald-700 group-hover:to-emerald-500 shadow-3xs"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">
                  {stat.day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Peak: Saturday (₹ 28,200)</span>
          <span className="font-bold text-emerald-700">Avg ₹ 21.6k/day</span>
        </div>
      </div>

      {/* 3. Recent Payment Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-3xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Recent Payment Activity
              </h3>
              <p className="text-[11px] text-slate-400">Live transaction event audit</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Activity Feed */}
        <div className="divide-y divide-slate-100 my-2">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => onActivityClick?.(log)}
              className="py-2.5 px-2 rounded-xl flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 transition-colors group"
            >
              <div className="mt-0.5 p-1 rounded-lg bg-slate-50 group-hover:bg-white border border-slate-200/60 shrink-0 transition-colors">
                {getActivityIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {log.customerName}
                  </p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">
                    {log.timeAgo}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {log.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-100">
          Audited under RBI & Payment Gateway guidelines
        </p>
      </div>
    </div>
  );
};
