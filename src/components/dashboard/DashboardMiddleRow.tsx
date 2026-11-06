"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpRight, AlertCircle, ShoppingBag } from "lucide-react";
import { ProduceImage } from "@/components/common/ProduceImage";

export interface DashboardOrder {
  id: string;
  customerName: string;
  itemsCount: number;
  amount: number;
  status: "Delivered" | "Processing" | "Cancelled" | "Pending";
  time: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  currentStock: string;
  remainingBadge: string;
  unit: string;
}

interface DashboardMiddleRowProps {
  onSelectOrder: (order: DashboardOrder) => void;
  onQuickAdjustStock: (item: LowStockItem) => void;
}

const TOP_SELLING_PRODUCTS = [
  { rank: 1, name: "Tomato", unit: "1 kg", ordersCount: 320 },
  { rank: 2, name: "Onion", unit: "1 kg", ordersCount: 280 },
  { rank: 3, name: "Potato", unit: "1 kg", ordersCount: 250 },
  { rank: 4, name: "Carrot", unit: "1 kg", ordersCount: 190 },
  { rank: 5, name: "Spinach", unit: "1 bunch", ordersCount: 160 },
];

const RECENT_ORDERS: DashboardOrder[] = [
  { id: "#ORD001234", customerName: "Priya S", itemsCount: 5, amount: 320, status: "Delivered", time: "09:15 AM" },
  { id: "#ORD001233", customerName: "Arun K", itemsCount: 3, amount: 180, status: "Processing", time: "08:40 AM" },
  { id: "#ORD001232", customerName: "Meena R", itemsCount: 7, amount: 450, status: "Delivered", time: "08:20 AM" },
  { id: "#ORD001231", customerName: "Karthik V", itemsCount: 4, amount: 260, status: "Processing", time: "07:55 AM" },
  { id: "#ORD001230", customerName: "Sneha M", itemsCount: 6, amount: 380, status: "Cancelled", time: "07:30 AM" },
];

const LOW_STOCK_ITEMS: LowStockItem[] = [
  { id: "LS-1", name: "Coriander", currentStock: "Current stock: 2 bunches", remainingBadge: "2 left", unit: "bunches" },
  { id: "LS-2", name: "Mint Leaves", currentStock: "Current stock: 3 bunches", remainingBadge: "3 left", unit: "bunches" },
  { id: "LS-3", name: "Green Chilli", currentStock: "Current stock: 1 kg", remainingBadge: "1 left", unit: "kg" },
  { id: "LS-4", name: "Lemon", currentStock: "Current stock: 4 kg", remainingBadge: "4 left", unit: "kg" },
  { id: "LS-5", name: "Ginger", currentStock: "Current stock: 2 kg", remainingBadge: "2 left", unit: "kg" },
];

export const DashboardMiddleRow: React.FC<DashboardMiddleRowProps> = ({
  onSelectOrder,
  onQuickAdjustStock,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Top Selling Products (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#00875a]" />
              <span>Top Selling Products</span>
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#00875a] hover:text-[#00734d] flex items-center gap-0.5 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {TOP_SELLING_PRODUCTS.map((prod) => (
              <div
                key={prod.rank}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-slate-400 w-3 text-center">
                    {prod.rank}
                  </span>
                  <ProduceImage name={prod.name} size={38} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#00875a] transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400">
                      {prod.unit}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-800">
                    {prod.ordersCount}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">
                    orders
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Updated based on today&apos;s batch</span>
          <span className="text-[#00875a] font-bold">1,200 total kg sold</span>
        </div>
      </div>

      {/* 2. Recent Orders Table (lg:col-span-5) */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#00875a] hover:text-[#00734d] flex items-center gap-0.5 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Compact Table matching PDF */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-bold">Order ID</th>
                  <th className="pb-2.5 font-bold">Customer</th>
                  <th className="pb-2.5 font-bold">Items</th>
                  <th className="pb-2.5 font-bold">Amount</th>
                  <th className="pb-2.5 font-bold text-center">Status</th>
                  <th className="pb-2.5 font-bold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {RECENT_ORDERS.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 font-bold text-slate-900 group-hover:text-[#00875a]">
                      {ord.id}
                    </td>
                    <td className="py-2.5 text-slate-700">{ord.customerName}</td>
                    <td className="py-2.5 text-slate-500">{ord.itemsCount} items</td>
                    <td className="py-2.5 font-bold text-slate-900">
                      ₹{ord.amount}
                    </td>
                    <td className="py-2.5 text-center">
                      {ord.status === "Delivered" && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]">
                          Delivered
                        </span>
                      )}
                      {ord.status === "Processing" && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Processing
                        </span>
                      )}
                      {ord.status === "Cancelled" && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          Cancelled
                        </span>
                      )}
                      {ord.status === "Pending" && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-slate-400 text-[11px]">
                      {ord.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any order to view detailed drawer</span>
          <span className="text-[#00875a] font-bold">Live real-time feed</span>
        </div>
      </div>

      {/* 3. Low Stock Items (lg:col-span-3) */}
      <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-3xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Low Stock Items</span>
            </h3>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-[#00875a] hover:text-[#00734d] flex items-center gap-0.5 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {LOW_STOCK_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100/90 hover:border-amber-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ProduceImage name={item.name} size={36} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {item.currentStock}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                    {item.remainingBadge}
                  </span>
                  <button
                    onClick={() => onQuickAdjustStock(item)}
                    title="Quick Stock Restock"
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-rose-600 font-bold">5 critical items</span>
          <Link
            href="/admin/procurement"
            className="text-xs font-bold text-[#00875a] hover:underline"
          >
            Procure now →
          </Link>
        </div>
      </div>
    </div>
  );
};
