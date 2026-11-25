"use client";

import React, { useState } from "react";
import {
  Eye,
  MoreVertical,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  RefreshCw,
  Truck,
  XCircle,
  FileText,
  Printer,
  Tag,
  Ban,
  User,
  Phone,
  Package,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import {
  exportToCsv,
  exportToPdf,
  generateInvoicePdf,
  generateDeliveryLabelPdf,
  getRegisteredCustomer,
  getDeliveryRecipient,
  getFormattedDeliveryAddress,
  formatOrderDateTime,
} from "@/utils";

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

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;

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
        { header: "Order ID", accessor: (o) => o.orderNumber || o.id },
        { header: "Account Owner", accessor: (o) => getRegisteredCustomer(o).name },
        { header: "Registered Mobile", accessor: (o) => getRegisteredCustomer(o).mobile },
        { header: "Delivery Recipient", accessor: (o) => getDeliveryRecipient(o).name },
        { header: "Recipient Mobile", accessor: (o) => getDeliveryRecipient(o).mobile },
        { header: "Delivery Address", accessor: (o) => getFormattedDeliveryAddress(o).fullAddress },
        { header: "Items Count", accessor: (o) => o.itemsCount || o.items?.length || 0 },
        { header: "Total Amount (INR)", accessor: (o) => o.totalAmount || o.amount },
        { header: "Payment Method", accessor: (o) => o.paymentMethod },
        { header: "Payment Status", accessor: (o) => o.paymentStatus },
        { header: "Order Status", accessor: (o) => o.status },
        { header: "Order Date", accessor: (o) => o.orderDate || o.orderPlacedAt || "-" },
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
        { header: "Order ID", accessor: (o) => o.orderNumber || o.id },
        { header: "Account Owner", accessor: (o) => getRegisteredCustomer(o).name },
        { header: "Recipient", accessor: (o) => getDeliveryRecipient(o).name },
        { header: "Recipient Phone", accessor: (o) => getDeliveryRecipient(o).mobile },
        { header: "Amount", accessor: (o) => `INR ${o.totalAmount || o.amount}` },
        { header: "Items", accessor: (o) => o.itemsCount || o.items?.length || 0 },
        { header: "Payment", accessor: (o) => `${o.paymentMethod} (${o.paymentStatus})` },
        { header: "Status", accessor: (o) => o.status },
      ],
      selectedOrders
    );

    setToastMessage(`Exported ${selectedOrders.length} order(s) to selected-orders.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStatusBadge = (statusStr: string) => {
    const s = String(statusStr).toUpperCase();
    if (s.includes("DELIVER")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eefcf2] text-[#15803d] border border-[#bbf7d0]">
          <CheckCircle2 className="w-3 h-3" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s.includes("PROCESS") || s.includes("PACK")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Processing</span>
        </span>
      );
    }
    if (s.includes("OUT") || s.includes("DISPATCH")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
          <Truck className="w-3 h-3" />
          <span>Out for Delivery</span>
        </span>
      );
    }
    if (s.includes("CANCEL") || s.includes("FAIL")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3" />
          <span>Cancelled</span>
        </span>
      );
    }
    if (s.includes("CONFIRM")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Confirmed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3" />
        <span>Pending</span>
      </span>
    );
  };

  const getPaymentBadge = (order: Order) => {
    const pStatus = String(order.paymentStatus || "").toUpperCase();
    const pMethod = String(order.paymentMethod || "COD");

    if (pStatus.includes("PAID") || pStatus.includes("COMPLETE")) {
      return (
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-emerald-700">Paid</span>
          <span className="text-[10px] text-slate-400 block font-medium">({pMethod})</span>
        </div>
      );
    }
    if (pMethod.includes("COD") || pStatus.includes("PENDING")) {
      return (
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-amber-700">COD Pending</span>
          <span className="text-[10px] text-slate-400 block font-medium">(Cash on Delivery)</span>
        </div>
      );
    }
    return (
      <div className="space-y-0.5">
        <span className="text-xs font-semibold text-slate-700">{pStatus || "Pending"}</span>
        <span className="text-[10px] text-slate-400 block font-medium">({pMethod})</span>
      </div>
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

      {/* Table Content (Responsive desktop/tablet layout) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
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
              <th className="py-3 px-4">Order Number</th>
              <th
                className={`py-3 px-4 cursor-pointer transition-colors ${
                  sortBy === "customerName" ? "text-[#00875a]" : "hover:text-slate-800"
                }`}
                onClick={() => onSort("customerName")}
              >
                <div className="flex items-center gap-1">
                  <span>Account Owner</span>
                  <ArrowUpDown
                    className={`w-3 h-3 ${sortBy === "customerName" ? "text-[#00875a]" : "opacity-50"}`}
                  />
                </div>
              </th>
              <th className="py-3 px-4">Delivery Recipient</th>
              <th
                className={`py-3 px-4 cursor-pointer transition-colors ${
                  sortBy === "itemsCount" ? "text-[#00875a]" : "hover:text-slate-800"
                }`}
                onClick={() => onSort("itemsCount")}
              >
                <div className="flex items-center gap-1">
                  <span>Items</span>
                  <ArrowUpDown
                    className={`w-3 h-3 ${sortBy === "itemsCount" ? "text-[#00875a]" : "opacity-50"}`}
                  />
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
                  <ArrowUpDown
                    className={`w-3 h-3 ${sortBy === "amount" ? "text-[#00875a]" : "opacity-50"}`}
                  />
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
                  <span>Placed Date/Time {sortBy === "orderTime" && (sortOrder === "asc" ? "↑" : "↓")}</span>
                  <ArrowUpDown
                    className={`w-3 h-3 ${sortBy === "orderTime" ? "text-[#00875a]" : "opacity-50"}`}
                  />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
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
                const regCustomer = getRegisteredCustomer(order);
                const recipient = getDeliveryRecipient(order);
                const orderNum = order.orderNumber || order.id;
                const totalAmt = order.totalAmount ?? order.amount ?? 0;
                const itemsCount = order.itemsCount ?? order.items?.length ?? 0;

                return (
                  <tr
                    key={order.id}
                    className={`border-l-4 border-transparent hover:border-[#00875a] hover:bg-[#eefcf2]/60 transition-all group ${
                      isChecked ? "bg-[#f2faf5]" : ""
                    }`}
                  >
                    {/* 1. Checkbox */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleRow(order.id, e)}
                        className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
                        aria-label={`Select order ${orderNum}`}
                      />
                    </td>

                    {/* 2. Order Number */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="font-mono font-bold text-[#00875a] hover:underline text-left"
                        title="Click to view full order details"
                      >
                        {orderNum}
                      </button>
                    </td>

                    {/* 3. Account Owner (Registered Customer) */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="font-bold text-slate-900">
                            {regCustomer.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          {regCustomer.mobile || "No Mobile"}
                        </span>
                      </div>
                    </td>

                    {/* 4. Delivery Recipient (CRITICAL: Distinct from Account Owner) */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          {recipient.name}
                        </span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="font-mono text-emerald-800 font-semibold">
                            {recipient.mobile || "No Mobile"}
                          </span>
                          {recipient.mobile && (
                            <a
                              href={`tel:${recipient.mobile}`}
                              className="p-0.5 text-emerald-700 hover:text-emerald-900 rounded"
                              title="Call delivery recipient"
                            >
                              <Phone className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 5. Items Count */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>{itemsCount} item{itemsCount !== 1 ? "s" : ""}</span>
                      </span>
                    </td>

                    {/* 6. Total Amount */}
                    <td className="py-3.5 px-4 font-black font-mono text-slate-900">
                      ₹{Number(totalAmt).toFixed(2)}
                    </td>

                    {/* 7. Payment Status & Method */}
                    <td className="py-3.5 px-4">{getPaymentBadge(order)}</td>

                    {/* 8. Order Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                    {/* 9. Placed Date / Time */}
                    <td className="py-3.5 px-4 font-medium text-slate-600 text-[11px]">
                      {formatOrderDateTime(order.orderPlacedAt || order.orderDate, order.orderTime)}
                    </td>

                    {/* 10. Actions Column */}
                    <td className="py-3.5 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        {/* Eye Button: View Details */}
                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-[#00875a] hover:bg-[#eefcf2] transition-colors"
                          title="View order details drawer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 3 Dots Context Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuOrderId((prev) =>
                                prev === order.id ? null : order.id
                              )
                            }
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                              <div className="absolute right-0 top-8 z-30 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-100">
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

                                <button
                                  type="button"
                                  onClick={() => {
                                    generateInvoicePdf(order, "print");
                                    setActiveMenuOrderId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Print Tax Invoice</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    generateDeliveryLabelPdf(order, "print");
                                    setActiveMenuOrderId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-amber-800 font-medium"
                                >
                                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Print Delivery Label</span>
                                </button>

                                {order.status === "CONFIRMED" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateStatus(order.id, "PROCESSING");
                                      setActiveMenuOrderId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-700 font-medium"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Move to Processing</span>
                                  </button>
                                )}

                                {order.status === "PROCESSING" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateStatus(order.id, "OUT_FOR_DELIVERY");
                                      setActiveMenuOrderId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-teal-700 font-medium"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Dispatch for Delivery</span>
                                  </button>
                                )}

                                {order.status === "OUT_FOR_DELIVERY" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateStatus(order.id, "DELIVERED");
                                      setActiveMenuOrderId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-medium"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Delivered</span>
                                  </button>
                                )}

                                {order.status !== "CANCELLED" &&
                                  order.status !== "DELIVERED" && (
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

      {/* Dynamic Pagination Bar */}
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
