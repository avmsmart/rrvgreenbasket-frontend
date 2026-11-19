
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Star, PenLine } from "lucide-react";
import { reviewService } from "@/services/review.service";

interface Props {
  productPublicId: string;
  productName: string;
  onWriteReview?: () => void;
}

interface ReviewItem {
  id: string;
  rating: number;
  title?: string;
  body: string;
  author: string;
  date: string;
}

type Sort = "recent" | "high" | "low";

const BAR_COLORS: Record<number, string> = {
  5: "bg-[#00875a]",
  4: "bg-[#00875a]",
  3: "bg-emerald-300",
  2: "bg-amber-400",
  1: "bg-rose-400",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalise(r: any, i: number): ReviewItem {
  return {
    id: String(r.publicId ?? r.id ?? i),
    rating: Number(r.rating ?? r.stars ?? 0),
    title: r.reviewTitle ?? r.title ?? r.headline ?? "",
    body: r.reviewComment ?? r.comment ?? r.reviewText ?? r.body ?? r.content ?? "",
    author:
      r.customerName ??
      r.userName ??
      r.reviewerName ??
      r.author ??
      "Verified buyer",
    date: r.createdAt ?? r.date ?? "",
  };
}

export const ProductReviewsSection: React.FC<Props> = ({
  productPublicId,
  productName,
  onWriteReview,
}) => {
  const [summary, setSummary] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("recent");
  const [visible, setVisible] = useState(5);

  useEffect(() => {
    let alive = true;

    const fetchReviews = async () => {
      setLoading(true);
      setSummary(null);
      setReviews([]);
      setVisible(5);

      try {
        const service = reviewService as any;

        const summaryPromise =
          typeof service.getProductRatingSummary === "function"
            ? service.getProductRatingSummary(productPublicId).catch(() => null)
            : Promise.resolve(null);

        const reviewsPromise =
          typeof service.getProductReviews === "function"
            ? service.getProductReviews(productPublicId, 0, 50, "newest").catch(() => null)
            : typeof service.getReviewsByProduct === "function"
              ? service.getReviewsByProduct(productPublicId, { page: 0, size: 50 }).catch(() => null)
              : Promise.resolve(null);

        const [summaryResult, listResult] = await Promise.all([
          summaryPromise,
          reviewsPromise,
        ]);

        if (!alive) return;

        setSummary(summaryResult);

        const reviewArray = Array.isArray(listResult)
          ? listResult
          : listResult?.content ??
            listResult?.reviews ??
            listResult?.data ??
            [];

        setReviews(
          Array.isArray(reviewArray)
            ? reviewArray.map(normalise)
            : []
        );
      } catch (error) {
        console.error("Failed to load product reviews:", error);

        if (alive) {
          setSummary(null);
          setReviews([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      alive = false;
    };
  }, [productPublicId]);

  const counts = useMemo(() => {
    const distribution =
      summary?.ratingDistribution ??
      summary?.distribution ??
      summary?.ratingCounts;

    const result: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (distribution && typeof distribution === "object") {
      [1, 2, 3, 4, 5].forEach((rating) => {
        result[rating] = Number(
          distribution[rating] ?? distribution[String(rating)] ?? 0
        );
      });
    } else {
      reviews.forEach((review) => {
        if (result[review.rating] !== undefined) {
          result[review.rating]++;
        }
      });
    }

    return result;
  }, [summary, reviews]);

  const total =
    Number(
      summary?.totalActiveReviews ??
        summary?.totalReviews ??
        summary?.total ??
        0
    ) ||
    Object.values(counts).reduce((a, b) => a + b, 0);

  const avg = Number(
    summary?.averageRating ??
      summary?.average ??
      summary?.avgRating ??
      0
  );

  const max = Math.max(1, ...Object.values(counts));

  const sorted = useMemo(() => {
    const result = [...reviews];

    if (sort === "high") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === "low") {
      result.sort((a, b) => a.rating - b.rating);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return result;
  }, [reviews, sort]);

  return (
    <section
      aria-labelledby="ratings-heading"
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="ratings-heading"
            className="text-lg font-bold text-[#24594b] sm:text-xl"
          >
            Ratings & Reviews
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            What customers say about {productName}
          </p>
        </div>

        {onWriteReview && (
          <button
            type="button"
            onClick={onWriteReview}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#2f6f5e] px-3 py-2 text-xs font-bold text-[#2f6f5e] transition hover:bg-[#2f6f5e] hover:text-white sm:px-4 sm:text-sm"
          >
            <PenLine className="h-4 w-4" />
            Write a review
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="mt-6 animate-pulse space-y-4">
          <div className="h-28 rounded-lg bg-slate-100" />
          <div className="h-20 rounded-lg bg-slate-100" />
        </div>
      ) : (
        <>
          {/* Empty state */}
          {total === 0 && (
            <div className="mt-6 rounded-lg border border-dashed border-slate-200 px-5 py-9 text-center">
              <Star className="mx-auto h-9 w-9 text-[#00875a]" />
              <h3 className="mt-3 font-semibold text-[#24594b]">
                No reviews yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Be the first to share your experience with {productName}.
              </p>

              {onWriteReview && (
                <button
                  type="button"
                  onClick={onWriteReview}
                  className="mt-4 text-sm font-bold text-[#00875a] hover:underline"
                >
                  Write the first review
                </button>
              )}
            </div>
          )}

          {/* Rating summary */}
          {total > 0 && (
            <div className="mt-6 flex items-center gap-5 rounded-lg border border-slate-100 bg-white p-4 sm:gap-8 sm:p-6">
              <div className="shrink-0 border-r border-slate-200 pr-5 sm:pr-8">
                <div className="flex items-center gap-1.5">
                  <span className="text-4xl font-light text-[#24594b] sm:text-5xl">
                    {avg.toFixed(1)}
                  </span>
                  <Star className="h-6 w-6 fill-[#00875a] text-[#00875a]" />
                </div>

                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  {total} customer reviews
                </p>
              </div>

              {/* Rating distribution */}
              <ul className="min-w-0 flex-1 space-y-2 sm:max-w-sm">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <li
                    key={rating}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <span className="flex w-6 shrink-0 items-center gap-0.5 text-slate-500">
                      {rating}
                      <Star className="h-3 w-3 fill-slate-300 text-slate-300" />
                    </span>

                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className={`block h-full rounded-full transition-all ${BAR_COLORS[rating]}`}
                        style={{
                          width: `${(counts[rating] / max) * 100}%`,
                        }}
                      />
                    </span>

                    <span className="w-8 shrink-0 text-right text-slate-600">
                      {counts[rating]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Review list */}
          {sorted.length > 0 && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#24594b]">
                  Customer reviews ({total})
                </h3>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as Sort)
                  }
                  aria-label="Sort reviews"
                  className="rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#00875a]"
                >
                  <option value="recent">Most recent</option>
                  <option value="high">Highest rated</option>
                  <option value="low">Lowest rated</option>
                </select>
              </div>

              <ul className="mt-4 divide-y divide-slate-100">
                {sorted.slice(0, visible).map((review) => (
                  <li
                    key={review.id}
                    className="flex gap-3 py-5"
                  >
                    <span className="mt-0.5 flex h-6 shrink-0 items-center gap-1 rounded bg-[#00875a] px-2 text-xs font-bold text-white">
                      {review.rating}
                      <Star className="h-3 w-3 fill-white text-white" />
                    </span>

                    <div className="min-w-0 flex-1">
                      {review.title && (
                        <p className="text-sm font-bold text-[#24594b]">
                          {review.title}
                        </p>
                      )}

                      {review.body && (
                        <p className="mt-1 text-sm leading-relaxed text-slate-700">
                          {review.body}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-slate-400">
                        {review.author}
                        {review.date &&
                          ` · ${new Date(
                            review.date
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {visible < sorted.length && (
                <button
                  type="button"
                  onClick={() =>
                    setVisible((current) => current + 5)
                  }
                  className="mt-3 text-sm font-bold text-[#00875a] hover:underline"
                >
                  View more reviews
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};
