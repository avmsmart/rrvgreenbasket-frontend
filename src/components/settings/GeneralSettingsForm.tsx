"use client";

import React, { useRef } from "react";
import { StoreSettings } from "@/types/settings";
import { Store, Upload, Globe, Mail, Phone, MapPin, Image as ImageIcon } from "lucide-react";

interface GeneralSettingsFormProps {
  settings: StoreSettings;
  onChange: (updated: Partial<StoreSettings>) => void;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  settings,
  onChange,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange({ platformLogo: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900">General Information</h3>
        <p className="text-xs text-slate-500 font-medium">
          Basic brand identities, contact details, and platform assets shown across the website & mobile app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Store Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Store / Platform Name *
          </label>
          <div className="relative">
            <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => onChange({ storeName: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Brand Tagline
          </label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g. Freshness Delivered Daily"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Support Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Support Helpline Phone
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) => onChange({ supportPhone: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Store Physical / Dispatch Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>
        </div>

        {/* Website */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Website Domain URL
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={settings.websiteUrl || ""}
              onChange={(e) => onChange({ websiteUrl: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>
        </div>
      </div>

      {/* Brand Assets Upload */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Brand Platform Logo</h4>
        <div className="max-w-md p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-3xs">
              {settings.platformLogo ? (
                <img
                  src={settings.platformLogo}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Platform Logo</span>
              <p className="text-[10px] text-slate-400">PNG or SVG, max 2MB</p>
            </div>
          </div>

          <div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-3xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
