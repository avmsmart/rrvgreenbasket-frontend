"use client";

import React, { useState, useEffect } from "react";
import { Users, Shield, Plus, Mail, Phone, CheckCircle2, QrCode, Copy, Check, X } from "lucide-react";
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
  const { is2FAEnabled, set2FAEnabled, getTotpSetup } = useAuth();
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string>("");
  const [formattedSecret, setFormattedSecret] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (showQrModal && !qrDataUrl) {
      getTotpSetup().then((info) => {
        setQrDataUrl(info.qrDataUrl);
        setSecretKey(info.secret);
        setFormattedSecret(info.formattedSecret);
      });
    }
  }, [showQrModal, qrDataUrl, getTotpSetup]);

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-slate-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#00875a] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                Google Authenticator (TOTP) 2FA
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
              When enabled, the administrator must enter the rotating 6-digit verification code from Google Authenticator upon login. When disabled, the admin logs in directly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {is2FAEnabled && (
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-[#00875a]" />
              <span>View QR Code</span>
            </button>
          )}

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

      {/* QR Code Setup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875a] flex items-center justify-center mx-auto mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Google Authenticator Setup
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan this QR code in Google Authenticator or any TOTP authenticator app.
              </p>
            </div>

            {/* QR Code */}
            {qrDataUrl ? (
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="Google Authenticator QR Code"
                    className="w-48 h-48 object-contain rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                <QrCode className="w-8 h-8 animate-pulse" />
              </div>
            )}

            {/* Secret Key manual entry */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Manual Entry Secret Key:
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                  {formattedSecret || secretKey}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00875a]" />
                    <span className="text-[#00875a]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
