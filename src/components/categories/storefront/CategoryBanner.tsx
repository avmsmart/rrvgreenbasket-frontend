"use client";

import React from "react";
import { BackendCategory } from "@/types";
import { getCategoryEmoji, getCategoryImage } from "@/utils/category-visuals";
import { CategoryAvatar } from "./CategoryAvatar";

interface CategoryBannerProps {
  /** Selected category, or null for the "All" view */
  category: BackendCategory | null;
  /**
   * Largest real discount (%) among the products on screen.
   * Only shown when it is above zero, so the banner never promises
   * an offer that does not exist.
   */
  maxDiscountPercent?: number;
}

/**
 * Banner shown above the product grid.
 * Phase 1: built from the category's own name, description and image.
 * (Phase 2 can swap in dedicated banner fields from the backend.)
 */
export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  category,
  maxDiscountPercent = 0,
}) => {
  const title = category ? category.name : "Fresh from the farm";
  const subtitle = category
    ? category.description?.trim() || "Picked fresh and delivered to your door."
    : "Fruits, vegetables and more, delivered daily.";

  const image = category ? getCategoryImage(category) : null;
  const emoji = category ? getCategoryEmoji(category.name) : "🧺";

  return (
    <section
      aria-label={`${title} banner`}
      className="relative flex min-h-[124px] items-center justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#005c3e] via-[#00734d] to-[#00875a] p-4 text-white sm:min-h-[148px] sm:p-6"
    >
      {/* Soft decorative circle behind the image */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 sm:h-52 sm:w-52"
      />

      <div className="relative z-10 min-w-0 flex-1">
        {maxDiscountPercent > 0 && (
          <span className="mb-2 inline-block rounded-md bg-amber-300 px-2 py-0.5 text-[10px] font-extrabold text-amber-950 sm:text-xs">
            Up to {maxDiscountPercent}% off
          </span>
        )}
        <h2 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 line-clamp-2 max-w-md text-xs font-medium text-emerald-50/90 sm:text-sm">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 shrink-0">
        <CategoryAvatar
          src={image}
          emoji={emoji}
          alt={title}
          size={96}
          className="!bg-white/15 ring-4 ring-white/25 sm:!h-28 sm:!w-28"
        />
      </div>
    </section>
  );
};

export default CategoryBanner;