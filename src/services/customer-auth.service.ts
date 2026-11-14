
import {
  CustomerUser,
  CustomerRegisterSendOtpRequest,
  CustomerRegisterVerifyOtpRequest,
  CustomerLoginSendOtpRequest,
  CustomerLoginVerifyOtpRequest,
  OtpDispatchData,
  CustomerAuthData,
  CustomerLogoutData,
} from "@/types/customer-auth";

const CUSTOMER_ACCESS_TOKEN_KEY = "rrv_customer_access_token";
const CUSTOMER_REFRESH_TOKEN_KEY = "rrv_customer_refresh_token";
const CUSTOMER_USER_KEY = "rrv_customer_user";
const CUSTOMER_TOKEN_TYPE_KEY = "rrv_customer_token_type";
const CUSTOMER_EXPIRES_AT_KEY = "rrv_customer_expires_at";

export class CustomerAuthError extends Error {
  public statusCode: number;
  public retryAfterSeconds?: number;
  public data?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    retryAfterSeconds?: number,
    data?: unknown
  ) {
    super(message);
    this.name = "CustomerAuthError";
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
    this.data = data;
  }
}

/**
 * Normalizes an Indian mobile number into E.164 format.
 */
export function normalizeMobileNumber(input: string): string {
  const cleaned = input.trim();
  const digits = cleaned.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (cleaned.startsWith("+") && digits.length >= 10) {
    return `+${digits}`;
  }

  return cleaned;
}

/**
 * Customer token storage.
 * Kept strictly separate from admin authentication.
 */
