"use client";

import { useState, useCallback, useMemo } from "react";

export function useTableSelection<T extends { id: string }>(initialSelected: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback((currentPageItems: T[]) => {
    const pageIds = currentPageItems.map((item) => item.id);
    if (pageIds.length === 0) return;

    setSelectedIds((prev) => {
      const allSelectedOnPage = pageIds.every((id) => prev.includes(id));
      if (allSelectedOnPage) {
        // Deselect all items on current page
        return prev.filter((id) => !pageIds.includes(id));
      } else {
        // Select all items on current page, keeping previous selections from other pages
        return Array.from(new Set([...prev, ...pageIds]));
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (currentPageItems: T[]) => {
      if (!currentPageItems || currentPageItems.length === 0) return false;
      return currentPageItems.every((item) => selectedIds.includes(item.id));
    },
    [selectedIds]
  );

  const isIndeterminate = useCallback(
    (currentPageItems: T[]) => {
      if (!currentPageItems || currentPageItems.length === 0) return false;
      const selectedOnPage = currentPageItems.filter((item) =>
        selectedIds.includes(item.id)
      ).length;
      return selectedOnPage > 0 && selectedOnPage < currentPageItems.length;
    },
    [selectedIds]
  );

  const getSelectedItems = useCallback(
    (allData: T[]): T[] => {
      return allData.filter((item) => selectedIds.includes(item.id));
    },
    [selectedIds]
  );

  return {
    selectedIds,
    setSelectedIds,
    selectedCount: selectedIds.length,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    getSelectedItems,
  };
}
