"use client";

import React from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { StoreProduct } from "@/types";
import { ZeptoProductCard } from "@/components/home/ZeptoProductCard";

interface CategoryProductGridProps {
  products: StoreProduct[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Text for the empty state, e.g. "No products in Fruits yet." */
  emptyMessage: string;
  onResetFilters?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const GRID =
  "grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 xl:grid-cols-4 2xl:grid-cols-5";

export const CategoryProductGrid: React.FC<CategoryProductGridProps> = ({
  products,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  onResetFilters,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  if (error && products.length === 0) {
    return (
      <div
        role="alert"
        className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h3 className="text-sm font-bold">Couldn’t load products</h3>
            <p className="mt-0.5 text-xs text-rose-600">{error}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
        >
          <RefreshCw size={13} />
          Try again
        </button>
      </div>
    );
  }

  if (isLoading && products.length === 0) {
    return (
      <div className={GRID} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-100 bg-white p-1.5"
          >
            <div className="aspect-square w-full rounded-xl bg-slate-100" />
            <div className="mt-2 h-4 w-14 rounded-md bg-slate-100" />
            <div className="mt-2 h-3 w-full rounded bg-slate-100" />
            <div className="mt-1.5 h-3 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-5 py-12 text-center">
        <div className="mb-2 text-4xl" aria-hidden="true">
          🥬
        </div>
        <h3 className="text-base font-extrabold text-slate-900">Nothing here yet</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">{emptyMessage}</p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 cursor-pointer rounded-xl bg-[#00875a] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-colors hover:bg-[#00734d]"
          >
            Show all products
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={GRID}>
        {products.map((product) => (
          <ZeptoProductCard key={String(product.publicId || product.id)} product={product} fluid />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[#00875a] bg-white px-6 py-2 text-xs font-bold text-[#00875a] transition-colors hover:bg-[#eaf8f0] disabled:opacity-60"
          >
            {isLoadingMore && <Loader2 size={14} className="animate-spin" />}
            {isLoadingMore ? "Loading..." : "Show more"}
          </button>
        </div>
      )}
    </>
  );
};

export default CategoryProductGrid;