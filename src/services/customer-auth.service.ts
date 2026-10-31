
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
 * Kept separate from admin authentication.
 */
export const customerTokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUser(): CustomerUser | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(CUSTOMER_USER_KEY);
      return raw ? JSON.parse(raw) : null;
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

  saveSession(authData: CustomerAuthData): void {
    if (typeof window === "undefined") return;

    try {
      const expiresIn = authData.expiresInSeconds || 86400;

      localStorage.setItem(
        CUSTOMER_ACCESS_TOKEN_KEY,
        authData.accessToken
      );
      localStorage.setItem(
        CUSTOMER_REFRESH_TOKEN_KEY,
        authData.refreshToken
      );
      localStorage.setItem(
        CUSTOMER_TOKEN_TYPE_KEY,
        authData.tokenType || "Bearer"
      );
      localStorage.setItem(
        CUSTOMER_USER_KEY,
        JSON.stringify(authData.user)
      );

      const expiresAt = Date.now() + expiresIn * 1000;

      localStorage.setItem(
        CUSTOMER_EXPIRES_AT_KEY,
        String(expiresAt)
      );

      document.cookie = `${CUSTOMER_ACCESS_TOKEN_KEY}=${encodeURIComponent(
        authData.accessToken
      )}; path=/; max-age=${expiresIn}; SameSite=Lax`;

      window.dispatchEvent(
        new CustomEvent("rrv:customer:auth:changed", {
          detail: {
            user: authData.user,
            isAuthenticated: true,
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
      if (!existing) return null;

      const updated: CustomerUser = {
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
      "http://10.63.45.179:8082"
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
    }

    customerTokenStorage.saveSession(authData);

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
    const payload: CustomerLoginVerifyOtpRequest = {
      mobileNumber: normalizeMobileNumber(mobileNumber),
      otp: otp.replace(/\s+/g, "").trim(),
    };

    const authData = await this.request<CustomerAuthData>(
      "/api/auth/customer/login/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    customerTokenStorage.saveSession(authData);

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
      customerTokenStorage.clearSession();

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
        customerTokenStorage.clearSession();
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
          customerTokenStorage.clearSession();

          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/login")
          ) {
            window.location.href = `/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}`;
          }

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
