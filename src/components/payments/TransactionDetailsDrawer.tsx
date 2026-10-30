"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Download,
  Phone,
  MapPin,
  Calendar,
  FileText,
  User,
  ExternalLink,
} from "lucide-react";
import { PaymentTransaction } from "@/types";

interface TransactionDetailsDrawerProps {
  transaction: PaymentTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkPaid?: (tx: PaymentTransaction) => void;
  onRefund?: (tx: PaymentTransaction, amount: number, reason: string) => void;
}

export const TransactionDetailsDrawer: React.FC<TransactionDetailsDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onMarkPaid,
  onRefund,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(
    transaction?.amount ? String(transaction.amount) : "0"
  );

  if (!isOpen || !transaction) return null;

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;
    if (onRefund) {
      onRefund(transaction, Number(refundAmount) || transaction.amount, refundReason);
    }
    setShowRefundForm(false);
  };

  const downloadReceipt = () => {
    const receiptText = `
========================================
         RRV GREEN BASKET
    Official Payment Receipt
========================================
Transaction ID: ${transaction.id}
Order ID: #${transaction.orderId}
Date: ${transaction.date}
Customer: ${transaction.customerName} (${transaction.customerPhone})
Delivery Address: ${transaction.deliveryAddress || "Kurnool, AP"}

Payment Method: ${transaction.method}
Gateway Ref: ${transaction.gatewayRef || "N/A"}
Status: ${transaction.status.toUpperCase()}

Total Amount: ₹ ${transaction.amount.toFixed(2)}
========================================
Thank you for shopping fresh farm produce!
RRV Green Basket, Kurnool, AP, India.
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${transaction.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200">
        {/* 1. Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Transaction Details
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Order #{transaction.orderId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Body Details */}
        <div className="p-5 space-y-5 flex-1">
          {/* Top Amount Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-slate-50 to-white border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Amount Paid</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                ₹ {transaction.amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  transaction.status === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : transaction.status === "Pending"
                    ? "bg-amber-100 text-amber-800"
                    : transaction.status === "Failed"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {transaction.status === "Paid" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {transaction.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                {transaction.status === "Failed" && <AlertTriangle className="w-3.5 h-3.5" />}
                {transaction.status === "Refunded" && <RotateCcw className="w-3.5 h-3.5" />}
                <span>{transaction.status}</span>
              </span>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transaction ID</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                <span>{transaction.id}</span>
                <button
                  type="button"
                  onClick={handleCopyTxn}
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-bold text-slate-800">{transaction.method}</span>
            </div>

            {transaction.gatewayRef && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Gateway Reference</span>
                <span className="font-mono text-slate-700">{transaction.gatewayRef}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-medium text-slate-700">{transaction.date}</span>
            </div>
          </div>

          {/* Customer & Address Information */}
          <div className="p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Customer Details
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-bold text-slate-900">{transaction.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phone</span>
              <a
                href={`tel:${transaction.customerPhone}`}
                className="font-bold text-emerald-700 hover:underline"
              >
                {transaction.customerPhone}
              </a>
            </div>
            {transaction.deliveryAddress && (
              <div className="flex items-start justify-between gap-4 pt-1 border-t border-slate-100">
                <span className="text-slate-500 flex items-center gap-1 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Address
                </span>
                <span className="font-medium text-slate-700 text-right">
                  {transaction.deliveryAddress}
                </span>
              </div>
            )}
          </div>

          {/* Failure / Refund Banner if Applicable */}
          {transaction.status === "Failed" && transaction.failureReason && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Failure Reason
              </p>
              <p className="text-rose-700 pl-5">{transaction.failureReason}</p>
            </div>
          )}

          {transaction.status === "Refunded" && (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                Refund Processed
              </p>
              <div className="pl-5 text-purple-800 space-y-0.5">
                <p>Refund Amount: ₹ {transaction.refundAmount || transaction.amount}</p>
                {transaction.refundDate && <p>Processed on: {transaction.refundDate}</p>}
                {transaction.failureReason && <p>Note: {transaction.failureReason}</p>}
              </div>
            </div>
          )}

          {/* Refund Inline Form */}
          {showRefundForm && (
            <form
              onSubmit={handleRefundSubmit}
              className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs"
            >
              <h5 className="font-bold text-amber-900">Issue Refund</h5>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={transaction.amount}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Refund *
                </label>
                <textarea
                  required
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer cancelled order / Quality dispute"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefundForm(false)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-3xs"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. Action Buttons Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadReceipt}
            className="flex-1 py-2 px-3 bg-white border border-slate-200/90 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-3xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download Receipt</span>
          </button>

          {transaction.status === "Pending" && onMarkPaid && (
            <button
              type="button"
              onClick={() => onMarkPaid(transaction)}
              className="py-2 px-3 bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs rounded-xl shadow-3xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Paid</span>
            </button>
          )}

          {transaction.status === "Paid" && onRefund && !showRefundForm && (
            <button
              type="button"
              onClick={() => setShowRefundForm(true)}
              className="py-2 px-3 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs rounded-xl shadow-3xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refund</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
