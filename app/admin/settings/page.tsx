"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, RotateCcw, Save, AlertCircle } from "lucide-react";
import { StoreSettings } from "@/types/settings";
import {
  getSavedSettings,
  saveSettings,
  INITIAL_SETTINGS_DATA,
} from "@/data/shared-store";
import {
  SettingsTabsNav,
  SettingsTabId,
  GeneralSettingsForm,
  BusinessHoursCard,
  OrderInventoryRulesCard,
  CurrencyRegionalCard,
  DeliveryPaymentCard,
  UsersStaffCard,
} from "@/components/settings";
import { storeService, StoreApiError } from "@/services/store.service";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS_DATA);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadBackendSettings = useCallback(async () => {
    try {
      const adminData = await storeService.getAdminSettings();
      if (adminData && adminData.storeName) {
        setSettings((prev) => ({
          ...prev,
          storeName: adminData.storeName,
          tagline: adminData.brandTagline || prev.tagline,
          supportEmail: adminData.supportEmail || prev.supportEmail,
          supportPhone: adminData.supportPhone || prev.supportPhone,
          address: adminData.physicalAddress || prev.address,
          websiteUrl: adminData.websiteUrl || prev.websiteUrl,
          platformLogo: adminData.logoUrl || prev.platformLogo,
          appFavicon: adminData.faviconUrl || prev.appFavicon,
        }));
      }
    } catch {
      // Fallback to local stored configuration if backend is initializing
      setSettings(getSavedSettings());
    }
  }, []);

  useEffect(() => {
    loadBackendSettings();

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      if (customEvent.detail) {
        setSettings((prev) => ({ ...prev, ...customEvent.detail }));
      }
    };

    window.addEventListener("rrv:settings:updated", handleSync);
    return () => {
      window.removeEventListener("rrv:settings:updated", handleSync);
    };
  }, [loadBackendSettings]);

  const handlePartialUpdate = (updated: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Call Backend Store Service API 15 (PUT /api/admin/store/settings)
      await storeService.updateSettings({
        storeName: settings.storeName,
        brandTagline: settings.tagline,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        physicalAddress: settings.address,
        websiteUrl: settings.websiteUrl,
      });

      // 2. Persist full settings in shared-store and dispatch global events
      saveSettings(settings);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("rrv:store-settings:changed", {
            detail: {
              storeName: settings.storeName,
              brandTagline: settings.tagline,
              supportEmail: settings.supportEmail,
              supportPhone: settings.supportPhone,
              physicalAddress: settings.address,
              websiteUrl: settings.websiteUrl,
              logoUrl: settings.platformLogo,
              faviconUrl: settings.appFavicon,
            },
          })
        );
      }

      setHasChanges(false);
      showToast("Store settings saved and synchronized across the entire platform!", "success");
    } catch (err: unknown) {
      // If backend network error, still save locally and inform user
      saveSettings(settings);
      const msg = err instanceof StoreApiError ? err.message : "Saved locally (Backend Store Service connection pending)";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default values?")) {
      setSettings(INITIAL_SETTINGS_DATA);
      saveSettings(INITIAL_SETTINGS_DATA);
      setHasChanges(false);
      showToast("Settings reset to defaults.", "success");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-20 right-6 z-50 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border animate-in fade-in slide-in-from-top-3 ${
            toastMsg.type === "success"
              ? "bg-slate-900 text-white border-slate-700"
              : "bg-rose-950 text-white border-rose-800"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure store branding, contact details, operating hours, and order rules.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-600 rounded-xl text-xs sm:text-sm font-bold shadow-3xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
              hasChanges
                ? "bg-[#00875a] hover:bg-[#00704a] text-white animate-pulse"
                : "bg-[#00875a] hover:bg-[#00704a] text-white"
            }`}
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Tab Navigation */}
      <SettingsTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === "general" && (
        <GeneralSettingsForm
          settings={settings}
          onChange={handlePartialUpdate}
          onRefresh={loadBackendSettings}
        />
      )}

      {activeTab === "hours" && (
        <BusinessHoursCard settings={settings} onChange={handlePartialUpdate} />
      )}

      {activeTab === "rules" && (
        <OrderInventoryRulesCard settings={settings} onChange={handlePartialUpdate} />
      )}

      {activeTab === "delivery_payment" && (
        <DeliveryPaymentCard settings={settings} onChange={handlePartialUpdate} />
      )}

      {activeTab === "regional" && (
        <CurrencyRegionalCard settings={settings} onChange={handlePartialUpdate} />
      )}

      {activeTab === "staff" && <UsersStaffCard />}
    </div>
  );
}
