"use client";

import React, { useState } from "react";
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

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalOrders);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
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
                    className={`border-l-4 border-transparent hover:border-[#00875a] hover:bg-[#eefcf2] transition-all group ${
                      isChecked ? "bg-[#f2faf5]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRow(order.id)}
                        className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
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
                      ₹{order.amount}
                    </td>
                    <td className="py-3.5 px-4">{getPaymentBadge(order)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {order.orderTime}
                    </td>
                    <td className="py-3.5 px-4 text-right relative">
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

      {/* Pagination Footer matching Page 5 */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{totalOrders > 0 ? startIndex : 0}</span> to{" "}
          <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
          <span className="font-bold text-slate-800">{totalOrders}</span> orders
        </span>

        <div className="flex items-center gap-3">
          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === p
                      ? "bg-[#00875a] text-white shadow-3xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === totalPages
                      ? "bg-[#00875a] text-white shadow-3xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page size dropdown */}
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00875a]"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
    </div>
  );
};
