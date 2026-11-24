"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Edit2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCheck,
  UserX,
  ShieldAlert,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";
import { CustomerListItem, CustomerAccountStatus } from "@/types";

interface CustomerTableProps {
  customers: CustomerListItem[];
  isLoading?: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number; // 0-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewCustomer: (customer: CustomerListItem) => void;
  onEditCustomer: (customer: CustomerListItem) => void;
  onUpdateStatus: (customerId: string, status: CustomerAccountStatus) => void;
  onResetFilters: () => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  isLoading = false,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewCustomer,
  onEditCustomer,
  onUpdateStatus,
  onResetFilters,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);

  const handleCopyUuid = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            INACTIVE
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const startEntry = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endEntry = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden">
      
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-center">Orders</th>
              <th className="py-3 px-4 text-right">Total Spent</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-slate-200 rounded" />
                        <div className="h-2.5 w-20 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                      <div className="h-2.5 w-32 bg-slate-100 rounded" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-4 w-8 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-3.5 w-16 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-5 w-16 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-7 w-20 bg-slate-200 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} className="py-16 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      No customers found
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      No customer records match your active search filters or status parameters.
                    </p>
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#00875a] hover:bg-emerald-100/80 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              // Customer Rows
              customers.map((c) => {
                const initial = c.fullName.charAt(0).toUpperCase();
                const isCopied = copiedId === c.id;
                const isMenuOpen = statusMenuOpenId === c.id;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onViewCustomer(c)}
                  >
                    {/* Customer Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {c.profileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.profileImageUrl}
                            alt={c.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-3xs shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-3xs shrink-0">
                            {initial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 truncate block hover:text-[#00875a] transition-colors">
                            {c.fullName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>Joined {formatDate(c.createdAt)}</span>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyUuid(e, c.id)}
                              className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors text-[10px]"
                              title={`Customer UUID: ${c.id} (Click to copy)`}
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                              )}
                              <span>{c.id.substring(0, 8)}...</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.mobileNumber}</span>
                        </div>
                        {c.email ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${c.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-emerald-700 hover:underline truncate"
                            >
                              {c.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No email linked</span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{c.location || "N/A"}</span>
                      </div>
                    </td>

                    {/* Orders Count */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {c.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-extrabold text-slate-900 tracking-tight">
                        {formatCurrency(c.totalSpent)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Details Button */}
                        <button
                          type="button"
                          onClick={() => onViewCustomer(c)}
                          className="p-1.5 text-slate-500 hover:text-[#00875a] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View customer profile details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Customer Button */}
                        <button
                          type="button"
                          onClick={() => onEditCustomer(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit customer profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Quick Status Update Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setStatusMenuOpenId(isMenuOpen ? null : c.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Update customer status"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 text-left">
                              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Change Status
                              </div>

                              {c.status !== "ACTIVE" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateStatus(c.id, "ACTIVE");
                                    setStatusMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mark Active</span>
                                </button>
                              )}

                              {c.status !== "INACTIVE" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateStatus(c.id, "INACTIVE");
                                    setStatusMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                >
                                  <UserX className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Mark Inactive</span>
                                </button>
                              )}

                              {c.status !== "SUSPENDED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateStatus(c.id, "SUSPENDED");
                                    setStatusMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Suspend Customer</span>
                                </button>
                              )}

                              <div className="border-t border-slate-100 my-1" />

                              <Link
                                href={`/admin/customers/${c.id}`}
                                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                <span>Dedicated Page</span>
                              </Link>
                            </div>
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

      {/* Pagination Bar */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        {/* Showing Entries Info */}
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900 font-bold">{startEntry}</strong> to{" "}
            <strong className="text-slate-900 font-bold">{endEntry}</strong> of{" "}
            <strong className="text-slate-900 font-bold">{totalElements.toLocaleString()}</strong> customers
          </span>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 ml-4">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Previous / Next Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 0 || isLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 text-xs shadow-3xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <span className="px-3 py-1.5 text-slate-700 font-bold">
            Page {currentPage + 1} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || isLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 text-xs shadow-3xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
