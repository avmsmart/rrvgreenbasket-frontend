"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Clock,
  Globe,
  Leaf,
  Bell,
  Check,
  CheckCircle2,
} from "lucide-react";
import {
  CustomerSettings,
  getStoredSettings,
  saveStoredSettings,
} from "@/data/customer-profile-mock";

export const CustomerAccountSettings: React.FC = () => {
  const [settings, setSettings] = useState<CustomerSettings>(getStoredSettings());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSettings(settings);
    setSuccessMessage("Account preferences saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Settings className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Account Settings
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Customize your preferred delivery times, language, and zero-plastic eco packaging
          </p>
        </div>

        {successMessage && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Delivery & Language Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Preferred Delivery Slot</span>
              </label>
              <select
                value={settings.deliverySlot}
                onChange={(e) =>
                  setSettings({ ...settings, deliverySlot: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              >
                <option value="Early Morning (6:00 AM - 8:00 AM)">
                  Early Morning (6:00 AM - 8:00 AM)
                </option>
                <option value="Morning (8:00 AM - 11:00 AM)">
                  Morning (8:00 AM - 11:00 AM)
                </option>
                <option value="Evening (5:00 PM - 8:00 PM)">
                  Evening (5:00 PM - 8:00 PM)
                </option>
              </select>
              <p className="mt-1 text-[11px] text-gray-400">
                Default time slot automatically chosen during checkout
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>App &amp; Communication Language</span>
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              >
                <option value="English">English</option>
                <option value="हिन्दी (Hindi)">हिन्दी (Hindi)</option>
                <option value="తెలుగు (Telugu)">తెలుగు (Telugu)</option>
                <option value="தமிழ் (Tamil)">தமிழ் (Tamil)</option>
                <option value="ಕನ್ನಡ (Kannada)">ಕನ್ನಡ (Kannada)</option>
              </select>
              <p className="mt-1 text-[11px] text-gray-400">
                Preferred language for delivery SMS, WhatsApp messages and receipts
              </p>
            </div>
          </div>

          <div className="my-2 border-t border-gray-100" />

          {/* Eco-Friendly Packaging Toggle */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <Leaf className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">
                    Zero-Plastic Packaging Initiative
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed max-w-xl">
                    Opt-in to receive all vegetables and fruits packed in reusable breathable cotton pouches and corrugated recycled paper baskets. No plastic wraps will be used.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={settings.zeroPlastic}
                  onChange={(e) =>
                    setSettings({ ...settings, zeroPlastic: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
              </label>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Notification Channels
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50/50 transition">
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    WhatsApp Order Updates
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Receive morning harvest dispatch notifications and live delivery links on WhatsApp
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.whatsappNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsappNotifications: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded text-emerald-700 focus:ring-emerald-500 border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50/50 transition">
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    SMS Status Updates
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Get delivery partner arrival OTP and billing SMS
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smsUpdates}
                  onChange={(e) =>
                    setSettings({ ...settings, smsUpdates: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-emerald-700 focus:ring-emerald-500 border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50/50 transition">
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Weekly Harvest &amp; Seasonal Offers Email
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Get notified about new seasonal arrivals and weekly harvest discounts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailPromotions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailPromotions: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded text-emerald-700 focus:ring-emerald-500 border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 border-t border-gray-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerAccountSettings;
