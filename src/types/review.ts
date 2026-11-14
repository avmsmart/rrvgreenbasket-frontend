/**
 * RRV Green Basket - Product Review Service TypeScript Interfaces
 * Strongly typed DTOs matching Spring Boot Review Microservice (Port 8088 / API Gateway)
 */

export interface ProductReviewItem {
  publicId: string;
  productPublicId: string;
  customerPublicId?: string;
  customerDisplayName: string;
  rating: number; // 1 to 5
  reviewTitle?: string;
  reviewComment: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitReviewRequest {
  productPublicId: string;
  rating: number; // 1-5
  reviewTitle?: string;
  reviewComment: string;
}

export interface UpdateReviewRequest {
  rating: number; // 1-5
  reviewTitle?: string;
  reviewComment: string;
}

export interface ProductRatingSummary {
  productPublicId: string;
  averageRating: number;
  totalActiveReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  ratingDistributionPercentages: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
    [key: string]: number;
  };
}

export interface BulkRatingSummariesRequest {
  productPublicIds: string[];
}

export interface ProductBulkRatingSummary {
  productPublicId: string;
  averageRating: number;
  totalReviews: number;
}

export interface PaginatedReviewsData {
  content: ProductReviewItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export type ReviewSortOption =
  | "newest"
  | "oldest"
  | "highest_rating"
  | "highest"
  | "lowest_rating"
  | "lowest";

export type AdminReviewStatus = "ACTIVE" | "DELETED";

export interface AdminReviewAuditEntry {
  id: number | string;
  reviewPublicId: string;
  actorPublicId?: string;
  actorRole: string; // "CUSTOMER" | "ADMIN" | "SUPER_ADMIN"
  action: string; // "CREATE" | "UPDATE" | "DELETE" | "SOFT_DELETE"
  reason?: string | null;
  createdAt: string;
}

export interface AdminReviewItem {
  publicId: string;
  productPublicId: string;
  customerPublicId?: string;
  customerDisplayName: string;
  rating: number;
  reviewTitle?: string;
  reviewComment: string;
  status: AdminReviewStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
  auditHistory?: AdminReviewAuditEntry[];
}

export interface AdminReviewsPageData {
  content: AdminReviewItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface AdminReviewsFilterParams {
  productPublicId?: string;
  customerPublicId?: string;
  rating?: number; // 1 to 5
  status?: AdminReviewStatus;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  sort?: "newest" | "oldest";
  page?: number;
  size?: number;
}

export interface AdminReviewStatistics {
  totalReviews: number;
  activeReviews: number;
  deletedReviews: number;
  averageActiveRating: number;
  ratingDistribution: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
    [key: string]: number;
  };
  recentReviewCount: number;
}

export type ReviewSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export function getReviewSentiment(rating: number): ReviewSentiment {
  if (rating >= 4) return "POSITIVE";
  if (rating === 3) return "NEUTRAL";
  return "NEGATIVE";
}
