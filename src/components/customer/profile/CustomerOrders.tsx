"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { CustomerOrder, INITIAL_ORDERS } from "@/data/customer-profile-mock";

export const CustomerOrders: React.FC = () => {
  const [orders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [filter, setFilter] = useState<"ALL" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    return o.status === filter;
  });

  const getStatusBadge = (status: CustomerOrder["status"]) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 animate-pulse">
            <Truck className="w-3.5 h-3.5 text-blue-700" />
            <span>Out for Delivery</span>
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Processing</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-700" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Package className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                My Orders
              </h1>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Track active deliveries and review your past farm-fresh vegetable orders
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
            {(["ALL", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  filter === tab
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "ALL"
                  ? "All Orders"
                  : tab === "IN_TRANSIT"
                  ? "In Transit"
                  : tab === "DELIVERED"
                  ? "Delivered"
                  : "Cancelled"}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="mt-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-50 text-gray-400 border border-gray-100">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900">
                No orders found
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                You haven&apos;t placed any orders in this category yet.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Explore Fresh Produce</span>
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      {order.id}
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                      ₹{order.total}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl bg-gray-50 p-2.5 border border-gray-100"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {item.quantity} × {item.unit} • ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Address, Slot & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
                  <div className="text-xs text-gray-500 truncate max-w-md">
                    <span className="font-semibold text-gray-700">Slot:</span>{" "}
                    {order.deliverySlot} •{" "}
                    <span className="font-semibold text-gray-700">Payment:</span>{" "}
                    {order.paymentMethod}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition active:scale-95"
                  >
                    <span>View Details &amp; Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details & Tracking Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Order Details – {selectedOrder.id}
                </h3>
                <p className="text-xs text-gray-500">{selectedOrder.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tracking timeline */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                Live Delivery Tracking
              </h4>
              <div className="space-y-3">
                {selectedOrder.trackingEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        event.done
                          ? "bg-emerald-700 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {event.done ? "✓" : "○"}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-xs font-bold ${
                          event.done ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {event.title}
                      </p>
                      <p className="text-[11px] text-gray-500">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Itemized summary */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-gray-100">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-gray-500 ml-2">({item.quantity} × {item.unit})</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-3 flex justify-between text-sm font-bold text-gray-900">
                <span>Total Paid</span>
                <span className="text-emerald-800">₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="mt-4 rounded-2xl bg-gray-50 p-3.5 text-xs text-gray-600 border border-gray-100">
              <p className="font-bold text-gray-800">Delivery Address:</p>
              <p className="mt-0.5">{selectedOrder.deliveryAddress}</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full rounded-2xl bg-emerald-700 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
