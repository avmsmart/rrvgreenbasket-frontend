"use client";

import React from "react";
import {
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/types";
import { ProduceImage } from "@/components/common/ProduceImage";

interface ProductsTableProps {
  products: Product[];
  viewMode: "table" | "grid";
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  viewMode,
  onEditProduct,
  onDeleteProduct,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-3xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Products Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No items match your active search or filter criteria. Try adjusting your search query or reset the filters.
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, idx) => {
            const sNo = (currentPage - 1) * pageSize + idx + 1;
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-3xs hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                      #{sNo} • {p.erpCode || p.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === "In Stock"
                          ? "bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]"
                          : p.status === "Low Stock"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <ProduceImage name={p.name} src={p.imageUrl} size={48} />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#00875a] transition-colors leading-tight">
                        {p.excelName || p.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {p.name !== p.excelName ? p.name : p.category}
                      </p>
                    </div>
                  </div>

                  {/* Pricing details */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Quot Rate:</span>
                      <span className="font-semibold text-slate-500 line-through">
                        ₹{p.originalPrice || p.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800">SRM Revised:</span>
                      <span className="text-sm font-black text-[#00875a]">
                        ₹{p.price.toFixed(2)} / {p.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span>HSN: <strong className="font-mono text-slate-700">{p.hsnCode || "7101000"}</strong></span>
                    <span>Stock: <strong className="text-slate-800">{p.stock} {p.unit}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onEditProduct(p)}
                    className="flex-1 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-3xs flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong> items
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Table View matching user prompt data format
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-bold text-center w-12">S.No</th>
              <th className="py-3 px-4 font-bold">Product Name in Excel</th>
              <th className="py-3 px-4 font-bold">ERP Product Name</th>
              <th className="py-3 px-4 font-bold font-mono">ERP Code</th>
              <th className="py-3 px-4 font-bold font-mono">HSN Code</th>
              <th className="py-3 px-4 font-bold text-center">UOM</th>
              <th className="py-3 px-4 font-bold text-right">Quot Rate (₹)</th>
              <th className="py-3 px-4 font-bold text-right text-emerald-800">SRM REVISED (₹)</th>
              <th className="py-3 px-4 font-bold text-center">Stock</th>
              <th className="py-3 px-4 font-bold text-center">Status</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {products.map((p, idx) => {
              const sNo = (currentPage - 1) * pageSize + idx + 1;
              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* S.No */}
                  <td className="py-3 px-4 text-center font-bold text-slate-400">
                    {sNo}
                  </td>

                  {/* Product Name in Excel */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <ProduceImage name={p.name} src={p.imageUrl} size={32} />
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-[#00875a] transition-colors">
                          {p.excelName || p.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {p.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ERP Product Name */}
                  <td className="py-3 px-4 text-slate-700 font-semibold">
                    {p.name}
                  </td>

                  {/* Product Code in ERP */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {p.erpCode || p.id}
                  </td>

                  {/* HSN Code */}
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {p.hsnCode || "7101000"}
                  </td>

                  {/* UOM */}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px]">
                      {p.unit}
                    </span>
                  </td>

                  {/* Quot Rate */}
                  <td className="py-3 px-4 text-right text-slate-500 font-semibold">
                    {p.originalPrice ? `₹${p.originalPrice}` : `₹${p.price}`}
                  </td>

                  {/* SRM REVISED */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs font-black text-[#00875a] bg-[#eaf8f0] px-2.5 py-1 rounded-xl border border-[#bbf7d0]">
                      ₹{p.price.toFixed(2)}
                    </span>
                  </td>

                  {/* Current Stock */}
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {p.stock}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    {p.status === "In Stock" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf8f0] text-[#00875a] border border-[#bbf7d0]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>In Stock</span>
                      </span>
                    )}
                    {p.status === "Low Stock" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </span>
                    )}
                    {p.status === "Out of Stock" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        <span>Out of Stock</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditProduct(p)}
                        title="Edit Rates & Stock"
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        title="Delete Product"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> master products
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs"
          >
            Previous
          </button>
          <span className="font-bold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-3xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
