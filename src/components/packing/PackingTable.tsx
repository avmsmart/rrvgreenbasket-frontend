"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  RotateCcw,
  Printer,
  AlertCircle,
} from "lucide-react";
import { PackingOrder, PackingStatus } from "@/types";
import { SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import { exportToCsv, exportToPdf } from "@/utils";

interface PackingTableProps {
  orders: PackingOrder[];
  selectedOrderIds: string[];
  onToggleSelectOrder: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection?: () => void;
  onViewOrder: (order: PackingOrder) => void;
  onActionClick: (order: PackingOrder) => void;
  onStatusChange: (id: string, status: PackingStatus) => void;
  onPrintSlip: (order: PackingOrder) => void;
  currentPage: number;
  pageSize: number;
  totalOrders: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PackingTable: React.FC<PackingTableProps> = ({
  orders,
  selectedOrderIds,
  onToggleSelectOrder,
  onToggleSelectAll,
  onClearSelection,
  onViewOrder,
  onActionClick,
  onStatusChange,
  onPrintSlip,
  currentPage,
  pageSize,
  totalOrders,
  onPageChange,
  onPageSizeChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const startItem = totalOrders === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalOrders);
  const isAllSelected =
    orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.id));
  const isIndeterminate =
    orders.some((o) => selectedOrderIds.includes(o.id)) && !isAllSelected;

  const handleExportSelected = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    exportToCsv<PackingOrder>(
      "selected-packing-orders.csv",
      [
        { header: "Order ID", accessor: (o) => o.id },
        { header: "Customer Name", accessor: (o) => o.customerName },
        { header: "Phone", accessor: (o) => o.customerPhone },
        { header: "Area", accessor: (o) => o.area },
        { header: "Items Count", accessor: (o) => o.itemsCount },
        { header: "Amount", accessor: (o) => o.amount },
        { header: "Payment Method", accessor: (o) => o.paymentMethod },
        { header: "Payment Status", accessor: (o) => o.paymentStatus },
        { header: "Packing Status", accessor: (o) => o.status },
        { header: "Assigned Packer", accessor: (o) => o.assignedPacker || "Unassigned" },
        { header: "Order Date", accessor: (o) => o.orderDate },
        { header: "Order Time", accessor: (o) => o.orderTime },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} packing order(s) to selected-packing-orders.csv`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPdf = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    exportToPdf<PackingOrder>(
      "selected-packing-orders.pdf",
      "Packing Orders Report",
      [
        { header: "Order ID", accessor: (o) => o.id },
        { header: "Customer Name", accessor: (o) => o.customerName },
        { header: "Phone", accessor: (o) => o.customerPhone },
        { header: "Area", accessor: (o) => o.area },
        { header: "Items Count", accessor: (o) => o.itemsCount },
        { header: "Amount", accessor: (o) => `INR ${o.amount}` },
        { header: "Status", accessor: (o) => o.status },
        { header: "Packer", accessor: (o) => o.assignedPacker || "Unassigned" },
        { header: "Order Date", accessor: (o) => o.orderDate },
        { header: "Order Time", accessor: (o) => o.orderTime },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} packing order(s) to selected-packing-orders.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status Badge matching Page 13:
  // Pending: soft pink/rose
  // In Packing: soft amber/yellow
  // Packed: soft green/emerald
  const getStatusBadge = (status: PackingStatus) => {
    switch (status) {
      case "Packed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eefcf2] text-[#15803d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
            <span>Packed</span>
          </span>
        );
      case "In Packing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>In Packing</span>
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Pending</span>
          </span>
        );
    }
  };

  // Payment Badge matching Page 13: Paid (UPI), Paid (COD), COD, Paid (Card)
  const getPaymentBadge = (payment: string) => {
    if (payment.includes("Paid")) {
      return (
        <span className="text-xs font-medium text-slate-700">
          <span className="text-[#00875a] font-bold">Paid</span>{" "}
          <span className="text-slate-500">({payment.replace(/Paid\s*\(|\)/g, "")})</span>
        </span>
      );
    }
    return (
      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
        COD
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-3xs overflow-hidden flex flex-col">
      {/* Selection Toolbar */}
      {selectedOrderIds.length > 0 && (
        <div className="p-3 sm:px-4 bg-slate-50 border-b border-slate-200">
          <SelectionToolbar
            selectedCount={selectedOrderIds.length}
            entityName="packing orders"
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

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-3 sm:px-4 w-10 text-center">
                <IndeterminateCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={onToggleSelectAll}
                  ariaLabel="Select all packing orders on page"
                />
              </th>
              <th className="py-3.5 px-2 w-10 text-center">#</th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Order ID</th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Customer</th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Items</th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Amount</th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Payment</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 text-center">
                Packing Status
              </th>
              <th className="py-3.5 px-4 font-bold text-slate-600">Order Time</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 text-center w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No packing orders found matching your filters.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => {
                const rowIndex = (currentPage - 1) * pageSize + index + 1;
                const isSelected = selectedOrderIds.includes(order.id);
                const isMenuOpen = activeMenuId === order.id;

                return (
                  <tr
                    key={order.id}
                    className={`border-l-4 border-transparent transition-all duration-150 hover:border-[#00875a] hover:bg-[#eefcf2]/30 ${
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
                        onChange={() => onToggleSelectOrder(order.id)}
                        className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
                        aria-label={`Select order ${order.id}`}
                      />
                    </td>

                    {/* Row Index */}
                    <td className="py-3.5 px-2 text-center text-slate-400 font-medium text-xs">
                      {rowIndex}
                    </td>

                    {/* Order ID */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onViewOrder(order)}
                        className="font-bold text-[#00875a] hover:underline cursor-pointer font-mono"
                      >
                        {order.id}
                      </button>
                    </td>

                    {/* Customer Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {order.customerName}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {order.itemsCount} items
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{order.amount}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      {getPaymentBadge(order.paymentMethod)}
                    </td>

                    {/* Packing Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Order Time */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium text-xs">
                      {order.orderTime}
                    </td>

                    {/* Actions matching Page 13: Pack / Continue / View + 3-dots */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 relative">
                        {order.status === "Pending" ? (
                          <button
                            type="button"
                            onClick={() => onActionClick(order)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-[#00875a] bg-emerald-50 hover:bg-[#00875a] hover:text-white border border-[#bbf7d0] transition-all cursor-pointer shadow-3xs"
                          >
                            Pack
                          </button>
                        ) : order.status === "In Packing" ? (
                          <button
                            type="button"
                            onClick={() => onActionClick(order)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-600 hover:text-white border border-amber-200 transition-all cursor-pointer shadow-3xs"
                          >
                            Continue
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onViewOrder(order)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-800 hover:text-white border border-slate-200 transition-all cursor-pointer shadow-3xs"
                          >
                            View
                          </button>
                        )}

                        {/* 3-Dots Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : order.id);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left text-xs font-semibold text-slate-700"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onViewOrder(order);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Details</span>
                              </button>

                              {order.status !== "Packed" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onStatusChange(order.id, "Packed");
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-[#00875a] flex items-center gap-2"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark as Packed</span>
                                </button>
                              )}

                              {order.status === "Pending" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onStatusChange(order.id, "In Packing");
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-amber-50 text-amber-700 flex items-center gap-2"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Start Packing</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  onPrintSlip(order);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-400" />
                                <span>Print Slip</span>
                              </button>
                            </div>
                          )}
                        </div>
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
        pageSizeOptions={[10, 20, 28]}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
