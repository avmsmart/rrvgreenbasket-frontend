import { apiClient } from "./api-client";
import { StoreSettings } from "@/types";
import { MOCK_STORE_SETTINGS_DATA } from "@/data";

export const settingsService = {
  /**
   * Fetch store operating settings and configuration
   */
  async getSettings(): Promise<StoreSettings> {
    return apiClient.get<StoreSettings>(
      "/admin/settings",
      {},
      MOCK_STORE_SETTINGS_DATA
    );
  },

  /**
   * Update store configuration
   */
  async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const updated: StoreSettings = {
      ...MOCK_STORE_SETTINGS_DATA,
      ...updates,
    };

    return apiClient.put<StoreSettings>(
      "/admin/settings",
      updates,
      {},
      updated
    );
  },

  /**
   * Quick update store night order cutoff time (e.g. 10:00 PM)
   */
  async updateOrderCutoffTime(orderCutoffTime: string): Promise<StoreSettings> {
    return this.updateSettings({ orderCutoffTime });
  },
};
