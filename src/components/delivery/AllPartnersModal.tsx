"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Users,
  Search,
  Phone,
  Bike,
  Star,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { DeliveryPartner } from "@/types";

interface AllPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: DeliveryPartner[];
  onSelectPartner: (partner: DeliveryPartner) => void;
}

export const AllPartnersModal: React.FC<AllPartnersModalProps> = ({
  isOpen,
  onClose,
  partners,
  onSelectPartner,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Online" | "Offline">("All");

  if (!isOpen) return null;

  const filteredPartners = partners.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.area.toLowerCase().includes(q) ||
      (p.vehicleDetails && p.vehicleDetails.toLowerCase().includes(q))
    );
  });

  const onlineCount = partners.filter((p) => p.status === "Online").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eefcf2] text-[#00875a] flex items-center justify-center shadow-3xs">
              <Users className="w-5 h-5 text-[#00875a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  All Delivery Partners
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  {onlineCount}/{partners.length} Online
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active riders fleet and real-time delivery status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/delivery-partners"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#00875a] bg-white hover:bg-emerald-50 border border-emerald-200 transition-colors shadow-3xs"
            >
              <span>Full Management</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rider name, phone, area, vehicle..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            {(["All", "Online", "Offline"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === s
                    ? "bg-white text-slate-900 shadow-3xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Partners Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto max-h-[60vh]">
          {filteredPartners.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No delivery partners found</p>
              <p className="text-xs text-slate-400 mt-1">Try another search or status filter</p>
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const initial = partner.name.charAt(0);
              const isOnline = partner.status === "Online";

              return (
                <div
                  key={partner.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#00875a]/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-200">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {partner.name}
                          </h4>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <a
                          href={`tel:${partner.phone}`}
                          className="text-[11px] font-mono text-slate-500 hover:text-emerald-700 flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{partner.phone}</span>
                        </a>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        isOnline
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {partner.status}
                    </span>
                  </div>

                  {/* Details stats */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50/70 rounded-xl text-center text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">Done</span>
                      <span className="font-extrabold text-slate-800">{partner.totalDeliveries}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">Pending</span>
                      <span className="font-extrabold text-amber-700">{partner.pendingDeliveries}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">Rating</span>
                      <span className="font-extrabold text-emerald-700 flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        {partner.rating}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle & Area */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 truncate max-w-[140px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{partner.area}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPartner(partner);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#00875a] bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Filter Orders
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Click &ldquo;Filter Orders&rdquo; on any partner to see only their assigned deliveries.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
