"use client";

import React, { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Category, CategoryStatusFilter, CategoryStatistics } from "@/types/category";
import { categoryService } from "@/services/category.service";
import {
  CategoryStatsCards, CategoryFiltersBar, CategoryTable,
  CategoryFormModal, CategoryDetailsDrawer, CategoryStatusConfirmModal,
} from "@/components/categories";

const T = {
  primary: "#0B8A4F", primaryTint: "#E7F6EE",
  bg: "#F6F8F7", card: "#FFFFFF", border: "#E6EBE8",
  text: "#111827", text2: "#5B6770", text3: "#9AA5AD",
};

function computeStats(cats: Category[]): CategoryStatistics {
  const active = cats.filter((c) => c.isActive).length;
  return { total: cats.length, active, inactive: cats.length - active };
}

function filterCategories(cats: Category[], status: CategoryStatusFilter, query: string): Category[] {
  let result = cats;
  if (status === "Active") result = result.filter((c) => c.isActive);
  if (status === "Inactive") result = result.filter((c) => !c.isActive);
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter((c) =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q)
    );
  }
  return result;
}

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [, startTransition] = useTransition();

  const [activeStatus, setActiveStatus] = useState<CategoryStatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartY = useRef<number | null>(null);
  const PULL_THRESHOLD = 64;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [statusConfirmCategory, setStatusConfirmCategory] = useState<Category | null>(null);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoadingData(true);
    try { const data = await categoryService.getAllCategories(); setCategories(data); }
    catch { /* show empty */ }
    finally { setIsLoadingData(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* scroll collapse */
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y > lastScrollY.current && y > 40) setHeaderCollapsed(true);
      else if (y < lastScrollY.current) setHeaderCollapsed(false);
      lastScrollY.current = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* pull-to-refresh */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) pullStartY.current = e.touches[0].clientY;
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullStartY.current === null) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) setPullDistance(Math.min(delta * 0.4, PULL_THRESHOLD + 20));
  }, []);
  const onTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD) {
      setIsPulling(true);
      startTransition(() => { fetchCategories().finally(() => { setIsPulling(false); setPullDistance(0); pullStartY.current = null; }); });
    } else { setPullDistance(0); pullStartY.current = null; }
  }, [pullDistance, fetchCategories]);

  const stats = computeStats(categories);
  const filtered = filterCategories(categories, activeStatus, searchQuery);

  const handleOpenAdd = () => { setCategoryToEdit(null); setIsFormOpen(true); };
  const handleEdit = (cat: Category) => { setCategoryToEdit(cat); setIsFormOpen(true); };
  const handleViewDetails = (cat: Category) => { setSelectedCategory(cat); setIsDetailsOpen(true); };
  const handleRequestToggleStatus = (cat: Category) => { setStatusConfirmCategory(cat); };

  const handleConfirmStatusToggle = async (cat: Category, nextStatus: boolean) => {
    setStatusLoadingId(cat.publicId);
    try {
      const updated = await categoryService.updateCategoryStatus(cat.publicId, nextStatus);
      setCategories((prev) => prev.map((c) => (c.publicId === updated.publicId ? updated : c)));
      if (selectedCategory?.publicId === updated.publicId) setSelectedCategory(updated);
    } finally { setStatusLoadingId(null); }
  };

  const handleFormSuccess = (saved: Category, isEdit: boolean) => {
    setCategories((prev) => isEdit ? prev.map((c) => (c.publicId === saved.publicId ? saved : c)) : [...prev, saved]);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: T.bg }}>

      {/* ── COLLAPSIBLE HEADER ── */}
      <header
        className={`flex-shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden md:overflow-visible ${
          headerCollapsed ? "max-h-0 md:max-h-none" : "max-h-60"
        }`}
        style={{ backgroundColor: T.card, borderBottom: `1px solid ${T.border}` }}
      >
        <div className="px-4 md:px-6 py-4">
          {/* Mobile header */}
          <div className="flex items-center md:hidden">
            <h1 className="text-lg font-black tracking-tight leading-tight" style={{ color: T.text }}>Categories</h1>
          </div>

          {/* Desktop header */}
          <div className="hidden md:block space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: T.text3 }}>
              <button type="button" onClick={() => history.back()} className="flex items-center gap-1 hover:opacity-70 transition-opacity cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" /> Admin
              </button>
              <span>/</span>
              <span className="font-semibold" style={{ color: T.text2 }}>Categories</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: T.text }}>Category Management</h1>
                <p className="text-sm mt-0.5" style={{ color: T.text2 }}>Manage your product classification catalog</p>
              </div>
              <button type="button" onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm transition-all cursor-pointer"
                style={{ backgroundColor: T.primary, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
            <CategoryStatsCards stats={stats} />
          </div>
        </div>
      </header>

      {/* ── STICKY SEARCH & FILTERS ── */}
      <div className="flex-shrink-0 z-10 px-4 md:px-6 py-3" style={{ backgroundColor: T.card, borderBottom: `1px solid ${T.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <CategoryFiltersBar
          activeStatus={activeStatus} onStatusChange={setActiveStatus}
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          stats={stats} isLoading={isLoadingData} onRefresh={fetchCategories} onOpenAddModal={handleOpenAdd}
          viewMode={viewMode} onViewModeChange={setViewMode}
        />
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

        {/* Pull-to-refresh spinner */}
        <div className="flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{ height: pullDistance > 0 ? pullDistance : isPulling ? 48 : 0 }}>
          <div
            className={`w-6 h-6 rounded-full border-2 border-t-transparent transition-all ${isPulling || pullDistance >= PULL_THRESHOLD ? "animate-spin" : ""}`}
            style={{
              borderColor: T.primary, borderTopColor: "transparent",
              transform: `rotate(${(pullDistance / PULL_THRESHOLD) * 360}deg)`,
              opacity: pullDistance > 10 ? 1 : 0,
            }}
          />
        </div>

        <div className="px-4 md:px-6 py-4">
          <CategoryTable
            categories={filtered} isLoading={isLoadingData}
            onViewDetails={handleViewDetails} onEdit={handleEdit}
            onRequestToggleStatus={handleRequestToggleStatus}
            statusLoadingId={statusLoadingId} onOpenAddModal={handleOpenAdd}
            viewMode={viewMode}
          />
          <div className="h-20 md:hidden" />
        </div>
      </div>

      {/* ── FAB (mobile) ── */}
      <button type="button" onClick={handleOpenAdd} aria-label="Add category"
        className="md:hidden fixed bottom-6 right-5 z-30 w-14 h-14 rounded-full text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        style={{ backgroundColor: T.primary, boxShadow: "0 4px 16px rgba(11,138,79,0.35)" }}>
        <Plus className="w-6 h-6" />
      </button>

      {/* ── MODALS ── */}
      <CategoryDetailsDrawer category={selectedCategory} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEdit} onRequestToggleStatus={handleRequestToggleStatus} isStatusLoading={statusLoadingId === selectedCategory?.publicId} />
      <CategoryFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} categoryToEdit={categoryToEdit} onSuccess={handleFormSuccess} />
      <CategoryStatusConfirmModal category={statusConfirmCategory} isOpen={Boolean(statusConfirmCategory)}
        onClose={() => setStatusConfirmCategory(null)} onConfirm={handleConfirmStatusToggle} />
    </div>
  );
}
