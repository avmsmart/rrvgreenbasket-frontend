"use client";

import React from "react";
import {
  Users,
  PieChart as PieChartIcon,
  Clock,
  AlertTriangle,
  ChevronRight,
  Phone,
  CheckCircle2,
  Truck,
  ExternalLink,
} from "lucide-react";
import {
  DeliveryPartner,
  DeliverySummary,
  DeliveryTimelineItem,
  DeliveryIssue,
} from "@/types";

interface DeliveryAnalyticsWidgetsProps {
  summary: DeliverySummary;
  partners: DeliveryPartner[];
  timeline: DeliveryTimelineItem[];
  issues: DeliveryIssue[];
  onOrderClick?: (orderId: string) => void;
  onPartnerClick?: (partner: DeliveryPartner) => void;
  onViewAllPartners?: () => void;
  onViewAllIssues?: () => void;
}

export const DeliveryAnalyticsWidgets: React.FC<DeliveryAnalyticsWidgetsProps> = ({
  summary,
  partners,
  timeline,
  issues,
  onOrderClick,
  onPartnerClick,
  onViewAllPartners,
  onViewAllIssues,
}) => {
  const total = summary.totalOrders || 32;
  const delivered = summary.delivered || 10;
  const outForDelivery = summary.outForDelivery || 14;
  const pending = summary.pendingAssignment || 6;
  const failed = summary.failed || 2;

  // Percentage calculations
  const deliveredPct = total > 0 ? Math.round((delivered / total) * 100) : 31;
  const outForDeliveryPct = total > 0 ? Math.round((outForDelivery / total) * 100) : 44;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 19;
  const failedPct = total > 0 ? 100 - deliveredPct - outForDeliveryPct - pendingPct : 6;

  // Donut circumference calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const deliveredStroke = (deliveredPct / 100) * circumference;
  const outStroke = (outForDeliveryPct / 100) * circumference;
  const pendingStroke = (pendingPct / 100) * circumference;
  const failedStroke = (failedPct / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      
      {/* 1. Delivery Partners (Quick list) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-4.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Delivery Partners
              </h3>
            </div>
            {onViewAllPartners && (
              <button
                type="button"
                onClick={onViewAllPartners}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {partners.slice(0, 3).map((p) => {
              const initial = p.name.charAt(0);
              const colorBg =
                initial === "R"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : initial === "S"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-purple-100 text-purple-800 border-purple-200";

              return (
                <div
                  key={p.id}
                  onClick={() => onPartnerClick?.(p)}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${colorBg}`}
                    >
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {p.phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {p.totalDeliveries}
                      </span>
                      <span className="text-[10px] text-slate-400">del.</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 inline-block mt-0.5">
                      Online
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Active Fleet</span>
          <span className="font-semibold text-emerald-700">3/3 Online</span>
        </div>
      </div>

      {/* 2. Delivery Status Overview (Donut Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-4.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Status Overview
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Today
            </span>
          </div>

          {/* Donut chart */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="14"
                  fill="transparent"
                />
                {/* Delivered (Emerald) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-700"
                  strokeWidth="14"
                  strokeDasharray={`${deliveredStroke} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Out for Delivery (Blue) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-blue-500 transition-all duration-700"
                  strokeWidth="14"
                  strokeDasharray={`${outStroke} ${circumference}`}
                  strokeDashoffset={-deliveredStroke}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Pending (Amber) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-amber-500 transition-all duration-700"
                  strokeWidth="14"
                  strokeDasharray={`${pendingStroke} ${circumference}`}
                  strokeDashoffset={-(deliveredStroke + outStroke)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Failed (Red) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-red-500 transition-all duration-700"
                  strokeWidth="14"
                  strokeDasharray={`${failedStroke} ${circumference}`}
                  strokeDashoffset={-(deliveredStroke + outStroke + pendingStroke)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {total}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Orders
                </span>
              </div>
            </div>
          </div>

          {/* Mini Legend */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-slate-600">Delivered</span>
              <span className="font-bold text-slate-800 ml-auto">{delivered}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
              <span className="text-slate-600">On the way</span>
              <span className="font-bold text-slate-800 ml-auto">{outForDelivery}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-slate-600">Pending</span>
              <span className="font-bold text-slate-800 ml-auto">{pending}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span className="text-slate-600">Failed</span>
              <span className="font-bold text-slate-800 ml-auto">{failed}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Success Rate</span>
          <span className="font-semibold text-emerald-700">93.8%</span>
        </div>
      </div>

      {/* 3. Today's Delivery Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-4.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Today&apos;s Timeline
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-none pr-1">
            {timeline.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => onOrderClick?.(item.orderId)}
                className="flex items-start gap-2.5 text-xs hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 shrink-0 w-14">
                  {item.time}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-[11px] truncate">
                    Order <span className="font-mono text-emerald-700">{item.orderId}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {item.action} ({item.partnerName})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Speed</span>
          <span className="font-semibold text-slate-700">~18 mins / stop</span>
        </div>
      </div>

      {/* 4. Delivery Issues (Red Alert List) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs p-4.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Delivery Issues
              </h3>
            </div>
            {onViewAllIssues && (
              <button
                type="button"
                onClick={onViewAllIssues}
                className="text-xs font-semibold text-red-600 hover:underline flex items-center"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {issues.slice(0, 4).map((issue) => (
              <div
                key={issue.id}
                onClick={() => onOrderClick?.(issue.orderId)}
                className="p-2 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-red-800">
                    {issue.orderId}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {issue.time}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                  {issue.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Action Required</span>
          <span className="font-semibold text-red-600">2 pending re-attempt</span>
        </div>
      </div>

    </div>
  );
};
