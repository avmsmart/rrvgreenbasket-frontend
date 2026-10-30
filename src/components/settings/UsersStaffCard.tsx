"use client";

import React from "react";
import { Users, Shield, Plus, Mail, Phone, CheckCircle2 } from "lucide-react";

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

export const UsersStaffCard: React.FC = () => {
  return (
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
          className="flex items-center gap-1.5 px-3 py-2 bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold rounded-xl transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <div className="space-y-3">
        {STAFF_MEMBERS.map((member) => (
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
    </div>
  );
};
