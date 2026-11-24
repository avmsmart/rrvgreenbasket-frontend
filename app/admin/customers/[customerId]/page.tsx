"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Mail,
  Phone,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  Briefcase,
  Building,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
} from "lucide-react";
import {
  CustomerDetailResponse,
  CustomerAccountStatus,
} from "@/types";
import { customerService } from "@/services/customer.service";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";

function CustomerDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-44 bg-white rounded-3xl border border-slate-200 p-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-3xl border border-slate-200" />
      </div>
    </div>
  );
}

function CustomerDetailContent() {
  const params = useParams();
  const router = useRouter();
  const customerId = (params?.customerId as string) || "";

  const [customer, setCustomer] = useState<CustomerDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopiedUuid, setIsCopiedUuid] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3500);
    },
    []
  );

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const data = await customerService.getCustomerDetail(customerId);
      setCustomer(data);
    } catch (err: any) {
      console.error("Failed to load customer profile:", err);
      showToast("Error retrieving customer profile", "error");
    } finally {
      setIsLoading(false);
    }
  }, [customerId, showToast]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleCopyUuid = () => {
    if (!customer?.id) return;
    navigator.clipboard.writeText(customer.id);
    setIsCopiedUuid(true);
    setTimeout(() => setIsCopiedUuid(false), 2000);
  };

  const handleUpdateStatus = async (newStatus: CustomerAccountStatus) => {
    if (!customer) return;
    try {
      await customerService.updateCustomerStatus(customer.id, newStatus);
      setCustomer((prev) => (prev ? { ...prev, status: newStatus } : null));
      showToast(`Customer status updated to ${newStatus}`);
    } catch (err: any) {
      showToast(err?.message || "Failed to update status", "error");
    }
  };

  const handleSaveProfile = async (data: {
    fullName: string;
    email: string | null;
    profileImageUrl: string | null;
  }) => {
    if (!customer) return;
    try {
      const updated = await customerService.updateCustomerProfile(customer.id, data);
      setCustomer(updated);
      showToast(`Customer profile for ${data.fullName} updated successfully`);
    } catch (err: any) {
      showToast(err?.message || "Failed to update profile", "error");
      throw err;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: CustomerAccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            ACTIVE
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            INACTIVE
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            SUSPENDED
          </span>
        );
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("DELIVERED")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {status}
        </span>
      );
    }
    if (s.includes("CANCEL")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        {status}
      </span>
    );
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "HOME":
        return <Home className="w-4 h-4 text-blue-600" />;
      case "WORK":
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      default:
        return <Building className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              notification.type === "success"
                ? "bg-emerald-900 text-white border-emerald-800"
                : notification.type === "error"
                ? "bg-rose-900 text-white border-rose-800"
                : "bg-slate-900 text-white border-slate-800"
            }`}
          >
            {notification.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {notification.type === "error" && <XCircle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-[#00875a] font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customers</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px]">
              {customer?.fullName || "Customer Details"}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchCustomer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-3xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          // Page Loading Skeleton
          <div className="space-y-6 animate-pulse">
            <div className="h-44 bg-white rounded-3xl border border-slate-200 p-6" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
              ))}
            </div>
            <div className="h-64 bg-white rounded-3xl border border-slate-200" />
          </div>
        ) : !customer ? (
          // Customer Not Found State
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Customer Not Found</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              No customer record was located with UUID: <br />
              <code className="text-slate-700 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                {customerId}
              </code>
            </p>
            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Customers Listing
            </Link>
          </div>
        ) : (
          <>
            {/* Screen 2: 1. Profile Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-3xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Avatar & Core Info */}
                <div className="flex items-start sm:items-center gap-5">
                  {customer.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={customer.profileImageUrl}
                      alt={customer.fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-3xl flex items-center justify-center shadow-md shrink-0">
                      {customer.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {customer.fullName}
                      </h1>
                      {getStatusBadge(customer.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Registered on {formatDate(customer.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {customer.mobileNumber}
                      </span>
                      {customer.email && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {customer.email}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Customer Public UUID with 1-Click Copy */}
                    <div className="pt-1 flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                        <span className="text-[11px] font-mono text-slate-600">
                          UUID: {customer.id}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUuid}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors ml-1"
                          title="Copy UUID to clipboard"
                        >
                          {isCopiedUuid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {isCopiedUuid && (
                        <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                          Copied to clipboard!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-3xs transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    <span>Edit Profile</span>
                  </button>

                  {customer.status === "ACTIVE" ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("INACTIVE")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs shadow-3xs transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-amber-600" />
                      <span>Mark Inactive</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("ACTIVE")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#00875a] font-bold text-xs shadow-3xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Activate Customer</span>
                    </button>
                  )}

                  {customer.status !== "SUSPENDED" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("SUSPENDED")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs shadow-3xs transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Suspend</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Screen 2: 2. Order Statistics Cards (4 Metric Tiles) */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Order Statistics Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* 1. Total Orders */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Total Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                    {customer.statistics.totalOrders}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Lifetime placed orders</p>
                </div>

                {/* 2. Total Spent (₹) */}
                <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-3xs">
                  <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                    <span>Total Spent</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-black text-emerald-700 tracking-tight">
                    {formatCurrency(customer.statistics.totalSpent)}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Net gross merchandise</p>
                </div>

                {/* 3. Delivered Orders */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Delivered Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-black text-emerald-600 tracking-tight">
                    {customer.statistics.deliveredOrders}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {customer.statistics.totalOrders > 0
                      ? `${Math.round(
                          (customer.statistics.deliveredOrders / customer.statistics.totalOrders) * 100
                        )}% fulfillment rate`
                      : "No orders yet"}
                  </p>
                </div>

                {/* 4. Cancelled / Pending */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-3xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Pending / Cancelled</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-blue-600">
                      {customer.statistics.pendingOrders}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">pending</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-2xl font-black text-rose-600">
                      {customer.statistics.cancelledOrders}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">cancelled</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Active fulfillment exceptions</p>
                </div>
              </div>
            </div>

            {/* Screen 2: 3. Addresses Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-3xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Registered Delivery Addresses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Saved shipping addresses used for grocery delivery and logistics routing.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {customer.addresses.length} {customer.addresses.length === 1 ? "Address" : "Addresses"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      addr.isDefault
                        ? "border-[#00875a] bg-emerald-50/40 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        {getAddressIcon(addr.addressType)}
                        <span>{addr.addressType} ADDRESS</span>
                      </div>
                      {addr.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00875a] text-white">
                          DEFAULT DELIVERY
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <p className="font-extrabold text-slate-900 text-sm">
                        {addr.receiverName}
                      </p>
                      <p className="font-medium text-slate-700">
                        Phone: {addr.receiverMobile}
                      </p>
                      <p className="pt-1">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      {addr.landmark && (
                        <p className="text-slate-400 italic text-[11px]">
                          Landmark: {addr.landmark}
                        </p>
                      )}
                      <p className="font-bold text-slate-900 pt-1.5 border-t border-slate-100 mt-2">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ID: {addr.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Screen 2: 4. Recent Orders List */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-3xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recent Customer Orders
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest 3-5 orders placed by this customer.
                  </p>
                </div>
                <Link
                  href={`/admin/orders?customer=${encodeURIComponent(customer.fullName)}`}
                  className="text-xs font-bold text-[#00875a] hover:underline flex items-center gap-1"
                >
                  View All Customer Orders →
                </Link>
              </div>

              {customer.recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
                  No orders have been placed by this customer yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Order Number</th>
                        <th className="py-3 px-4">Placed Date</th>
                        <th className="py-3 px-4 text-center">Items</th>
                        <th className="py-3 px-4 text-right">Total Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customer.recentOrders.map((ord) => (
                        <tr key={ord.orderPublicId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900">
                              {ord.orderNumber}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {ord.orderPublicId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {formatDate(ord.orderDate)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {ord.itemCount} items
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900">
                            {formatCurrency(ord.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getOrderStatusBadge(ord.orderStatus)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/admin/orders?search=${encodeURIComponent(ord.orderNumber)}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors"
                            >
                              View Order
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Screen 2: 5. Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <Suspense fallback={<CustomerDetailSkeleton />}>
      <CustomerDetailContent />
    </Suspense>
  );
}
