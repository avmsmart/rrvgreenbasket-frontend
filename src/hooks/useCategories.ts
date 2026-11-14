"use client";

import { useState, useEffect, useCallback } from "react";
import { BackendCategory } from "@/types";
import { adminProductService } from "@/services/product.service";

export interface UseCategoriesResult {
  categories: BackendCategory[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<BackendCategory[]>;
}

/**
 * Shared hook to load and manage produce categories across Add and Update product forms and storefront.
 * Connects directly to public GET /api/products/categories with in-memory caching.
 */
export function useCategories(enabled = true): UseCategoriesResult {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (forceRefresh = false): Promise<BackendCategory[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminProductService.getCategories(forceRefresh);
      setCategories(data);
      return data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load product categories from server.";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchCategories(false).catch(() => {
        // Error state handled inside fetchCategories
      });
    }
  }, [enabled, fetchCategories]);

  const refresh = useCallback(() => {
    return fetchCategories(true);
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refresh,
  };
}

export default useCategories;
