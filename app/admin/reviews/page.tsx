"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  History,
  ShieldAlert,
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

  // Reviews Table State
  const [reviewsData, setReviewsData] = useState<AdminReviewsPageData>({
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
  });
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

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
    try {
      const data = await adminReviewService.getStatistics();
      if (data && typeof data === "object") {
        setStats(data);
      }
    } catch (err) {
      console.warn("[AdminReviews] Failed to fetch statistics:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // 2. Fetch Reviews with Filters (API 9)
  const fetchReviews = useCallback(async () => {
    setIsReviewsLoading(true);

    const params: AdminReviewsFilterParams = {
      page: currentPage,
      size: pageSize,
      sort: sortBy,
    };

    // Rating filter
    if (filterRating !== "ALL") {
      params.rating = Number(filterRating);
    }

    // Status filter
    if (filterStatus === "ACTIVE" || filterStatus === "DELETED") {
      params.status = filterStatus as AdminReviewStatus;
    }

    // Date range
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      const res = await adminReviewService.getReviews(params);
      if (res && Array.isArray(res.content)) {
        setReviewsData(res);
      } else {
        setReviewsData({
          content: [],
          pageNumber: 0,
          pageSize,
          totalElements: 0,
          totalPages: 0,
          last: true,
          first: true,
        });
      }
    } catch (err) {
      console.warn("[AdminReviews] Failed to fetch reviews:", err);
      setReviewsData({
        content: [],
        pageNumber: 0,
        pageSize,
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
      });
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
      fetchReviews();
      fetchStatistics();
    } catch (err: unknown) {
      const msg = err instanceof AdminReviewApiError ? err.message : "Failed to delete review";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side search & sentiment filtering over paginated data
  const filteredContent = useMemo(() => {
    return reviewsData.content.filter((item) => {
      // Search matching title, comment, product, customer
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

      // Sentiment filter derived from rating
      if (filterSentiment !== "ALL") {
        const sentiment = getReviewSentiment(item.rating);
        if (sentiment !== filterSentiment) {
          return false;
        }
      }

      return true;
    });
  }, [reviewsData.content, searchTerm, filterSentiment]);

  // Derived statistics metrics
  const positiveCount = (stats.ratingDistribution["5"] || 0) + (stats.ratingDistribution["4"] || 0);
  const neutralCount = stats.ratingDistribution["3"] || 0;
  const negativeCount = (stats.ratingDistribution["2"] || 0) + (stats.ratingDistribution["1"] || 0);

  // Multi-select toggle
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredContent.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContent.map((r) => r.publicId));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border animate-in fade-in slide-in-from-top-3 ${
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Review Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Monitor product feedback, sentiment analysis, ratings metrics, and moderate community reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStatistics();
            fetchReviews();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/90 text-xs font-bold shadow-3xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* =========================================================================
          A. STATISTICS CARDS (API 12)
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
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
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalReviews}
          </div>
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
          <p className="text-[10px] text-slate-400 font-medium">
            Across active products
          </p>
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
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {positiveCount}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium">
            {stats.totalReviews > 0 ? `${Math.round((positiveCount / stats.totalReviews) * 100)}% of total` : "0%"}
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
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {neutralCount}
          </div>
          <p className="text-[10px] text-amber-700 font-medium">
            Moderate satisfaction
          </p>
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
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {negativeCount}
          </div>
          <p className="text-[10px] text-rose-700 font-medium">
            Requires follow-up
          </p>
        </div>
      </div>

      {/* =========================================================================
          B. FILTERS SECTION
         ========================================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-3xs space-y-3.5">
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

        {/* Custom Date Inputs if CUSTOM selected */}
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

        {/* Filter Summary & Actions */}
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
          C. REVIEWS TABLE
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
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
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(review.publicId)}
                          className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a]/20 cursor-pointer"
                        />
                      </td>

                      {/* S.No */}
                      <td className="px-3 py-3.5 font-bold text-slate-400">
                        {reviewsData.pageNumber * reviewsData.pageSize + idx + 1}
                      </td>

                      {/* Review Content */}
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

                      {/* Product */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 font-mono text-[11px] truncate max-w-[150px]">
                          {review.productPublicId}
                        </div>
                      </td>

                      {/* Customer */}
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

                      {/* Rating */}
                      <td className="px-3 py-3.5">
                        <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-extrabold text-slate-900">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{review.rating}</span>
                        </div>
                      </td>

                      {/* Sentiment */}
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

                      {/* Date */}
                      <td className="px-4 py-3.5 font-medium text-slate-600 whitespace-nowrap">
                        {reviewDate}
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(review)}
                            title="View details & audit history"
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page {reviewsData.pageNumber + 1} of {Math.max(1, reviewsData.totalPages)} (
            {reviewsData.totalElements} reviews total)
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
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
              disabled={reviewsData.first}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
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
          D. REVIEW DETAILS MODAL (API 10)
         ========================================================================= */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setViewReview(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Review ID: {viewReview.publicId}
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Review Details & Audit Trail
              </h3>
            </div>

            {/* Core Review Details Card */}
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
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Title
                  </span>
                  <p className="font-bold text-slate-900">{viewReview.reviewTitle}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Comment
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {viewReview.reviewComment}
                </p>
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

              {/* Deletion Information (if applicable) */}
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

            {/* Audit History Timeline */}
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
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{audit.action}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {audit.actorRole}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(audit.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {audit.reason && (
                        <p className="text-slate-600 text-[11px]">{audit.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewReview(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          E. ADMIN SOFT DELETE CONFIRMATION MODAL (API 11)
         ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                Soft Delete Review?
              </h3>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
