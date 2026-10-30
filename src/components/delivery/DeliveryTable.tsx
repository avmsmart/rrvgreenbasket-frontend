"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Navigation,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  MapPin,
} from "lucide-react";
import { DeliveryOrder, DeliveryStatus } from "@/types";
import { SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import { exportToCsv, exportToPdf } from "@/utils";

interface DeliveryTableProps {
  orders: DeliveryOrder[];
  selectedOrderIds: string[];
  selectedMapOrderId?: string | null;
  onToggleSelectOrder: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection?: () => void;
  onViewOrder: (order: DeliveryOrder) => void;
  onTrackOrder: (order: DeliveryOrder) => void;
  onAssignPartner: (order: DeliveryOrder) => void;
  onStatusChange: (orderId: string, status: DeliveryStatus) => void;
  currentPage: number;
  pageSize: number;
  totalOrders: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({
  orders,
  selectedOrderIds,
  selectedMapOrderId,
  onToggleSelectOrder,
  onToggleSelectAll,
  onClearSelection,
  onViewOrder,
  onTrackOrder,
  onAssignPartner,
  onStatusChange,
  currentPage,
  pageSize,
  totalOrders,
  onPageChange,
  onPageSizeChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const startIdx = totalOrders === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalOrders);

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
            <span>Delivered</span>
          </span>
        );
      case "Out for Delivery":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
            <span>Out for Delivery</span>
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span>Pending</span>
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
            <AlertTriangle className="w-2.5 h-2.5 text-red-600 shrink-0" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getPartnerBadge = (order: DeliveryOrder) => {
    if (!order.assignedPartnerName) {
      return (
        <span className="inline-flex items-center text-[11px] font-medium text-slate-400">
          --
        </span>
      );
    }

    const firstLetter = order.assignedPartnerName.charAt(0);
    const colorBg =
      firstLetter === "R"
        ? "bg-emerald-100 text-emerald-800"
        : firstLetter === "S"
        ? "bg-blue-100 text-blue-800"
        : "bg-purple-100 text-purple-800";

    return (
      <div className="flex items-center gap-1.5 min-w-0" title={order.assignedPartnerName}>
        <span
          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${colorBg}`}
        >
          {firstLetter}
        </span>
        <span className="text-xs font-bold text-slate-800 truncate">
          {order.assignedPartnerName}
        </span>
      </div>
    );
  };

  const renderActionButton = (order: DeliveryOrder) => {
    switch (order.status) {
      case "Delivered":
        return (
          <button
            type="button"
            onClick={() => onViewOrder(order)}
            className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold shadow-3xs transition-colors whitespace-nowrap"
          >
            View
          </button>
        );
      case "Out for Delivery":
        return (
          <button
            type="button"
            onClick={() => onTrackOrder(order)}
            className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-[11px] font-bold shadow-3xs transition-colors flex items-center gap-1 whitespace-nowrap"
            title="Track location on map"
          >
            <Navigation className="w-2.5 h-2.5 shrink-0" />
            <span>Track</span>
          </button>
        );
      case "Pending":
        return (
          <button
            type="button"
            onClick={() => onAssignPartner(order)}
            className="px-2 py-1 rounded-lg bg-[#00875a] hover:bg-[#00704a] text-white text-[11px] font-bold shadow-3xs transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <UserPlus className="w-2.5 h-2.5 shrink-0" />
            <span>Assign</span>
          </button>
        );
      case "Failed":
        return (
          <button
            type="button"
            onClick={() => onViewOrder(order)}
            className="px-2 py-1 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-[11px] font-bold shadow-3xs transition-colors whitespace-nowrap"
          >
            Details
          </button>
        );
      default:
        return null;
    }
  };

  const allSelected =
    orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.id));
  const isIndeterminate =
    orders.some((o) => selectedOrderIds.includes(o.id)) && !allSelected;

  // CSV Export
  const handleExportSelected = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    exportToCsv<DeliveryOrder>(
      "selected-deliveries.csv",
      [
        { header: "Order ID", accessor: (o) => o.id },
        { header: "Customer Name", accessor: (o) => o.customerName },
        { header: "Phone", accessor: (o) => o.customerPhone },
        { header: "Delivery Address", accessor: (o) => o.customerAddress },
        { header: "Area", accessor: (o) => o.area },
        { header: "Delivery Partner", accessor: (o) => o.assignedPartnerName || "Unassigned" },
        { header: "Partner Phone", accessor: (o) => o.assignedPartnerPhone || "--" },
        { header: "Status", accessor: (o) => o.status },
        { header: "Delivery Time", accessor: (o) => o.deliveryTime || "--" },
        { header: "Amount", accessor: (o) => o.amount },
        { header: "Payment Method", accessor: (o) => o.paymentMethod },
        { header: "Payment Status", accessor: (o) => o.paymentStatus },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} delivery record(s) to selected-deliveries.csv`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // PDF Export
  const handleExportPdf = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    exportToPdf<DeliveryOrder>(
      "selected-deliveries.pdf",
      "Delivery Management Report",
      [
        { header: "Order ID", accessor: (o) => o.id },
        { header: "Customer", accessor: (o) => o.customerName },
        { header: "Phone", accessor: (o) => o.customerPhone },
        { header: "Address", accessor: (o) => o.customerAddress },
        { header: "Area", accessor: (o) => o.area },
        { header: "Partner", accessor: (o) => o.assignedPartnerName || "Unassigned" },
        { header: "Status", accessor: (o) => o.status },
        { header: "Amount", accessor: (o) => `INR ${o.amount}` },
        { header: "Payment", accessor: (o) => `${o.paymentMethod} (${o.paymentStatus})` },
        { header: "Delivery Time", accessor: (o) => o.deliveryTime || "--" },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} delivery record(s) to selected-deliveries.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col w-full min-w-0">
      {/* Selection Toolbar (with both Download PDF & Export CSV) */}
      {selectedOrderIds.length > 0 && (
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <SelectionToolbar
            selectedCount={selectedOrderIds.length}
            entityName="deliveries"
            onExportSelected={handleExportSelected}
            onExportPdf={handleExportPdf}
            onClearSelection={onClearSelection || (() => {})}
          />
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mx-3 mt-2.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-[#00875a] text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Table container with optimized padding & responsive fit */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-2.5 px-2 w-8 text-center">
                <IndeterminateCheckbox
                  checked={allSelected}
                  indeterminate={isIndeterminate}
                  onChange={onToggleSelectAll}
                  ariaLabel="Select all deliveries on page"
                />
              </th>
              <th className="py-2.5 px-1.5 w-6 text-center text-[10px]">#</th>
              <th className="py-2.5 px-2 font-bold text-slate-600">Order ID</th>
              <th className="py-2.5 px-2 font-bold text-slate-600">Customer</th>
              <th className="py-2.5 px-1.5 text-center font-bold text-slate-600">Items</th>
              <th className="py-2.5 px-2 text-right font-bold text-slate-600">Amount</th>
              <th className="py-2.5 px-2 font-bold text-slate-600">Partner</th>
              <th className="py-2.5 px-1.5 text-center font-bold text-slate-600">Status</th>
              <th className="py-2.5 px-1.5 text-center font-bold text-slate-600">Time</th>
              <th className="py-2.5 px-2 text-center font-bold text-slate-600 w-24">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-slate-600">
                      No delivery orders found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search or filters to see more results.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => {
                const isSelected = selectedOrderIds.includes(order.id);
                const isMapFocused = selectedMapOrderId === order.id;
                const rowNum = (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={order.id}
                    onClick={() => onTrackOrder(order)}
                    className={`cursor-pointer transition-colors ${
                      isMapFocused
                        ? "bg-emerald-50/70 border-l-4 border-[#00875a]"
                        : isSelected
                        ? "bg-emerald-50/40"
                        : "hover:bg-slate-50/80"
                    }`}
                    title="Click row to focus on live map"
                  >
                    {/* Checkbox */}
                    <td
                      className="py-2.5 px-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectOrder(order.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        aria-label={`Select delivery order ${order.id}`}
                      />
                    </td>

                    {/* Row # */}
                    <td className="py-2.5 px-1.5 text-center text-slate-400 font-medium text-[10px]">
                      {rowNum}
                    </td>

                    {/* Order ID */}
                    <td className="py-2.5 px-2 font-bold font-mono text-slate-800 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrder(order);
                        }}
                        className="hover:text-emerald-700 transition-colors text-left"
                      >
                        {order.id}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-2 min-w-0 max-w-[120px]">
                      <div className="truncate">
                        <span className="font-bold text-slate-800 block truncate" title={order.customerName}>
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {order.customerPhone}
                        </span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-2.5 px-1.5 text-center font-medium text-slate-700 text-[11px] whitespace-nowrap">
                      {order.itemsCount}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 text-xs whitespace-nowrap">
                      ₹{order.amount}
                    </td>

                    {/* Delivery Partner */}
                    <td className="py-2.5 px-2 min-w-0 max-w-[110px]">{getPartnerBadge(order)}</td>

                    {/* Status */}
                    <td className="py-2.5 px-1.5 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Delivery Time */}
                    <td className="py-2.5 px-1.5 text-center text-slate-500 font-medium text-[11px] whitespace-nowrap">
                      {order.deliveryTime || "--"}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-2 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {renderActionButton(order)}

                        {/* Three-dot dropdown menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(
                                activeMenuId === order.id ? null : order.id
                              );
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="More options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuId === order.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onViewOrder(order);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                View Details
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onTrackOrder(order);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <Navigation className="w-3.5 h-3.5 text-blue-500" />
                                Locate on Map
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onAssignPartner(order);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                                Assign Partner
                              </button>

                              <div className="my-1 border-t border-slate-100"></div>

                              {order.status !== "Delivered" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onStatusChange(order.id, "Delivered");
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium text-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Mark as Delivered
                                </button>
                              )}

                              {order.status !== "Failed" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onStatusChange(order.id, "Failed");
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-red-700 hover:bg-red-50 flex items-center gap-2 font-medium text-xs"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                  Mark as Failed
                                </button>
                              )}
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
        pageSizeOptions={[10, 20, 32]}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
