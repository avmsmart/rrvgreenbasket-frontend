"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, MapPin, ShoppingBag, ArrowRight, Sparkles,
  CheckCircle2, Phone, Leaf, Clock,
} from "lucide-react";
import { CustomerUser } from "@/types/customer-auth";
import { CustomerAddress } from "@/types/customer-address";
import customerAddressService from "@/services/customer-address.service";
import { orderService } from "@/services/order.service";
import type { OrderResponse } from "@/types";

interface CustomerOverviewProps {
  customer: CustomerUser | null;
  onNavigateTab: (tab: any) => void;
}

export const CustomerOverview: React.FC<CustomerOverviewProps> = ({ customer, onNavigateTab }) => {
  const [defaultAddress, setDefaultAddress] = useState<CustomerAddress | null>(null);
  const [addressCount, setAddressCount] = useState(0);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const displayName = customer?.fullName?.trim() || "Valued Customer";
  const firstName = displayName.split(" ")[0];

  useEffect(() => {
    let active = true;
    async function loadQuickData() {
      try {
        const addresses = await customerAddressService.getMyAddresses();
        if (!active) return;
        setAddressCount(addresses.length);
        setDefaultAddress(addresses.find((address) => address.isDefault) || addresses[0] || null);
      } catch {
        // Address preview is optional; keep the profile dashboard available.
      }

      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const page = await orderService.getMyOrders(0, 20, "orderPlacedAt,desc");
        if (!active) return;
        setOrders(Array.isArray(page?.content) ? page.content : []);
        setOrderCount(typeof page?.totalElements === "number" ? page.totalElements : (page?.content?.length || 0));
      } catch (error) {
        if (!active) return;
        setOrders([]);
        setOrderCount(0);
        setOrdersError(error instanceof Error ? error.message : "Unable to load your recent orders.");
      } finally {
        if (active) setOrdersLoading(false);
      }
    }
    loadQuickData();
    return () => { active = false; };
  }, []);

  const latestOrder = orders[0];

  return (
    <div className="min-w-0 space-y-8 text-slate-800">
      <section className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Welcome back, {firstName}!</h1>
          <p className="mt-1 text-sm text-slate-500">Your orders and delivery details, all in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800">
            <ShoppingBag className="h-4 w-4" /> Shop now
          </Link>
          <button type="button" onClick={() => onNavigateTab("orders")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50">
            <Package className="h-4 w-4" /> Track orders
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white py-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)]">
        <button type="button" onClick={() => onNavigateTab("orders")} className="px-2 text-center transition hover:bg-emerald-50/60">
          <span className="block text-2xl font-extrabold text-slate-900">{orderCount}</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">Orders</span>
        </button>
        <button type="button" onClick={() => onNavigateTab("addresses")} className="px-2 text-center transition hover:bg-emerald-50/60">
          <span className="block text-2xl font-extrabold text-slate-900">{addressCount}</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">Addresses</span>
        </button>
      </section>

      {/* Account navigation is already available in the sidebar. Keep this page focused on account information. */}
      <div className="grid min-w-0 grid-cols-1 gap-8 xl:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900"><MapPin className="h-5 w-5 text-emerald-700" /> Delivery address</h2>
            <button type="button" onClick={() => onNavigateTab("addresses")} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900">
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {defaultAddress ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">{defaultAddress.addressType}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Default</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{defaultAddress.receiverName}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{defaultAddress.addressLine1}{defaultAddress.addressLine2 ? `, ${defaultAddress.addressLine2}` : ""}</p>
              <p className="text-sm text-slate-600">{defaultAddress.city}, {defaultAddress.state} – {defaultAddress.pincode}</p>
              <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500"><Phone className="h-3.5 w-3.5 text-emerald-700" />{defaultAddress.receiverMobile}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6">
              <p className="text-sm text-slate-500">No delivery address saved yet.</p>
              <button type="button" onClick={() => onNavigateTab("addresses")} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">Add address <ArrowRight className="h-4 w-4" /></button>
            </div>
          )}
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900"><Package className="h-5 w-5 text-emerald-700" /> Recent order</h2>
            <button type="button" onClick={() => onNavigateTab("orders")} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900">View all <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
          {ordersLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Loading your recent orders...</div>
          ) : ordersError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <p>{ordersError}</p>
              <button type="button" onClick={() => onNavigateTab("orders")} className="mt-2 font-bold underline">Open My Orders</button>
            </div>
          ) : latestOrder ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-slate-900">{latestOrder.orderNumber || latestOrder.orderPublicId}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-emerald-800"><CheckCircle2 className="h-3 w-3" />{String(latestOrder.orderStatus || "PLACED").replaceAll("_", " ")}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {latestOrder.orderPlacedAt ? new Date(latestOrder.orderPlacedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date unavailable"}
                {" · "}{latestOrder.items?.length || 0} items · <strong className="text-slate-800">₹{Number(latestOrder.totalAmount || 0).toLocaleString("en-IN")}</strong>
              </p>
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                {(latestOrder.items || []).slice(0, 3).map((item) => (
                  <div key={item.publicId} className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                    {item.productImage ? <img src={item.productImage} alt={item.productName || "Ordered product"} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-slate-400" />}
                  </div>
                ))}
                {(latestOrder.items?.length || 0) > 3 && <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">+{latestOrder.items.length - 3}</span>}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">No orders placed yet. <Link href="/" className="font-bold text-emerald-700">Start shopping</Link></div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerOverview;
