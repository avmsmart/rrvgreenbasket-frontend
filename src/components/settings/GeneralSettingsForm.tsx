"use client";

import React, { useRef, useState } from "react";
import { StoreSettings } from "@/types/settings";
import {
  Store,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { storeService, StoreApiError } from "@/services/store.service";

interface GeneralSettingsFormProps {
  settings: StoreSettings;
  onChange: (updated: Partial<StoreSettings>) => void;
  onRefresh?: () => void;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  settings,
  onChange,
  onRefresh,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isDeletingFavicon, setIsDeletingFavicon] = useState(false);
  const [assetMessage, setAssetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setAssetMessage({ text, type });
    setTimeout(() => setAssetMessage(null), 3500);
  };

  // Upload Logo (API 16)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const res = await storeService.uploadLogo(file);
      const url = res?.logoUrl || res?.assetUrl;
      if (url) {
        onChange({ platformLogo: url });
        showMsg("Logo uploaded successfully!", "success");
        // Dispatch global sync event
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("rrv:store-settings:changed", {
              detail: { logoUrl: url },
            })
          );
        }
        if (onRefresh) onRefresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof StoreApiError ? err.message : "Failed to upload logo";
      showMsg(msg, "error");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Delete Logo (API 18)
  const handleDeleteLogo = async () => {
    if (!confirm("Are you sure you want to remove the platform logo?")) return;

    setIsDeletingLogo(true);
    try {
      await storeService.deleteLogo();
      onChange({ platformLogo: "" });
      showMsg("Platform logo removed successfully", "success");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("rrv:store-settings:changed", {
            detail: { logoUrl: null },
          })
        );
      }
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof StoreApiError ? err.message : "Failed to remove logo";
      showMsg(msg, "error");
    } finally {
      setIsDeletingLogo(false);
    }
  };

  // Upload Favicon (API 17)
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    try {
      const res = await storeService.uploadFavicon(file);
      const url = res?.faviconUrl || res?.assetUrl;
      if (url) {
        onChange({ appFavicon: url });
        showMsg("Favicon uploaded successfully!", "success");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("rrv:store-settings:changed", {
              detail: { faviconUrl: url },
            })
          );
        }
        if (onRefresh) onRefresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof StoreApiError ? err.message : "Failed to upload favicon";
      showMsg(msg, "error");
    } finally {
      setIsUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  // Delete Favicon (API 19)
  const handleDeleteFavicon = async () => {
    if (!confirm("Are you sure you want to remove the app favicon?")) return;

    setIsDeletingFavicon(true);
    try {
      await storeService.deleteFavicon();
      onChange({ appFavicon: "" });
      showMsg("App favicon removed successfully", "success");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("rrv:store-settings:changed", {
            detail: { faviconUrl: null },
          })
        );
      }
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof StoreApiError ? err.message : "Failed to remove favicon";
      showMsg(msg, "error");
    } finally {
      setIsDeletingFavicon(false);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-3xs space-y-6">
      {/* Toast message for asset actions */}
      {assetMessage && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-bold ${
            assetMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {assetMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{assetMessage.text}</span>
        </div>
      )}

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
              required
              value={settings.storeName}
              onChange={(e) => onChange({ storeName: e.target.value })}
              placeholder="e.g. RRV Green Basket"
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
              placeholder="e.g. support@rrvgreenbasket.in"
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
              placeholder="e.g. +91 98765 43210"
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
              placeholder="e.g. Kurnool, Andhra Pradesh, India"
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
              placeholder="e.g. https://www.rrvgreenbasket.in"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00875a]/20"
            />
          </div>
        </div>
      </div>

      {/* Brand Assets Upload (APIs 16-19) */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Brand Logo & Favicon</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Platform Logo */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
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
                <p className="text-[10px] text-slate-400">PNG, JPG, SVG, max 2MB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                disabled={isUploadingLogo || isDeletingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-3xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploadingLogo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploadingLogo ? "Uploading..." : "Upload"}</span>
              </button>

              {settings.platformLogo && (
                <button
                  type="button"
                  disabled={isUploadingLogo || isDeletingLogo}
                  onClick={handleDeleteLogo}
                  title="Delete Logo"
                  className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 shadow-3xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeletingLogo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Favicon */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-3xs">
                {settings.appFavicon ? (
                  <img
                    src={settings.appFavicon}
                    alt="Favicon"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-xl">🌿</span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900">App Favicon</span>
                <p className="text-[10px] text-slate-400">ICO or PNG, max 2MB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,image/x-icon,image/png"
                className="hidden"
                onChange={handleFaviconUpload}
              />
              <button
                type="button"
                disabled={isUploadingFavicon || isDeletingFavicon}
                onClick={() => faviconInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-3xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploadingFavicon ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploadingFavicon ? "Uploading..." : "Upload"}</span>
              </button>

              {settings.appFavicon && (
                <button
                  type="button"
                  disabled={isUploadingFavicon || isDeletingFavicon}
                  onClick={handleDeleteFavicon}
                  title="Delete Favicon"
                  className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 shadow-3xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeletingFavicon ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
