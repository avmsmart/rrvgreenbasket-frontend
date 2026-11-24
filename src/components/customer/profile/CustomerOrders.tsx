"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  IndianRupee,
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { orderService, OrderApiError } from "@/services/order.service";
import { OrderResponse, BackendOrderStatus } from "@/types/order";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

type FilterTab = "ALL" | "PROCESSING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export const CustomerOrders: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useCustomerAuth();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation state
  const [cancelTargetOrder, setCancelTargetOrder] = useState<OrderResponse | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Changed my mind");
  const [customReason, setCustomReason] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Fetch customer orders from real Spring Boot Order microservice
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pageData = await orderService.getMyOrders(0, 50);
      const list = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      setOrders(list);
    } catch (err: unknown) {
      console.warn("[CustomerOrders] Failed to load orders:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your orders. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadOrders();
    }
  }, [isAuthLoading, loadOrders]);

  // Client-side tab filtering
  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "IN_TRANSIT") return o.orderStatus === "OUT_FOR_DELIVERY";
    if (filter === "PROCESSING") {
      return (
        o.orderStatus === "PLACED" ||
        o.orderStatus === "CONFIRMED" ||
        o.orderStatus === "PROCESSING" ||
        o.orderStatus === "PACKED"
      );
    }
    if (filter === "DELIVERED") return o.orderStatus === "DELIVERED";
    if (filter === "CANCELLED") return o.orderStatus === "CANCELLED" || o.orderStatus === "FAILED";
    return true;
  });

  const getStatusBadge = (status?: BackendOrderStatus | string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 animate-pulse">
            <Truck className="w-3.5 h-3.5 text-blue-700" />
            <span>Out for Delivery</span>
          </span>
        );
      case "PROCESSING":
      case "PACKED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Harvesting & Packing</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case "CANCELLED":
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-700" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Placed</span>
          </span>
        );
    }
  };

  // Handle Order Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelTargetOrder) return;

    const reason = cancelReason === "Other" ? customReason.trim() : cancelReason;
    if (!reason) {
      setCancelError("Please provide a reason for cancellation");
      return;
    }

    setIsCancelling(true);
    setCancelError(null);

    try {
      await orderService.cancelOrder(cancelTargetOrder.orderPublicId, reason);
      showToast("Order cancelled successfully");
      setCancelTargetOrder(null);
      // Refresh orders
      await loadOrders();
    } catch (err: unknown) {
      console.error("[CustomerOrders] Cancellation failed:", err);
      setCancelError(
        err instanceof Error ? err.message : "Failed to cancel order. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-4 py-3 text-xs font-bold text-white shadow-lg transition-all ${
            feedbackToast.type === "success" ? "bg-emerald-700" : "bg-red-600"
          }`}
        >
          {feedbackToast.message}
        </div>
      )}

      {/* Header & Filter Tabs */}
      <div className="border-y border-slate-200 bg-white px-4 py-6 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Package className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                My Orders
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Track active morning harvest deliveries and review your order history
            </p>
          </div>

          <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1.5 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                ["ALL", "All Orders"],
                ["IN_TRANSIT", "In Transit"],
                ["PROCESSING", "Processing"],
                ["DELIVERED", "Delivered"],
                ["CANCELLED", "Cancelled"],
              ] as const
            ).map(([tabKey, label]) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setFilter(tabKey as FilterTab)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition sm:px-3.5 ${
                  filter === tabKey
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            <p className="text-xs font-semibold">Loading your orders from Order Service...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium text-slate-700">{error}</p>
            <button
              type="button"
              onClick={loadOrders}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty Orders State */
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {filter === "ALL" ? "No orders found" : `No ${filter.toLowerCase()} orders`}
            </h2>
            <p className="max-w-xs mx-auto text-xs text-slate-500">
              Order fresh organic vegetables and fruits harvested every morning from local Kurnool farms.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
            >
              <span>Start Shopping</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          /* Real Orders List */
          <div className="space-y-3 pt-4">
            {filteredOrders.map((order) => {
              const canCancel =
                order.orderStatus === "PLACED" || order.orderStatus === "CONFIRMED";
              const orderItems = order.items || [];

              return (
                <article
                  key={order.orderPublicId}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  {/* Order reference row */}
                  <div className="flex flex-col gap-2 border-b border-dashed border-slate-200 bg-slate-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-bold text-slate-800">
                        Order #{order.orderNumber || order.orderPublicId.slice(0, 8)}
                      </span>
                      <span className="text-slate-500">
                        {new Date(order.orderPlacedAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      {getStatusBadge(order.orderStatus)}
                      <span className="text-[11px] font-medium text-slate-500">
                        {order.paymentMethod === "COD"
                          ? "Cash on Delivery"
                          : order.paymentMethod === "ONLINE_FULL"
                          ? "Online Paid"
                          : "Partial Paid"}
                      </span>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="divide-y divide-slate-100">
                    {orderItems.slice(0, 3).map((it) => (
                      <div
                        key={it.orderItemPublicId}
                        className="flex items-center gap-3 px-3 py-3 sm:px-4"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                          {it.productImageUrl ? (
                            <img
                              src={it.productImageUrl}
                              alt={it.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-emerald-700" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {it.productName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Quantity: {it.quantityKg} kg
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-slate-900">
                            ₹{Number(it.totalPrice || 0).toFixed(2)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            ₹{Number(it.pricePerKg || 0).toFixed(2)} / kg
                          </p>
                        </div>
                      </div>
                    ))}
                    {orderItems.length > 3 && (
                      <p className="px-4 py-2 text-xs font-semibold text-emerald-700">
                        +{orderItems.length - 3} more {orderItems.length - 3 === 1 ? "item" : "items"}
                      </p>
                    )}
                    {orderItems.length === 0 && (
                      <div className="px-4 py-4 text-xs text-slate-500">
                        Product details are not available for this order.
                      </div>
                    )}
                  </div>

                  {/* Amount and delivery information */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
                      </span>
                      {order.promisedDeliveryDate && (
                        <span className="inline-flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5 text-slate-400" />
                          Delivery: {new Date(order.promisedDeliveryDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <span className="text-xs font-medium text-slate-500">Order total</span>
                      <span className="text-lg font-extrabold text-emerald-800">
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: full-width friendly controls on small screens */}
                  <div className="grid grid-cols-1 gap-2 border-t border-slate-100 bg-slate-50/70 p-3 sm:flex sm:items-center sm:justify-end sm:px-4">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setCancelTargetOrder(order)}
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 active:scale-[0.99] sm:w-auto"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99] sm:w-auto"
                    >
                      <span>Track & View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          ORDER DETAILS & STATUS TIMELINE MODAL
         ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Order Details #{selectedOrder.orderNumber || selectedOrder.orderPublicId.slice(0, 8)}
                </h3>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(selectedOrder.orderPlacedAt || Date.now()).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
              <span className="text-xs font-bold text-slate-700">Current Status</span>
              {getStatusBadge(selectedOrder.orderStatus)}
            </div>

            {/* Delivery Address */}
            {selectedOrder.deliveryAddress && (
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Delivery Address</span>
                </p>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700">
                  <p>{selectedOrder.deliveryAddress.addressLine}</p>
                  <p className="text-slate-500">
                    {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                  </p>
                </div>
              </div>
            )}

            {/* Items Purchased */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900">Items Ordered</p>
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                  {selectedOrder.items.map((it) => (
                    <div
                      key={it.orderItemPublicId}
                      className="p-3 flex items-center justify-between gap-3 bg-white"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {it.productImageUrl ? (
                          <img
                            src={it.productImageUrl}
                            alt={it.productName}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 truncate">{it.productName}</p>
                          <p className="text-[11px] text-slate-500">
                            {it.quantityKg} kg x ₹{it.pricePerKg}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{it.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status History Timeline */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-gray-100 text-xs">
                <p className="font-bold text-slate-900">Status History & Audit Trail</p>
                <div className="space-y-3 pl-2 border-l-2 border-emerald-500/30">
                  {selectedOrder.statusHistory.map((step, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <p className="font-bold text-slate-900">
                        {(step.status || step.newStatus || "CONFIRMED").replace(/_/g, " ")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(step.changedAt || step.timestamp || Date.now()).toLocaleString("en-IN")}
                        {step.reason ? ` • ${step.reason}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER CANCELLATION MODAL
         ========================================================================= */}
      {cancelTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">
                  Cancel Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelTargetOrder(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel order #{cancelTargetOrder.orderNumber || cancelTargetOrder.orderPublicId.slice(0, 8)}?
            </p>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800">
                Please select a reason for cancellation:
              </label>
              {[
                "Changed my mind",
                "Ordered incorrect items",
                "Found alternative",
                "Delivery time not suitable",
                "Other",
              ].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === r}
                    onChange={() => setCancelReason(r)}
                    className="text-emerald-700 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">{r}</span>
                </label>
              ))}

              {cancelReason === "Other" && (
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Tell us why you are cancelling..."
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelTargetOrder(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
