"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Breadcrumbs } from "@/components/layout";
import {
  CategoryStatsCards,
  CategoryFiltersBar,
  CategoryTable,
  CategoryFormModal,
  CategoryDetailsDrawer,
  CategoryStatusConfirmModal,
} from "@/components/categories";
import { Category, CategoryStatusFilter, CategoryStatistics } from "@/types/category";
import { categoryService } from "@/services/category.service";
import { CheckCircle2, AlertTriangle, RefreshCw, FolderTree } from "lucide-react";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters
  const [activeStatus, setActiveStatus] = useState<CategoryStatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const [confirmStatusCategory, setConfirmStatusCategory] = useState<Category | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Read URL search parameter if navigated from global search
  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search).get("search");
    if (s) {
      setSearchQuery(s);
      setActiveStatus("All");
    }
  }, []);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  // Fetch all categories from backend
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load categories from Product Service";
      setErrorMessage(msg);
      showNotification(msg, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Derived Statistics
  const stats: CategoryStatistics = useMemo(() => {
    const total = categories.length;
    let active = 0;
    let inactive = 0;
    for (const c of categories) {
      if (c.isActive) {
        active++;
      } else {
        inactive++;
      }
    }
    return { total, active, inactive };
  }, [categories]);

  // Filtered and Sorted Categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        // Status filter
        if (activeStatus === "Active" && !cat.isActive) return false;
        if (activeStatus === "Inactive" && cat.isActive) return false;

        // Search filter
        if (debouncedSearch) {
          const matchName = cat.name.toLowerCase().includes(debouncedSearch);
          const matchSlug = cat.slug.toLowerCase().includes(debouncedSearch);
          const matchDesc = cat.description
            ? cat.description.toLowerCase().includes(debouncedSearch)
            : false;
          if (!matchName && !matchSlug && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sort order ascending, then name ascending
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });
  }, [categories, activeStatus, debouncedSearch]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setIsFormModalOpen(true);
  };

  // Open Details Drawer
  const handleOpenDetails = (cat: Category) => {
    setSelectedCategory(cat);
    setIsDetailsDrawerOpen(true);
  };

  // Request Status Toggle (opens confirmation dialog)
  const handleRequestToggleStatus = (cat: Category) => {
    setConfirmStatusCategory(cat);
    setIsConfirmModalOpen(true);
  };

  // Execute Status Toggle via backend PATCH endpoint
  const handleConfirmToggleStatus = async (cat: Category, nextStatus: boolean) => {
    setStatusLoadingId(cat.publicId);
    try {
      const updated = await categoryService.updateCategoryStatus(cat.publicId, nextStatus);
      setCategories((prev) =>
        prev.map((item) => (item.publicId === updated.publicId ? updated : item))
      );

      // Keep drawer in sync if open
      if (selectedCategory && selectedCategory.publicId === updated.publicId) {
        setSelectedCategory(updated);
      }

      showNotification(
        `Category "${updated.name}" has been ${nextStatus ? "activated" : "deactivated"} successfully.`,
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update category status";
      showNotification(msg, "error");
      throw err;
    } finally {
      setStatusLoadingId(null);
    }
  };

  // Form Modal Success Handler (Add or Edit)
  const handleFormSuccess = (savedCat: Category, isEdit: boolean) => {
    if (isEdit) {
      setCategories((prev) =>
        prev.map((c) => (c.publicId === savedCat.publicId ? savedCat : c))
      );
      if (selectedCategory && selectedCategory.publicId === savedCat.publicId) {
        setSelectedCategory(savedCat);
      }
      showNotification(`Category "${savedCat.name}" updated successfully!`, "success");
    } else {
      setCategories((prev) => [savedCat, ...prev]);
      showNotification(`Category "${savedCat.name}" created successfully!`, "success");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Category Management" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage product categories, URL slugs, storefront visibility and display ordering.
          </p>
        </div>

        <button
          onClick={fetchCategories}
          disabled={isLoading}
          title="Refresh categories from database"
          className="self-start sm:self-auto px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-3xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00875a] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center gap-2.5 animate-in fade-in ${
            notification.type === "success"
              ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Backend Error Alert */}
      {errorMessage && !isLoading && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <div>
              <p className="font-bold">Failed to load categories</p>
              <p className="text-rose-600 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={fetchCategories}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 font-bold hover:bg-rose-100 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Category KPI Statistics */}
      <CategoryStatsCards stats={stats} />

      {/* Filters, Search & Action Bar */}
      <CategoryFiltersBar
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={stats}
        isLoading={isLoading}
        onRefresh={fetchCategories}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Category Table & Mobile Cards */}
      <CategoryTable
        categories={filteredCategories}
        isLoading={isLoading}
        onViewDetails={handleOpenDetails}
        onEdit={handleOpenEditModal}
        onRequestToggleStatus={handleRequestToggleStatus}
        statusLoadingId={statusLoadingId}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Add / Edit Category Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        categoryToEdit={editingCategory}
        onSuccess={handleFormSuccess}
      />

      {/* Category Details Slide-Out Drawer */}
      <CategoryDetailsDrawer
        category={selectedCategory}
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        onEdit={(cat) => {
          setIsDetailsDrawerOpen(false);
          handleOpenEditModal(cat);
        }}
        onRequestToggleStatus={(cat) => {
          handleRequestToggleStatus(cat);
        }}
        isStatusLoading={statusLoadingId === selectedCategory?.publicId}
      />

      {/* Activate / Deactivate Confirmation Dialog */}
      <CategoryStatusConfirmModal
        category={confirmStatusCategory}
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
      />
    </div>
  );
}
