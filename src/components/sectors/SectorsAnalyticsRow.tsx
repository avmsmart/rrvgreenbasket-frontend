"use client";

import React from "react";
import { Sector } from "@/types/sector";
import { TrendingUp, BarChart3, Award, Sparkles } from "lucide-react";

interface SectorsAnalyticsRowProps {
  sectors: Sector[];
}

export const SectorsAnalyticsRow: React.FC<SectorsAnalyticsRowProps> = ({ sectors }) => {
  const sortedByRev = [...sectors].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  const topSector = sortedByRev[0];
  const totalRev = sectors.reduce((acc, s) => acc + (s.revenue || 0), 0) || 1;

  const maxProducts = Math.max(...sectors.map((s) => s.productsCount || 0), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Leader Highlight Card */}
      <div className="bg-gradient-to-br from-[#00875a] to-[#006644] p-5 sm:p-6 rounded-3xl text-white shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              Highest Performing Sector
            </span>
            <span className="text-2xl">{topSector?.icon || "🥦"}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            {topSector?.name || "Fresh Vegetables"}
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 line-clamp-2">
            {topSector?.description || "Daily driver for local customer grocery baskets."}
          </p>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-bold text-emerald-200">Total Revenue</div>
            <div className="text-xl font-black mt-0.5">
              ₹ {(topSector?.revenue || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-emerald-200/80 font-medium mt-0.5">
              {Math.round(((topSector?.revenue || 0) / totalRev) * 100)}% of total business
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-200">Active Inventory</div>
            <div className="text-xl font-black mt-0.5">
              {topSector?.productsCount || 0} Items
            </div>
            <div className="text-[10px] text-emerald-200/80 font-medium mt-0.5">
              {topSector?.totalOrders || 0} orders completed
            </div>
          </div>
        </div>
      </div>

      {/* 2. Department Allocation Breakdown */}
      <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Merchandise Distribution
            </span>
            <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              Products per Sector
            </h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2.5">
          {sectors.slice(0, 5).map((sector) => {
            const count = sector.productsCount || 0;
            const pct = Math.round((count / maxProducts) * 100);
            return (
              <div key={sector.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span>{sector.icon}</span>
                    <span>{sector.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900">{count} products</span>
                    <span className="text-slate-400 font-medium text-[11px]">
                      (₹{(sector.revenue || 0).toLocaleString("en-IN")})
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00875a] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 font-medium pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
          <span className="flex items-center gap-1 text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Top 5 categories represent 95% of active storefront SKUs
          </span>
          <span className="font-semibold text-emerald-700">Healthy Assortment</span>
        </div>
      </div>
    </div>
  );
};
