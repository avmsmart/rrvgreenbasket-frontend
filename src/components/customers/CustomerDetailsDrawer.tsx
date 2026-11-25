"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Home,
  Briefcase,
  Building,
} from "lucide-react";
import { CustomerDetailResponse, CustomerAccountStatus } from "@/types";

interface CustomerDetailsDrawerProps {
  customer: CustomerDetailResponse | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onEdit: (customer: CustomerDetailResponse) => void;
  onUpdateStatus: (customerId: string, status: CustomerAccountStatus) => void;
}

export const CustomerDetailsDrawer: React.FC<CustomerDetailsDrawerProps> = ({
  customer,
  isOpen,
  isLoading = false,
  onClose,
  onEdit,
  onUpdateStatus,
}) => {
  const [copiedUuid, setCopiedUuid] = useState(false);

  if (!isOpen) return null;

  const handleCopyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {status}
        </span>
      );
    }
    if (s.includes("CANCEL")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3 text-blue-600" />
        {status}
      </span>
    );
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "HOME":
        return <Home className="w-3.5 h-3.5 text-blue-600" />;
      case "WORK":
        return <Briefcase className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Building className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Profile Drawer
              </span>
              {customer && getStatusBadge(customer.status)}
            </div>

            <div className="flex items-center gap-2">
              {customer && (
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Open dedicated customer profile page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Page</span>
                </Link>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {isLoading || !customer ? (
              <div className="space-y-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-slate-200 rounded" />
                    <div className="h-3 w-56 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* 1. Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-200">
                  <div className="flex items-center gap-4">
                    {customer.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={customer.profileImageUrl}
                        alt={customer.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm shrink-0">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        {customer.fullName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Registered {formatDate(customer.createdAt)}</span>
                      </div>
                      
                      {/* Public UUID 1-Click Copy */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[220px]">
                          UUID: {customer.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyUuid(customer.id)}
                          className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy public UUID"
                        >
                          {copiedUuid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {copiedUuid && (
                          <span className="text-[10px] font-semibold text-emerald-600 animate-in fade-in">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEdit(customer)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-3xs transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit Profile</span>
                    </button>

                    {customer.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(customer.id, "INACTIVE")}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mark Inactive</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(customer.id, "ACTIVE")}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#00875a] text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Activate Customer</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact Information Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">
                        Mobile Number (Immutable)
                      </span>
                      <span className="font-semibold text-slate-800">
                        {customer.mobileNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">
                        Email Address
                      </span>
                      <span className="font-semibold text-slate-800">
                        {customer.email || "No email linked"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Order Statistics Cards (4 Metric Tiles) */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Order Statistics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Total Orders */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-3xs">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Total Orders
                      </span>
                      <span className="text-2xl font-black text-slate-900 mt-1 block">
                        {customer.statistics.totalOrders}
                      </span>
                    </div>

                    {/* Total Spent */}
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-3xs">
                      <span className="text-[11px] font-semibold text-emerald-800 block">
                        Total Spent
                      </span>
                      <span className="text-2xl font-black text-emerald-700 mt-1 block">
                        {formatCurrency(customer.statistics.totalSpent)}
                      </span>
                    </div>

                    {/* Delivered Orders */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-3xs">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Delivered
                      </span>
                      <span className="text-2xl font-black text-emerald-600 mt-1 block">
                        {customer.statistics.deliveredOrders}
                      </span>
                    </div>

                    {/* Pending / Cancelled */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-3xs">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Pending / Cancelled
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-black text-blue-600">
                          {customer.statistics.pendingOrders} P
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xl font-black text-rose-600">
                          {customer.statistics.cancelledOrders} C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Addresses Section */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Registered Delivery Addresses ({customer.addresses.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customer.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-3.5 rounded-xl border transition-shadow relative ${
                          addr.isDefault
                            ? "bg-emerald-50/40 border-emerald-300 shadow-3xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            {getAddressIcon(addr.addressType)}
                            <span className="text-xs font-bold text-slate-800">
                              {addr.addressType}
                            </span>
                          </div>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00875a] text-white">
                              DEFAULT DELIVERY
                            </span>
                          )}
                        </div>

                        <div className="text-xs space-y-1 text-slate-600">
                          <p className="font-bold text-slate-900">
                            {addr.receiverName} • {addr.receiverMobile}
                          </p>
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          {addr.landmark && (
                            <p className="text-[11px] text-slate-400 italic">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                          <p className="font-semibold text-slate-800 pt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Recent Orders List */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recent Orders ({customer.recentOrders.length})
                    </h3>
                    <Link
                      href={`/admin/orders?customer=${encodeURIComponent(customer.fullName)}`}
                      className="text-xs font-bold text-[#00875a] hover:underline flex items-center gap-1"
                    >
                      View All in Orders
                    </Link>
                  </div>

                  {customer.recentOrders.length === 0 ? (
                    <div className="p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                      No order history recorded for this customer yet.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                      {customer.recentOrders.map((ord) => (
                        <div
                          key={ord.orderPublicId}
                          className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">
                                {ord.orderNumber}
                              </span>
                              {getOrderStatusBadge(ord.orderStatus)}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Placed on {formatDate(ord.orderDate)} • {ord.itemCount} items
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 block">
                              {formatCurrency(ord.totalAmount)}
                            </span>
                            <Link
                              href={`/admin/orders?search=${encodeURIComponent(ord.orderNumber)}`}
                              className="text-[11px] font-bold text-[#00875a] hover:underline"
                            >
                              Order Details →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
