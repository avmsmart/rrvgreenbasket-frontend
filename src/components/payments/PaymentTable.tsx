"use client";

import React, { useState } from "react";
import {
  Eye,
  MoreVertical,
  Copy,
  Check,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { PaymentTransaction, PaymentStatus, PaymentTransactionMethod } from "@/types/payment";
import { SelectionToolbar, IndeterminateCheckbox, PaginationBar } from "@/components/common";
import { exportToCsv, exportToPdf } from "@/utils";

interface PaymentTableProps {
  transactions: PaymentTransaction[];
  onViewDetails: (tx: PaymentTransaction) => void;
  onRefund?: (tx: PaymentTransaction) => void;
  onMarkPaid?: (tx: PaymentTransaction) => void;
  selectedPaymentIds?: string[];
  onToggleSelectPayment?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onClearSelection?: () => void;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  transactions,
  onViewDetails,
  onRefund,
  onMarkPaid,
  selectedPaymentIds,
  onToggleSelectPayment,
  onToggleSelectAll,
  onClearSelection,
}) => {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const selectedIds = selectedPaymentIds ?? internalSelectedIds;

  const toggleSelectAll = () => {
    if (onToggleSelectAll) {
      onToggleSelectAll();
      return;
    }
    const pageIds = paginatedTransactions.map((t) => t.id);
    const areAllPageSelected = pageIds.every((id) => selectedIds.includes(id));
    if (areAllPageSelected) {
      setInternalSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setInternalSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onToggleSelectPayment) {
      onToggleSelectPayment(id);
      return;
    }
    setInternalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClear = () => {
    if (onClearSelection) {
      onClearSelection();
    } else {
      setInternalSelectedIds([]);
    }
  };

  const isAllSelected =
    paginatedTransactions.length > 0 &&
    paginatedTransactions.every((t) => selectedIds.includes(t.id));
  const isIndeterminate =
    paginatedTransactions.some((t) => selectedIds.includes(t.id)) && !isAllSelected;

  const handleExportSelected = () => {
    const selected = transactions.filter((t) => selectedIds.includes(t.id));
    if (selected.length === 0) return;

    exportToCsv<PaymentTransaction>(
      "selected-payments.csv",
      [
        { header: "Payment ID", accessor: (t) => t.id },
        { header: "Order ID", accessor: (t) => t.orderId },
        { header: "Customer Name", accessor: (t) => t.customerName },
        { header: "Customer Phone", accessor: (t) => t.customerPhone || "--" },
        { header: "Amount (INR)", accessor: (t) => t.amount },
        { header: "Payment Method", accessor: (t) => t.method || t.paymentMethod || "--" },
        { header: "Payment Status", accessor: (t) => t.status },
        { header: "Transaction Date", accessor: (t) => t.date || t.paymentDate || "--" },
        { header: "Gateway Reference", accessor: (t) => t.gatewayRef || t.transactionId || "--" },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} payment transaction(s) to selected-payments.csv`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPdf = () => {
    const selected = transactions.filter((t) => selectedIds.includes(t.id));
    if (selected.length === 0) return;

    exportToPdf<PaymentTransaction>(
      "selected-payments.pdf",
      "Payments Transactions Report",
      [
        { header: "Payment ID", accessor: (t) => t.id },
        { header: "Order ID", accessor: (t) => t.orderId },
        { header: "Customer Name", accessor: (t) => t.customerName },
        { header: "Phone", accessor: (t) => t.customerPhone || "--" },
        { header: "Amount", accessor: (t) => `INR ${t.amount}` },
        { header: "Method", accessor: (t) => t.method || t.paymentMethod || "--" },
        { header: "Status", accessor: (t) => t.status },
        { header: "Date", accessor: (t) => t.date || t.paymentDate || "--" },
        { header: "Ref ID", accessor: (t) => t.gatewayRef || t.transactionId || "--" },
      ],
      selected
    );

    setToastMessage(`Exported ${selected.length} payment transaction(s) to selected-payments.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedTxn(id);
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Failed
          </span>
        );
      case "Refunded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
            <RotateCcw className="w-3 h-3 text-purple-500" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getMethodBadge = (method?: string) => {
    if (!method) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200/60">
          -
        </span>
      );
    }
    if (method.includes("PhonePe")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
          <Smartphone className="w-3 h-3 text-indigo-500" />
          UPI PhonePe
        </span>
      );
    }
    if (method.includes("Google Pay")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
          <Smartphone className="w-3 h-3 text-teal-500" />
          UPI GPay
        </span>
      );
    }
    if (method.includes("Cash on Delivery")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
          <Banknote className="w-3 h-3 text-blue-500" />
          COD
        </span>
      );
    }
    if (method.includes("Card") || method.includes("Razorpay")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/60">
          <CreditCard className="w-3 h-3 text-violet-500" />
          Card (Razorpay)
        </span>
      );
    }
    if (method.includes("Wallet") || method.includes("Paytm")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
          <Wallet className="w-3 h-3 text-amber-500" />
          Wallet (Paytm)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200/60">
        <CreditCard className="w-3 h-3 text-slate-400" />
        {method}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col">
      {/* Selection Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 sm:px-4 bg-slate-50 border-b border-slate-200">
          <SelectionToolbar
            selectedCount={selectedIds.length}
            entityName="payments"
            onExportSelected={handleExportSelected}
            onExportPdf={handleExportPdf}
            onClearSelection={handleClear}
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
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-3.5 w-10 text-center">
                <IndeterminateCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={toggleSelectAll}
                  ariaLabel="Select all payments on page"
                />
              </th>
              <th className="py-3 px-3 text-slate-600">#</th>
              <th className="py-3 px-3 text-slate-600">Order ID</th>
              <th className="py-3 px-3 text-slate-600">Customer</th>
              <th className="py-3 px-3 text-right text-slate-600">Amount</th>
              <th className="py-3 px-3 text-slate-600">Payment Method</th>
              <th className="py-3 px-3 text-slate-600">Transaction ID</th>
              <th className="py-3 px-3 text-slate-600">Payment Date</th>
              <th className="py-3 px-3 text-slate-600">Status</th>
              <th className="py-3 px-3 text-center text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                  No payment transactions found matching criteria
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx, idx) => {
                const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                const isChecked = selectedIds.includes(tx.id);

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onViewDetails(tx)}
                    className={`cursor-pointer transition-colors ${
                      isChecked ? "bg-emerald-50/40" : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3.5 px-3.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        onClick={(e) => toggleSelect(tx.id, e)}
                        className="rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer"
                        aria-label={`Select payment transaction ${tx.id}`}
                      />
                    </td>

                    {/* Serial Number */}
                    <td className="py-3.5 px-3 text-slate-400 font-semibold text-xs">
                      {serialNumber}
                    </td>

                    {/* Order ID */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#00875a] hover:underline font-mono">
                        #{tx.orderId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {tx.customerAvatar || tx.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {tx.customerName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {tx.customerPhone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-black text-slate-900 text-sm">
                        ₹ {tx.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-3">
                      {getMethodBadge(tx.method)}
                    </td>

                    {/* Transaction ID */}
                    <td
                      className="py-3.5 px-3 font-mono text-xs text-slate-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[110px]">{tx.id}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(tx.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Copy Transaction ID"
                        >
                          {copiedTxn === tx.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Payment Date */}
                    <td className="py-3.5 px-3 text-slate-600 text-xs">
                      {tx.date}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(tx.status)}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View Transaction Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === tx.id ? null : tx.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === tx.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  onViewDetails(tx);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Receipt</span>
                              </button>

                              {tx.status === "Pending" && onMarkPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onMarkPaid(tx);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-semibold"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mark as Paid</span>
                                </button>
                              )}

                              {tx.status === "Paid" && onRefund && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRefund(tx);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-medium"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
                                  <span>Issue Refund</span>
                                </button>
                              )}
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
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};
