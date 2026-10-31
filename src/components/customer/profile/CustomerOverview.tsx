"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Heart,
  Settings,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Leaf,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { CustomerUser } from "@/types/customer-auth";
import { CustomerAddress } from "@/types/customer-address";
import customerAddressService from "@/services/customer-address.service";
import { INITIAL_ORDERS, getStoredWishlist } from "@/data/customer-profile-mock";

interface CustomerOverviewProps {
  customer: CustomerUser | null;
  onNavigateTab: (tab: any) => void;
}

export const CustomerOverview: React.FC<CustomerOverviewProps> = ({
  customer,
  onNavigateTab,
}) => {
  const [defaultAddress, setDefaultAddress] = useState<CustomerAddress | null>(null);
  const [addressCount, setAddressCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  const displayName = customer?.fullName?.trim() || "Valued Customer";
  const firstName = displayName.split(" ")[0];

  useEffect(() => {
    async function loadQuickData() {
      try {
        const addresses = await customerAddressService.getMyAddresses();
        setAddressCount(addresses.length);
        const def = addresses.find((a) => a.isDefault) || addresses[0] || null;
        setDefaultAddress(def);
      } catch {
        // Handled silently for overview
      }

      try {
        const items = getStoredWishlist();
        setWishlistCount(items.length);
      } catch {
        // Handled silently
      }
    }
    loadQuickData();
  }, []);

  const latestOrder = INITIAL_ORDERS[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>RRV Green Basket Member</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100 max-w-lg leading-relaxed">
              Your source for daily harvested, organic farm-fresh vegetables and fruits. Manage your orders, delivery locations, and preferences here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 shadow hover:bg-emerald-50 active:scale-95 transition"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span>Shop Produce</span>
            </Link>

            <button
              type="button"
              onClick={() => onNavigateTab("orders")}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur border border-white/20 hover:bg-white/20 active:scale-95 transition"
            >
              <Package className="w-4 h-4" />
              <span>Track Orders</span>
            </button>
          </div>
        </div>

        {/* Decorative background leaf */}
        <div className="absolute -bottom-8 -right-8 text-white/5 pointer-events-none select-none">
          <Leaf className="w-64 h-64" />
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Orders */}
        <button
          type="button"
          onClick={() => onNavigateTab("orders")}
          className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Package className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-700">View</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-gray-900">
              {INITIAL_ORDERS.length}
            </p>
            <p className="text-xs font-medium text-gray-500">Total Orders</p>
          </div>
        </button>

        {/* Saved Addresses */}
        <button
          type="button"
          onClick={() => onNavigateTab("addresses")}
          className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <MapPin className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-700">Manage</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-gray-900">{addressCount}</p>
            <p className="text-xs font-medium text-gray-500">Saved Addresses</p>
          </div>
        </button>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => onNavigateTab("wishlist")}
          className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
              <Heart className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-pink-700">Saved</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-gray-900">{wishlistCount}</p>
            <p className="text-xs font-medium text-gray-500">Wishlist Produce</p>
          </div>
        </button>

        {/* Eco Packaging Badge */}
        <button
          type="button"
          onClick={() => onNavigateTab("settings")}
          className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-700">Active</span>
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold text-gray-900">Zero-Plastic</p>
            <p className="text-xs font-medium text-gray-500">Packaging Opt-in</p>
          </div>
        </button>
      </div>

      {/* 2 Main Preview Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Delivery Address Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Default Delivery Location
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("addresses")}
                className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <span>All Addresses</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {defaultAddress ? (
              <div className="mt-4 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                    {defaultAddress.addressType}
                  </span>
                  <span className="rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-bold">
                    Default
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-gray-900">
                  {defaultAddress.receiverName}
                </h4>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {defaultAddress.addressLine1}
                  {defaultAddress.addressLine2 ? `, ${defaultAddress.addressLine2}` : ""}
                  <br />
                  {defaultAddress.city}, {defaultAddress.state} – {defaultAddress.pincode}
                </p>
                <p className="mt-2 text-xs font-mono text-gray-500">
                  📞 {defaultAddress.receiverMobile}
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-gray-50 p-6 text-center border border-gray-100">
                <p className="text-xs text-gray-500">No default address saved yet.</p>
                <button
                  type="button"
                  onClick={() => onNavigateTab("addresses")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Fast daily delivery slot</span>
            <span className="font-semibold text-gray-700">6:00 AM – 8:00 AM</span>
          </div>
        </div>

        {/* Latest Order Tracking Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Recent Farm Delivery
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("orders")}
                className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Order History</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {latestOrder ? (
              <div className="mt-4 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-900">
                    {latestOrder.id}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {latestOrder.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {latestOrder.date} • {latestOrder.items.length} items • ₹{latestOrder.total}
                </p>

                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                  {latestOrder.items.slice(0, 3).map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                  {latestOrder.items.length > 3 && (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-xs font-bold text-gray-600">
                      +{latestOrder.items.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-gray-50 p-6 text-center border border-gray-100">
                <p className="text-xs text-gray-500">No orders placed yet.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Harvested fresh daily</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab("orders")}
              className="font-bold text-emerald-700 hover:underline"
            >
              Track Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
