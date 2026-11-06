"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Edit3,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ProcurementItem, ProcurementStatus } from "@/types";
import { ProduceImage, SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import { exportToCsv, exportToPdf } from "@/utils";

interface ProcurementTableProps {
  items: ProcurementItem[];
  selectedItemIds: string[];
  onToggleSelectItem: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection?: () => void;
  onViewItem: (item: ProcurementItem) => void;
  onEditItem: (item: ProcurementItem) => void;
  onStatusChange: (id: string, status: ProcurementStatus) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const ProcurementTable: React.FC<ProcurementTableProps> = ({
  items,
  selectedItemIds,
  onToggleSelectItem,
  onToggleSelectAll,
  onClearSelection,
  onViewItem,
  onEditItem,
  onStatusChange,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const isAllSelected =
    items.length > 0 && items.every((i) => selectedItemIds.includes(i.id));
  const isIndeterminate =
    items.some((i) => selectedItemIds.includes(i.id)) && !isAllSelected;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExportSelected = () => {
    const selected = items.filter((i) => selectedItemIds.includes(i.id));
    if (selected.length === 0) return;

    exportToCsv<ProcurementItem>(
      "selected-procurement.csv",
      [
        { header: "Item ID", accessor: (i) => i.id },
        { header: "Product Name", accessor: (i) => i.productName },
        { header: "Category", accessor: (i) => i.category },
        { header: "Supplier", accessor: (i) => i.supplier },
        { header: "Required Qty", accessor: (i) => i.requiredQty },
        { header: "Procured Qty", accessor: (i) => i.procuredQty },
        { header: "Pending Qty", accessor: (i) => i.pendingQty },
        { header: "Unit", accessor: (i) => i.unit },
        { header: "Estimated Cost (INR)", accessor: (i) => i.estimatedCost },
        { header: "Status", accessor: (i) => i.status },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} procurement item(s) to selected-procurement.csv`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPdf = () => {
    const selected = items.filter((i) => selectedItemIds.includes(i.id));
    if (selected.length === 0) return;

    exportToPdf<ProcurementItem>(
      "selected-procurement.pdf",
      "Procurement Items Report",
      [
        { header: "Item ID", accessor: (i) => i.id },
        { header: "Product Name", accessor: (i) => i.productName },
        { header: "Category", accessor: (i) => i.category },
        { header: "Supplier", accessor: (i) => i.supplier },
        { header: "Required", accessor: (i) => `${i.requiredQty} ${i.unit}` },
        { header: "Procured", accessor: (i) => `${i.procuredQty} ${i.unit}` },
        { header: "Pending", accessor: (i) => `${i.pendingQty} ${i.unit}` },
        { header: "Est. Cost", accessor: (i) => `INR ${i.estimatedCost}` },
        { header: "Status", accessor: (i) => i.status },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} procurement item(s) to selected-procurement.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Category badge colors
  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case "fruits":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "vegetables":
        return "bg-emerald-50 text-[#00875a] border-emerald-200/80";
      case "leafy":
        return "bg-teal-50 text-teal-700 border-teal-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Status badge colors - exact same as OrdersTable
  const getStatusBadge = (status: ProcurementStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#eefcf2] text-[#15803d] border border-[#bbf7d0]">
            <CheckCircle2 className="w-3 h-3 text-[#15803d]" />
            <span>Completed</span>
          </span>
        );
      case "Partial":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Partial</span>
          </span>
        );
      case "Not Started":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col">
      {/* Selection Toolbar */}
      {selectedItemIds.length > 0 && (
        <div className="p-3 sm:px-4 bg-slate-50 border-b border-slate-200">
          <SelectionToolbar
            selectedCount={selectedItemIds.length}
            entityName="procurement records"
            onExportSelected={handleExportSelected}
            onExportPdf={handleExportPdf}
            onClearSelection={onClearSelection || (() => {})}
          />
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-[#00875a] text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[360px]">
        <table className="w-full text-left text-xs sm:text-sm text-slate-700 border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-3 sm:px-4 w-10 text-center">
                <IndeterminateCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={onToggleSelectAll}
                  ariaLabel="Select all procurement items on page"
                />
              </th>
              <th className="py-3.5 px-2 w-10 text-center">#</th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Product</th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Category</th>
              <th className="py-3.5 px-3 font-bold text-slate-600 text-right">
                Required Qty
              </th>
              <th className="py-3.5 px-3 font-bold text-slate-600 text-right">
                Procured Qty
              </th>
              <th className="py-3.5 px-3 font-bold text-slate-600 text-right">
                Pending Qty
              </th>
              <th className="py-3.5 px-3 font-bold text-slate-600 text-center">
                Unit
              </th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Supplier</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 text-center">
                Status
              </th>
              <th className="py-3.5 px-4 font-bold text-slate-600 text-right">
                Estimated Cost
              </th>
              <th className="py-3.5 px-4 font-bold text-slate-600 text-center w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No procurement items found matching your filters.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const rowIndex = (currentPage - 1) * pageSize + index + 1;
                const isSelected = selectedItemIds.includes(item.id);
                const isMenuOpen = activeMenuId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`border-l-4 border-transparent transition-all duration-150 hover:border-[#00875a] hover:bg-[#eefcf2]/40 ${
                      isSelected ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3.5 px-3 sm:px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectItem(item.id)}
                        className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
                        aria-label={`Select ${item.productName}`}
                      />
                    </td>

                    {/* Row Index */}
                    <td className="py-3.5 px-2 text-center text-slate-400 font-medium text-xs">
                      {rowIndex}
                    </td>

                    {/* Product Image & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <ProduceImage
                          name={item.productName}
                          size={38}
                          className="rounded-xl shadow-3xs"
                        />
                        <span className="font-semibold text-slate-900">
                          {item.productName}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Required Qty */}
                    <td className="py-3.5 px-3 text-right font-medium text-slate-800">
                      {item.requiredQty}
                    </td>

                    {/* Procured Qty */}
                    <td className="py-3.5 px-3 text-right font-medium text-emerald-700">
                      {item.procuredQty}
                    </td>

                    {/* Pending Qty */}
                    <td className="py-3.5 px-3 text-right font-medium text-amber-700">
                      {item.pendingQty}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-3 text-center text-slate-500 text-xs">
                      {item.unit}
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {item.supplier}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹ {item.estimatedCost.toLocaleString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="relative inline-flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          title="Edit Procurement Item"
                          className="p-1.5 text-slate-400 hover:text-[#00875a] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => onViewItem(item)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 3 Dots Menu Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : item.id)
                          }
                          title="More options"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* 3 Dots Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onViewItem(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onEditItem(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              Edit Item
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Quick Status
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onStatusChange(item.id, "Completed");
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#12783d] hover:bg-emerald-50 rounded-lg flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Mark Completed
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onStatusChange(item.id, "Partial");
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Mark Partial
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Pagination Bar (No 'Showing X to Y' text) */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 35]}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
