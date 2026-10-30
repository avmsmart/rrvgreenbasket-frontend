"use client";

import React from "react";
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
  Edit2,
  ChevronRight,
} from "lucide-react";
import { Customer } from "@/types";

interface CustomerDetailsDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onToggleStatus: (id: string) => void;
}

export const CustomerDetailsDrawer: React.FC<CustomerDetailsDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}) => {
  if (!isOpen || !customer) return null;

  const initial = customer.name.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#00875a] text-white flex items-center justify-center font-bold text-base shadow-3xs">
                {initial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 truncate max-w-[180px]">
                    {customer.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      customer.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Joined: {customer.joinedOn}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-medium text-slate-500 block">Total Orders</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {customer.totalOrders}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[11px] font-medium text-emerald-800 block">Total Spent</span>
                <span className="text-xl font-black text-emerald-800 mt-1 block">
                  ₹ {customer.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Contact & Address
              </h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-emerald-700 hover:underline font-mono font-medium"
                  >
                    {customer.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700">{customer.email}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="text-slate-600 leading-relaxed">
                    <p>{customer.address || "12, Green Street, Kurnool"}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {customer.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recent Orders ({customer.recentOrders?.length || 0})
              </h3>

              {customer.recentOrders && customer.recentOrders.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs">
                  {customer.recentOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800">
                          {ord.orderId}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {ord.date} • {ord.itemsCount} items
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">
                          ₹{ord.amount}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 inline-block mt-0.5">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No recent order records</p>
              )}
            </div>

          </div>

          {/* Sticky Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onToggleStatus(customer.id);
                  onClose();
                }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  customer.status === "Active"
                    ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {customer.status === "Active" ? "Mark Inactive" : "Mark Active"}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] shadow-3xs transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Customer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
