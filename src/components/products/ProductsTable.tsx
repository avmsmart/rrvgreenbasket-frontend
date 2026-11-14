"use client";

import React from "react";
import {
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Product, toApiProductStatus, toUiProductStatus } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";
import { adminProductService } from "@/services/product.service";

interface ProductsTableProps {
  products: Product[];
  viewMode: "table" | "grid";
  isLoading?: boolean;
  onViewDetails?: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleAvailability?: (product: Product) => void | Promise<void>;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  onProductUpdated?: () => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  viewMode,
  isLoading = false,
  onViewDetails,
  onEditProduct,
  onDeleteProduct,
  onToggleAvailability,
  currentPage,
  pageSize,
  totalItems,
  totalPages: propTotalPages,
  onPageChange,
  onProductUpdated,
}) => {
  const [availabilityLoadingId, setAvailabilityLoadingId] = React.useState<string | null>(null);

  const handleAvailabilityToggle = async (product: Product) => {
    const id = product.publicId || product.id;
    if (!id) return;
    setAvailabilityLoadingId(id);
    try {
      if (onToggleAvailability) {
        await onToggleAvailability(product);
      } else {
        const currentEnabled = product.adminEnabled !== false;
        const nextEnabled = !currentEnabled;
        await adminProductService.updateProductAvailability(id, nextEnabled);
        onProductUpdated?.();
      }
    } catch (error) {
      console.error("Failed to update product availability:", error);
    } finally {
      setAvailabilityLoadingId(null);
    }
  };

  const calculatedTotalPages = Math.ceil(totalItems / pageSize) || 1;
  const totalPages = propTotalPages !== undefined && propTotalPages > 0 ? propTotalPages : calculatedTotalPages;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-3xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Products Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No items match your active search or category criteria. Try selecting another category or resetting the search.
        </p>
      </div>
    );
  }

  // Helper for category label
  const getCategoryName = (p: Product): string => {
    return String(p.category || "Vegetables");
  };

  // Helper for stock status formatting
  const formatStockStatus = (product: Product) => {
    const normalizedStock = String(product.stockStatus ?? "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    const normalizedStatus = String(toApiProductStatus(product.status) ?? "")
      .trim()
      .toUpperCase();

    const isOutOfStock =
      normalizedStatus === "INACTIVE" ||
      normalizedStock === "OUT_OF_STOCK" ||
      normalizedStock === "OUT_OF_STOCKS" ||
      product.available === false;

    const isAvailable = product.adminEnabled !== false && !isOutOfStock;

    return {
      label: isAvailable ? "Available" : "Not Available",
      color: isAvailable
        ? "bg-[#eaf8f0] text-[#00875a] border-[#bbf7d0]"
        : "bg-rose-50 text-rose-600 border-rose-200",
      icon: isAvailable ? CheckCircle2 : XCircle,
    };
  };

  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, idx) => {
            const sNo = (currentPage - 1) * pageSize + idx + 1;
            const stockInfo = formatStockStatus(p);
            const StockIcon = stockInfo.icon;
            const categoryLabel = getCategoryName(p);
            const totalPrice = p.totalPrice ?? (p.pricePerKg ? p.pricePerKg * (p.defaultQuantityKg || 1) : p.price ?? 0);
            const unit = p.quantityUnit || p.unit || "Kg";

            return (
              <div
                key={p.publicId || p.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-3xs hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg truncate max-w-[120px]">
                      #{sNo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${stockInfo.color}`}
                    >
                      <StockIcon className="w-3 h-3" />
                      <span>{stockInfo.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => onViewDetails && onViewDetails(p)}>
                    <ProduceImage name={p.name} src={p.imageUrl} size={48} />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#00875a] transition-colors leading-tight truncate">
                          {p.name}
                        </h4>
                        {p.isFeatured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {p.shortDescription || categoryLabel}
                      </p>
                    </div>
                  </div>

                  {/* Pricing details */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">Price:</span>
                    <span className="text-sm font-black text-[#00875a]">
                      ₹{totalPrice.toFixed(2)} <span className="text-xs font-medium text-slate-400">/ {p.defaultQuantityKg || 1} {unit}</span>
                    </span>
                  </div>

                  {/* Availability & Status */}
                  <div className="flex items-center justify-between text-xs mb-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.adminEnabled !== false}
                        aria-label={`${p.adminEnabled !== false ? "Disable" : "Enable"} ${p.name}`}
                        title={p.adminEnabled !== false ? "Click to make Not Available (Disable)" : "Click to make Available (Enable)"}
                        disabled={availabilityLoadingId === (p.publicId || p.id)}
                        onClick={() => handleAvailabilityToggle(p)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer ${
                          p.adminEnabled !== false ? "bg-[#00875a]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                            p.adminEnabled !== false ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                        {availabilityLoadingId === (p.publicId || p.id) && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-2 w-2 rounded-full border border-white border-t-transparent animate-spin" />
                          </span>
                        )}
                      </button>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide ${p.adminEnabled !== false ? "text-emerald-700" : "text-slate-500"}`}>
                        {p.adminEnabled !== false ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        toApiProductStatus(p.status) === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : toApiProductStatus(p.status) === "DRAFT"
                          ? "bg-slate-100 text-slate-700"
                          : toApiProductStatus(p.status) === "ARCHIVED"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {toUiProductStatus(p.status)}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(p)}
                      title="View Details"
                      className="p-1.5 rounded-xl border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditProduct(p)}
                    className="flex-1 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteProduct(p.publicId || p.id)}
                    title="Permanently Delete Product"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Footer */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong> items
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Table View matching existing UI design (Price / Kg removed, responsive mobile cards)
  return (
    <div className="space-y-4">
      {/* ========================================================
          1. DESKTOP TABLE VIEW (Visible on >= md screens)
          ======================================================== */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-200/70 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold text-center w-12">S.No</th>
                <th className="py-3 px-4 font-bold">Product</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold text-center">Pack Qty</th>
                <th className="py-3 px-4 font-bold text-right text-emerald-800">Total Price (₹)</th>
                <th className="py-3 px-4 font-bold text-center">Stock Status</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-center bg-slate-300/80 text-slate-800">Enable / Disable</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.map((p, idx) => {
                const sNo = (currentPage - 1) * pageSize + idx + 1;
                const stockInfo = formatStockStatus(p);
                const StockIcon = stockInfo.icon;
                const categoryLabel = getCategoryName(p);
                const totalPrice = p.totalPrice ?? (p.pricePerKg ? p.pricePerKg * (p.defaultQuantityKg || 1) : p.price ?? 0);
                const unit = p.quantityUnit || p.unit || "Kg";

                return (
                  <tr
                    key={p.publicId || p.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* S.No */}
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {sNo}
                    </td>

                    {/* Product: Image + Name + Short description */}
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => onViewDetails && onViewDetails(p)}
                      >
                        <ProduceImage name={p.name} src={p.imageUrl} size={34} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 block group-hover:text-[#00875a] transition-colors">
                              {p.name}
                            </span>
                            {p.isFeatured && (
                              <span title="Featured Product">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              </span>
                            )}
                          </div>
                          {p.shortDescription && (
                            <span className="text-[10px] font-medium text-slate-400 block truncate max-w-xs">
                              {p.shortDescription}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {categoryLabel}
                      </span>
                    </td>

                    {/* Pack Qty */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-700 text-[11px]">
                        {p.defaultQuantityKg ?? 1} {unit}
                      </span>
                    </td>

                    {/* Total Price (Price / Kg removed) */}
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-black text-[#00875a] bg-[#eaf8f0] px-2.5 py-1 rounded-xl border border-[#bbf7d0]">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${stockInfo.color}`}
                      >
                        <StockIcon className="w-3 h-3" />
                        <span>{stockInfo.label}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          toApiProductStatus(p.status) === "ACTIVE"
                            ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                            : toApiProductStatus(p.status) === "DRAFT"
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : toApiProductStatus(p.status) === "ARCHIVED"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {toUiProductStatus(p.status)}
                      </span>
                    </td>

                    {/* Availability Toggle */}
                    <td className="py-3 px-4 text-center bg-slate-50/50">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={p.adminEnabled !== false}
                          aria-label={`${p.adminEnabled !== false ? "Disable" : "Enable"} ${p.name}`}
                          title={p.adminEnabled !== false ? "Click to make Not Available (Disable)" : "Click to make Available (Enable)"}
                          disabled={availabilityLoadingId === (p.publicId || p.id)}
                          onClick={() => handleAvailabilityToggle(p)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer ${
                            p.adminEnabled !== false ? "bg-[#00875a]" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                              p.adminEnabled !== false ? "translate-x-4.5" : "translate-x-0.5"
                            }`}
                          />
                          {availabilityLoadingId === (p.publicId || p.id) && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="h-2 w-2 rounded-full border border-white border-t-transparent animate-spin" />
                            </span>
                          )}
                        </button>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${p.adminEnabled !== false ? "text-emerald-700" : "text-slate-400"}`}>
                          {p.adminEnabled !== false ? "Available" : "Disabled"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(p)}
                            title="View Product Details"
                            className="p-1.5 rounded-xl border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditProduct(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.publicId || p.id)}
                          title="Permanently Delete Product"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          2. MOBILE RESPONSIVE CARD VIEW (Visible on < md screens)
          Fixes mobile viewport truncation completely!
          ======================================================== */}
      <div className="md:hidden space-y-3">
        {products.map((p, idx) => {
          const sNo = (currentPage - 1) * pageSize + idx + 1;
          const stockInfo = formatStockStatus(p);
          const categoryLabel = getCategoryName(p);
          const totalPrice = p.totalPrice ?? (p.pricePerKg ? p.pricePerKg * (p.defaultQuantityKg || 1) : p.price ?? 0);
          const unit = p.quantityUnit || p.unit || "Kg";
          const isOperating = availabilityLoadingId === (p.publicId || p.id);

          return (
            <div
              key={p.publicId || p.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-3xs flex flex-col justify-between space-y-3 transition-all hover:border-emerald-300"
            >
              {/* Top Row: # Index + Category + Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                    #{sNo}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100">
                    {categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stockInfo.color}`}
                  >
                    {stockInfo.label}
                  </span>
                </div>
              </div>

              {/* Product Info Row */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onViewDetails && onViewDetails(p)}
              >
                <ProduceImage name={p.name} src={p.imageUrl} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                      {p.name}
                    </h4>
                    {p.isFeatured && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  {p.shortDescription ? (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {p.shortDescription}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-[#00875a]">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      / {p.defaultQuantityKg || 1} {unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability Toggle & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                {/* Switch */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.adminEnabled !== false}
                    disabled={isOperating}
                    onClick={() => handleAvailabilityToggle(p)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      p.adminEnabled !== false ? "bg-[#00875a]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                        p.adminEnabled !== false ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span className={`text-[10px] font-black uppercase ${p.adminEnabled !== false ? "text-emerald-700" : "text-slate-400"}`}>
                    {p.adminEnabled !== false ? "Available" : "Disabled"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(p)}
                      title="View Details"
                      className="p-1.5 rounded-xl border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditProduct(p)}
                    title="Edit Product"
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(p.publicId || p.id)}
                    title="Delete Product"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 text-center sm:text-left">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> products
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs cursor-pointer"
          >
            Previous
          </button>
          <span className="font-bold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
