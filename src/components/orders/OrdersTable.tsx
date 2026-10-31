"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  RefreshCw,
  Truck,
  XCircle,
  FileText,
  Printer,
  Ban,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import { exportToCsv, exportToPdf } from "@/utils";
import { getCurrencySymbol } from "@/data/shared-store";

interface OrdersTableProps {
  orders: Order[];
  totalOrders: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (orderId: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (col: "orderTime" | "amount" | "itemsCount" | "customerName") => void;
  selectedOrderId?: string | null;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  totalOrders,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectOrder,
  onUpdateStatus,
  onCancelOrder,
  sortBy,
  sortOrder,
  onSort,
  selectedOrderId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol());
    const onSettingsUpdate = () => {
      setCurrencySymbol(getCurrencySymbol());
    };
    window.addEventListener("rrv:settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("rrv:settings:updated", onSettingsUpdate);
  }, []);

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalOrders);

  const isAllSelected = orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));
  const isIndeterminate = orders.some((o) => selectedIds.includes(o.id)) && !isAllSelected;

  const handleSelectAll = () => {
    const pageIds = orders.map((o) => o.id);
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleRow = (id: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleExportSelected = () => {
    const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
    if (selectedOrders.length === 0) return;

    exportToCsv<Order>(
      "selected-orders.csv",
      [
        { header: "Order ID", accessor: (o) => o.id },
        { header: "Customer Name", accessor: (o) => o.customerName },
        { header: "Customer Phone", accessor: (o) => o.customerPhone },
        { header: "Delivery Address", accessor: (o) => o.customerAddress },
        { header: "Order Date", accessor: (o) => o.orderDate },
        { header: "Order Time", accessor: (o) => o.orderTime },
        { header: "Items Count", accessor: (o) => o.itemsCount },
        { header: "Total Amount (INR)", accessor: (o) => o.amount },
        { header: "Payment Method", accessor: (o) => o.paymentMethod },
        { header: "Payment Status", accessor: (o) => o.paymentStatus },
        { header: "Order Status", accessor: (o) => o.status },
        { header: "Delivery Slot", accessor: (o) => o.deliveryTime || "-" },
        { header: "Delivery Partner", accessor: (o) => o.deliveryPartner || "Unassigned" },
      ],
      selectedOrders
    );

    setToastMessage(`Exported ${selectedOrders.length} order(s) to selected-orders.csv`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPdf = () => {
    const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
    if (selectedOrders.length === 0) return;

    exportToPdf<Order>(
      "selected-orders.pdf",
      "Orders Management Report",
      [
        { header: "Order ID", accessor: (o) => o.id },
        { header: "Customer Name", accessor: (o) => o.customerName },
        { header: "Phone", accessor: (o) => o.customerPhone },
        { header: "Amount", accessor: (o) => `INR ${o.amount}` },
        { header: "Items", accessor: (o) => o.itemsCount },
        { header: "Payment Method", accessor: (o) => o.paymentMethod },
        { header: "Payment Status", accessor: (o) => o.paymentStatus },
        { header: "Order Status", accessor: (o) => o.status },
        { header: "Delivery Slot", accessor: (o) => o.deliveryTime || "-" },
        { header: "Delivery Partner", accessor: (o) => o.deliveryPartner || "Unassigned" },
      ],
      selectedOrders
    );

    setToastMessage(`Exported ${selectedOrders.length} order(s) to selected-orders.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#eefcf2] text-[#15803d] border border-[#bbf7d0]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "Processing":
      case "In Packing":
      case "Packed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case "Out for Delivery":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Truck className="w-3 h-3" />
            <span>Out for Delivery</span>
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (order: Order) => {
    if (order.paymentStatus === "Paid") {
      return (
        <span className="text-xs font-semibold text-slate-700">
          Paid <span className="text-slate-400 font-normal">({order.paymentMethod})</span>
        </span>
      );
    }
    if (order.paymentMethod === "COD") {
      return (
        <span className="text-xs font-semibold text-amber-700">
          COD <span className="text-slate-400 font-normal">(Pending)</span>
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-500">
        {order.paymentMethod} • {order.paymentStatus}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs overflow-hidden">
      {/* Selection Toolbar when 1+ records are selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 border-b border-slate-200/90 bg-emerald-50/40">
          <SelectionToolbar
            selectedCount={selectedIds.length}
            entityName="orders"
            onExportSelected={handleExportSelected}
            onExportPdf={handleExportPdf}
            onClearSelection={handleClearSelection}
          />
        </div>
      )}

      {/* Export Toast Feedback */}
      {toastMessage && (
        <div className="mx-4 my-2.5 px-3.5 py-2 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-3xs animate-in fade-in">
          <span>✓ {toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10">
                <IndeterminateCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  aria-label="Select all orders on this page"
                />
              </th>
              <th className="py-3 px-4">Order ID</th>
              <th
                className={`py-3 px-4 cursor-pointer transition-colors ${
                  sortBy === "customerName" ? "text-[#00875a]" : "hover:text-slate-800"
                }`}
                onClick={() => onSort("customerName")}
              >
                <div className="flex items-center gap-1">
                  <span>Customer</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortBy === "customerName" ? "text-[#00875a]" : "opacity-50"}`} />
                </div>
              </th>
              <th
                className={`py-3 px-4 cursor-pointer transition-colors ${
                  sortBy === "itemsCount" ? "text-[#00875a]" : "hover:text-slate-800"
                }`}
                onClick={() => onSort("itemsCount")}
              >
                <div className="flex items-center gap-1">
                  <span>Items</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortBy === "itemsCount" ? "text-[#00875a]" : "opacity-50"}`} />
                </div>
              </th>
              <th
                className={`py-3 px-4 cursor-pointer transition-colors ${
                  sortBy === "amount" ? "text-[#00875a]" : "hover:text-slate-800"
                }`}
                onClick={() => onSort("amount")}
              >
                <div className="flex items-center gap-1">
                  <span>Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortBy === "amount" ? "text-[#00875a]" : "opacity-50"}`} />
                </div>
              </th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Status</th>
              <th
                className={`py-3 px-4 cursor-pointer transition-colors ${
                  sortBy === "orderTime" ? "text-[#00875a]" : "hover:text-slate-800"
                }`}
                onClick={() => onSort("orderTime")}
              >
                <div className="flex items-center gap-1">
                  <span>Order Time {sortBy === "orderTime" && (sortOrder === "asc" ? "↑" : "↓")}</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortBy === "orderTime" ? "text-[#00875a]" : "opacity-50"}`} />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-slate-600">No orders found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try adjusting your search query, status tab, or date filters
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isChecked = selectedIds.includes(order.id);
                const isSelected = selectedOrderId === order.id;
                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    title="Click to view order details"
                    className={`border-l-4 transition-all group cursor-pointer ${
                      isSelected
                        ? "border-[#00875a] bg-[#eefcf2] shadow-3xs"
                        : isChecked
                        ? "border-transparent bg-[#f2faf5]"
                        : "border-transparent hover:border-[#00875a] hover:bg-[#eefcf2]"
                    }`}
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleRow(order.id, e)}
                        className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
                        aria-label={`Select order ${order.id}`}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#00875a]">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {order.itemsCount} items
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {currencySymbol}{order.amount}
                    </td>
                    <td className="py-3.5 px-4">{getPaymentBadge(order)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {order.orderTime}
                    </td>
                    <td
                      className="py-3.5 px-4 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#00875a] hover:bg-[#eefcf2] transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuOrderId((prev) =>
                                prev === order.id ? null : order.id
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuOrderId === order.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveMenuOrderId(null)}
                              />
                              <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectOrder(order);
                                    setActiveMenuOrderId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </button>
                                {order.status === "Pending" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateStatus(order.id, "Processing");
                                      setActiveMenuOrderId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-700 font-medium"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Move to Processing</span>
                                  </button>
                                )}
                                {order.status === "Processing" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateStatus(order.id, "Out for Delivery");
                                      setActiveMenuOrderId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-teal-700 font-medium"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Dispatch Order</span>
                                  </button>
                                )}
                                {order.status === "Out for Delivery" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateStatus(order.id, "Delivered");
                                      setActiveMenuOrderId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-medium"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Delivered</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.print();
                                    setActiveMenuOrderId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Print Slip</span>
                                </button>
                                {order.status !== "Cancelled" && order.status !== "Delivered" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onCancelOrder(order.id);
                                      setActiveMenuOrderId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium border-t border-slate-100"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Cancel Order</span>
                                  </button>
                                )}
                              </div>
                            </>
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
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
