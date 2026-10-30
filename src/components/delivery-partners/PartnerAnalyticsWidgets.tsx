"use client";

import React from "react";
import {
  PieChart,
  Trophy,
  MapPin,
  Star,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { DeliveryPartner, AreaDeliveryStat, DeliveryPartnersSummary } from "@/types";

interface PartnerAnalyticsWidgetsProps {
  summary: DeliveryPartnersSummary;
  topPartners: DeliveryPartner[];
  areaStats: AreaDeliveryStat[];
  onSelectPartner?: (partner: DeliveryPartner) => void;
}

export const PartnerAnalyticsWidgets: React.FC<PartnerAnalyticsWidgetsProps> = ({
  summary,
  topPartners,
  areaStats,
  onSelectPartner,
}) => {
  const statusItems = [
    { label: "Active", count: summary.activePartners, color: "bg-emerald-500", text: "text-emerald-700" },
    { label: "On Delivery", count: summary.onDelivery, color: "bg-blue-500", text: "text-blue-700" },
    { label: "Idle", count: summary.idlePartners, color: "bg-amber-500", text: "text-amber-700" },
    { label: "Inactive", count: summary.inactivePartners, color: "bg-slate-400", text: "text-slate-600" },
  ];

  const maxAreaDeliveries = Math.max(
    ...areaStats.map((a) => a.deliveriesCount ?? a.deliveries ?? 0),
    1
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Partner Status Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-3xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Partner Status Overview
              </h3>
              <p className="text-[11px] text-slate-400">Current fleet availability</p>
            </div>
          </div>
          <span className="text-xs font-black text-slate-700">
            {summary.totalPartners} total
          </span>
        </div>

        {/* Progress Bar Stack */}
        <div className="my-4">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {statusItems.map((item) => {
              const pct = (item.count / (summary.totalPartners || 1)) * 100;
              return (
                <div
                  key={item.label}
                  className={`${item.color} h-full transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${item.count}`}
                />
              );
            })}
          </div>
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="font-semibold text-slate-700">{item.label}</span>
              </div>
              <span className={`font-black ${item.text}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top Performing Partners */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-3xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Top Performing Partners
              </h3>
              <p className="text-[11px] text-slate-400">By rating & completed volume</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Ranked
          </span>
        </div>

        <div className="divide-y divide-slate-100 my-2">
          {topPartners.slice(0, 3).map((partner, idx) => (
            <div
              key={partner.id}
              onClick={() => onSelectPartner?.(partner)}
              className="py-2.5 px-2 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#00875a] group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#00875a] transition-colors leading-tight">
                    {partner.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {partner.totalDeliveries} deliveries
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {partner.onTimeRate || "96%"}
                </span>
                <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-700">
                  <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                  <span>{partner.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-100">
          High rating partners receive delivery batch priority
        </p>
      </div>

      {/* 3. Deliveries by Area */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-3xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Deliveries by Area
              </h3>
              <p className="text-[11px] text-slate-400">Demand distribution across sectors</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            Kurnool
          </span>
        </div>

        <div className="space-y-2.5 my-2">
          {areaStats.slice(0, 4).map((area) => {
            const count = area.deliveriesCount ?? area.deliveries ?? 0;
            const pct = Math.round((count / maxAreaDeliveries) * 100);
            return (
              <div key={area.area} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{area.area}</span>
                  <span className="font-bold text-slate-900">
                    {count}{" "}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({area.activePartners ?? 4} active)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-100">
          Updated in real-time from active delivery routes
        </p>
      </div>
    </div>
  );
};
