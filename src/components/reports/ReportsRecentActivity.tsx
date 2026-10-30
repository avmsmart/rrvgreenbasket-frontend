"use client";

import React from "react";
import { Activity, ShoppingCart, Truck, Tag, Store, CheckCircle2 } from "lucide-react";

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

const EVENTS: ActivityEvent[] = [
  {
    id: "1",
    title: "Mandi Inward Batch Synced",
    description: "Received 140 kg Tomatoes & 80 kg Onions via Kurnool Mandi challan #MND-8841",
    time: "12 mins ago",
    icon: Store,
    badgeColor: "bg-emerald-100 text-[#00875a]",
  },
  {
    id: "2",
    title: "Large Order Delivered",
    description: "Order #ORD001234 (₹3,450) delivered to Sector 4 by Raju V.",
    time: "35 mins ago",
    icon: Truck,
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "3",
    title: "High Coupon Utilization",
    description: "Coupon 'WELCOME10' reached 245 redemptions across first-time buyers",
    time: "1 hour ago",
    icon: Tag,
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "4",
    title: "Stock Re-order Alert Cleared",
    description: "Broccoli and Celery stock replenished above minimum buffer (10 kg)",
    time: "2 hours ago",
    icon: CheckCircle2,
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

export const ReportsRecentActivity: React.FC = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Operational Audit
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Real-Time Business Events
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* Feed list */}
      <div className="space-y-3">
        {EVENTS.map((evt) => {
          const Icon = evt.icon;
          return (
            <div
              key={evt.id}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${evt.badgeColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {evt.title}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                    {evt.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-500 font-medium pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
        <span>System activity status</span>
        <span className="flex items-center gap-1.5 font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          All Services Operational
        </span>
      </div>
    </div>
  );
};
