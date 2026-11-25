"use client";

import React, { useEffect, useRef } from "react";
import { BackendCategory } from "@/types";
import { getCategoryId } from "@/services/product.service";
import { getCategoryEmoji, getCategoryImage } from "@/utils/category-visuals";
import { CategoryAvatar } from "./CategoryAvatar";

interface CategoryRailProps {
  categories: BackendCategory[];
  /** publicId of the selected category, or null for "All" */
  activeId: string | null;
  onSelect: (category: BackendCategory | null) => void;
  isLoading?: boolean;
}

const ALL_KEY = "__all__";
/** Diameter (px) of the round category images in the rail */
const AVATAR_SIZE = 44;

/**
 * Left-hand vertical category rail (Zepto style).
 * Scrolls on its own, independent of the product pane, and keeps the
 * selected category in view.
 */
export const CategoryRail: React.FC<CategoryRailProps> = ({
  categories,
  activeId,
  onSelect,
  isLoading = false,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Keep the active item visible inside the rail (without scrolling the page)
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const target = scroller.querySelector<HTMLElement>(
      `[data-rail-key="${CSS.escape(activeId ?? ALL_KEY)}"]`
    );
    if (!target) return;

    const top = target.offsetTop;
    const bottom = top + target.offsetHeight;
    const viewTop = scroller.scrollTop;
    const viewBottom = viewTop + scroller.clientHeight;

    if (top < viewTop) {
      scroller.scrollTo({ top: Math.max(0, top - 8), behavior: "smooth" });
    } else if (bottom > viewBottom) {
      scroller.scrollTo({ top: bottom - scroller.clientHeight + 8, behavior: "smooth" });
    }
  }, [activeId, categories.length]);

  const itemBase =
    "relative flex w-full cursor-pointer flex-col items-center gap-1 px-1 py-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#00875a]";

  const renderItem = (
    key: string,
    label: string,
    isActive: boolean,
    onClick: () => void,
    avatar: React.ReactNode
  ) => (
    <li key={key}>
      <button
        type="button"
        data-rail-key={key}
        onClick={onClick}
        aria-current={isActive ? "true" : undefined}
        className={`${itemBase} ${isActive ? "bg-[#eaf8f0]" : "hover:bg-slate-50"}`}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#00875a]"
          />
        )}
        <span
          className={`rounded-full transition-shadow ${
            isActive ? "ring-2 ring-[#00875a]/50 ring-offset-2 ring-offset-[#eaf8f0]" : ""
          }`}
        >
          {avatar}
        </span>
        <span
          className={`line-clamp-2 w-full px-0.5 text-[11px] leading-[14px] lg:text-xs ${
            isActive ? "font-bold text-[#00734d]" : "font-medium text-slate-600"
          }`}
        >
          {label}
        </span>
      </button>
    </li>
  );

  return (
    <nav
      aria-label="Product categories"
      className="h-full w-[72px] shrink-0 border-r border-slate-100 bg-white sm:w-[88px] lg:w-[104px]"
    >
      <div
        ref={scrollerRef}
        className="relative h-full overflow-y-auto overscroll-contain pb-28 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] md:pb-6"
      >
        {isLoading ? (
          <ul aria-hidden="true" className="animate-pulse">
            {Array.from({ length: 7 }).map((_, i) => (
              <li key={i} className="flex flex-col items-center gap-2 px-1 py-2.5">
                <span className="h-11 w-11 rounded-full bg-slate-100" />
                <span className="h-2.5 w-12 rounded bg-slate-100" />
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {renderItem(
              ALL_KEY,
              "All",
              activeId === null,
              () => onSelect(null),
              <CategoryAvatar emoji="🧺" alt="All products" size={AVATAR_SIZE} />
            )}

            {categories.map((cat) => {
              const id = getCategoryId(cat);
              return renderItem(
                id,
                cat.name,
                activeId === id,
                () => onSelect(cat),
                <CategoryAvatar
                  src={getCategoryImage(cat)}
                  emoji={getCategoryEmoji(cat.name)}
                  alt={cat.name}
                  size={AVATAR_SIZE}
                />
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default CategoryRail;