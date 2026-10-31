"use client";

import React from "react";
import { Users, Shield, Plus, Mail, Phone, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "Invited";
  avatar: string;
}

const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "1",
    name: "Karan",
    role: "Store Owner / Super Administrator",
    email: "karan@rrvgreenbasket.in",
    phone: "+91 98765 43210",
    status: "Active",
    avatar: "👑",
  },
  {
    id: "2",
    name: "Venkat R.",
    role: "Store Manager",
    email: "venkat@rrvgreenbasket.in",
    phone: "+91 98765 43211",
    status: "Active",
    avatar: "👨‍💼",
  },
  {
    id: "3",
    name: "Suresh K.",
    role: "Delivery Operations Lead",
    email: "suresh@rrvgreenbasket.in",
    phone: "+91 98765 43212",
    status: "Active",
    avatar: "🛵",
  },
  {
    id: "4",
    name: "Priya S.",
    role: "Mandi Procurement & Stock Manager",
    email: "priya@rrvgreenbasket.in",
    phone: "+91 98765 43213",
    status: "Active",
    avatar: "🌾",
  },
];

import { InviteStaffModal } from "./InviteStaffModal";

export const UsersStaffCard: React.FC = () => {
  const [staffList, setStaffList] = React.useState<StaffMember[]>(STAFF_MEMBERS);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  const handleStaffAdded = (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
  };

  return (
    <>
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">Store Staff & Role Permissions</h3>
            <p className="text-xs text-slate-500 font-medium">
              Manage administrative personnel with access to orders, stock adjustments, and settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold rounded-xl transition-colors self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Team Member</span>
          </button>
        </div>

        <div className="space-y-3">
          {staffList.map((member) => (
          <div
            key={member.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl flex-shrink-0 shadow-3xs">
                {member.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {member.name}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {member.email}
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {member.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {member.status}
              </span>
            </div>
          </div>
        ))}
      </div>

        {/* Security & Two-Factor Authentication (2FA) Configuration */}
        <div className="pt-5 border-t border-slate-200">
          <Security2FASection />
        </div>
      </div>

      {/* Invite Staff Dialog */}
      <InviteStaffModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onStaffAdded={handleStaffAdded}
      />
    </>
  );
};

const Security2FASection: React.FC = () => {
  const { is2FAEnabled, set2FAEnabled } = useAuth();

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-slate-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              Two-Factor Authentication (2FA)
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                is2FAEnabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {is2FAEnabled ? "Active & Enforced" : "Disabled (Optional)"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-xl">
            When turned ON, admins must enter a 6-digit Authenticator code (Google Authenticator / Microsoft Authenticator) after password verification. When turned OFF, admins sign in directly.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <button
          type="button"
          onClick={() => set2FAEnabled(!is2FAEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
            is2FAEnabled ? "bg-[#00875a]" : "bg-slate-300"
          }`}
          aria-label="Toggle 2FA requirement"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              is2FAEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
