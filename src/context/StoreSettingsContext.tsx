"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { PublicStoreSettings } from "@/types";
import { storeService } from "@/services/store.service";

const STORAGE_KEY = "rrv_public_store_settings";
const ADMIN_STORAGE_KEY = "rrv_store_settings_v1";

export const DEFAULT_PUBLIC_STORE_SETTINGS: PublicStoreSettings = {
  storeName: "RRV Green Basket",
  brandTagline: "Freshness Delivered Daily",
  supportEmail: "rrvgreenbasket@gmail.com",
  supportPhone: "+91 8978040537",
  physicalAddress: "Kurnool, Andhra Pradesh, India",
  websiteUrl: "https://www.rrvgreenbasket.in",
  logoUrl: null,
  faviconUrl: null,
};

export interface StoreSettingsContextType {
  settings: PublicStoreSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<PublicStoreSettings>;
  updateLocalSettings: (updated: Partial<PublicStoreSettings>) => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: DEFAULT_PUBLIC_STORE_SETTINGS,
  isLoading: false,
  refreshSettings: async () => DEFAULT_PUBLIC_STORE_SETTINGS,
  updateLocalSettings: () => {},
});

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<PublicStoreSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_PUBLIC_STORE_SETTINGS, ...parsed };
        }
        const adminStored = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (adminStored) {
          const adminParsed = JSON.parse(adminStored);
          return {
            ...DEFAULT_PUBLIC_STORE_SETTINGS,
            storeName: adminParsed.storeName || DEFAULT_PUBLIC_STORE_SETTINGS.storeName,
            brandTagline: adminParsed.tagline || DEFAULT_PUBLIC_STORE_SETTINGS.brandTagline,
            supportEmail: adminParsed.supportEmail || DEFAULT_PUBLIC_STORE_SETTINGS.supportEmail,
            supportPhone: adminParsed.supportPhone || DEFAULT_PUBLIC_STORE_SETTINGS.supportPhone,
            physicalAddress: adminParsed.address || DEFAULT_PUBLIC_STORE_SETTINGS.physicalAddress,
            websiteUrl: adminParsed.websiteUrl || DEFAULT_PUBLIC_STORE_SETTINGS.websiteUrl,
            logoUrl: adminParsed.platformLogo || null,
            faviconUrl: adminParsed.appFavicon || null,
          };
        }
      } catch {
        // use default
      }
    }
    return DEFAULT_PUBLIC_STORE_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);

  // Synchronize dynamic favicon in browser tab
  const applyFavicon = useCallback((url?: string | null) => {
    if (typeof document === "undefined") return;
    try {
      const link: HTMLLinkElement =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = url || "/favicon.ico";
      if (!document.head.contains(link)) {
        document.head.appendChild(link);
      }
    } catch {
      // Ignore DOM errors
    }
  }, []);

  const refreshSettings = useCallback(async (): Promise<PublicStoreSettings> => {
    if (isFetchingRef.current) return settings;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const fetched = await storeService.getPublicSettings();
      if (fetched && typeof fetched === "object" && fetched.storeName) {
        const merged: PublicStoreSettings = {
          storeName: fetched.storeName || DEFAULT_PUBLIC_STORE_SETTINGS.storeName,
          brandTagline: fetched.brandTagline || DEFAULT_PUBLIC_STORE_SETTINGS.brandTagline,
          supportEmail: fetched.supportEmail || DEFAULT_PUBLIC_STORE_SETTINGS.supportEmail,
          supportPhone: fetched.supportPhone || DEFAULT_PUBLIC_STORE_SETTINGS.supportPhone,
          physicalAddress: fetched.physicalAddress || DEFAULT_PUBLIC_STORE_SETTINGS.physicalAddress,
          websiteUrl: fetched.websiteUrl || DEFAULT_PUBLIC_STORE_SETTINGS.websiteUrl,
          logoUrl: fetched.logoUrl || null,
          faviconUrl: fetched.faviconUrl || null,
        };

        setSettings(merged);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // storage quota
          }
        }

        applyFavicon(merged.faviconUrl);
        return merged;
      }
    } catch (err) {
      console.warn("[StoreSettingsProvider] Public endpoint unreachable, checking local store:", err);
      if (typeof window !== "undefined") {
        try {
          const adminStored = localStorage.getItem(ADMIN_STORAGE_KEY);
          if (adminStored) {
            const adminParsed = JSON.parse(adminStored);
            const fallback: PublicStoreSettings = {
              storeName: adminParsed.storeName || DEFAULT_PUBLIC_STORE_SETTINGS.storeName,
              brandTagline: adminParsed.tagline || DEFAULT_PUBLIC_STORE_SETTINGS.brandTagline,
              supportEmail: adminParsed.supportEmail || DEFAULT_PUBLIC_STORE_SETTINGS.supportEmail,
              supportPhone: adminParsed.supportPhone || DEFAULT_PUBLIC_STORE_SETTINGS.supportPhone,
              physicalAddress: adminParsed.address || DEFAULT_PUBLIC_STORE_SETTINGS.physicalAddress,
              websiteUrl: adminParsed.websiteUrl || DEFAULT_PUBLIC_STORE_SETTINGS.websiteUrl,
              logoUrl: adminParsed.platformLogo || null,
              faviconUrl: adminParsed.appFavicon || null,
            };
            setSettings(fallback);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
            applyFavicon(fallback.faviconUrl);
            return fallback;
          }
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }

    return settings;
  }, [settings, applyFavicon]);

  const updateLocalSettings = useCallback((updated: Partial<PublicStoreSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...updated };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
      if (updated.faviconUrl !== undefined) {
        applyFavicon(updated.faviconUrl);
      }
      return merged;
    });
  }, [applyFavicon]);

  useEffect(() => {
    refreshSettings();

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<PublicStoreSettings>>;
      if (customEvent.detail) {
        updateLocalSettings(customEvent.detail);
      } else {
        refreshSettings();
      }
    };

    const handleAdminSync = () => {
      if (typeof window !== "undefined") {
        try {
          const adminStored = localStorage.getItem(ADMIN_STORAGE_KEY);
          if (adminStored) {
            const adminParsed = JSON.parse(adminStored);
            updateLocalSettings({
              storeName: adminParsed.storeName,
              brandTagline: adminParsed.tagline,
              supportEmail: adminParsed.supportEmail,
              supportPhone: adminParsed.supportPhone,
              physicalAddress: adminParsed.address,
              websiteUrl: adminParsed.websiteUrl,
              logoUrl: adminParsed.platformLogo,
              faviconUrl: adminParsed.appFavicon,
            });
          }
        } catch {
          // ignore
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings(parsed);
          applyFavicon(parsed.faviconUrl);
        } catch {
          // ignore
        }
      } else if (e.key === ADMIN_STORAGE_KEY && e.newValue) {
        handleAdminSync();
      }
    };

    window.addEventListener("rrv:store-settings:changed", handleSync);
    window.addEventListener("rrv:settings:updated", handleAdminSync);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("rrv:store-settings:changed", handleSync);
      window.removeEventListener("rrv:settings:updated", handleAdminSync);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshSettings, updateLocalSettings, applyFavicon]);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
        updateLocalSettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
