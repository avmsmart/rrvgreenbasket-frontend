"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  History,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import {
  AdminReviewItem,
  AdminReviewStatistics,
  AdminReviewsFilterParams,
  AdminReviewsPageData,
  AdminReviewStatus,
  getReviewSentiment,
} from "@/types/review";
import { adminReviewService, AdminReviewApiError } from "@/services/admin-review.service";

/* ------------------------------------------------------------------ */
/* Small helpers (mobile UI)                                           */
/* ------------------------------------------------------------------ */

type AppliedFilter = { key: string; label: string; clear: () => void };

function relativeDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function initialsOf(name?: string | null): string {
  const parts = (name || "Customer").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "C";
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === "POSITIVE")
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800">
        Positive
      </span>
    );
  if (sentiment === "NEUTRAL")
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800">
        Neutral
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800">
      Negative
    </span>
  );
}

function PillChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] px-3.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
        active
          ? "bg-[#00875a] text-white border-[#00875a]"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatChip({
  label,
  value,
  dot,
}: {
  label: string;
  value: React.ReactNode;
  dot: string;
}) {
  return (
    <div className="snap-start shrink-0 flex items-center gap-2 h-10 px-3.5 rounded-full bg-white border border-slate-200/90">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-sm font-extrabold text-slate-900">{value}</span>
      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 rounded bg-slate-100" />
          <div className="h-2.5 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-3 w-2/3 rounded bg-slate-100" />
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded bg-slate-100" />
        <div className="h-2.5 w-5/6 rounded bg-slate-100" />
      </div>
    </div>
  );
}

const EMPTY_PAGE = (size: number): AdminReviewsPageData => ({
  content: [],
  pageNumber: 0,
  pageSize: size,
  totalElements: 0,
  totalPages: 0,
  last: true,
  first: true,
});

