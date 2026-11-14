"use client";

import React from "react";
import { CategoryStatistics } from "@/types/category";

interface CategoryStatsCardsProps {
  stats: CategoryStatistics;
}

export const CategoryStatsCards: React.FC<CategoryStatsCardsProps> = ({ stats }) => {
  return (
    <>
      {/* Desktop: stat cards */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        <StatCard
          label="Total Categories"
          value={stats.total}
          subtext="Master catalog"
          accent="#9AA5AD"
        />
        <StatCard
          label="Active"
          value={stats.active}
          subtext="Visible on storefront"
          accent="#0B8A4F"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          subtext="Hidden from storefront"
          accent={stats.inactive > 0 ? "#F59E0B" : "#E6EBE8"}
          warning={stats.inactive > 0}
        />
      </div>
    </>
  );
};

/* ── Desktop stat card ── */
const StatCard: React.FC<{
  label: string;
  value: number;
  subtext: string;
  accent: string;
  warning?: boolean;
}> = ({ label, value, subtext, accent, warning }) => (
  <div
    className="bg-white rounded-2xl p-5 border-l-4"
    style={{
      borderLeftColor: accent,
      border: `1px solid #E6EBE8`,
      borderLeft: `4px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}
  >
    <div className="flex items-center justify-between mb-1">
      <p className="text-xs font-semibold" style={{ color: "#5B6770" }}>{label}</p>
      {warning && (
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: "#F59E0B" }}
        />
      )}
    </div>
    <p className="text-2xl font-black tracking-tight" style={{ color: "#111827" }}>{value}</p>
    <p className="text-[11px] font-medium mt-0.5" style={{ color: "#9AA5AD" }}>{subtext}</p>
  </div>
);
