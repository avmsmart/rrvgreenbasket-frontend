"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  X,
} from "lucide-react";
import {
  ProductReviewItem,
  ProductRatingSummary,
  PaginatedReviewsData,
  ReviewSortOption,
} from "@/types/review";
import { reviewService, ReviewApiError } from "@/services/review.service";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface ProductReviewsSectionProps {
  productPublicId: string;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productPublicId,
  productName,
}) => {
  const router = useRouter();
  const { customer, isAuthenticated } = useCustomerAuth();

  // Summary state
  const [summary, setSummary] = useState<ProductRatingSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Reviews list state
  const [reviewsData, setReviewsData] = useState<PaginatedReviewsData>({
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
  });
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<ReviewSortOption>("newest");
  const [currentPage, setCurrentPage] = useState<number>(0);

  // My review state
  const [myReview, setMyReview] = useState<ProductReviewItem | null>(null);
  const [isCheckingMyReview, setIsCheckingMyReview] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formComment, setFormComment] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Product Rating Summary (API 7)
  const fetchSummary = useCallback(async () => {
    if (!productPublicId) return;
    setIsSummaryLoading(true);
    try {
      const data = await reviewService.getProductRatingSummary(productPublicId);
      setSummary(data);
    } catch (err) {
      console.warn("[Reviews] Failed to fetch rating summary:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [productPublicId]);

  // 2. Fetch Paginated Product Reviews (API 6)
  const fetchReviews = useCallback(
    async (page: number, sort: ReviewSortOption) => {
      if (!productPublicId) return;
      setIsReviewsLoading(true);
      try {
        const data = await reviewService.getProductReviews(
          productPublicId,
          page,
          10,
          sort
        );
        if (data && Array.isArray(data.content)) {
          setReviewsData(data);
        }
      } catch (err) {
        console.warn("[Reviews] Failed to fetch reviews:", err);
      } finally {
        setIsReviewsLoading(false);
      }
    },
    [productPublicId]
  );

  // 3. Check customer's existing review (API 5)
  const checkMyReview = useCallback(async () => {
    if (!productPublicId || !isAuthenticated) {
      setMyReview(null);
      setIsCheckingMyReview(false);
      return;
    }
    setIsCheckingMyReview(true);
    try {
      const existing = await reviewService.getMyReviewForProduct(productPublicId);
      if (
        existing &&
        typeof existing.publicId === "string" &&
        existing.publicId.trim().length > 0 &&
        (!existing.productPublicId || existing.productPublicId === productPublicId)
      ) {
        setMyReview(existing);
      } else {
        setMyReview(null);
      }
    } catch {
      setMyReview(null);
    } finally {
      setIsCheckingMyReview(false);
    }
  }, [productPublicId, isAuthenticated]);

  // Reset myReview whenever productPublicId or authentication changes
  useEffect(() => {
    setMyReview(null);
    setIsCheckingMyReview(false);
  }, [productPublicId, isAuthenticated]);

  useEffect(() => {
    fetchSummary();
    fetchReviews(currentPage, sortBy);
    checkMyReview();
  }, [fetchSummary, fetchReviews, checkMyReview, currentPage, sortBy]);

  const hasCustomerGivenReview = Boolean(
    isAuthenticated &&
    !isCheckingMyReview &&
    myReview &&
    typeof myReview.publicId === "string" &&
    myReview.publicId.trim().length > 0 &&
    (!myReview.productPublicId || myReview.productPublicId === productPublicId)
  );

  // Open modal in Create or Edit mode
  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      router.push("/mobile-auth");
      return;
    }

    if (hasCustomerGivenReview && myReview) {
      // Edit Mode
      setFormRating(myReview.rating || 5);
      setFormTitle(myReview.reviewTitle || "");
      setFormComment(myReview.reviewComment || "");
    } else {
      // Create Mode
      setFormRating(5);
      setFormTitle("");
      setFormComment("");
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit review form (API 1 or API 2)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      setFormError("Please enter your review feedback.");
      return;
    }
    if (formComment.length > 2000) {
      setFormError("Review comment must not exceed 2,000 characters.");
      return;
    }
    if (formTitle.length > 150) {
      setFormError("Review title must not exceed 150 characters.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (myReview?.publicId) {
        // API 2: Update existing review
        const updated = await reviewService.updateReview(myReview.publicId, {
          rating: formRating,
          reviewTitle: formTitle.trim() || undefined,
          reviewComment: formComment.trim(),
        });
        setMyReview(updated);
        showToast("Your review has been updated successfully!");
      } else {
        // API 1: Submit new review
        const created = await reviewService.submitReview({
          productPublicId,
          rating: formRating,
          reviewTitle: formTitle.trim() || undefined,
          reviewComment: formComment.trim(),
        });
        setMyReview(created);
        showToast("Thank you! Your review has been submitted.");
      }

      setIsModalOpen(false);
      fetchSummary();
      fetchReviews(0, sortBy);
      setCurrentPage(0);
    } catch (err: unknown) {
      const msg = err instanceof ReviewApiError ? err.message : "Failed to submit review";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete own review (API 3)
  const handleConfirmDelete = async () => {
    if (!myReview?.publicId) return;
    setIsDeleting(true);

    try {
      await reviewService.deleteReview(myReview.publicId);
      setMyReview(null);
      setIsDeleteModalOpen(false);
      showToast("Your review was deleted successfully.");
      fetchSummary();
      fetchReviews(0, sortBy);
      setCurrentPage(0);
    } catch (err: unknown) {
      const msg = err instanceof ReviewApiError ? err.message : "Failed to delete review";
      showToast(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const averageRating = summary?.averageRating ?? 0;
  const totalReviews = summary?.totalActiveReviews ?? 0;
  const distributions = summary?.ratingDistributionPercentages || {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
  };

  return (
    <section className="pt-10 border-t border-slate-200/80 mt-12 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Reviews
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real feedback from verified purchasers of {productName}.
          </p>
        </div>

        {/* Customer Action Button */}
        <div>
          {hasCustomerGivenReview ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#00875a] border border-emerald-200 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-3xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Your Review</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                title="Delete your review"
                className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00875a] hover:bg-[#00734d] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Write a Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Rating Summary Card (API 7) */}
      <div className="bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Star Rating */}
        <div className="md:col-span-4 text-center md:border-r md:border-slate-200/80 md:pr-6 space-y-2">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </div>

          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 fill-slate-200"
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-slate-500">
            Based on {totalReviews} {totalReviews === 1 ? "rating" : "ratings"}
          </p>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="md:col-span-8 space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const key = String(stars);
            const percentage = distributions[key] || 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 flex items-center gap-1 flex-shrink-0">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>

                <div className="flex-1 h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00875a] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  />
                </div>

                <span className="w-12 text-right font-semibold text-slate-400 text-[11px] flex-shrink-0">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sorting & Filter Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Sort Reviews By
        </span>

        <select
          value={sortBy}
          onChange={(e) => {
            const val = e.target.value as ReviewSortOption;
            setSortBy(val);
            setCurrentPage(0);
          }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 cursor-pointer shadow-3xs"
        >
          <option value="newest">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="highest_rating">Highest Rating</option>
          <option value="lowest_rating">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List (API 6) */}
      <div className="space-y-4">
        {isReviewsLoading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#00875a]" />
            <span>Loading reviews...</span>
          </div>
        ) : reviewsData.content.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              No reviews yet for this product
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first customer to share your thoughts on the freshness, taste, and quality!
            </p>
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00875a] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#00734d] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsData.content.map((review) => {
              const isMine = myReview?.publicId === review.publicId;
              const reviewDate = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={review.publicId}
                  className={`p-5 rounded-2xl bg-white border transition-all ${
                    isMine
                      ? "border-emerald-300 ring-2 ring-emerald-500/10 shadow-3xs"
                      : "border-slate-200/80 shadow-3xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00875a] border border-emerald-100 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {review.customerDisplayName
                          ? review.customerDisplayName.charAt(0).toUpperCase()
                          : "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {review.customerDisplayName || "Verified Customer"}
                          </span>
                          {isMine && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">
                          {reviewDate}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-900">
                        {review.rating}
                      </span>
                    </div>
                  </div>

                  {/* Title & Comment */}
                  <div className="mt-3 space-y-1">
                    {review.reviewTitle && (
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {review.reviewTitle}
                      </h4>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {review.reviewComment}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {reviewsData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">
              Page {reviewsData.pageNumber + 1} of {reviewsData.totalPages} ({reviewsData.totalElements} total)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={reviewsData.first}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={reviewsData.last}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          REVIEW SUBMISSION / EDIT MODAL (API 1 & 2)
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold text-[#00875a] uppercase tracking-wider">
                {hasCustomerGivenReview ? "Edit Your Review" : "Write a Product Review"}
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {productName}
              </h3>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = formHoverRating || formRating;
                    const isFilled = star <= activeRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setFormHoverRating(star)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        className="p-1 text-slate-200 hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`Rate ${star} star`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 fill-slate-100"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {formRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline / Title (Optional)
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Fresh, crisp, and high quality!"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
                />
              </div>

              {/* Review Comment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Review Description *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formComment.length} / 2000
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={2000}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Describe the freshness, taste, packing, and overall delivery satisfaction..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20 leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? "Submitting..." : hasCustomerGivenReview ? "Update Review" : "Submit Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE REVIEW CONFIRMATION MODAL (API 3)
         ========================================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Delete Your Review?
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Are you sure you want to remove your review for {productName}? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Keep Review
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