export default function AdminReviewsPage() {
  // Statistics State
  const [stats, setStats] = useState<AdminReviewStatistics>({
    totalReviews: 0,
    activeReviews: 0,
    deletedReviews: 0,
    averageActiveRating: 0,
    ratingDistribution: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
    recentReviewCount: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // Reviews Table State
  const [reviewsData, setReviewsData] = useState<AdminReviewsPageData>(EMPTY_PAGE(10));
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Mobile list (pages are appended for infinite scroll)
  const [mobileItems, setMobileItems] = useState<AdminReviewItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("ALL");
  const [filterSentiment, setFilterSentiment] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDatePreset, setFilterDatePreset] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // Mobile filter sheet
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [viewReview, setViewReview] = useState<AdminReviewItem | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminReviewItem | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch Statistics (API 12)
  const fetchStatistics = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(false);
    try {
      const data = await adminReviewService.getStatistics();
      if (data && typeof data === "object") {
        setStats(data);
      }
    } catch (err) {
      console.warn("[AdminReviews] Failed to fetch statistics:", err);
      setStatsError(true);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // 2. Fetch Reviews with Filters (API 9)
  const fetchReviews = useCallback(async () => {
    setIsReviewsLoading(true);
    setReviewsError(null);

    const params: AdminReviewsFilterParams = {
      page: currentPage,
      size: pageSize,
      sort: sortBy,
    };

    if (filterRating !== "ALL") {
      params.rating = Number(filterRating);
    }

    if (filterStatus === "ACTIVE" || filterStatus === "DELETED") {
      params.status = filterStatus as AdminReviewStatus;
    }

    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      const res = await adminReviewService.getReviews(params);
      if (res && Array.isArray(res.content)) {
        setReviewsData(res);
        setMobileItems((prev) =>
          res.pageNumber === 0
            ? res.content
            : [
                ...prev,
                ...res.content.filter((n) => !prev.some((p) => p.publicId === n.publicId)),
              ]
        );
      } else {
        setReviewsData(EMPTY_PAGE(pageSize));
        setMobileItems([]);
      }
    } catch (err) {
      console.warn("[AdminReviews] Failed to fetch reviews:", err);
      setReviewsError(
        err instanceof AdminReviewApiError
          ? err.message
          : "Please check your connection or try again in a moment."
      );
      if (currentPage === 0) {
        setReviewsData(EMPTY_PAGE(pageSize));
        setMobileItems([]);
      }
    } finally {
      setIsReviewsLoading(false);
    }
  }, [currentPage, pageSize, sortBy, filterRating, filterStatus, startDate, endDate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Date Preset Selection
  const handleDatePresetChange = (preset: string) => {
    setFilterDatePreset(preset);
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    if (preset === "TODAY") {
      const todayStr = formatDate(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "LAST_7_DAYS") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === "LAST_30_DAYS") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === "THIS_MONTH") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(today));
    } else if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
    }
    setCurrentPage(0);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterRating("ALL");
    setFilterSentiment("ALL");
    setFilterStatus("ALL");
    setFilterDatePreset("ALL");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
    setCurrentPage(0);
  };

  // Single refresh used by desktop + mobile buttons
  const handleRefresh = () => {
    fetchStatistics();
    if (currentPage !== 0) {
      setCurrentPage(0); // effect refetches page 0
    } else {
      fetchReviews();
    }
  };

  // View details modal (API 10)
  const handleOpenDetails = async (item: AdminReviewItem) => {
    setViewReview(item);
    setIsDetailsLoading(true);
    try {
      const fullDetails = await adminReviewService.getReviewDetails(item.publicId);
      if (fullDetails) {
        setViewReview(fullDetails);
      }
    } catch (err) {
      console.warn("[AdminReviews] Failed to fetch full audit details:", err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Delete review action (API 11)
  const handleExecuteDelete = async () => {
    if (!deleteTarget?.publicId) return;
    setIsDeleting(true);

    try {
      await adminReviewService.deleteReview(deleteTarget.publicId, deleteReason);
      showToast("Review has been soft-deleted successfully.", "success");
      setDeleteTarget(null);
      setDeleteReason("");
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof AdminReviewApiError ? err.message : "Failed to delete review";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side search & sentiment filtering
  const applyClientFilters = useCallback(
    (list: AdminReviewItem[]) =>
      list.filter((item) => {
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchesComment = (item.reviewComment || "").toLowerCase().includes(query);
          const matchesTitle = (item.reviewTitle || "").toLowerCase().includes(query);
          const matchesCust = (item.customerDisplayName || "").toLowerCase().includes(query);
          const matchesProd = (item.productPublicId || "").toLowerCase().includes(query);
          if (!matchesComment && !matchesTitle && !matchesCust && !matchesProd) {
            return false;
          }
        }
        if (filterSentiment !== "ALL") {
          if (getReviewSentiment(item.rating) !== filterSentiment) return false;
        }
        return true;
      }),
    [searchTerm, filterSentiment]
  );

  const filteredContent = useMemo(
    () => applyClientFilters(reviewsData.content),
    [applyClientFilters, reviewsData.content]
  );
  const filteredMobile = useMemo(
    () => applyClientFilters(mobileItems),
    [applyClientFilters, mobileItems]
  );

  // Derived statistics metrics
  const positiveCount = (stats.ratingDistribution["5"] || 0) + (stats.ratingDistribution["4"] || 0);
  const neutralCount = stats.ratingDistribution["3"] || 0;
  const negativeCount = (stats.ratingDistribution["2"] || 0) + (stats.ratingDistribution["1"] || 0);

  // Applied filters (for mobile chips + badge)
  const appliedFilters: AppliedFilter[] = [];
  if (filterRating !== "ALL")
    appliedFilters.push({
      key: "rating",
      label: `${filterRating}★`,
      clear: () => {
        setFilterRating("ALL");
        setCurrentPage(0);
      },
    });
  if (filterSentiment !== "ALL")
    appliedFilters.push({
      key: "sentiment",
      label: filterSentiment.charAt(0) + filterSentiment.slice(1).toLowerCase(),
      clear: () => setFilterSentiment("ALL"),
    });
  if (filterStatus !== "ALL")
    appliedFilters.push({
      key: "status",
      label: filterStatus === "ACTIVE" ? "Active" : "Deleted",
      clear: () => {
        setFilterStatus("ALL");
        setCurrentPage(0);
      },
    });
  if (filterDatePreset !== "ALL")
    appliedFilters.push({
      key: "date",
      label: filterDatePreset
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase()),
      clear: () => handleDatePresetChange("ALL"),
    });

  // Infinite scroll (mobile only: the sentinel is hidden on md+)
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !reviewsData.last &&
          !isReviewsLoading &&
          !reviewsError
        ) {
          setCurrentPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reviewsData.last, isReviewsLoading, reviewsError]);

  // Multi-select toggle (desktop table)
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredContent.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContent.map((r) => r.publicId));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const statVal = (v: React.ReactNode) => (statsError ? "—" : isStatsLoading ? "…" : v);

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-clip space-y-4 md:space-y-6 pb-28 md:pb-12">
      {/* Toast Notification (bottom on mobile, top-right on desktop) */}
      {toast && (
        <div
          className={`fixed z-[60] bottom-20 left-4 right-4 md:bottom-auto md:left-auto md:top-20 md:right-6 text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-3 md:slide-in-from-top-3 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-700"
              : "bg-rose-950 text-white border-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold md:font-black text-slate-900 tracking-tight">
            <span className="md:hidden">Reviews</span>
            <span className="hidden md:inline">Review Management</span>
          </h1>
          <p className="hidden md:block text-sm text-slate-500 font-medium mt-1">
            Monitor product feedback, sentiment analysis, ratings metrics, and moderate community reviews.
          </p>
        </div>

        {/* Desktop refresh (mobile has its own icon button beside search) */}
        <button
          type="button"
          onClick={handleRefresh}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/90 text-xs font-bold shadow-3xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* =========================================================================
          A1. STATISTICS CHIPS (mobile only)
         ========================================================================= */}
      <div className="md:hidden w-full max-w-full min-w-0 flex gap-2 overflow-x-auto overscroll-x-contain snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatChip label="Total" value={statVal(stats.totalReviews)} dot="bg-slate-700" />
        <StatChip
          label="Avg rating"
          value={statVal(stats.averageActiveRating > 0 ? stats.averageActiveRating.toFixed(1) : "0.0")}
          dot="bg-amber-400"
        />
        <StatChip label="Positive" value={statVal(positiveCount)} dot="bg-emerald-500" />
        <StatChip label="Neutral" value={statVal(neutralCount)} dot="bg-amber-500" />
        <StatChip label="Negative" value={statVal(negativeCount)} dot="bg-rose-500" />
      </div>

      {/* =========================================================================
          A2. STATISTICS CARDS (desktop only)
         ========================================================================= */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Reviews */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-3xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalReviews}</div>
          <p className="text-[10px] text-slate-400 font-medium">
            {stats.activeReviews} active • {stats.deletedReviews} deleted
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-3xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avg Rating
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.averageActiveRating > 0 ? stats.averageActiveRating.toFixed(1) : "0.0"}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Across active products</p>
        </div>

        {/* Positive (4-5 Stars) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-3xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Positive (4-5★)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{positiveCount}</div>
          <p className="text-[10px] text-emerald-700 font-medium">
            {stats.totalReviews > 0
              ? `${Math.round((positiveCount / stats.totalReviews) * 100)}% of total`
              : "0%"}
          </p>
        </div>

        {/* Neutral (3 Stars) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-3xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Neutral (3★)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{neutralCount}</div>
          <p className="text-[10px] text-amber-700 font-medium">Moderate satisfaction</p>
        </div>

        {/* Negative (1-2 Stars) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-3xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Negative (1-2★)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">{negativeCount}</div>
          <p className="text-[10px] text-rose-700 font-medium">Requires follow-up</p>
        </div>
      </div>

      {/* =========================================================================
          B1. STICKY SEARCH + FILTER BUTTON + REFRESH (mobile only)
          If your layout's scroll container has its own header offset, change top-0.
         ========================================================================= */}
      <div className="md:hidden sticky top-0 z-30 w-full max-w-full min-w-0 py-2 bg-slate-50 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviews"
              aria-label="Search reviews"
              className="w-full h-11 pl-9 pr-9 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Open filters"
            onClick={() => setIsFilterSheetOpen(true)}
            className="relative w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-white border border-slate-200 text-slate-700 active:scale-95 transition-transform cursor-pointer"
          >
            <Filter className="w-[18px] h-[18px]" />
            {appliedFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[#00875a] text-white text-[10px] font-bold">
                {appliedFilters.length}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Refresh"
            onClick={handleRefresh}
            className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-transform cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isReviewsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {appliedFilters.length > 0 && (
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {appliedFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.clear}
                className="shrink-0 flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                {f.label}
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="shrink-0 h-8 px-2 text-xs font-bold text-[#00875a] cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          B2. FILTERS SECTION (desktop only)
         ========================================================================= */}
      <div className="hidden md:block bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by review text, customer, or product ID..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>

          {/* Rating Filter */}
          <div className="lg:col-span-2">
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20 cursor-pointer"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="lg:col-span-2">
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20 cursor-pointer"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POSITIVE">Positive (4-5★)</option>
              <option value="NEUTRAL">Neutral (3★)</option>
              <option value="NEGATIVE">Negative (1-2★)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DELETED">Deleted Only</option>
            </select>
          </div>

          {/* Date Preset */}
          <div className="lg:col-span-2">
            <select
              value={filterDatePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20 cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>
        </div>

        {filterDatePreset === "CUSTOM" && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredContent.length} reviews
          </span>

          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-[#00875a] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          C1. REVIEW CARDS (mobile only)
         ========================================================================= */}
      <div className="md:hidden space-y-3">
        {/* Initial loading skeletons */}
        {isReviewsLoading && mobileItems.length === 0 && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* Error state */}
        {!isReviewsLoading && reviewsError && mobileItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 grid place-items-center">
              <WifiOff className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Couldn&apos;t load reviews</p>
              <p className="text-xs text-slate-500 mt-1">{reviewsError}</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="h-11 px-6 rounded-xl bg-[#00875a] text-white text-sm font-bold active:scale-95 transition-transform cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state (no reviews at all) */}
        {!isReviewsLoading &&
          !reviewsError &&
          mobileItems.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-2">
              <MessageSquare className="w-9 h-9 text-slate-300 mx-auto" />
              <p className="text-sm font-extrabold text-slate-900">No reviews yet</p>
              <p className="text-xs text-slate-500">
                Reviews will appear here when customers submit feedback.
              </p>
            </div>
          )}

        {/* No results after client filtering */}
        {mobileItems.length > 0 && filteredMobile.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-3">
            <Search className="w-9 h-9 text-slate-300 mx-auto" />
            <p className="text-sm font-extrabold text-slate-900">No reviews match your filters</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-5 rounded-xl border border-[#00875a] text-[#00875a] text-sm font-bold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Cards */}
        {filteredMobile.map((review) => {
          const sentiment = getReviewSentiment(review.rating);
          const isExpanded = expandedIds.includes(review.publicId);
          const comment = review.reviewComment || "";
          const isLong = comment.length > 110;

          return (
            <div
              key={review.publicId}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenDetails(review)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleOpenDetails(review);
              }}
              className={`bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2.5 active:scale-[0.98] transition-transform cursor-pointer ${
                review.status === "DELETED" ? "opacity-70" : ""
              }`}
            >
              {/* Row 1: avatar, name, date */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 grid place-items-center text-xs font-extrabold shrink-0">
                  {initialsOf(review.customerDisplayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900 truncate">
                    {review.customerDisplayName || "Customer"}
                  </p>
                  <p className="text-xs text-slate-500">{relativeDate(review.createdAt)}</p>
                </div>
                <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg font-extrabold text-sm text-slate-900 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {review.rating}
                </div>
              </div>

              {/* Row 2: product + sentiment */}
              <div className="flex items-center gap-2">
                <SentimentBadge sentiment={sentiment} />
                <span className="text-[11px] font-mono text-slate-500 truncate">
                  {review.productPublicId}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-1">
                {review.reviewTitle && (
                  <p className="text-sm font-bold text-slate-900">{review.reviewTitle}</p>
                )}
                <p
                  className={`text-[13px] leading-relaxed text-slate-600 ${
                    isExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {comment}
                </p>
                {isLong && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(review.publicId);
                    }}
                    className="text-xs font-bold text-[#00875a] cursor-pointer"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {review.status === "ACTIVE" ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                    Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">
                    Deleted
                  </span>
                )}

                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="View review details"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(review);
                    }}
                    className="w-11 h-11 grid place-items-center rounded-xl text-slate-500 active:bg-slate-100 cursor-pointer"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {review.status === "ACTIVE" && (
                    <button
                      type="button"
                      aria-label="Delete review"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(review);
                        setDeleteReason("");
                      }}
                      className="w-11 h-11 grid place-items-center rounded-xl text-rose-500 active:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Load-more state / infinite-scroll sentinel */}
        <div ref={sentinelRef} className="py-3 text-center text-xs text-slate-500">
          {isReviewsLoading && mobileItems.length > 0 && (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#00875a]" /> Loading more…
            </span>
          )}
          {!isReviewsLoading && reviewsError && mobileItems.length > 0 && (
            <button
              type="button"
              onClick={fetchReviews}
              className="font-bold text-[#00875a] cursor-pointer"
            >
              Couldn&apos;t load more · Retry
            </button>
          )}
          {!isReviewsLoading &&
            !reviewsError &&
            reviewsData.last &&
            mobileItems.length > 0 && <span>You&apos;re all caught up</span>}
        </div>
      </div>

      {/* =========================================================================
          C2. REVIEWS TABLE (desktop only)
         ========================================================================= */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredContent.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a]/20 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3.5 w-12">S.No</th>
                <th className="px-4 py-3.5 min-w-[240px]">Review Content</th>
                <th className="px-4 py-3.5 min-w-[160px]">Product</th>
                <th className="px-4 py-3.5 min-w-[140px]">Customer</th>
                <th className="px-3 py-3.5 w-24">Rating</th>
                <th className="px-3 py-3.5 w-24">Sentiment</th>
                <th className="px-4 py-3.5 w-28">Date</th>
                <th className="px-3 py-3.5 w-24">Status</th>
                <th className="px-4 py-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isReviewsLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00875a]" />
                      <span>Loading reviews data...</span>
                    </div>
                  </td>
                </tr>
              ) : reviewsError ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center space-y-3">
                    <WifiOff className="w-8 h-8 text-rose-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Couldn&apos;t load reviews</p>
                    <p className="text-[11px] text-slate-400">{reviewsError}</p>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="px-4 py-2 rounded-xl bg-[#00875a] text-white text-xs font-bold cursor-pointer"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : filteredContent.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No matching reviews found</p>
                    <p className="text-[11px] text-slate-400">
                      Try clearing filters or checking back when customers submit feedback.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContent.map((review, idx) => {
                  const isSelected = selectedIds.includes(review.publicId);
                  const sentiment = getReviewSentiment(review.rating);
                  const reviewDate = review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={review.publicId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(review.publicId)}
                          className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a]/20 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3.5 font-bold text-slate-400">
                        {reviewsData.pageNumber * reviewsData.pageSize + idx + 1}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 max-w-sm">
                          {review.reviewTitle && (
                            <div className="font-bold text-slate-900 truncate">
                              {review.reviewTitle}
                            </div>
                          )}
                          <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                            {review.reviewComment}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 font-mono text-[11px] truncate max-w-[150px]">
                          {review.productPublicId}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">
                          {review.customerDisplayName || "Customer"}
                        </div>
                        {review.customerPublicId && (
                          <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[130px]">
                            {review.customerPublicId}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-extrabold text-slate-900">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{review.rating}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        {sentiment === "POSITIVE" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Positive
                          </span>
                        )}
                        {sentiment === "NEUTRAL" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Neutral
                          </span>
                        )}
                        {sentiment === "NEGATIVE" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Negative
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-600 whitespace-nowrap">
                        {reviewDate}
                      </td>

                      <td className="px-3 py-3.5">
                        {review.status === "ACTIVE" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span
                            title={review.deletionReason || "Deleted"}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700"
                          >
                            Deleted
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(review)}
                            title="View details & audit history"
                            aria-label="View details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {review.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(review);
                                setDeleteReason("");
                              }}
                              title="Soft delete review"
                              aria-label="Delete review"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls (desktop) */}
        <div className="p-4 border-t border-slate-100 flex flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page {reviewsData.pageNumber + 1} of {Math.max(1, reviewsData.totalPages)} (
            {reviewsData.totalElements} reviews total)
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <button
              type="button"
              aria-label="Previous page"
              disabled={reviewsData.first}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={reviewsData.last}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          F. MOBILE FILTER BOTTOM SHEET
         ========================================================================= */}
      {isFilterSheetOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex items-end">
          <div
            className="absolute inset-0 bg-slate-900/50 animate-in fade-in"
            onClick={() => setIsFilterSheetOpen(false)}
          />
          <div className="relative w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-[20px] shadow-2xl animate-in slide-in-from-bottom">
            <div className="sticky top-0 bg-white pt-2.5 pb-2 px-5 z-10 border-b border-slate-100">
              <div className="w-10 h-1.5 rounded-full bg-slate-200 mx-auto mb-2" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">Filters</h3>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-10 h-10 grid place-items-center rounded-full text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</p>
                <div className="flex flex-wrap gap-2">
                  {["ALL", "5", "4", "3", "2", "1"].map((v) => (
                    <PillChip
                      key={v}
                      active={filterRating === v}
                      onClick={() => {
                        setFilterRating(v);
                        setCurrentPage(0);
                      }}
                    >
                      {v === "ALL" ? "All" : `${v}★`}
                    </PillChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sentiment</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["ALL", "All"],
                    ["POSITIVE", "Positive 4-5★"],
                    ["NEUTRAL", "Neutral 3★"],
                    ["NEGATIVE", "Negative 1-2★"],
                  ].map(([v, label]) => (
                    <PillChip key={v} active={filterSentiment === v} onClick={() => setFilterSentiment(v)}>
                      {label}
                    </PillChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["ALL", "All"],
                    ["ACTIVE", "Active"],
                    ["DELETED", "Deleted"],
                  ].map(([v, label]) => (
                    <PillChip
                      key={v}
                      active={filterStatus === v}
                      onClick={() => {
                        setFilterStatus(v);
                        setCurrentPage(0);
                      }}
                    >
                      {label}
                    </PillChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["ALL", "All"],
                    ["TODAY", "Today"],
                    ["LAST_7_DAYS", "7 days"],
                    ["LAST_30_DAYS", "30 days"],
                    ["THIS_MONTH", "This month"],
                    ["CUSTOM", "Custom"],
                  ].map(([v, label]) => (
                    <PillChip
                      key={v}
                      active={filterDatePreset === v}
                      onClick={() => handleDatePresetChange(v)}
                    >
                      {label}
                    </PillChip>
                  ))}
                </div>

                {filterDatePreset === "CUSTOM" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="date"
                      aria-label="Start date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                    />
                    <input
                      type="date"
                      aria-label="End date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-3 flex gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 h-12 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-[2] h-12 rounded-xl bg-[#00875a] text-white text-sm font-bold cursor-pointer"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          D. REVIEW DETAILS (bottom sheet on mobile, modal on desktop)
         ========================================================================= */}
      {viewReview && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full md:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-[20px] md:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xl space-y-5 relative">
            <div className="md:hidden w-10 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1" />
            <button
              type="button"
              aria-label="Close"
              onClick={() => setViewReview(null)}
              className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-10">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block break-all">
                Review ID: {viewReview.publicId}
              </span>
              <h3 className="text-lg md:text-xl font-extrabold md:font-black text-slate-900 tracking-tight mt-0.5">
                Review Details & Audit Trail
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-slate-900 text-sm">
                    {viewReview.rating} / 5 Stars
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    viewReview.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {viewReview.status}
                </span>
              </div>

              {viewReview.reviewTitle && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Title</span>
                  <p className="font-bold text-slate-900">{viewReview.reviewTitle}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Comment</span>
                <p className="text-slate-700 leading-relaxed font-medium">{viewReview.reviewComment}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Customer</span>
                  <span className="font-bold text-slate-800">{viewReview.customerDisplayName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Product Public ID</span>
                  <span className="font-mono text-slate-800 font-bold truncate block">
                    {viewReview.productPublicId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Created At</span>
                  <span className="font-medium text-slate-700">{viewReview.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Updated At</span>
                  <span className="font-medium text-slate-700">{viewReview.updatedAt}</span>
                </div>
              </div>

              {viewReview.status === "DELETED" && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Deletion Record</span>
                  </div>
                  <p className="text-[11px]">
                    <strong>Reason:</strong> {viewReview.deletionReason || "No reason specified"}
                  </p>
                  <p className="text-[10px] text-rose-700">
                    Deleted At: {viewReview.deletedAt || "N/A"} by {viewReview.deletedBy || "ADMIN"}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-[#00875a]" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Audit History Timeline
                </h4>
              </div>

              {isDetailsLoading ? (
                <div className="p-4 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00875a]" />
                  <span>Loading audit log...</span>
                </div>
              ) : !viewReview.auditHistory || viewReview.auditHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No additional audit history logged.</p>
              ) : (
                <div className="space-y-3 relative pl-4 border-l-2 border-emerald-200">
                  {viewReview.auditHistory.map((audit) => (
                    <div key={audit.id} className="relative text-xs space-y-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00875a] absolute -left-[21px] top-1" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900">{audit.action}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {audit.actorRole}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(audit.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {audit.reason && <p className="text-slate-600 text-[11px]">{audit.reason}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewReview(null)}
                className="w-full md:w-auto h-12 md:h-auto px-5 md:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm md:text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          E. ADMIN SOFT DELETE CONFIRMATION (bottom sheet on mobile)
         ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full md:max-w-md rounded-t-[20px] md:rounded-3xl p-5 md:p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="md:hidden w-10 h-1.5 rounded-full bg-slate-200 mx-auto" />
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Soft Delete Review?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                This review will be marked as DELETED and hidden from the storefront product page.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Deletion (Optional)
              </label>
              <textarea
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Violated community guidelines, abusive content, spam..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 h-12 md:h-auto md:py-2.5 rounded-xl border border-slate-200 text-sm md:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="flex-1 h-12 md:h-auto md:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm md:text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}