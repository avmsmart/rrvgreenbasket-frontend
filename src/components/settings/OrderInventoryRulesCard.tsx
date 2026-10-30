"use client";

import React from "react";
import { StoreSettings } from "@/types/settings";
import { ShoppingBag, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

interface OrderInventoryRulesCardProps {
  settings: StoreSettings;
  onChange: (updated: Partial<StoreSettings>) => void;
}

export const OrderInventoryRulesCard: React.FC<OrderInventoryRulesCardProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Order Policies */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-slate-900">Order & Checkout Rules</h3>
          <p className="text-xs text-slate-500 font-medium">
            Controls thresholds, delivery assignment, and order cancellation logic across storefront and admin.
          </p>
        </div>

        {/* Minimum Order Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Minimum Order Basket Value (₹) *
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Customers cannot place orders below this value in the cart.
            </p>
            <div className="relative w-44">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min={0}
                value={settings.minimumOrderAmount}
                onChange={(e) =>
                  onChange({ minimumOrderAmount: Number(e.target.value) || 0 })
                }
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Daily Order Cutoff Time (24h)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Orders placed after this hour will be queued for next morning dispatch.
            </p>
            <input
              type="text"
              value={settings.orderCutoffTime || "22:00"}
              onChange={(e) => onChange({ orderCutoffTime: e.target.value })}
              className="w-44 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20"
              placeholder="22:00"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {/* Allow COD */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Cash on Delivery (COD)
              </span>
              <p className="text-[11px] text-slate-400">
                Allow customers to pay in cash upon produce delivery.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowCod}
              onChange={(e) => onChange({ allowCod: e.target.checked })}
              className="w-4 h-4 text-[#00875a] rounded focus:ring-emerald-500"
            />
          </div>

          {/* Scheduled Delivery */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Scheduled Slot Booking
              </span>
              <p className="text-[11px] text-slate-400">
                Permit customers to select delivery time windows (e.g. 06:30 AM - 08:30 AM).
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableScheduledDelivery}
              onChange={(e) => onChange({ enableScheduledDelivery: e.target.checked })}
              className="w-4 h-4 text-[#00875a] rounded focus:ring-emerald-500"
            />
          </div>

          {/* Customer Cancellation */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Customer Self-Cancellation
              </span>
              <p className="text-[11px] text-slate-400">
                Customers may cancel orders while in &apos;Pending&apos; state before packing begins.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowCustomerCancellation}
              onChange={(e) => onChange({ allowCustomerCancellation: e.target.checked })}
              className="w-4 h-4 text-[#00875a] rounded focus:ring-emerald-500"
            />
          </div>

          {/* Auto assign delivery partner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Auto-Assign Delivery Partner
              </span>
              <p className="text-[11px] text-slate-400">
                Dispatch system automatically selects the nearest available rider for orders.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoAssignDeliveryPartner}
              onChange={(e) => onChange({ autoAssignDeliveryPartner: e.target.checked })}
              className="w-4 h-4 text-[#00875a] rounded focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Inventory Policies */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-slate-900">Inventory & Stock Safeguards</h3>
          <p className="text-xs text-slate-500 font-medium">
            Controls stock deduction triggers, out-of-stock visibility, and mandi re-order alerts.
          </p>
        </div>

        {/* Low Stock Alert Threshold */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Low Stock Alert Threshold
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Items falling to or below this stock level will trigger immediate replenishment alerts in Inventory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={settings.lowStockThreshold || 10}
              onChange={(e) =>
                onChange({ lowStockThreshold: Number(e.target.value) || 10 })
              }
              className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-xs font-bold text-slate-500">Kg / Units</span>
          </div>
        </div>

        {/* Auto update stock & backorders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Auto-Deduct Stock on Order Confirmation
              </span>
              <p className="text-[11px] text-slate-400">
                Automatically decrement warehouse stock weights upon confirmed order.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoUpdateStockAfterOrder}
              onChange={(e) => onChange({ autoUpdateStockAfterOrder: e.target.checked })}
              className="w-4 h-4 text-[#00875a] rounded focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Allow Out-of-Stock Purchases (Pre-orders)
              </span>
              <p className="text-[11px] text-slate-400">
                When enabled, customers can place orders for fresh items arriving in tomorrow morning mandi consignment.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowOutOfStockPurchase}
              onChange={(e) => onChange({ allowOutOfStockPurchase: e.target.checked })}
              className="w-4 h-4 text-[#00875a] rounded focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
