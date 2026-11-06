"use client";

import React, { useState } from "react";
import { X, Plus, Ticket, CheckCircle2 } from "lucide-react";
import { Coupon, CouponDiscountType } from "@/types/coupon";

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCouponCreated: (coupon: Coupon) => void;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen,
  onClose,
  onCouponCreated,
}) => {
  const [code, setCode] = useState("");
  const [offerName, setOfferName] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">(10);
  const [minOrder, setMinOrder] = useState<number | "">(199);
  const [maxUsage, setMaxUsage] = useState<number | "">(500);
  const [validTill, setValidTill] = useState("30 Aug 2025");
  const [status, setStatus] = useState<Coupon["status"]>("Active");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !offerName) return;

    let discountText = "";
    if (discountType === "percentage") {
      discountText = `${discountValue}% OFF`;
    } else if (discountType === "fixed") {
      discountText = `₹${discountValue} OFF`;
    } else {
      discountText = "Free Shipping";
    }

    const created: Coupon = {
      id: `CPN-${Date.now()}`,
      code: code.toUpperCase().trim(),
      offerName,
      discount: discountText,
      discountType,
      discountValue: Number(discountValue) || 0,
      minOrder: Number(minOrder) || 199,
      maxUsage: Number(maxUsage) || 500,
      currentUsage: 0,
      usage: `0 / ${maxUsage || 500}`,
      validTill,
      status,
      description: description || `${discountText} on orders above ₹${minOrder}`,
      totalSaved: 0,
    };

    onCouponCreated(created);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCode("");
      setOfferName("");
      setDescription("");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Create New Promotional Coupon
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Set discount rules, usage limits, and storefront validity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-3xs transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-2 animate-in fade-in my-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00875a] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-black text-slate-900">Coupon Created!</h4>
            <p className="text-xs text-slate-500">
              Code <span className="font-mono font-bold text-[#00875a]">{code.toUpperCase()}</span> is now live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Welcome Offer"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as CouponDiscountType)}
                    className="w-full px-2.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    disabled={discountType === "free_shipping"}
                    placeholder="10"
                    value={discountType === "free_shipping" ? "" : discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-black text-emerald-900 bg-emerald-50/60 border border-emerald-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min. Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="199"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valid Till Date
                  </label>
                  <input
                    type="text"
                    placeholder="30 Aug 2025"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Coupon["status"])}
                    className="w-full px-2.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Valid on all vegetable orders above ₹199"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00875a] hover:bg-[#00734d] text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
