"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Phone,
  ArrowRight,
  ShoppingBag,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { OrderResponse, BackendOrderStatus } from "@/types/order";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderPublicId = searchParams.get("orderPublicId") || searchParams.get("orderId");

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!orderPublicId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    orderService
      .getOrderById(orderPublicId)
      .then((res) => {
        if (mounted) {
          setOrder(res);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.warn("[OrderConfirmation] Failed to load order:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to find order details. Please check your order history."
          );
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [orderPublicId]);

  const handleCopyOrderId = () => {
    const textToCopy = order?.orderNumber || order?.orderPublicId || orderPublicId || "";
    if (textToCopy && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getStatusBadge = (status?: BackendOrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 animate-pulse">
            <Truck className="h-3.5 w-3.5 text-blue-700" />
            <span>Out for Delivery</span>
          </span>
        );
      case "PACKED":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-700" />
            <span>Preparing Harvest</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>Confirmed</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Order Placed</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-700" />
          <p className="text-sm font-semibold text-slate-600">
            Retrieving order confirmation...
          </p>
        </div>
      </main>
    );
  }

  if (error || (!order && !orderPublicId)) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Order Reference Not Found
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || "We could not find an active order reference. If you recently placed an order, please review your order history."}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/customer/profile?tab=orders"
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              My Orders
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Success Card Header */}
        <section className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
              RRV Green Basket • Farm Fresh Order
            </p>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Order Placed Successfully!
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Thank you{order?.customerName ? `, ${order.customerName}` : ""}! Your order has been placed and transmitted to our partner farms.
            </p>
          </div>

          {/* Order ID Badge */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 border border-emerald-100 text-xs text-emerald-900 font-bold">
            <span>Order #: {order?.orderNumber || order?.orderPublicId || orderPublicId}</span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="text-emerald-700 hover:text-emerald-900 transition p-1"
              title="Copy Order ID"
            >
              {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {order && (
            <div className="pt-2 flex justify-center">
              {getStatusBadge(order.orderStatus)}
            </div>
          )}
        </section>

        {/* Morning Harvest Delivery Schedule Banner */}
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50/50 p-6 shadow-xs flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs">
            <Truck className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-xs">
            <h2 className="font-bold text-slate-900 text-sm">
              Morning Harvest Delivery: 6:00 AM – 10:00 AM
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Our farmers harvest your items directly at sunrise. We maintain cold-chain handling to ensure maximum freshness delivered right to your doorstep in Kurnool.
            </p>
          </div>
        </section>

        {/* Order Details & Summary Card */}
        {order && (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-700" />
                <span>Order Summary</span>
              </h2>
              <span className="text-xs text-slate-500">
                Placed on {new Date(order.orderPlacedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Delivery Address</span>
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {order.deliveryAddress.addressLine}
                  {order.deliveryAddress.landmark ? `, Near ${order.deliveryAddress.landmark}` : ""}
                </p>
                <p className="text-slate-500">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
                {order.customerPhone && (
                  <p className="text-slate-600 flex items-center gap-1 pt-0.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{order.customerPhone}</span>
                  </p>
                )}
              </div>
            )}

            {/* Ordered Items List */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Items ({order.items.length})
                </h3>
                <div className="divide-y divide-gray-100 border rounded-2xl border-gray-100 overflow-hidden">
                  {order.items.map((it) => (
                    <div
                      key={it.orderItemPublicId}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {it.productImageUrl ? (
                          <img
                            src={it.productImageUrl}
                            alt={it.productName}
                            className="h-10 w-10 rounded-xl object-cover bg-slate-50 border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {it.productName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {it.quantityKg} kg x ₹{it.pricePerKg}/kg
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

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{order.subtotalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">
                  {order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-bold">-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-emerald-800 text-base">₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Payment Method</span>
                <span className="font-bold text-slate-700 uppercase">
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : order.paymentMethod === "ONLINE_FULL"
                    ? "Online Full Payment"
                    : "Partial Payment"}
                </span>
              </div>
            </div>

            {/* Audit Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Status Tracking
                </h3>
                <div className="space-y-3 pl-2 border-l-2 border-emerald-500/30">
                  {order.statusHistory.map((step, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <p className="text-xs font-bold text-slate-900">
                        {step.status.replace(/_/g, " ")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(step.changedAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                        {step.reason ? ` • ${step.reason}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/customer/profile?tab=orders"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            <span>Track in My Orders</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 px-6 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Home className="h-4 w-4 text-slate-400" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8faf7]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-700" />
            <p className="text-sm font-semibold text-slate-600">Loading order details...</p>
          </div>
        </main>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
