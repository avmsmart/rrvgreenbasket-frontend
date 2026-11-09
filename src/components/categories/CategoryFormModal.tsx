"use client";

import React, { useState, useEffect } from "react";
import { X, FolderTree, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category";
import { categoryService } from "@/services/category.service";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSuccess: (savedCategory: Category, isEdit: boolean) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSuccess,
}) => {
  const isEdit = Boolean(categoryToEdit && categoryToEdit.publicId);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // UI / Error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset or Populate form on open
  useEffect(() => {
    if (!isOpen) return;

    if (categoryToEdit) {
      setName(categoryToEdit.name || "");
      setSlug(categoryToEdit.slug || "");
      setIsSlugManuallyEdited(true);
      setDescription(categoryToEdit.description || "");
      setImageUrl(categoryToEdit.imageUrl || "");
      setSortOrder(typeof categoryToEdit.sortOrder === "number" ? categoryToEdit.sortOrder : 0);
      setIsActive(categoryToEdit.isActive !== false);
    } else {
      setName("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setDescription("");
      setImageUrl("");
      setSortOrder(0);
      setIsActive(true);
    }

    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(false);
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  // Auto-slugify generator for Name input when slug hasn't been manually altered
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const cleanName = name.trim();
    if (!cleanName) {
      errors.name = "Category name is required.";
    } else if (cleanName.length < 2) {
      errors.name = "Category name must be at least 2 characters.";
    } else if (cleanName.length > 100) {
      errors.name = "Category name cannot exceed 100 characters.";
    }

    if (isEdit && !slug.trim()) {
      errors.slug = "Slug is required for updating a category.";
    } else if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      errors.slug = "Slug can only contain lowercase alphanumeric characters and single hyphens (e.g., fresh-fruits).";
    }

    if (description && description.length > 500) {
      errors.description = "Description cannot exceed 500 characters.";
    }

    if (isNaN(sortOrder) || sortOrder < 0) {
      errors.sortOrder = "Sort order must be a non-negative number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && categoryToEdit) {
        // PUT /api/admin/products/categories/{publicId}
        const payload: UpdateCategoryPayload = {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          sortOrder: Number(sortOrder) || 0,
          isActive: Boolean(isActive),
        };

        const updated = await categoryService.updateCategory(
          categoryToEdit.publicId,
          payload
        );
        onSuccess(updated, true);
        onClose();
      } else {
        // POST /api/admin/products/categories
        const payload: CreateCategoryPayload = {
          name: name.trim(),
          sortOrder: Number(sortOrder) || 0,
          isActive: Boolean(isActive),
        };

        if (slug.trim()) {
          payload.slug = slug.trim();
        }
        if (description.trim()) {
          payload.description = description.trim();
        }
        if (imageUrl.trim()) {
          payload.imageUrl = imageUrl.trim();
        }

        const created = await categoryService.createCategory(payload);
        onSuccess(created, false);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {isEdit ? "Edit Category" : "Add New Category"}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {isEdit
                  ? `Updating master catalog category: ${categoryToEdit?.name}`
                  : "Create a new product classification for RRV Green Basket"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <span className="font-bold">Error saving category: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Fresh Fruits, Exotic Vegetables, Daily Greens"
              maxLength={100}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none transition-all ${
                fieldErrors.name
                  ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#00875a] focus:ring-1 focus:ring-[#00875a]"
              }`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.name}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Length: {name.length}/100 characters (min. 2 characters)
            </p>
          </div>

          {/* Slug Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Slug (URL Identifier) {isEdit && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g., fresh-fruits"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-mono font-medium focus:outline-none transition-all ${
                fieldErrors.slug
                  ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#00875a] focus:ring-1 focus:ring-[#00875a]"
              }`}
            />
            {fieldErrors.slug && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.slug}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Used in URLs and customer search filters. Auto-generated from name if left empty during creation.
            </p>
          </div>

          {/* Description Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length}/500
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about the vegetables, fruits, or items in this category..."
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none transition-all resize-none ${
                fieldErrors.description
                  ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                  : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#00875a] focus:ring-1 focus:ring-[#00875a]"
              }`}
            />
            {fieldErrors.description && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          {/* Image URL & Thumbnail Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Image URL (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/images/category.png"
                disabled={isSubmitting}
                className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:outline-none focus:border-[#00875a] focus:ring-1 focus:ring-[#00875a] transition-all"
              />
              {imageUrl ? (
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Direct HTTPS image URL or S3 asset link.
            </p>
          </div>

          {/* Row: Sort Order & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sort Order (Display Priority)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none transition-all ${
                  fieldErrors.sortOrder
                    ? "border-rose-400 bg-rose-50/30"
                    : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#00875a] focus:ring-1 focus:ring-[#00875a]"
                }`}
              />
              {fieldErrors.sortOrder && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.sortOrder}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                Lower numbers display first (e.g. 1, 2, 3).
              </p>
            </div>

            {/* Is Active Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Visibility Status
              </label>
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/50 border border-slate-200">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  disabled={isSubmitting}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    isActive ? "bg-[#00875a]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                      isActive ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${isActive ? "text-emerald-700" : "text-slate-600"}`}>
                    {isActive ? "Active (Storefront Visible)" : "Inactive (Hidden)"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isActive ? "Customers can browse products in this category" : "Category is hidden from public API"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-[#00875a] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEdit ? "Update Category" : "Create Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
