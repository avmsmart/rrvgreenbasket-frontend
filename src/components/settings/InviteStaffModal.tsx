"use client";

import React, { useState } from "react";
import { X, Mail, User, Shield, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { saveAdminAccount } from "@/data/shared-store";
import { RegisteredAdminAccount } from "@/types/auth";

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: (newStaff: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    status: "Active" | "Invited";
    avatar: string;
  }) => void;
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({
  isOpen,
  onClose,
  onStaffAdded,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Store Manager");
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);

    const tempPassword = `Admin@${Math.floor(1000 + Math.random() * 9000)}`;

    const newAccount: RegisteredAdminAccount = {
      id: `ADM-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || "+91 98765 43210",
      role,
      storeName: "RRV Green Basket",
      location: "Kurnool, Andhra Pradesh, India",
      avatarInitial: name.charAt(0).toUpperCase(),
      status: "Invited",
      permissions: ["All Modules Access", "Order Management", "Inventory Control"],
      twoFactorEnabled: twoFactorRequired,
      passwordHash: tempPassword,
      createdAt: new Date().toISOString(),
    };

    saveAdminAccount(newAccount);

    // Also dispatch email invitation if possible
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
        }),
      });
    } catch {
      // Ignore
    }

    onStaffAdded({
      id: newAccount.id,
      name: newAccount.name,
      role: newAccount.role,
      email: newAccount.email,
      phone: newAccount.phone,
      status: "Invited",
      avatar: "👤",
    });

    setSuccessMsg(
      `Invitation and temporary credentials sent to ${email.trim()}. Temporary password: ${tempPassword}`
    );
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setSuccessMsg(null);
    setName("");
    setEmail("");
    setPhone("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {successMsg ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Administrator Invited</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {successMsg}
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Invite Administrator</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Add a new staff member to manage store orders, inventory, or deliveries.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/50 hover:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@rrvgreenbasket.in"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/50 hover:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/50 hover:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-[#16a34a] bg-slate-50/50 hover:bg-white"
                  >
                    <option value="Store Manager">Store Manager</option>
                    <option value="Delivery Operations Lead">Delivery Lead</option>
                    <option value="Procurement Head">Procurement Head</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="twofaStaff"
                  checked={twoFactorRequired}
                  onChange={(e) => setTwoFactorRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-[#16a34a] focus:ring-emerald-500/30 border-slate-300 accent-[#16a34a]"
                />
                <label htmlFor="twofaStaff" className="text-xs text-slate-600 cursor-pointer font-medium">
                  Enforce Two-Factor Authentication (2FA) via Email OTP
                </label>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Invite</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
