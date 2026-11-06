"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Layers,
  IndianRupee,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Star,
  Trash2,
  Image as ImageIcon,
  Check,
  Power,
  RefreshCw,
  Archive,
} from "lucide-react";
import { AdminProduct, AdminProductImage, ProductStatus, toApiProductStatus, toUiProductStatus } from "@/types";
import { adminProductService } from "@/services/product.service";
import { ProduceImage } from "@/components/common";

interface ProductDetailsDrawerProps {
  publicId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: AdminProduct) => void;
  onProductUpdated?: () => void;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  publicId,
  isOpen,
  onClose,
  onEdit,
  onProductUpdated,
}) => {
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch complete product details
  const loadProductDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminProductService.getProductById(id);
      setProduct(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load complete product details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && publicId) {
      loadProductDetails(publicId);
    } else {
      setProduct(null);
      setError(null);
      setFeedbackMsg(null);
    }
  }, [isOpen, publicId]);

  if (!isOpen) return null;

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  // Toggle availability (adminEnabled)
  const handleToggleAvailability = async () => {
    if (!product) return;
    const currentEnabled =
      product.adminEnabled !== undefined && product.adminEnabled !== null
        ? Boolean(product.adminEnabled)
        : product.available !== undefined && product.available !== null
        ? Boolean(product.available)
        : true;
    const nextVal = !currentEnabled;
    setActionLoading("availability");

    // Optimistic UI update in drawer
    setProduct((prev) => (prev ? {
      ...prev,
      adminEnabled: nextVal,
      available: nextVal,
    } : null));

    try {
      const updated = await adminProductService.updateProductAvailability(product.publicId, nextVal);
      setProduct((prev) => (prev ? {
        ...prev,
        adminEnabled: updated.adminEnabled !== undefined ? updated.adminEnabled : nextVal,
        available: updated.available !== undefined ? updated.available : nextVal,
      } : updated));
      showNotification(`Product availability ${nextVal ? "enabled" : "disabled"} successfully.`);
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      // Revert optimistic update on error
      setProduct((prev) => (prev ? {
        ...prev,
        adminEnabled: currentEnabled,
        available: currentEnabled,
      } : null));
      showNotification(
        err instanceof Error ? err.message : "Failed to update availability.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Change product status
  const handleChangeStatus = async (status: ProductStatus) => {
    if (!product || product.status === status) return;
    setActionLoading(`status-${status}`);
    try {
      const updated = await adminProductService.updateProductStatus(product.publicId, status);
      setProduct((prev) => (prev ? { ...prev, status: updated.status } : updated));
      showNotification(`Product status updated to ${status}.`);
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Failed to update status.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Set primary image
  const handleSetPrimaryImage = async (imagePublicId: string) => {
    if (!product) return;
    setActionLoading(`primary-${imagePublicId}`);
    try {
      await adminProductService.setPrimaryProductImage(product.publicId, imagePublicId);
      // Reload product details to update images list
      await loadProductDetails(product.publicId);
      showNotification("Primary image updated successfully.");
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Failed to set primary image.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Delete image
  const handleDeleteImage = async (imagePublicId: string) => {
    if (!product) return;
    if (!confirm("Are you sure you want to remove this product image? This will delete it permanently.")) {
      return;
    }
    setActionLoading(`delete-${imagePublicId}`);
    try {
      await adminProductService.deleteProductImage(product.publicId, imagePublicId);
      await loadProductDetails(product.publicId);
      showNotification("Product image deleted successfully.");
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Failed to delete image.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Archive product
  const handleArchive = async () => {
    if (!product) return;
    if (
      !confirm(
        `Are you sure you want to archive "${product.name}"? The product will be marked as ARCHIVED while preserving historical order data.`
      )
    ) {
      return;
    }

    setActionLoading("archive");
    try {
      await adminProductService.archiveProduct(product.publicId);
      showNotification("Product archived successfully.");
      if (onProductUpdated) onProductUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Failed to archive product.",
        "error"
      );
      setActionLoading(null);
    }
  };

  const categoryName =
    typeof product?.category === "object" && product?.category?.name
      ? product.category.name
      : typeof product?.category === "string"
      ? product.category
      : "Vegetables";

  const normalizedStockStatus = String(product?.stockStatus ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\\s-]+/g, "_");

  const isOutOfStock =
    !!product &&
    (toApiProductStatus(product.status) === "INACTIVE" ||
      normalizedStockStatus === "OUT_OF_STOCK" ||
      normalizedStockStatus === "OUT_OF_STOCKS" ||
      product.available === false);

  const isEnabled =
    product?.adminEnabled !== undefined && product?.adminEnabled !== null
      ? Boolean(product.adminEnabled)
      : product?.available !== undefined && product?.available !== null
      ? Boolean(product.available)
      : true;

  const isActuallyAvailable =
    !!product && isEnabled && !isOutOfStock;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#00875a] text-white flex items-center justify-center font-bold text-base shadow-3xs flex-shrink-0">
                <ProduceImage name={product?.name || "Vegetable"} src={product?.imageUrl} size={44} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 truncate max-w-[220px]">
                  {product ? product.name : "Product Details"}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-slate-400">
                    {product?.publicId || publicId}
                  </span>
                  {product?.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {categoryName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toast Notification Alert */}
          {feedbackMsg && (
            <div
              className={`mx-6 mt-4 p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 animate-in fade-in ${
                feedbackMsg.type === "success"
                  ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {feedbackMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading && (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#00875a] animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Fetching real database product details...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Failed to load details</span>
                </div>
                <p>{error}</p>
                <button
                  onClick={() => publicId && loadProductDetails(publicId)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 font-bold hover:bg-rose-100/50 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && product && (
              <>
                {/* Status & Availability Quick Control Card */}
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Product Availability</span>
                      <span
                        className={`text-xs font-extrabold ${
                          isEnabled ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isEnabled ? "Available" : "Not Available"}
                        {isOutOfStock ? " · Out of Stock" : ""}
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      disabled={actionLoading === "availability"}
                      onClick={handleToggleAvailability}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 ${
                        isEnabled ? "bg-[#00875a]" : "bg-slate-300"
                      }`}
                      aria-label="Toggle product availability"
                      title={isEnabled ? "Click to make Not Available (Disable)" : "Click to make Available (Enable)"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          isEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                      {actionLoading === "availability" && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          toApiProductStatus(product.status) === "ACTIVE"
                            ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                            : toApiProductStatus(product.status) === "DRAFT"
                            ? "bg-slate-200 text-slate-700"
                            : toApiProductStatus(product.status) === "ARCHIVED"
                            ? "bg-slate-200 text-slate-600"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {toUiProductStatus(product.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {(
                        [
                          { value: "ACTIVE", label: "In Stock" },
                          { value: "INACTIVE", label: "Out of Stock" },
                          { value: "DRAFT", label: "Draft" },
                          { value: "ARCHIVED", label: "Archived" },
                        ] as const
                      ).map(({ value, label }) => {
                        const isCurrent = toApiProductStatus(product.status) === value;
                        return (
                          <button
                            key={value}
                            disabled={actionLoading?.startsWith("status") || isCurrent}
                            onClick={() => handleChangeStatus(value)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              isCurrent
                                ? "bg-slate-900 text-white"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Pricing & Stock Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Price / Kg</span>
                    <p className="text-base font-black text-[#00875a]">
                      ₹{product.pricePerKg.toFixed(2)}
                    </p>
                    <span className="text-[10px] text-slate-400">Base rate</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Default Pack Price</span>
                    <p className="text-base font-black text-slate-900">
                      ₹{product.totalPrice ? product.totalPrice.toFixed(2) : (product.pricePerKg * (product.defaultQuantityKg || 1)).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {product.defaultQuantityKg} {product.quantityUnit}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Stock Status</span>
                    <p className="text-xs font-bold text-slate-800">
                      {product.stockStatus ? product.stockStatus.replace(/_/g, " ") : "IN STOCK"}
                    </p>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        product.available ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Featured</span>
                    <p className="text-xs font-bold text-slate-800">
                      {product.isFeatured ? "Yes (Featured)" : "Standard Item"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {(product.description || product.shortDescription) && (
                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-3xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</h4>
                    {product.shortDescription && (
                      <p className="text-xs font-semibold text-slate-800">{product.shortDescription}</p>
                    )}
                    {product.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
                    )}
                  </div>
                )}

                {/* Image Gallery */}
                <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-3xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#00875a]" />
                      <h4 className="text-xs font-bold text-slate-900">
                        Product Images ({product.images?.length || (product.imageUrl ? 1 : 0)})
                      </h4>
                    </div>
                  </div>

                  {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {product.images.map((img) => (
                        <div
                          key={img.publicId}
                          className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col group"
                        >
                          <div className="relative aspect-square w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.imageUrl}
                              alt={img.altText || product.name}
                              className="object-cover w-full h-full"
                            />
                            {img.isPrimary && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00875a] text-white shadow-3xs flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" />
                                <span>Primary</span>
                              </span>
                            )}
                          </div>

                          <div className="p-2 border-t border-slate-100 flex items-center justify-between bg-white text-[11px]">
                            {!img.isPrimary ? (
                              <button
                                disabled={actionLoading?.startsWith("primary")}
                                onClick={() => handleSetPrimaryImage(img.publicId)}
                                className="text-[11px] font-bold text-[#00875a] hover:underline flex items-center gap-1"
                              >
                                <Star className="w-3 h-3" />
                                <span>Set Primary</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400">Main Image</span>
                            )}

                            <button
                              disabled={actionLoading?.startsWith("delete")}
                              onClick={() => handleDeleteImage(img.publicId)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : product.imageUrl ? (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <ProduceImage name={product.name} src={product.imageUrl} size={56} />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Primary Product Image</span>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{product.imageUrl}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No images currently uploaded for this product.</p>
                  )}
                </div>

                {/* Audit Timestamps */}
                <div className="text-[11px] text-slate-400 space-y-1 px-1">
                  {product.createdAt && <div>Created: {new Date(product.createdAt).toLocaleString()}</div>}
                  {product.updatedAt && <div>Last Updated: {new Date(product.updatedAt).toLocaleString()}</div>}
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          {product && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                disabled={actionLoading === "archive"}
                onClick={handleArchive}
                className="px-3.5 py-2.5 rounded-2xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-bold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onEdit(product);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
