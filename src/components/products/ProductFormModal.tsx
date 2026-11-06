"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Package,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Star,
  Layers,
  Edit3,
  Check,
} from "lucide-react";
import {
  Product,
  AdminProduct,
  AdminProductImage,
  ProductStatus,
  AdminProductCreatePayload,
  AdminProductUpdatePayload,
  BackendCategory,
  BackendQuantityUnit,
  BACKEND_QUANTITY_UNITS,
  CATEGORY_DEFAULT_UNITS,
  toApiProductStatus,
  toUiProductStatus,
} from "@/types";
import { adminProductService, mapAdminProductToUIProduct } from "@/services/product.service";
import { ApiError } from "@/services/api-client";

export type ProductFormMode = "create" | "edit";

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: ProductFormMode;
  product?: Product | AdminProduct | null;
  initialData?: AdminProduct | Product | null;
  onSuccess?: (product?: Product | AdminProduct) => void;
  onProductAdded?: (product: Partial<Product>) => void;
  onSave?: (updated: Product) => void;
}

interface NewImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  sizeFormatted: string;
}

const MAX_IMAGES_ALLOWED = 5;

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  product,
  initialData,
  onSuccess,
  onProductAdded,
  onSave,
}) => {
  const currentProduct = product || initialData || null;
  const isEditMode = (mode === "edit") || Boolean(currentProduct && !mode);

  // 1. Categories State (Loaded dynamically from backend API)
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // 2. Form Fields State
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(""); // Strictly holds the category UUID (publicId)
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");

  // 3. Selling Unit & Dynamic Pricing State
  const [sellingUnit, setSellingUnit] = useState<BackendQuantityUnit>("KG");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [defaultQuantity, setDefaultQuantity] = useState<number | "">(1);

  // 4. Status & Visibility Flags
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [adminEnabled, setAdminEnabled] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  // 5. Multiple Images State (Existing + New Files, Max 5 Total)
  const [existingImages, setExistingImages] = useState<AdminProductImage[]>([]);
  const [newSelectedImages, setNewSelectedImages] = useState<NewImageItem[]>([]);
  const [replaceImages, setReplaceImages] = useState<boolean>(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 6. Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch categories using shared adminProductService.getCategories
  const fetchBackendCategories = useCallback(async (forceRefresh = false) => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await adminProductService.getCategories(forceRefresh);
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        setCategories([]);
        // Genuine empty list from backend
        setCategoriesError(null);
      }
    } catch (err: unknown) {
      console.error("[ProductFormModal] Failed to load categories:", err);
      setCategoriesError(
        err instanceof Error
          ? err.message
          : "Unable to reach categories API. Please check backend connection."
      );
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  // Load categories whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBackendCategories(false);
    }
  }, [isOpen, fetchBackendCategories]);

  // Find currently selected category object by UUID
  const selectedCategory = useMemo(() => {
    if (!categoryId) return null;
    return categories.find((c) => c.publicId === categoryId.trim()) || null;
  }, [categories, categoryId]);

  // Resolve category UUID from product in Edit Mode
  const resolveInitialCategoryId = useCallback(
    (prod: Product | AdminProduct, catsList: BackendCategory[]): string => {
      // 1. Direct publicId on product.category
      if (typeof prod.category === "object" && prod.category !== null && "publicId" in prod.category) {
        const pId = (prod.category as { publicId?: string }).publicId;
        if (pId && typeof pId === "string" && pId.trim()) {
          return pId.trim();
        }
      }

      // 2. Direct publicId on prod.categoryObj
      if ("categoryObj" in prod && prod.categoryObj && prod.categoryObj.publicId) {
        return prod.categoryObj.publicId.trim();
      }

      // 3. String category matching a publicId UUID
      if (typeof prod.category === "string" && prod.category.trim()) {
        const trimmed = prod.category.trim();
        const byPublicId = catsList.find((c) => c.publicId === trimmed);
        if (byPublicId?.publicId) return byPublicId.publicId;

        // Legacy match by category name
        const byName = catsList.find(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (byName?.publicId) return byName.publicId;
      }

      // 4. Object category with name
      if (typeof prod.category === "object" && prod.category !== null && "name" in prod.category) {
        const catName = ((prod.category as { name?: string }).name || "").trim().toLowerCase();
        if (catName) {
          const byName = catsList.find(
            (c) => c.name.toLowerCase() === catName
          );
          if (byName?.publicId) return byName.publicId;
        }
      }

      return "";
    },
    []
  );

  const currentProductId = currentProduct ? (currentProduct.publicId || currentProduct.id || "product") : null;

  // Initialize or reset form state when modal opens or target product changes
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && currentProduct) {
      // Edit Mode: Pre-populate all fields from existing product
      setName(currentProduct.name || "");
      setSlug(currentProduct.slug || "");
      setDescription(currentProduct.description || "");
      setShortDescription(currentProduct.shortDescription || "");
      setUnitPrice(currentProduct.pricePerKg ?? currentProduct.price ?? "");
      setDefaultQuantity(currentProduct.defaultQuantityKg ?? 1);

      const parsedUnit = (currentProduct.quantityUnit || currentProduct.unit || "KG").toUpperCase();
      const matchedUnit = BACKEND_QUANTITY_UNITS.find((u) => u.value === parsedUnit);
      setSellingUnit(matchedUnit ? matchedUnit.value : "KG");

      setStatus(toApiProductStatus(currentProduct.status));
      setAdminEnabled(currentProduct.adminEnabled !== false);
      setIsFeatured(Boolean(currentProduct.isFeatured || (currentProduct as Product).featured));

      // Resolve category UUID if product.category has publicId
      const initialCatId = resolveInitialCategoryId(currentProduct, categories);
      setCategoryId(initialCatId);

      // Existing images
      if (currentProduct.images && currentProduct.images.length > 0) {
        setExistingImages(currentProduct.images);
      } else if (currentProduct.imageUrl) {
        setExistingImages([
          {
            publicId: "existing-0",
            imageUrl: currentProduct.imageUrl,
            isPrimary: true,
          },
        ]);
      } else {
        setExistingImages([]);
      }

      setNewSelectedImages([]);
      setReplaceImages(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    } else {
      // Create Mode: Initialize default/empty fields
      setName("");
      setCategoryId("");
      setSlug("");
      setDescription("");
      setShortDescription("");
      setSellingUnit("KG");
      setUnitPrice("");
      setDefaultQuantity(1);
      setStatus("ACTIVE");
      setAdminEnabled(true);
      setIsFeatured(false);
      setExistingImages([]);
      setNewSelectedImages([]);
      setReplaceImages(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, isEditMode, currentProductId]);

  // When categories finish loading in Edit Mode, ensure categoryId is resolved to the backend UUID
  useEffect(() => {
    if (!isOpen || !isEditMode || !currentProduct || categories.length === 0) return;

    // If categoryId is already set to a valid category in categories, nothing to do
    if (categoryId && categories.some((c) => c.publicId === categoryId)) {
      return;
    }

    // Attempt to resolve category publicId from currentProduct
    const resolvedId = resolveInitialCategoryId(currentProduct, categories);
    if (resolvedId) {
      setCategoryId(resolvedId);
    }
  }, [isOpen, isEditMode, currentProduct, categories, categoryId, resolveInitialCategoryId]);

  // Clean up object URLs on unmount or file removal
  useEffect(() => {
    return () => {
      newSelectedImages.forEach((img) => {
        if (img.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [newSelectedImages]);

  // Resolve current quantity unit definition for dynamic labels
  const selectedUnitDef = useMemo(() => {
    return (
      BACKEND_QUANTITY_UNITS.find((u) => u.value === sellingUnit) ||
      BACKEND_QUANTITY_UNITS[0]
    );
  }, [sellingUnit]);

  // Automatic Product Slug generation: category-slug + "-" + product-name
  const generatedSlug = useMemo(() => {
    const catSlug = selectedCategory?.slug || (selectedCategory?.name ? selectedCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "");
    const cleanName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!catSlug) return cleanName;
    if (!cleanName) return catSlug;
    return `${catSlug}-${cleanName}`;
  }, [selectedCategory, name]);

  // Dynamic Total Price Calculation: Total Price = Unit Price × Default Quantity
  const calculatedTotal = useMemo(() => {
    const p = typeof unitPrice === "number" ? unitPrice : 0;
    const q = typeof defaultQuantity === "number" ? defaultQuantity : 0;
    if (p <= 0 || q <= 0) return 0;
    return Math.round(p * q * 100) / 100;
  }, [unitPrice, defaultQuantity]);

  const formattedTotal = useMemo(() => {
    return calculatedTotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [calculatedTotal]);

  if (!isOpen) return null;

  // Handle Category Change: stores the category UUID and suggests unit
  const handleCategoryChange = (selectedPublicId: string) => {
    setCategoryId(selectedPublicId);

    const cat = categories.find((c) => c.publicId === selectedPublicId);
    if (cat?.name) {
      const suggestedUnit = CATEGORY_DEFAULT_UNITS[cat.name as keyof typeof CATEGORY_DEFAULT_UNITS];
      if (suggestedUnit && !isEditMode) {
        setSellingUnit(suggestedUnit);
        if (suggestedUnit === "GRAM" || suggestedUnit === "ML") {
          setDefaultQuantity(500);
        } else {
          setDefaultQuantity(1);
        }
      }
    }
  };

  // Handle Selling Unit Change
  const handleUnitChange = (newUnit: BackendQuantityUnit) => {
    setSellingUnit(newUnit);
    if (newUnit === "GRAM" || newUnit === "ML") {
      if (defaultQuantity === "" || defaultQuantity === 1) {
        setDefaultQuantity(500);
      }
    } else if (defaultQuantity === 500 || defaultQuantity === 100) {
      setDefaultQuantity(1);
    }
  };

  // Multiple File Selection Handler (Respects maximum 5 images total)
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = replaceImages ? 0 : existingImages.length;
    const availableSlots = MAX_IMAGES_ALLOWED - (currentCount + newSelectedImages.length);

    if (availableSlots <= 0) {
      setErrorMsg(`Maximum ${MAX_IMAGES_ALLOWED} images reached. Remove an image before adding more.`);
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const addedItems: NewImageItem[] = [];

    Array.from(files).slice(0, availableSlots).forEach((file) => {
      const isExtValid = file.name.match(/\.(jpg|jpeg|png|webp)$/i);
      const isMimeValid = validTypes.includes(file.type.toLowerCase());
      if (!isMimeValid && !isExtValid) {
        setErrorMsg(`Unsupported file format for "${file.name}". Please upload JPG, PNG, or WebP.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const sizeKB = Math.round(file.size / 1024);
      const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      addedItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        name: file.name,
        sizeFormatted,
      });
    });

    if (addedItems.length > 0) {
      setNewSelectedImages((prev) => [...prev, ...addedItems]);
      setErrorMsg(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove a newly selected image
  const handleRemoveNewImage = (id: string) => {
    setNewSelectedImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item && item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  // Make a new image primary (moves to first position in new selections)
  const handleMakeNewImagePrimary = (index: number) => {
    if (index === 0) return;
    setNewSelectedImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  // Delete an existing image from the backend database & S3 storage
  const handleDeleteExistingImage = async (imagePublicId: string) => {
    const prodPublicId = currentProduct?.publicId || currentProduct?.id;
    if (!prodPublicId || !imagePublicId || imagePublicId.startsWith("existing-")) {
      // Local fallback removal
      setExistingImages((prev) => prev.filter((img) => img.publicId !== imagePublicId));
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product photo from storage?")) {
      return;
    }

    setDeletingImageId(imagePublicId);
    setErrorMsg(null);
    try {
      await adminProductService.deleteProductImage(prodPublicId, imagePublicId);
      setExistingImages((prev) => prev.filter((img) => img.publicId !== imagePublicId));
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to delete image from server."
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  // Set an existing image as primary on backend
  const handleSetExistingImagePrimary = async (imagePublicId: string) => {
    const prodPublicId = currentProduct?.publicId || currentProduct?.id;
    if (!prodPublicId || !imagePublicId || imagePublicId.startsWith("existing-")) {
      setExistingImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.publicId === imagePublicId,
        }))
      );
      return;
    }

    setSettingPrimaryId(imagePublicId);
    setErrorMsg(null);
    try {
      await adminProductService.setPrimaryProductImage(prodPublicId, imagePublicId);
      setExistingImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.publicId === imagePublicId,
        }))
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update primary image."
      );
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Clear all new image selections
  const handleClearNewImages = () => {
    newSelectedImages.forEach((img) => {
      if (img.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setNewSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Submission (Supports both Create and Edit modes)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Product Name
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg("Please enter a valid product name (minimum 2 characters).");
      return;
    }

    // 2. Validate Category Selection (Strictly ensures category UUID is selected)
    if (!categoryId || !categoryId.trim()) {
      setErrorMsg("Please select a product category.");
      return;
    }

    const matchedCat = categories.find((c) => c.publicId === categoryId.trim());
    if (!matchedCat || !matchedCat.publicId) {
      setErrorMsg(
        "Invalid category selection. Selected category does not have a valid backend UUID."
      );
      return;
    }

    // 3. Validate Unit Price
    const priceNum = typeof unitPrice === "number" ? unitPrice : Number(unitPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg(`Please enter a valid ${selectedUnitDef.priceLabel} greater than 0.`);
      return;
    }

    // 4. Validate Default Quantity
    const qtyNum = typeof defaultQuantity === "number" ? defaultQuantity : Number(defaultQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg(`Please enter a valid ${selectedUnitDef.quantityLabel} greater than 0.`);
      return;
    }

    // 5. Validate Total Images Count (Maximum 5)
    const activeExistingCount = replaceImages ? 0 : existingImages.length;
    const totalImagesCount = activeExistingCount + newSelectedImages.length;
    if (totalImagesCount > MAX_IMAGES_ALLOWED) {
      setErrorMsg(`Total images cannot exceed ${MAX_IMAGES_ALLOWED}. Currently selected: ${totalImagesCount}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const finalSlug = slug.trim() || (isEditMode && currentProduct?.slug ? currentProduct.slug : generatedSlug);
      const finalDescription = description.trim() || undefined;
      const finalShortDesc =
        shortDescription.trim() || `${matchedCat.name} • Fresh Produce`;

      const imageFiles = newSelectedImages.length > 0
        ? newSelectedImages.map((i) => i.file)
        : undefined;

      if (isEditMode) {
        // ==========================================
        // UPDATE PRODUCT
        // ==========================================
        const publicId = currentProduct?.publicId || currentProduct?.id;
        if (!publicId) {
          throw new Error("Missing product publicId for update.");
        }

        const updatePayload: AdminProductUpdatePayload = {
          categoryId: matchedCat.publicId, // Category UUID sent to backend
          name: cleanName,
          slug: finalSlug,
          description: finalDescription,
          shortDescription: finalShortDesc,
          pricePerKg: priceNum,
          defaultQuantityKg: qtyNum,
          quantityUnit: sellingUnit,
          status: toApiProductStatus(status),
          adminEnabled: adminEnabled,
          isFeatured: isFeatured,
        };

        const updated = await adminProductService.updateProduct(
          publicId,
          updatePayload,
          imageFiles,
          replaceImages
        );

        const uiProduct = mapAdminProductToUIProduct(updated);
        if (onSave) onSave(uiProduct);
        if (onSuccess) onSuccess(updated);

        setSuccessMsg("Product updated successfully in the catalog!");
      } else {
        // ==========================================
        // CREATE PRODUCT
        // ==========================================
        const createPayload: AdminProductCreatePayload = {
          categoryId: matchedCat.publicId, // Category UUID sent to backend
          name: cleanName,
          slug: finalSlug,
          description: finalDescription,
          shortDescription: finalShortDesc,
          pricePerKg: priceNum,
          defaultQuantityKg: qtyNum,
          quantityUnit: sellingUnit,
          status: toApiProductStatus(status),
          adminEnabled: adminEnabled,
          isFeatured: isFeatured,
        };

        const created = await adminProductService.createProduct(createPayload, imageFiles);

        const uiProduct = mapAdminProductToUIProduct(created);
        if (onProductAdded) onProductAdded(uiProduct);
        if (onSuccess) onSuccess(created);

        setSuccessMsg("Product created successfully in the catalog!");
      }

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      console.error("[ProductFormModal] Operation failed:", err);
      let userMsg = "Operation failed. Please check server logs and connection.";
      if (err instanceof ApiError) {
        userMsg = err.message;
        if (err.data && typeof err.data === "object") {
          const d = err.data as Record<string, unknown>;
          if (Array.isArray(d.errors) && d.errors.length > 0) {
            const fieldMsgs = d.errors
              .map((e: unknown) =>
                typeof e === "object" && e && "defaultMessage" in e
                  ? (e as { defaultMessage: string }).defaultMessage
                  : String(e)
              )
              .join("; ");
            userMsg = `${userMsg}: ${fieldMsgs}`;
          } else if (typeof d.detail === "string" && d.detail) {
            userMsg = `${userMsg} - ${d.detail}`;
          }
        }
      } else if (err instanceof Error) {
        userMsg = err.message;
      }
      setErrorMsg(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImagesCount = (replaceImages ? 0 : existingImages.length) + newSelectedImages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                {isEditMode ? "Edit Product Details" : "Add New Product"}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
                {isEditMode
                  ? `${currentProduct?.name || "Product"} • UUID: ${currentProduct?.publicId || currentProduct?.id || ""}`
                  : "Create and publish produce item to catalog with rates & images"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#eaf8f0] border border-[#bbf7d0] text-[#00875a] flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Categories Loading/Error Notice */}
        {categoriesError && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{categoriesError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchBackendCategories(true)}
              className="text-emerald-700 font-bold underline ml-2 cursor-pointer hover:text-emerald-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* =========================================================================
                1. BASIC INFORMATION & CATEGORY UUID MAPPING
               ========================================================================= */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00875a]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Basic Information
                </h4>
              </div>

              {/* Product Name & Category Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Button Mushroom, Spinach, Mango"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Category *
                    </label>
                    {isCategoriesLoading && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Loading...
                      </span>
                    )}
                  </div>
                  <select
                    value={categoryId}
                    required
                    disabled={isCategoriesLoading}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isCategoriesLoading ? "Loading categories from server..." : "Select Category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.publicId} value={category.publicId}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {selectedCategory && (
                    <p className="mt-1 text-[10px] text-emerald-700 font-mono">
                      Category UUID: <span className="font-bold">{selectedCategory.publicId}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Automatic Product Slug Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Product Slug
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>category-slug + product-name</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={slug || generatedSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. leafy-vegetables-spinach"
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Short Description & Full Description */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Description / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Farm Fresh Produce • Sorted & Packaged Daily"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Handpicked organic vegetables sourced directly from certified farms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* =========================================================================
                2. SELLING UNIT & PRICING SECTION (Dynamic Labels & Total Calculation)
               ========================================================================= */}
            <div className="p-4 bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-slate-50/60 rounded-2xl border border-emerald-100/90 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00875a]" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pricing &amp; Quantity
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-emerald-800">
                  Unit: {selectedUnitDef.label}
                </span>
              </div>

              {/* Selling Unit Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selling Unit *
                </label>
                <select
                  value={sellingUnit}
                  onChange={(e) => handleUnitChange(e.target.value as BackendQuantityUnit)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                >
                  {BACKEND_QUANTITY_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Price & Quantity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedUnitDef.priceLabel} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="0.00"
                      value={unitPrice}
                      onChange={(e) =>
                        setUnitPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full pl-7 pr-12 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      / {selectedUnitDef.unitShort}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedUnitDef.quantityLabel} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      required
                      placeholder="1"
                      value={defaultQuantity}
                      onChange={(e) =>
                        setDefaultQuantity(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full px-3.5 pr-14 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      {selectedUnitDef.unitShort}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Total Price Display Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Calculated Total Price
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {unitPrice !== "" && defaultQuantity !== "" && unitPrice > 0 && defaultQuantity > 0 ? (
                      <>
                        ₹{unitPrice} &times; {defaultQuantity} {selectedUnitDef.unitShort}
                      </>
                    ) : (
                      "Enter unit price and quantity to calculate"
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-black text-emerald-900 tracking-tight">
                    ₹{formattedTotal}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700">
                    Currency: INR (₹)
                  </span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                3. MULTIPLE PRODUCT IMAGES SECTION (AWS S3, Max 5, Replacement/Deletion)
               ========================================================================= */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#00875a]" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Product Images ({totalImagesCount}/{MAX_IMAGES_ALLOWED})
                  </h4>
                </div>

                {newSelectedImages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearNewImages}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear New ({newSelectedImages.length})</span>
                  </button>
                )}
              </div>

              {/* In Edit Mode: Image Replacement Option */}
              {isEditMode && existingImages.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-amber-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={replaceImages}
                      onChange={(e) => setReplaceImages(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00875a] focus:ring-emerald-500 border-amber-300 cursor-pointer"
                    />
                    <span>Replace all existing images with newly selected files upon saving</span>
                  </label>
                  {replaceImages && (
                    <p className="mt-1 text-[11px] text-amber-700 font-medium">
                      Notice: Existing photos will be replaced in S3 storage with the new uploads.
                    </p>
                  )}
                </div>
              )}

              {/* Existing Images Gallery (in Edit Mode) */}
              {isEditMode && existingImages.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Current Stored Photos ({existingImages.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {existingImages.map((img) => (
                      <div
                        key={img.publicId}
                        className={`relative rounded-xl border p-1.5 bg-white shadow-2xs flex flex-col justify-between ${
                          replaceImages
                            ? "opacity-40 border-dashed border-slate-300"
                            : img.isPrimary
                            ? "border-emerald-500 ring-2 ring-emerald-500/20"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="relative w-full h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.imageUrl}
                            alt="Existing produce photo"
                            className="w-full h-full object-cover"
                          />

                          {img.isPrimary && !replaceImages && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#00875a] text-white text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Primary</span>
                            </span>
                          )}

                          {/* Delete individual existing image */}
                          <button
                            type="button"
                            disabled={deletingImageId === img.publicId}
                            onClick={() => handleDeleteExistingImage(img.publicId)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            aria-label="Delete image"
                          >
                            {deletingImageId === img.publicId ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {!replaceImages && !img.isPrimary && (
                          <button
                            type="button"
                            disabled={settingPrimaryId === img.publicId}
                            onClick={() => handleSetExistingImagePrimary(img.publicId)}
                            className="mt-1 text-[10px] font-bold text-[#00875a] hover:underline text-left cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {settingPrimaryId === img.publicId ? (
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Star className="w-2.5 h-2.5" />
                            )}
                            <span>Set Primary</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Input for New Photos */}
              {totalImagesCount < MAX_IMAGES_ALLOWED && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFilesSelected}
                    className="hidden"
                    id="product-form-file-upload"
                  />
                  <label
                    htmlFor="product-form-file-upload"
                    className="w-full py-3 px-4 border-2 border-dashed border-emerald-300 bg-white hover:bg-emerald-50/50 rounded-2xl text-xs font-bold text-[#00875a] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all shadow-3xs"
                  >
                    <Upload className="w-5 h-5 text-[#00875a]" />
                    <span>Click or Drag to Upload Product Photos</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Up to {MAX_IMAGES_ALLOWED - (replaceImages ? 0 : existingImages.length)} more photos (JPG, PNG, WebP up to 5MB)
                    </span>
                  </label>
                </div>
              )}

              {/* Previews of Newly Selected Photos */}
              {newSelectedImages.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Newly Selected Photos ({newSelectedImages.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {newSelectedImages.map((img, idx) => {
                      const isFirstNew = idx === 0 && (existingImages.length === 0 || replaceImages);
                      return (
                        <div
                          key={img.id}
                          className={`relative rounded-xl border p-1.5 bg-white shadow-2xs flex flex-col justify-between ${
                            isFirstNew ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
                          }`}
                        >
                          <div className="relative w-full h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.previewUrl}
                              alt={img.name}
                              className="w-full h-full object-cover"
                            />

                            {isFirstNew && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#00875a] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                                Primary
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(img.id)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                              aria-label="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="truncate max-w-[80px]" title={img.name}>
                              {img.name}
                            </span>
                            <span>{img.sizeFormatted}</span>
                          </div>

                          {!isFirstNew && (existingImages.length === 0 || replaceImages) && (
                            <button
                              type="button"
                              onClick={() => handleMakeNewImagePrimary(idx)}
                              className="mt-1 text-[10px] font-bold text-[#00875a] hover:underline text-left cursor-pointer"
                            >
                              Make Primary
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================================
                4. STATUS & VISIBILITY SETTINGS
               ========================================================================= */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Status &amp; Storefront Visibility
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Product Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(toApiProductStatus(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                  >
                    <option value="ACTIVE">In Stock</option>
                    <option value="INACTIVE">Out of Stock</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                {/* Admin Enabled Checkbox */}
                <div className="flex items-center gap-2 pt-2 sm:pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={adminEnabled}
                      onChange={(e) => setAdminEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00875a] focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <span>Storefront Visible</span>
                  </label>
                </div>

                {/* Featured Product Checkbox */}
                <div className="flex items-center gap-2 pt-2 sm:pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00875a] focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <span>Featured Item</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? "Updating Product..." : "Submitting to Database..."}</span>
                </>
              ) : (
                <>
                  {isEditMode ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEditMode ? "Update Product" : "Save & Add to Catalog"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
