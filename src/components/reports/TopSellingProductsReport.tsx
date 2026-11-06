"use client";

import React from "react";
import { TrendingUp, Package, Award } from "lucide-react";
import { ProduceImage } from "@/components/common";

interface TopProduct {
  rank: number;
  name: string;
  category: string;
  quantitySold: string;
  revenue: number;
  growth: string;
  inStock: number;
}

const TOP_PRODUCTS: TopProduct[] = [
  { rank: 1, name: "Tomato (Hybrid)", category: "Fresh Vegetables", quantitySold: "340 Kg", revenue: 13600, growth: "+24%", inStock: 65 },
  { rank: 2, name: "Onion (Sambhar)", category: "Fresh Vegetables", quantitySold: "280 Kg", revenue: 9800, growth: "+18%", inStock: 120 },
  { rank: 3, name: "Banana (Robusta)", category: "Fresh Fruits", quantitySold: "210 Dozen", revenue: 7350, growth: "+12%", inStock: 45 },
  { rank: 4, name: "Potato (Agra)", category: "Fresh Vegetables", quantitySold: "195 Kg", revenue: 6825, growth: "+15%", inStock: 90 },
  { rank: 5, name: "Carrot (Ooty)", category: "English Vegetables", quantitySold: "160 Kg", revenue: 7200, growth: "+9%", inStock: 38 },
];

export const TopSellingProductsReport: React.FC = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Volume Leaders
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Top Selling Products
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Award className="w-4 h-4" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {TOP_PRODUCTS.map((item) => (
          <div
            key={item.rank}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  item.rank === 1
                    ? "bg-amber-400 text-amber-950"
                    : item.rank === 2
                    ? "bg-slate-300 text-slate-800"
                    : item.rank === 3
                    ? "bg-amber-700 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {item.rank}
              </span>
              <ProduceImage name={item.name} size={36} />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {item.category} • {item.quantitySold}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs sm:text-sm font-black text-slate-900">
                ₹ {item.revenue.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                <span>{item.growth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500 font-medium pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
        <span>Combined top 5 produce revenue</span>
        <span className="font-bold text-slate-900">₹ 44,775 (34.8%)</span>
      </div>
    </div>
  );
};
