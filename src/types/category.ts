/**
 * RRV Green Basket - Category Management Types & API Contracts
 *
 * Microservice: PRODUCT-SERVICE (Spring Boot)
 * Admin Prefix: /api/admin/products/categories
 * Customer Prefix: /api/products/categories
 */

import { ApiResponse } from "./common";
export type { ApiResponse };

/**
 * Backend Category entity response matching Spring Boot exact response structure
 */
export interface Category {
  publicId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for POST /api/admin/products/categories
 */
export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Request payload for PUT /api/admin/products/categories/{publicId}
 */
export interface UpdateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Client-side filter status options for Category Management table
 */
export type CategoryStatusFilter = "All" | "Active" | "Inactive";

/**
 * Derived Category Statistics calculated from GET all categories response
 */
export interface CategoryStatistics {
  total: number;
  active: number;
  inactive: number;
}
