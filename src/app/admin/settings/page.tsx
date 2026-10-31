"use client";

import React, { useState, useEffect } from "react";
import { Check, CheckCircle2, RotateCcw, Save } from "lucide-react";
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
  DeliveryPaymentCard,
} from "@/components/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS_DATA);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getSavedSettings());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getSavedSettings());
      }
    };

    window.addEventListener("rrv:settings:updated", handleSync);
    return () => {
      window.removeEventListener("rrv:settings:updated", handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePartialUpdate = (updated: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updated };
      if ("platformLogo" in updated) {
        saveSettings(next);
        showToast("Brand logo uploaded and updated across the dashboard!");
      } else if ("businessHours" in updated) {
        saveSettings(next);
        showToast("Business operating hours updated and synchronized!");
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveSettings(settings);
      setIsSaving(false);
      setHasChanges(false);
      showToast("Store settings saved and synchronized across all pages!");
    }, 350);
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default values?")) {
      setSettings(INITIAL_SETTINGS_DATA);
      saveSettings(INITIAL_SETTINGS_DATA);
      setHasChanges(false);
      showToast("Settings reset to defaults.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure store information, operating hours, order rules, delivery, payment, and security preferences.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-600 rounded-xl text-xs sm:text-sm font-bold shadow-3xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
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
        <GeneralSettingsForm settings={settings} onChange={handlePartialUpdate} />
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
    </div>
  );
}
