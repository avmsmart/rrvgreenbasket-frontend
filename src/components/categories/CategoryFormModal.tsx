"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X, FolderTree, AlertCircle, CheckCircle2,
  Image as ImageIcon, ChevronRight, ChevronLeft,
  Tag, FileText, Settings2,
} from "lucide-react";
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category";
import { categoryService } from "@/services/category.service";

const T = {
  primary: "#0B8A4F", primaryDark: "#076B3D", primaryTint: "#E7F6EE",
  danger: "#E23744", bg: "#F6F8F7", card: "#FFFFFF", border: "#E6EBE8",
  text: "#111827", text2: "#5B6770", text3: "#9AA5AD",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSuccess: (savedCategory: Category, isEdit: boolean) => void;
}

const STEPS = [
  { id: 0, label: "Identity",  icon: Tag,       description: "Name & slug" },
  { id: 1, label: "Details",   icon: FileText,  description: "Description & image" },
  { id: 2, label: "Settings",  icon: Settings2, description: "Order & visibility" },
] as const;

type StepId = 0 | 1 | 2;

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen, onClose, categoryToEdit, onSuccess,
}) => {
  const isEdit = Boolean(categoryToEdit && categoryToEdit.publicId);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [step, setStep] = useState<StepId>(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => { requestAnimationFrame(() => setVisible(true)); });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0); setDirection("forward"); setErrorMessage(null); setFieldErrors({}); setIsSubmitting(false);
    if (categoryToEdit) {
      setName(categoryToEdit.name || ""); setSlug(categoryToEdit.slug || ""); setIsSlugManuallyEdited(true);
      setDescription(categoryToEdit.description || ""); setImageUrl(categoryToEdit.imageUrl || "");
      setSortOrder(typeof categoryToEdit.sortOrder === "number" ? categoryToEdit.sortOrder : 0);
      setIsActive(categoryToEdit.isActive !== false);
    } else {
      setName(""); setSlug(""); setIsSlugManuallyEdited(false); setDescription(""); setImageUrl(""); setSortOrder(0); setIsActive(true);
    }
  }, [isOpen, categoryToEdit]);

  useEffect(() => { return () => { if (animationTimer.current) clearTimeout(animationTimer.current); }; }, []);

  const handleNameChange = useCallback((val: string) => {
    setName(val);
    if (!isEdit && !isSlugManuallyEdited) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  }, [isEdit, isSlugManuallyEdited]);

  const handleSlugChange = useCallback((val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/\s+/g, "-"));
  }, []);

  const goToStep = useCallback((target: StepId, dir: "forward" | "backward") => {
    if (isAnimating) return;
    setIsAnimating(true); setDirection(dir); setFieldErrors({}); setErrorMessage(null);
    animationTimer.current = setTimeout(() => { setStep(target); setIsAnimating(false); }, 240);
  }, [isAnimating]);

  const validateStep = useCallback((s: StepId): boolean => {
    const errors: Record<string, string> = {};
    if (s === 0) {
      const cn = name.trim();
      if (!cn) errors.name = "Category name is required.";
      else if (cn.length < 2) errors.name = "At least 2 characters.";
      else if (cn.length > 100) errors.name = "Max 100 characters.";
      if (isEdit && !slug.trim()) errors.slug = "Slug is required.";
      else if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) errors.slug = "Only lowercase + hyphens (e.g., fresh-fruits).";
    }
    if (s === 1 && description.length > 500) errors.description = "Max 500 characters.";
    if (s === 2 && (isNaN(sortOrder) || sortOrder < 0)) errors.sortOrder = "Must be non-negative.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, slug, description, sortOrder, isEdit]);

  const handleNext = useCallback(() => { if (!validateStep(step)) return; if (step < 2) goToStep((step + 1) as StepId, "forward"); }, [validateStep, step, goToStep]);
  const handleBack = useCallback(() => { if (step > 0) goToStep((step - 1) as StepId, "backward"); }, [step, goToStep]);

  if (!mounted) return null;

  const handleSubmit = async () => {
    setErrorMessage(null);
    // full validation
    const errors: Record<string, string> = {};
    const cn = name.trim();
    if (!cn) errors.name = "Required."; else if (cn.length < 2) errors.name = "Min 2 chars."; else if (cn.length > 100) errors.name = "Max 100 chars.";
    if (isEdit && !slug.trim()) errors.slug = "Required.";
    else if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) errors.slug = "Invalid slug.";
    if (description.length > 500) errors.description = "Max 500.";
    if (isNaN(sortOrder) || sortOrder < 0) errors.sortOrder = "Non-negative.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (isEdit && categoryToEdit) {
        const payload: UpdateCategoryPayload = { name: cn, slug: slug.trim(), description: description.trim() || undefined, imageUrl: imageUrl.trim() || undefined, sortOrder: Number(sortOrder) || 0, isActive };
        const updated = await categoryService.updateCategory(categoryToEdit.publicId, payload);
        onSuccess(updated, true); onClose();
      } else {
        const payload: CreateCategoryPayload = { name: cn, sortOrder: Number(sortOrder) || 0, isActive };
        if (slug.trim()) payload.slug = slug.trim();
        if (description.trim()) payload.description = description.trim();
        if (imageUrl.trim()) payload.imageUrl = imageUrl.trim();
        const created = await categoryService.createCategory(payload);
        onSuccess(created, false); onClose();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save.");
    } finally { setIsSubmitting(false); }
  };

  const inputCls = (err?: string) =>
    `w-full px-3.5 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
      err
        ? "border-[#E23744] bg-[#FFF1F2] focus:ring-2 focus:ring-[#E23744]/20"
        : `border-[${T.border}] bg-[${T.bg}] focus:bg-white focus:border-[${T.primary}] focus:ring-2 focus:ring-[${T.primary}]/20`
    }`;

  const stepContent: Record<StepId, React.ReactNode> = {
    0: (
      <div className="space-y-5">
        <div>
          <Label required>Category Name</Label>
          <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g., Fresh Fruits" maxLength={100} disabled={isSubmitting} autoFocus className={inputCls(fieldErrors.name)} />
          {fieldErrors.name && <ErrMsg>{fieldErrors.name}</ErrMsg>}
          <p className="text-[11px] mt-1" style={{ color: T.text3 }}>{name.length}/100 characters</p>
        </div>
        <div>
          <Label required={isEdit}>Slug (URL Identifier)</Label>
          <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="e.g., fresh-fruits" disabled={isSubmitting} className={`${inputCls(fieldErrors.slug)} font-mono`} />
          {fieldErrors.slug && <ErrMsg>{fieldErrors.slug}</ErrMsg>}
          <p className="text-[11px] mt-1" style={{ color: T.text3 }}>Auto-generated from name if empty.</p>
        </div>
      </div>
    ),
    1: (
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>Description (Optional)</Label>
            <span className="text-[11px]" style={{ color: T.text3 }}>{description.length}/500</span>
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…" maxLength={500} rows={4} disabled={isSubmitting} autoFocus className={`${inputCls(fieldErrors.description)} resize-none`} />
          {fieldErrors.description && <ErrMsg>{fieldErrors.description}</ErrMsg>}
        </div>
        <div>
          <Label>Image URL (Optional)</Label>
          <div className="flex items-center gap-3">
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" disabled={isSubmitting} className={`flex-1 ${inputCls()}`} />
            {imageUrl ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${T.border}`, backgroundColor: T.bg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl border-dashed flex items-center justify-center flex-shrink-0" style={{ border: `2px dashed ${T.border}`, color: T.text3 }}>
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <p className="text-[11px] mt-1" style={{ color: T.text3 }}>Direct HTTPS image URL.</p>
        </div>
      </div>
    ),
    2: (
      <div className="space-y-5">
        <div>
          <Label>Sort Order</Label>
          <input type="number" min={0} step={1} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)} disabled={isSubmitting} autoFocus className={`${inputCls(fieldErrors.sortOrder)} font-bold`} />
          {fieldErrors.sortOrder && <ErrMsg>{fieldErrors.sortOrder}</ErrMsg>}
          <p className="text-[11px] mt-1" style={{ color: T.text3 }}>Lower = displays first.</p>
        </div>
        <div>
          <Label>Visibility</Label>
          <button type="button" role="switch" aria-checked={isActive} disabled={isSubmitting} onClick={() => setIsActive(!isActive)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left"
            style={{ borderColor: isActive ? T.primary : T.border, backgroundColor: isActive ? T.primaryTint : T.bg }}
          >
            <div className="relative inline-flex h-7 w-13 items-center rounded-full transition-colors flex-shrink-0" style={{ backgroundColor: isActive ? T.primary : "#CBD5D1" }}>
              <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform" style={{ transform: isActive ? "translateX(24px)" : "translateX(4px)" }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: isActive ? T.primaryDark : T.text2 }}>
                {isActive ? "Active — Visible" : "Inactive — Hidden"}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: T.text3 }}>
                {isActive ? "Customers can browse this category." : "Hidden from storefront."}
              </p>
            </div>
          </button>
        </div>
        {errorMessage && (
          <div className="p-4 rounded-2xl flex items-start gap-3 text-xs" style={{ backgroundColor: "#FFF1F2", border: `1px solid #FECDD3`, color: T.danger }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1"><span className="font-bold">Error: </span>{errorMessage}</div>
          </div>
        )}
      </div>
    ),
  };

  const slideClass = isAnimating
    ? direction === "forward" ? "-translate-x-8 opacity-0" : "translate-x-8 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${
        visible ? "bg-[#111827]/60 backdrop-blur-sm" : "bg-[#111827]/0 backdrop-blur-none pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[94dvh] sm:max-h-[90vh] transition-all duration-300 ease-out ${
          visible ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-8 opacity-0 sm:scale-95"
        }`}
        style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: T.border }} />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-3xl" style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: T.bg }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.primaryTint }}>
              <FolderTree className="w-5 h-5" style={{ color: T.primary }} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight" style={{ color: T.text }}>{isEdit ? "Edit Category" : "Add Category"}</h3>
              <p className="text-xs font-medium" style={{ color: T.text3 }}>{isEdit ? `Updating: ${categoryToEdit?.name}` : "New classification"}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="p-2 rounded-xl transition-colors cursor-pointer" style={{ color: T.text3 }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isCurrent = s.id === step;
              const isDone = s.id < step;
              return (
                <React.Fragment key={s.id}>
                  <button type="button"
                    onClick={() => { if (isDone) goToStep(s.id as StepId, "backward"); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                    style={
                      isCurrent ? { backgroundColor: T.primary, color: "white" }
                      : isDone ? { backgroundColor: T.primaryTint, color: T.primary, cursor: "pointer" }
                      : { backgroundColor: T.bg, color: T.text3, cursor: "default" }
                    }
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: isDone ? T.primary : T.border }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-[11px] font-medium mt-2" style={{ color: T.text3 }}>Step {step + 1}/3 — {STEPS[step].description}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-2">
          <div className={`transition-all duration-200 ease-in-out ${slideClass}`}>
            {stepContent[step]}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-5 flex items-center justify-between gap-3 rounded-b-3xl" style={{ borderTop: `1px solid ${T.border}` }}>
          <button type="button" onClick={step === 0 ? onClose : handleBack} disabled={isSubmitting}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            style={{ border: `1px solid ${T.border}`, color: T.text2 }}
          >
            {step > 0 && <ChevronLeft className="w-3.5 h-3.5" />}
            <span>{step === 0 ? "Cancel" : "Back"}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <div key={s.id} className="rounded-full transition-all duration-300"
                style={{
                  width: s.id === step ? 20 : 8, height: 8,
                  backgroundColor: s.id === step ? T.primary : s.id < step ? T.primaryTint : T.border,
                }}
              />
            ))}
          </div>

          {step === 2 ? (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: T.primary, boxShadow: T.shadow }}
            >
              {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isEdit ? "Update" : "Create"}</span>
              {!isSubmitting && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <button type="button" onClick={handleNext} disabled={isAnimating}
              className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: T.primary, boxShadow: T.shadow }}
            >
              <span>Next</span><ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── helpers ── */
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#5B6770" }}>
    {children} {required && <span style={{ color: "#E23744" }}>*</span>}
  </label>
);
const ErrMsg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-bold mt-1" style={{ color: "#E23744" }}>{children}</p>
);
