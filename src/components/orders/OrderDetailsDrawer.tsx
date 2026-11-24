"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  X,
  Phone,
  MapPin,
  Clock,
  Printer,
  Download,
  CheckCircle2,
  Copy,
  Check,
  Truck,
  CreditCard,
  User,
  ExternalLink,
  ShieldAlert,
  Tag,
  Package,
  Calendar,
  Layers,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Order, OrderStatus, AdminOrder, AdminOrderItem } from "@/types";
import { ProduceImage } from "@/components/common";
import {
  generateInvoicePdf,
  generateDeliveryLabelPdf,
  getRegisteredCustomer,
  getDeliveryRecipient,
  getFormattedDeliveryAddress,
  getGoogleMapsUrl,
  formatOrderDateTime,
  formatOrderDateOnly,
} from "@/utils";
import { orderService } from "@/services/order.service";

interface OrderDetailsProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailsContent: React.FC<OrderDetailsProps & { isDrawer?: boolean }> = ({
  order: initialOrder,
  onClose,
  onUpdateStatus,
  isDrawer = false,
}) => {
  // Fresh full details loaded directly from API 2: /api/admin/orders/{orderPublicId}
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loadingFresh, setLoadingFresh] = useState(false);

  // Copy feedback states
  const [copiedCustomerPhone, setCopiedCustomerPhone] = useState(false);
  const [copiedCustomerId, setCopiedCustomerId] = useState(false);
  const [copiedRecipientPhone, setCopiedRecipientPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Download / Print feedback states
  const [invoiceDownloadSuccess, setInvoiceDownloadSuccess] = useState(false);
  const [labelDownloadSuccess, setLabelDownloadSuccess] = useState(false);

  // Status Change Confirmation State
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  // Whenever initialOrder changes or drawer opens, fetch fresh individual order from API 2
  useEffect(() => {
    setOrder(initialOrder);
    if (!initialOrder) return;

    const publicId = initialOrder.orderPublicId || initialOrder.id;
    if (!publicId) return;

    let isCurrent = true;
    setLoadingFresh(true);
    orderService
      .getAdminOrderById(publicId)
      .then((fresh) => {
        if (!isCurrent) return;
        const mapped = orderService.mapToLegacyOrder(fresh);
        setOrder(mapped);
      })
      .catch((err) => {
        console.warn("Could not load fresh order from backend:", err);
      })
      .finally(() => {
        if (isCurrent) setLoadingFresh(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [initialOrder]);

  if (!order) return null;

  // Registered Customer (Account Owner)
  const regCustomer = getRegisteredCustomer(order);

  // Delivery Recipient (CRITICAL: Strictly separated from account owner)
  const recipient = getDeliveryRecipient(order);

  // Complete Delivery Address
  const deliveryAddress = getFormattedDeliveryAddress(order);

  // Google Maps URL using delivery latitude & longitude
  const googleMapsUrl = getGoogleMapsUrl(
    order.deliveryLatitude ?? deliveryAddress.latitude,
    order.deliveryLongitude ?? deliveryAddress.longitude,
    deliveryAddress.fullAddress
  );

  // Copy handlers
  const handleCopyCustomerPhone = () => {
    if (!regCustomer.mobile) return;
    navigator.clipboard?.writeText(regCustomer.mobile);
    setCopiedCustomerPhone(true);
    setTimeout(() => setCopiedCustomerPhone(false), 2000);
  };

  const handleCopyCustomerId = () => {
    if (!regCustomer.customerPublicId) return;
    navigator.clipboard?.writeText(regCustomer.customerPublicId);
    setCopiedCustomerId(true);
    setTimeout(() => setCopiedCustomerId(false), 2000);
  };

  const handleCopyRecipientPhone = () => {
    if (!recipient.mobile) return;
    navigator.clipboard?.writeText(recipient.mobile);
    setCopiedRecipientPhone(true);
    setTimeout(() => setCopiedRecipientPhone(false), 2000);
  };

  const handleCopyAddress = () => {
    if (!deliveryAddress.fullAddress) return;
    navigator.clipboard?.writeText(deliveryAddress.fullAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Invoice handlers (recipient-only)
  const handlePrintInvoice = () => {
    generateInvoicePdf(order, "print");
  };

  const handleDownloadInvoice = () => {
    generateInvoicePdf(order, "download");
    setInvoiceDownloadSuccess(true);
    setTimeout(() => setInvoiceDownloadSuccess(false), 2500);
  };

  // Delivery label handlers (recipient-only)
  const handlePrintDeliveryLabel = () => {
    generateDeliveryLabelPdf(order, "print");
  };

  const handleDownloadDeliveryLabel = () => {
    generateDeliveryLabelPdf(order, "download");
    setLabelDownloadSuccess(true);
    setTimeout(() => setLabelDownloadSuccess(false), 2500);
  };

  // Status Change Confirmation
  const handleInitiateStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;
    setPendingStatus(newStatus);
    setStatusReason(`Admin updated order status to ${newStatus}`);
    setStatusError(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      const publicId = order.orderPublicId || order.id;
      const updated = await orderService.updateOrderStatus(
        publicId,
        pendingStatus,
        statusReason || `Status updated to ${pendingStatus}`
      );
      setOrder(updated);
      onUpdateStatus(order.id, pendingStatus);
      setStatusSuccess(`Status successfully updated to ${pendingStatus}`);
      setPendingStatus(null);
      setTimeout(() => setStatusSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status.";
      setStatusError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Items to render
  const items = order.items && order.items.length > 0 ? order.items : [];

  // Order status badge styling
  const getStatusBadgeStyle = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s.includes("DELIVER")) {
      return "bg-[#eefcf2] text-[#15803d] border-[#bbf7d0]";
    }
    if (s.includes("PROCESS") || s.includes("PACK")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s.includes("OUT") || s.includes("DISPATCH")) {
      return "bg-teal-50 text-teal-700 border-teal-200";
    }
    if (s.includes("CANCEL") || s.includes("FAIL")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-amber-50 text-amber-800 border-amber-200";
  };

  return (
    <div className="flex flex-col h-full justify-between bg-slate-50/50">
      {/* Scrollable Content Container */}
      <div className="overflow-y-auto">
        {/* ================================================================= */}
        {/* SECTION A: Order Header */}
        {/* ================================================================= */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-3xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-base sm:text-lg font-black text-[#00875a] tracking-tight">
                  {order.orderNumber || order.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border tracking-wider ${getStatusBadgeStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                {loadingFresh && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-bold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin text-[#00875a]" />
                    <span>Syncing...</span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timestamps & Promised Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>
                Placed:{" "}
                <strong className="text-slate-800 font-semibold">
                  {formatOrderDateTime(order.orderPlacedAt || order.orderDate, order.orderTime)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                Expected delivery:{" "}
                <strong className="text-emerald-800 font-bold">
                  {formatOrderDateOnly(order.promisedDeliveryDate || order.orderDate)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Status Toast Messages */}
        {statusSuccess && (
          <div className="m-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-3xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{statusSuccess}</span>
          </div>
        )}

        {statusError && (
          <div className="m-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-3xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{statusError}</span>
          </div>
        )}

        {/* Status Confirmation Dialog Card */}
        {pendingStatus && (
          <div className="m-4 p-4 rounded-3xl bg-amber-50/90 border border-amber-300 shadow-sm animate-in fade-in zoom-in-95 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                  Confirm Status Transition
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Are you sure you want to transition this order status from{" "}
                  <strong>{order.status}</strong> to <strong>{pendingStatus}</strong>?
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-900 mb-1">
                Audit Note / Reason for Change:
              </label>
              <input
                type="text"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g. Packed at warehouse, dispatched with delivery driver"
                className="w-full px-3 py-1.5 rounded-xl border border-amber-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingStatus(null)}
                disabled={isUpdatingStatus}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isUpdatingStatus}
                className="px-4 py-1.5 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Confirm Transition</span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          {/* ================================================================= */}
          {/* SECTION B: Registered Customer Details (Account Owner) */}
          {/* ================================================================= */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-3xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Registered Customer / Account Owner
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Account that placed and authorized this order
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                ACCOUNT OWNER
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Registered Name
                </span>
                <p className="font-bold text-slate-900 text-sm">{regCustomer.name}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Registered Mobile
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {regCustomer.mobile || "Not Provided"}
                  </span>
                  {regCustomer.mobile && (
                    <button
                      type="button"
                      onClick={handleCopyCustomerPhone}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#00875a] hover:bg-emerald-50 transition-colors"
                      title="Copy customer phone"
                    >
                      {copiedCustomerPhone ? (
                        <Check className="w-3.5 h-3.5 text-[#00875a]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {regCustomer.customerPublicId && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Customer ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-[10px]">
                    {regCustomer.customerPublicId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCustomerId}
                    className="p-1 rounded text-slate-400 hover:text-[#00875a]"
                    title="Copy customer ID"
                  >
                    {copiedCustomerId ? (
                      <Check className="w-3 h-3 text-[#00875a]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION C: Delivery Recipient Details (CRITICAL) */}
          {/* ================================================================= */}
          <div className="rounded-3xl bg-white border border-emerald-200/90 p-4 shadow-3xs space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-[#00875a]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 tracking-tight">
                    Delivery Recipient &amp; Location
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Designated recipient for package handover and doorstep delivery
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                DELIVERY RECIPIENT
              </span>
            </div>

            {/* Recipient Identity & Call Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/80">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Recipient Name
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {recipient.name}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Recipient Phone (Delivery Calls Only)
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-900 text-sm">
                    {recipient.mobile || "Not Provided"}
                  </span>
                  {recipient.mobile && (
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${recipient.mobile}`}
                        className="px-2 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 transition shadow-3xs"
                        title="Click to call recipient"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyRecipientPhone}
                        className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Copy recipient phone"
                      >
                        {copiedRecipientPhone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-800" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address & Location */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#00875a] flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Complete Delivery Address
                    </span>
                    <p className="font-medium text-slate-800 leading-relaxed text-xs">
                      {deliveryAddress.fullAddress}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="p-1 rounded-lg text-slate-400 hover:text-[#00875a] hover:bg-emerald-50 transition-colors flex-shrink-0"
                  title="Copy full delivery address"
                >
                  {copiedAddress ? (
                    <Check className="w-3.5 h-3.5 text-[#00875a]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Delivery Zone & Pincode Pill Row */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                {deliveryAddress.zoneName && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#00875a]" />
                    <span>Zone: {deliveryAddress.zoneName}</span>
                  </span>
                )}
                {deliveryAddress.pincode && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold font-mono">
                    PIN: {deliveryAddress.pincode}
                  </span>
                )}
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 transition inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Google Maps</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION D: Order Items */}
          {/* ================================================================= */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-3xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Package className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-900 tracking-tight">
                  Order Items ({items.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Fresh Produce Items
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No items listed for this order.
                </div>
              ) : (
                items.map((item: any, idx: number) => {
                  const unit = item.unitOfMeasure || item.unit || "KG";
                  const qty = typeof item.quantity === "number" ? item.quantity : item.quantityKg || 1;
                  const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : item.pricePerKg || 0;
                  const totalPrice = typeof item.totalPrice === "number" ? item.totalPrice : unitPrice * qty;
                  const img = item.productImage || item.imageUrl || null;

                  return (
                    <div
                      key={item.id || item.orderItemPublicId || idx}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/80 rounded-2xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Correct Product Image rendering with fallback */}
                        <ProduceImage
                          name={item.productName}
                          productImage={img}
                          size={44}
                          className="rounded-2xl"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 text-xs truncate">
                            {item.productName}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            ₹{unitPrice} / {unit} • Qty:{" "}
                            <strong className="text-slate-700 font-bold">
                              {qty % 1 === 0 ? qty : qty.toFixed(3)} {unit}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          ₹{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION E: Payment Breakdown */}
          {/* ================================================================= */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-3xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00875a]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-900 tracking-tight">
                  Payment Breakdown
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Authoritative Pricing
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{Number(order.subtotal ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-mono font-bold text-slate-800">
                  {Number(order.deliveryCharge) > 0
                    ? `₹${Number(order.deliveryCharge).toFixed(2)}`
                    : "FREE (₹0.00)"}
                </span>
              </div>

              {Number(order.discount ?? order.discountAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Discount Applied</span>
                  <span className="font-mono font-bold">
                    -₹{Number(order.discount ?? order.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between font-black text-sm text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono text-base text-[#00875a]">
                  ₹{Number(order.totalAmount ?? order.amount ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Payment Method
                </span>
                <span className="font-bold text-slate-800">
                  {order.paymentMethod === "COD" || order.paymentMethod === "Cash on Delivery"
                    ? "Cash on Delivery (COD)"
                    : order.paymentMethod}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Payment Status
                </span>
                <span
                  className={`font-black uppercase text-[11px] ${
                    order.paymentStatus === "Paid" || order.paymentStatus === "COMPLETED"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION F: Order Status History */}
          {/* ================================================================= */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-3xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-900 tracking-tight">
                  Status Audit History
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Timeline
              </span>
            </div>

            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {(order.statusHistory && order.statusHistory.length > 0
                ? order.statusHistory
                : [
                    {
                      id: 1,
                      newStatus: order.status || "CONFIRMED",
                      timestamp: order.orderPlacedAt || new Date().toISOString(),
                      reason: "Order successfully recorded in system",
                      changedBy: "Customer App",
                    },
                  ]
              ).map((h: any, idx: number) => {
                const statusName = h.newStatus || h.status || "STATUS_CHANGE";
                const timeStr = formatOrderDateTime(h.timestamp || h.changedAt);
                return (
                  <div key={h.id || idx} className="relative">
                    <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-[#00875a] border-2 border-white ring-2 ring-emerald-100" />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                        {statusName.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {timeStr}
                      </span>
                    </div>
                    {h.reason && (
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {h.reason}
                      </p>
                    )}
                    {h.changedBy && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Actor: {h.changedBy}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION G: Bottom Drawer Actions Footer */}
      {/* ===================================================================== */}
      <div className="p-4 bg-white border-t border-slate-200/90 space-y-2.5 sticky bottom-0 z-20 shadow-lg">
        {/* Quick Status Transition Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-700 whitespace-nowrap">
            Update Status:
          </span>
          <select
            value={order.status}
            onChange={(e) => handleInitiateStatusChange(e.target.value as OrderStatus)}
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00875a]"
          >
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PACKED">PACKED</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Invoice and Delivery Label Printable Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Print Invoice */}
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-3xs transition hover:border-slate-300"
            title="Print Official Tax Invoice (Recipient Details Only)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Invoice</span>
          </button>

          {/* Download Invoice */}
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[#00875a] text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-3xs transition"
            title="Download Tax Invoice PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{invoiceDownloadSuccess ? "Saved!" : "Invoice PDF"}</span>
          </button>

          {/* Print Delivery Label */}
          <button
            type="button"
            onClick={handlePrintDeliveryLabel}
            className="px-2.5 py-2 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-3xs transition"
            title="Print Shipping Label for Packing & Delivery"
          >
            <Tag className="w-3.5 h-3.5 text-amber-700" />
            <span>Print Label</span>
          </button>

          {/* Download Delivery Label */}
          <button
            type="button"
            onClick={handleDownloadDeliveryLabel}
            className="px-2.5 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-3xs transition"
            title="Download Delivery Label PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{labelDownloadSuccess ? "Saved!" : "Label PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 1. Embedded Desktop Side Panel
export const OrderDetailsPanel: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  if (!order) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-3xs overflow-hidden flex flex-col max-h-[calc(100vh-140px)] sticky top-20 animate-in fade-in zoom-in-95 duration-200">
      <OrderDetailsContent
        order={order}
        onClose={onClose}
        onUpdateStatus={onUpdateStatus}
        isDrawer={false}
      />
    </div>
  );
};

// 2. Slide-over Drawer (for mobile / overlay)
interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <OrderDetailsContent
            order={order}
            onClose={onClose}
            onUpdateStatus={onUpdateStatus}
            isDrawer={true}
          />
        </div>
      </div>
    </div>
  );
};