export const customerTokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      const candidates = [
        localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY),
        localStorage.getItem("rrv_customer_access_token"),
        localStorage.getItem("rrv_green_basket_auth_token"),
        localStorage.getItem("token"),
        localStorage.getItem("accessToken"),
        localStorage.getItem("customer_token"),
      ];

      for (const t of candidates) {
        if (
          t &&
          typeof t === "string" &&
          t.trim().length > 0 &&
          t !== "undefined" &&
          t !== "null"
        ) {
          return t.replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "").trim();
        }
      }

      // Check cookie fallback if localStorage was somehow empty
      if (typeof document !== "undefined" && document.cookie) {
        const match = document.cookie.match(new RegExp(`(^|;\\s*)${CUSTOMER_ACCESS_TOKEN_KEY}=([^;]+)`));
        if (match && match[2]) {
          const cookieVal = decodeURIComponent(match[2])
            .replace(/^Bearer\s+/i, "")
            .replace(/^["']|["']$/g, "")
            .trim();
          if (cookieVal && cookieVal !== "undefined" && cookieVal !== "null") {
            try {
              localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, cookieVal);
              localStorage.setItem("rrv_customer_access_token", cookieVal);
            } catch {}
            return cookieVal;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return (
        localStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY) ||
        localStorage.getItem("rrv_customer_refresh_token") ||
        null
      );
    } catch {
      return null;
    }
  },

  getUser(): CustomerUser | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(CUSTOMER_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
      return null;
    } catch {
      return null;
    }
  },

  getExpiresAt(): number | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(CUSTOMER_EXPIRES_AT_KEY);
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  },

  saveSession(authData: CustomerAuthData, fallbackMobile?: string): void {
    if (typeof window === "undefined" || !authData) return;

    try {
      const anyData = authData as unknown as Record<string, any>;

      const rawAccess =
        anyData.accessToken ||
        anyData.token ||
        anyData.jwt ||
        anyData.data?.accessToken ||
        anyData.data?.token ||
        anyData.data?.jwt ||
        "";
      const cleanAccess = rawAccess ? String(rawAccess).replace(/^Bearer\s+/i, "").trim() : "";

      const rawRefresh =
        anyData.refreshToken ||
        anyData.refresh_token ||
        anyData.data?.refreshToken ||
        anyData.data?.refresh_token ||
        "";

      const expiresIn =
        anyData.expiresInSeconds ||
        anyData.expires_in ||
        anyData.data?.expiresInSeconds ||
        anyData.data?.expires_in ||
        2592000; // 30 days default

      const rawUser =
        anyData.user ||
        anyData.customer ||
        anyData.data?.user ||
        anyData.data?.customer ||
        null;

      // Always resolve a solid customer user object even if backend only sent tokens
      const resolvedUser: CustomerUser = {
        publicId: rawUser?.publicId || rawUser?.id || rawUser?.userId || `cust-${Date.now()}`,
        mobileNumber: rawUser?.mobileNumber || rawUser?.mobile || fallbackMobile || "",
        fullName: rawUser?.fullName || rawUser?.name || "Customer",
        email: rawUser?.email || "",
        role: rawUser?.role || "CUSTOMER",
        status: rawUser?.status || "ACTIVE",
      };

      if (cleanAccess) {
        localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, cleanAccess);
        localStorage.setItem("rrv_customer_access_token", cleanAccess);
        localStorage.setItem("rrv_green_basket_auth_token", cleanAccess);
        localStorage.setItem("token", cleanAccess);
        localStorage.setItem("accessToken", cleanAccess);

        document.cookie = `${CUSTOMER_ACCESS_TOKEN_KEY}=${encodeURIComponent(
          cleanAccess
        )}; path=/; max-age=${expiresIn}; SameSite=Lax`;
        document.cookie = `rrv_customer_access_token=${encodeURIComponent(
          cleanAccess
        )}; path=/; max-age=${expiresIn}; SameSite=Lax`;
      }

      if (rawRefresh) {
        localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, rawRefresh);
        localStorage.setItem("rrv_customer_refresh_token", rawRefresh);
      }

      localStorage.setItem(
        CUSTOMER_TOKEN_TYPE_KEY,
        anyData.tokenType || "Bearer"
      );

      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(resolvedUser));

      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem(CUSTOMER_EXPIRES_AT_KEY, String(expiresAt));

      // Update authData fields in place so caller receives normalized response
      authData.accessToken = cleanAccess;
      authData.refreshToken = rawRefresh;
      authData.user = resolvedUser;

      window.dispatchEvent(
        new CustomEvent("rrv:customer:auth:changed", {
          detail: {
            user: resolvedUser,
            isAuthenticated: true,
            token: cleanAccess,
          },
        })
      );
    } catch (error) {
      console.error(
        "Failed to persist customer authentication session:",
        error
      );
    }
  },

  updateUser(updates: Partial<CustomerUser>): CustomerUser | null {
    if (typeof window === "undefined") return null;

    try {
      const existing = this.getUser();
      const updated: CustomerUser = {
        publicId: existing?.publicId || `cust-${Date.now()}`,
        mobileNumber: existing?.mobileNumber || "",
        fullName: existing?.fullName || "Customer",
        email: existing?.email || "",
        role: existing?.role || "CUSTOMER",
        status: existing?.status || "ACTIVE",
        ...existing,
        ...updates,
      };

      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent("rrv:customer:auth:changed", {
          detail: {
            user: updated,
            isAuthenticated: true,
          },
        })
      );

      return updated;
    } catch (error) {
      console.error("Failed to update stored customer user:", error);
      return null;
    }
  },

  clearSession(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
      localStorage.removeItem("rrv_customer_access_token");
      localStorage.removeItem("rrv_customer_refresh_token");
      localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_USER_KEY);
      localStorage.removeItem(CUSTOMER_TOKEN_TYPE_KEY);
      localStorage.removeItem(CUSTOMER_EXPIRES_AT_KEY);

      document.cookie = `${CUSTOMER_ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;

      window.dispatchEvent(
        new CustomEvent("rrv:customer:auth:changed", {
          detail: {
            user: null,
            isAuthenticated: false,
          },
        })
      );
    } catch (error) {
      console.error("Failed to clear customer session:", error);
    }
  },
};

// Prevent duplicate simultaneous refresh requests.
let refreshPromise: Promise<CustomerAuthData> | null = null;

class CustomerAuthService {
  private getBaseUrl(): string {
    return (
      process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://192.168.0.142:8082"
    ).replace(/\/$/, "");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    const url = `${this.getBaseUrl()}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (requireAuth) {
      const token = customerTokenStorage.getAccessToken();

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `Network connection error: Unable to reach authentication server at ${this.getBaseUrl()}`
          : "Network connection error";

      throw new CustomerAuthError(message, 0);
    }

    let json: any = null;

    try {
      json = await response.json();
    } catch {
      // Response is not JSON.
    }

    if (!response.ok) {
      const errorMessage =
        json?.message ||
        `Authentication request failed with status ${response.status} (${response.statusText})`;

      const retryAfter = json?.data?.retryAfterSeconds;

      throw new CustomerAuthError(
        errorMessage,
        response.status,
        retryAfter,
        json
      );
    }

    return json?.data !== undefined ? json.data : json;
  }

  /**
   * CUSTOMER REGISTRATION - SEND OTP
   * POST /api/auth/customer/register/send-otp
   */
  async registerSendOtp(
    data: CustomerRegisterSendOtpRequest
  ): Promise<OtpDispatchData> {
    const payload: CustomerRegisterSendOtpRequest = {
      fullName: data.fullName.trim(),
      mobileNumber: normalizeMobileNumber(data.mobileNumber),
      email: data.email?.trim() || undefined,
    };

    return this.request<OtpDispatchData>(
      "/api/auth/customer/register/send-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * CUSTOMER REGISTRATION - VERIFY OTP
   * POST /api/auth/customer/register/verify-otp
   */
  async registerVerifyOtp(
    data: CustomerRegisterVerifyOtpRequest
  ): Promise<CustomerAuthData> {
    const payload: CustomerRegisterVerifyOtpRequest = {
      mobileNumber: normalizeMobileNumber(data.mobileNumber),
      otp: data.otp.replace(/\s+/g, "").trim(),
      fullName: data.fullName?.trim() || undefined,
      email: data.email?.trim() || undefined,
    };

    const authData = await this.request<CustomerAuthData>(
      "/api/auth/customer/register/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    // Ensure fullName and email are preserved in stored user if backend omitted them
    if (authData?.user) {
      if (payload.fullName && !authData.user.fullName) {
        authData.user.fullName = payload.fullName;
      }
      if (payload.email && !authData.user.email) {
        authData.user.email = payload.email;
      }
      if (!authData.user.mobileNumber) {
        authData.user.mobileNumber = payload.mobileNumber;
      }
    }

    customerTokenStorage.saveSession(authData, payload.mobileNumber);

    return authData;
  }

  /**
   * CUSTOMER LOGIN - SEND OTP
   * POST /api/auth/customer/login/send-otp
   */
  async loginSendOtp(
    mobileNumber: string
  ): Promise<OtpDispatchData> {
    const payload: CustomerLoginSendOtpRequest = {
      mobileNumber: normalizeMobileNumber(mobileNumber),
    };

    return this.request<OtpDispatchData>(
      "/api/auth/customer/login/send-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * CUSTOMER LOGIN - VERIFY OTP
   * POST /api/auth/customer/login/verify-otp
   */
  async loginVerifyOtp(
    mobileNumber: string,
    otp: string
  ): Promise<CustomerAuthData> {
    const normalizedMobile = normalizeMobileNumber(mobileNumber);
    const payload: CustomerLoginVerifyOtpRequest = {
      mobileNumber: normalizedMobile,
      otp: otp.replace(/\s+/g, "").trim(),
    };

    const authData = await this.request<CustomerAuthData>(
      "/api/auth/customer/login/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    customerTokenStorage.saveSession(authData, normalizedMobile);

    return authData;
  }

  /**
   * CUSTOMER TOKEN REFRESH
   * POST /api/auth/customer/refresh
   */
  async refreshTokens(): Promise<CustomerAuthData> {
    if (refreshPromise) {
      return refreshPromise;
    }

    const currentRefreshToken =
      customerTokenStorage.getRefreshToken();

    if (!currentRefreshToken) {
      throw new CustomerAuthError(
        "No active refresh token available",
        401
      );
    }

    refreshPromise = (async () => {
      try {
        const authData = await this.request<CustomerAuthData>(
          "/api/auth/customer/refresh",
          {
            method: "POST",
            body: JSON.stringify({
              refreshToken: currentRefreshToken,
            }),
          }
        );

        customerTokenStorage.saveSession(authData);

        return authData;
      } catch (error) {
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /**
   * Execute authenticated customer API calls.
   * Automatically refreshes the access token after a 401 response.
   */
  async customerFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options, true);
    } catch (error: unknown) {
      if (
        error instanceof CustomerAuthError &&
        error.statusCode === 401
      ) {
        try {
          const authData = await this.refreshTokens();

          const retryHeaders: Record<string, string> = {
            ...((options.headers as Record<string, string>) || {}),
            Authorization: `Bearer ${authData.accessToken}`,
          };

          return await this.request<T>(
            endpoint,
            {
              ...options,
              headers: retryHeaders,
            },
            false
          );
        } catch (refreshError) {
          throw refreshError;
        }
      }

      throw error;
    }
  }

  /**
   * CUSTOMER LOGOUT
   * POST /api/auth/customer/logout
   */
  async logout(): Promise<CustomerLogoutData> {
    const refreshToken =
      customerTokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await this.request<CustomerLogoutData>(
          "/api/auth/customer/logout",
          {
            method: "POST",
            body: JSON.stringify({
              refreshToken,
            }),
          },
          true
        );
      }
    } catch (error) {
      console.warn(
        "Backend logout request encountered an error:",
        error
      );
    } finally {
      customerTokenStorage.clearSession();
    }

    return { loggedOut: true };
  }

  /**
   * Update locally stored customer profile information
   */
  updateProfile(updates: Partial<CustomerUser>): CustomerUser | null {
    return customerTokenStorage.updateUser(updates);
  }

  /**
   * Check locally stored customer authentication directly from storage.
   */
  isAuthenticated(): boolean {
    return !!customerTokenStorage.getAccessToken();
  }
}

export const customerAuthService = new CustomerAuthService();

export default customerAuthService;
