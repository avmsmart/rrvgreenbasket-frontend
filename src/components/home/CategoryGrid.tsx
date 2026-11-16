"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackendCategory } from "@/types";
import { getCategoryId } from "@/services/product.service";

interface CategoryGridProps {
  categories: BackendCategory[];
  onSelect?: (cat: BackendCategory) => void;
}

// Emoji "illustrations" for each category (matches the ones already used in page.tsx)
const CATEGORY_EMOJI: Record<string, string> = {
  Fruits: "🍎",
  Vegetables: "🥦",
  "Leafy Vegetables": "🥬",
  "Leafy Greens": "🥬",
  "Root Vegetables": "🥔",
  Seasonings: "🌿",
  Mushrooms: "🍄",
  "Other Items": "📦",
  "Exotic & Seasonal": "🍍",
  Organics: "🌱",
  "Dairy Products": "🥛",
  "Snacks & Foods": "🥜",
  Beverages: "🧃",
  "Household Items": "🧺",
};

// Pastel background colors (light blue / mint like the Slyce reference)
const PASTEL_COLORS = [
  "bg-sky-50",
  "bg-emerald-50",
  "bg-amber-50",
  "bg-rose-50",
  "bg-violet-50",
  "bg-teal-50",
  "bg-orange-50",
  "bg-lime-50",
];

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  const list = categories.slice(0, 6); // 6 in a row, like the Slyce reference

  return (
    <section className="mx-auto mt-2 max-w-[1600px] px-3 sm:px-5 lg:px-6">
      {/* Header row */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Shop by</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
            Categories
          </h2>
        </div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-50 hover:border-emerald-300"
        >
          See All Categories <ArrowRight size={14} />
        </Link>
      </div>

      {/* Category cards — 6 in a row on desktop, 3 on mobile */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {list.map((cat, i) => {
          const emoji = CATEGORY_EMOJI[cat.name] || cat.icon || "🛒";
          const bg = PASTEL_COLORS[i % PASTEL_COLORS.length];

          return (
            <button
              key={getCategoryId(cat)}
              type="button"
              onClick={() => onSelect?.(cat)}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-xs transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md sm:p-4"
            >
              {/* Pastel illustration tile */}
              <div
                className={`flex h-20 w-full items-center justify-center rounded-2xl ${bg} text-4xl transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:text-5xl`}
                aria-hidden="true"
              >
                <span className="drop-shadow-sm">{emoji}</span>
              </div>
              {/* Category name */}
              <h3 className="line-clamp-2 text-center text-xs font-bold text-slate-900 sm:text-sm">
                {cat.name}
              </h3>
            </button>
          );
        })}
      </div>
    </section>
  );
}