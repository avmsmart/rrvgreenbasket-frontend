"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  Copy,
  ShoppingBag,
} from "lucide-react";
import { Customer, CustomerStatus } from "@/types";
import { SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import { exportToCsv, exportToPdf } from "@/utils";

interface CustomerTableProps {
  customers: Customer[];
  selectedCustomerIds: string[];
  onToggleSelectCustomer: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection?: () => void;
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onToggleStatus: (id: string) => void;
  currentPage: number;
  pageSize: number;
  totalCustomers: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  selectedCustomerIds,
  onToggleSelectCustomer,
  onToggleSelectAll,
  onClearSelection,
  onViewCustomer,
  onEditCustomer,
  onToggleStatus,
  currentPage,
  pageSize,
  totalCustomers,
  onPageChange,
  onPageSizeChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(totalCustomers / pageSize) || 125;
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCustomers);

  const allSelected =
    customers.length > 0 && customers.every((c) => selectedCustomerIds.includes(c.id));
  const isIndeterminate =
    customers.some((c) => selectedCustomerIds.includes(c.id)) && !allSelected;

  const handleExportSelected = () => {
    const selected = customers.filter((c) => selectedCustomerIds.includes(c.id));
    if (selected.length === 0) return;

    exportToCsv<Customer>(
      "selected-customers.csv",
      [
        { header: "Customer ID", accessor: (c) => c.id },
        { header: "Name", accessor: (c) => c.name },
        { header: "Phone", accessor: (c) => c.phone },
        { header: "Email", accessor: (c) => c.email },
        { header: "Location", accessor: (c) => c.location },
        { header: "Total Orders", accessor: (c) => c.totalOrders },
        { header: "Total Spent (INR)", accessor: (c) => c.totalSpent },
        { header: "Status", accessor: (c) => c.status },
        { header: "Joined On", accessor: (c) => c.joinedOn },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} customer(s) to selected-customers.csv`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPdf = () => {
    const selected = customers.filter((c) => selectedCustomerIds.includes(c.id));
    if (selected.length === 0) return;

    exportToPdf<Customer>(
      "selected-customers.pdf",
      "Customers Report",
      [
        { header: "Customer ID", accessor: (c) => c.id },
        { header: "Name", accessor: (c) => c.name },
        { header: "Phone", accessor: (c) => c.phone },
        { header: "Email", accessor: (c) => c.email || "-" },
        { header: "Location", accessor: (c) => c.location },
        { header: "Total Orders", accessor: (c) => c.totalOrders },
        { header: "Total Spent", accessor: (c) => `INR ${c.totalSpent}` },
        { header: "Status", accessor: (c) => c.status },
        { header: "Joined On", accessor: (c) => c.joinedOn },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} customer(s) to selected-customers.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Inactive
      </span>
    );
  };

  const getAvatarBg = (initial: string) => {
    switch (initial) {
      case "P":
        return "bg-emerald-600 text-white";
      case "A":
        return "bg-blue-600 text-white";
      case "M":
        return "bg-purple-600 text-white";
      case "K":
        return "bg-amber-600 text-white";
      case "S":
        return "bg-pink-600 text-white";
      case "V":
        return "bg-indigo-600 text-white";
      case "L":
        return "bg-teal-600 text-white";
      case "R":
        return "bg-orange-600 text-white";
      case "N":
        return "bg-rose-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col">
      {/* Selection Toolbar */}
      {selectedCustomerIds.length > 0 && (
        <div className="p-3 sm:px-4 bg-slate-50 border-b border-slate-200">
          <SelectionToolbar
            selectedCount={selectedCustomerIds.length}
            entityName="customers"
            onExportSelected={handleExportSelected}
            onExportPdf={handleExportPdf}
            onClearSelection={onClearSelection || (() => {})}
          />
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-[#00875a] text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-3.5 w-10 text-center">
                <IndeterminateCheckbox
                  checked={allSelected}
                  indeterminate={isIndeterminate}
                  onChange={onToggleSelectAll}
                  ariaLabel="Select all customers on page"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center">#</th>
              <th className="py-3 px-3.5">Customer</th>
              <th className="py-3 px-3.5">Phone Number</th>
              <th className="py-3 px-3.5">Email</th>
              <th className="py-3 px-3.5">Location</th>
              <th className="py-3 px-3 text-center">Total Orders</th>
              <th className="py-3 px-3.5 text-right">Total Spent</th>
              <th className="py-3 px-3.5 text-center">Status</th>
              <th className="py-3 px-3.5 text-center">Joined On</th>
              <th className="py-3 px-3.5 text-center w-28">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-slate-600">
                      No customer accounts found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting search terms or filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer, idx) => {
                const isSelected = selectedCustomerIds.includes(customer.id);
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const initial = customer.name.charAt(0).toUpperCase();

                return (
                  <tr
                    key={customer.id}
                    onClick={() => onViewCustomer(customer)}
                    title="Click to view customer profile and order history"
                    className={`cursor-pointer border-l-4 transition-all ${
                      isSelected
                        ? "border-[#00875a] bg-[#eefcf2]"
                        : "border-transparent hover:border-[#00875a] hover:bg-[#eefcf2]/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 px-3.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectCustomer(customer.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        aria-label={`Select customer ${customer.name}`}
                      />
                    </td>

                    {/* Row # */}
                    <td className="py-3 px-2 text-center text-slate-400 font-medium text-[11px]">
                      {rowNum}
                    </td>

                    {/* Customer Name & Avatar */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs ${getAvatarBg(
                            initial
                          )}`}
                        >
                          {initial}
                        </span>
                        <button
                          type="button"
                          onClick={() => onViewCustomer(customer)}
                          className="font-bold text-slate-800 hover:text-emerald-700 transition-colors text-left truncate max-w-[130px]"
                        >
                          {customer.name}
                        </button>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-3 px-3.5 font-mono text-slate-600 text-xs">
                      {customer.phone}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3.5 text-slate-500 truncate max-w-[150px]">
                      {customer.email}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {customer.location}
                      </span>
                    </td>

                    {/* Total Orders */}
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {customer.totalOrders}
                    </td>

                    {/* Total Spent */}
                    <td className="py-3 px-3.5 text-right font-black text-slate-900">
                      ₹ {customer.totalSpent.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 text-center">
                      {getStatusBadge(customer.status)}
                    </td>

                    {/* Joined On */}
                    <td className="py-3 px-3.5 text-center text-slate-500 font-medium text-xs">
                      {customer.joinedOn}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3 px-3.5 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Eye: View */}
                        <button
                          type="button"
                          onClick={() => onViewCustomer(customer)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          title="View customer profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit icon */}
                        <button
                          type="button"
                          onClick={() => onEditCustomer(customer)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-blue-700 transition-colors"
                          title="Edit customer details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown ⋮ */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(
                                activeMenuId === customer.id ? null : customer.id
                              );
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuId === customer.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onViewCustomer(customer);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                View Profile
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onEditCustomer(customer);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                Edit Customer
                              </button>

                              <div className="my-1 border-t border-slate-100"></div>

                              <button
                                type="button"
                                onClick={() => {
                                  onToggleStatus(customer.id);
                                  setActiveMenuId(null);
                                }}
                                className={`w-full px-3 py-1.5 flex items-center gap-2 font-medium text-xs ${
                                  customer.status === "Active"
                                    ? "text-amber-700 hover:bg-amber-50"
                                    : "text-emerald-700 hover:bg-emerald-50"
                                }`}
                              >
                                {customer.status === "Active" ? (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                    Mark Inactive
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Mark Active
                                  </>
                                )}
                              </button>
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

      {/* Dynamic Pagination Bar (No 'Showing X to Y' text) */}
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
