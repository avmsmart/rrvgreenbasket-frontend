"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackendCategory } from "@/types";
import { getCategoryId } from "@/services/product.service";
import { resolveImageUrl } from "@/utils/image-utils";

export interface CategoryGridProps {
  categories: BackendCategory[];
  onSelect?: (cat: BackendCategory) => void;
  selectedCategoryId?: string | null;
  title?: string;
  showSeeAll?: boolean;
}

// Fallback images for standard grocery categories
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  Fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
  Vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
  "Leafy Vegetables": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
  "Leafy Greens": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
  "Root Vegetables": "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=400&q=80",
  Seasonings: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
  Mushrooms: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80",
  "Other Items": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=400&q=80",
  "Exotic & Seasonal": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80",
  Organics: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
  "Dairy Products": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
  "Snacks & Foods": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80",
  Beverages: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80",
  "Household Items": "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80",
};

// Emoji illustration fallbacks
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

// Pastel background palette inspired by Zepto mobile
const PASTEL_PALETTE = [
  "bg-emerald-50/70 border-emerald-100/70",
  "bg-amber-50/70 border-amber-100/70",
  "bg-sky-50/70 border-sky-100/70",
  "bg-rose-50/70 border-rose-100/70",
  "bg-purple-50/70 border-purple-100/70",
  "bg-teal-50/70 border-teal-100/70",
  "bg-orange-50/70 border-orange-100/70",
  "bg-lime-50/70 border-lime-100/70",
];

interface CategoryItemProps {
  cat: BackendCategory;
  index: number;
  isSelected: boolean;
  onSelect?: (cat: BackendCategory) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  cat,
  index,
  isSelected,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);
  const bgStyle = PASTEL_PALETTE[index % PASTEL_PALETTE.length];

  const rawImage =
    cat.imageUrl ||
    DEFAULT_CATEGORY_IMAGES[cat.name] ||
    DEFAULT_CATEGORY_IMAGES.Vegetables;
  const imageSrc = resolveImageUrl(rawImage, 200);
  const emoji = CATEGORY_EMOJI[cat.name] || cat.icon || "🧺";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(cat)}
      className="group flex flex-col items-center gap-1.5 transition cursor-pointer active:scale-95 text-center select-none"
      aria-label={`Select category ${cat.name}`}
    >
      {/* Small square image container (~75–85px) with rounded corners and light pastel background */}
      <div
        className={`relative flex h-[76px] w-[76px] sm:h-[84px] sm:w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border p-2 transition-all duration-200 ${bgStyle} ${
          isSelected
            ? "ring-2 ring-[#00875a] border-[#00875a] bg-emerald-100/70 shadow-xs scale-105"
            : "group-hover:border-emerald-300 group-hover:shadow-xs"
        }`}
      >
        {!imgError && imageSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageSrc}
            alt={cat.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs"
          />
        ) : (
          <span className="text-3xl select-none" aria-hidden="true">
            {emoji}
          </span>
        )}
      </div>

      {/* Category Name: centered, ~12–13px, wrapped to maximum 2 lines */}
      <span
        className={`line-clamp-2 max-w-[85px] text-center text-[12px] sm:text-[13px] leading-tight font-bold transition-colors ${
          isSelected
            ? "text-[#00875a] font-extrabold"
            : "text-slate-800 group-hover:text-[#00875a]"
        }`}
      >
        {cat.name}
      </span>
    </button>
  );
};

export function CategoryGrid({
  categories,
  onSelect,
  selectedCategoryId,
  title = "Shop by Category",
  showSeeAll = true,
}: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;

  // Check if categories have parent/group metadata from backend
  type CategoryWithGroup = BackendCategory & {
    group?: string;
    parentName?: string;
    categoryGroup?: string;
  };

  const hasGrouping = categories.some((c: CategoryWithGroup) =>
    Boolean(c.group || c.parentName || c.categoryGroup)
  );

  // If grouping exists in data, group by heading; otherwise render single compact grid
  if (hasGrouping) {
    const groupsMap = new Map<string, BackendCategory[]>();
    categories.forEach((cat: CategoryWithGroup) => {
      const gName = cat.group || cat.parentName || cat.categoryGroup || "Other Categories";
      if (!groupsMap.has(gName)) groupsMap.set(gName, []);
      groupsMap.get(gName)!.push(cat);
    });

    return (
      <section className="mx-auto my-3 w-full max-w-[1400px] px-3 sm:px-5 lg:px-6">
        {Array.from(groupsMap.entries()).map(([groupName, groupCats]) => (
          <div key={groupName} className="mb-5 last:mb-0">
            <h3 className="mb-2.5 text-sm font-extrabold text-slate-900 tracking-tight sm:text-base">
              {groupName}
            </h3>

            {/* 4-column compact grid on mobile, 5 on tablet, 6 on desktop */}
            <div className="grid grid-cols-4 gap-x-2 gap-y-3.5 sm:grid-cols-5 sm:gap-4 md:grid-cols-6 lg:grid-cols-6">
              {groupCats.map((cat, i) => {
                const catId = getCategoryId(cat);
                const isSelected = selectedCategoryId === catId;

                return (
                  <CategoryItem
                    key={catId}
                    cat={cat}
                    index={i}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Flat category list -> Compact 4-column grid on mobile, 5–6 on tablets/desktop
  return (
    <section className="mx-auto my-3 w-full max-w-[1400px] px-3 sm:px-5 lg:px-6">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00875a] sm:text-xs">
            Explore
          </p>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight sm:text-xl md:text-2xl">
            {title}
          </h2>
        </div>

        {showSeeAll && (
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#00875a] shadow-2xs transition hover:bg-emerald-50 hover:border-emerald-300 sm:text-xs"
          >
            <span>All Categories</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* 4 columns on mobile, 5–6 on tablets, 6 on desktop */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-3.5 sm:grid-cols-5 sm:gap-4 md:grid-cols-6 lg:grid-cols-6">
        {categories.map((cat, i) => {
          const catId = getCategoryId(cat);
          const isSelected = selectedCategoryId === catId;

          return (
            <CategoryItem
              key={catId}
              cat={cat}
              index={i}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </section>
  );
}

export default CategoryGrid;
