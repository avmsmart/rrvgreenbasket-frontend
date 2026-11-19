/**
 * RRV Green Basket - Customer Authentication & Centralized Token Manager
 *
 * Microservice: AUTH-SERVICE (Spring Boot)
 * Local API Gateway: http://localhost:8080 (or NEXT_PUBLIC_CUSTOMER_AUTH_API_BASE_URL)
 *
 * Features:
 * - Email + Password Authentication
 * - Email Registration with OTP Verification
 * - Forgot Password OTP Verification & Reset Flow
 * - Refresh Token Rotation (Atomic replacement of both access & refresh tokens)
 * - Single Shared Refresh Operation (Concurrency protection preventing reuse of rotated tokens)
 * - Proactive & Reactive 401 Token Refresh
 * - Strict Separation from Admin Authentication
 */

import {
  CustomerUser,
  CustomerEmailRegisterSendOtpRequest,
  CustomerEmailRegisterVerifyOtpRequest,
  CustomerEmailLoginRequest,
  CustomerForgotPasswordSendOtpRequest,
  CustomerForgotPasswordVerifyOtpRequest,
  CustomerForgotPasswordResetRequest,
  CustomerAuthData,
  CustomerLogoutData,
  OtpDispatchData,
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
 * Normalizes an Indian mobile number into E.164 format (+91...).
 */
export function normalizeMobileNumber(input: string): string {
  const cleaned = (input || "").trim();
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
 * Centralized Customer Token Storage & Session Manager
 * Kept strictly isolated from Admin staff authentication.
 */
export const customerTokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      const candidate =
        localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY) ||
        sessionStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY);

      if (
        candidate &&
        typeof candidate === "string" &&
        candidate.trim().length > 0 &&
        candidate !== "undefined" &&
        candidate !== "null"
      ) {
        return candidate.replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "").trim();
      }

      // Cookie fallback
      if (typeof document !== "undefined" && document.cookie) {
        const match = document.cookie.match(
          new RegExp(`(^|;\\s*)(?:${CUSTOMER_ACCESS_TOKEN_KEY})=([^;]+)`)
        );
        if (match && match[2]) {
          const cookieVal = decodeURIComponent(match[2])
            .replace(/^Bearer\s+/i, "")
            .replace(/^["']|["']$/g, "")
            .trim();
          if (cookieVal && cookieVal !== "undefined" && cookieVal !== "null") {
            try {
              localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, cookieVal);
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
        sessionStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY) ||
        null
      );
    } catch {
      return null;
    }
  },

  getUser(): CustomerUser | null {
    if (typeof window === "undefined") return null;

    try {
      const raw =
        localStorage.getItem(CUSTOMER_USER_KEY) ||
        sessionStorage.getItem(CUSTOMER_USER_KEY);

      if (raw) {
        const user = JSON.parse(raw);
        if (user && (user.email || user.mobileNumber || user.publicId)) {
          return user;
        }
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

  /**
   * Atomically save the new access token, refresh token, and user profile.
   * Handles Refresh Token Rotation by immediately replacing the stored refresh token.
   */
  saveSession(authData: CustomerAuthData, fallbackEmail?: string): void {
    if (typeof window === "undefined" || !authData) return;

    try {
      const anyData = authData as unknown as Record<string, any>;

      // Extract tokens from direct object or Spring Boot ApiResponse data wrapper
      const rawAccess =
        anyData.accessToken ||
        anyData.token ||
        anyData.jwt ||
        anyData.data?.accessToken ||
        anyData.data?.token ||
        anyData.data?.jwt ||
        "";
      const cleanAccess = rawAccess
        ? String(rawAccess).replace(/^Bearer\s+/i, "").trim()
        : "";

      const rawRefresh =
        anyData.refreshToken ||
        anyData.refresh_token ||
        anyData.data?.refreshToken ||
        anyData.data?.refresh_token ||
        "";
      const cleanRefresh = rawRefresh ? String(rawRefresh).trim() : "";

      const expiresIn =
        anyData.expiresInSeconds ||
        anyData.expires_in ||
        anyData.data?.expiresInSeconds ||
        anyData.data?.expires_in ||
        1800; // 30 minutes default

      const rawUser =
        anyData.user ||
        anyData.customer ||
        anyData.data?.user ||
        anyData.data?.customer ||
        null;

      const resolvedUser: CustomerUser = {
        publicId:
          rawUser?.publicId ||
          rawUser?.id ||
          rawUser?.userId ||
          `cust-${Date.now()}`,
        fullName: rawUser?.fullName || rawUser?.name || "Customer",
        email: rawUser?.email || fallbackEmail || "",
        mobileNumber: rawUser?.mobileNumber || rawUser?.mobile || "",
        role: rawUser?.role || "CUSTOMER",
        status: rawUser?.status || "ACTIVE",
        roles: rawUser?.roles || ["ROLE_CUSTOMER"],
      };

      if (cleanAccess) {
        localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, cleanAccess);
        sessionStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, cleanAccess);

        // Synchronize cookie for Next.js SSR / middleware
        document.cookie = `${CUSTOMER_ACCESS_TOKEN_KEY}=${encodeURIComponent(
          cleanAccess
        )}; path=/; max-age=${expiresIn}; SameSite=Lax`;
      }

      if (cleanRefresh) {
        // Atomic replacement of refresh token for Refresh Token Rotation
        localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, cleanRefresh);
        sessionStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, cleanRefresh);
      }

      localStorage.setItem(
        CUSTOMER_TOKEN_TYPE_KEY,
        anyData.tokenType || "Bearer"
      );

      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(resolvedUser));
      sessionStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(resolvedUser));

      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem(CUSTOMER_EXPIRES_AT_KEY, String(expiresAt));

      // Update authData fields in place for caller
      authData.accessToken = cleanAccess;
      authData.refreshToken = cleanRefresh;
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
      console.error("Failed to persist customer auth session:", error);
    }
  },

  updateUser(updates: Partial<CustomerUser>): CustomerUser | null {
    if (typeof window === "undefined") return null;

    try {
      const existing = this.getUser();
      const updated: CustomerUser = {
        publicId: existing?.publicId || `cust-${Date.now()}`,
        fullName: updates.fullName || existing?.fullName || "Customer",
        email: updates.email || existing?.email || "",
        mobileNumber: updates.mobileNumber || existing?.mobileNumber || "",
        role: existing?.role || "CUSTOMER",
        status: existing?.status || "ACTIVE",
        roles: existing?.roles || ["ROLE_CUSTOMER"],
        ...existing,
        ...updates,
      };

      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updated));
      sessionStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updated));

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

      sessionStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(CUSTOMER_USER_KEY);

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

// Single shared refresh promise to prevent concurrent duplicate refresh requests
let refreshPromise: Promise<CustomerAuthData> | null = null;

class CustomerAuthService {
  public getBaseUrl(): string {
    return (
      process.env.NEXT_PUBLIC_CUSTOMER_AUTH_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8080"
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
          ? `Network error: Unable to reach authentication server at ${this.getBaseUrl()}`
          : "Network connection error";
      throw new CustomerAuthError(message, 0);
    }

    let json: any = null;
    try {
      json = await response.json();
    } catch {
      // Non-JSON response
    }

    if (!response.ok) {
      const errorMessage =
        json?.message ||
        `Request failed with status ${response.status} (${response.statusText})`;
      const retryAfter = json?.data?.retryAfterSeconds;

      throw new CustomerAuthError(
        errorMessage,
        response.status,
        retryAfter,
        json
      );
    }

    // Always extract data object if backend uses ApiResponse<T> wrapper
    if (json && typeof json === "object" && json.data !== undefined) {
      if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) {
        if (!json.data.message && json.message) {
          json.data.message = json.message;
        }
        if (json.success !== undefined && json.data.success === undefined) {
          json.data.success = json.success;
        }
      }
      return json.data;
    }
    return json;
  }

  /**
   * 1. CUSTOMER EMAIL REGISTRATION - SEND OTP
   * POST /api/auth/customer/email-register/send-otp
   */
  async emailRegisterSendOtp(
    data: CustomerEmailRegisterSendOtpRequest
  ): Promise<OtpDispatchData> {
    const payload: CustomerEmailRegisterSendOtpRequest = {
      fullName: data.fullName.trim(),
      mobileNumber: normalizeMobileNumber(data.mobileNumber),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    return this.request<OtpDispatchData>(
      "/api/auth/customer/email-register/send-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * 2. CUSTOMER EMAIL REGISTRATION - VERIFY OTP
   * POST /api/auth/customer/email-register/verify-otp
   */
  async emailRegisterVerifyOtp(
    data: CustomerEmailRegisterVerifyOtpRequest
  ): Promise<CustomerAuthData> {
    const payload: CustomerEmailRegisterVerifyOtpRequest = {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.replace(/\s+/g, "").trim(),
      ...(data.mobileNumber ? { mobileNumber: normalizeMobileNumber(data.mobileNumber) } : {}),
      ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
    };

    const authData = await this.request<CustomerAuthData>(
      "/api/auth/customer/email-register/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    // Ensure customer details are preserved if backend omitted any field in the user object
    if (authData?.user) {
      if (payload.fullName && !authData.user.fullName) {
        authData.user.fullName = payload.fullName;
      }
      if (payload.email && !authData.user.email) {
        authData.user.email = payload.email;
      }
      if (payload.mobileNumber && !authData.user.mobileNumber) {
        authData.user.mobileNumber = payload.mobileNumber;
      }
    }

    customerTokenStorage.saveSession(authData, payload.email);
    return authData;
  }

  /**
   * 3. CUSTOMER EMAIL / PASSWORD LOGIN
   * POST /api/auth/customer/email-login
   * No Bearer token required.
   */
  async emailLogin(
    data: CustomerEmailLoginRequest
  ): Promise<CustomerAuthData> {
    const payload: CustomerEmailLoginRequest = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    const authData = await this.request<CustomerAuthData>(
      "/api/auth/customer/email-login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false
    );

    customerTokenStorage.saveSession(authData, payload.email);
    return authData;
  }

  /**
   * 4. FORGOT PASSWORD - SEND OTP
   * POST /api/auth/customer/forgot-password/send-otp
   */
  async forgotPasswordSendOtp(
    email: string
  ): Promise<OtpDispatchData> {
    const payload: CustomerForgotPasswordSendOtpRequest = {
      email: email.trim().toLowerCase(),
    };

    return this.request<OtpDispatchData>(
      "/api/auth/customer/forgot-password/send-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * 5. FORGOT PASSWORD - VERIFY OTP
   * POST /api/auth/customer/forgot-password/verify-otp
   */
  async forgotPasswordVerifyOtp(
    email: string,
    otp: string
  ): Promise<any> {
    const payload: CustomerForgotPasswordVerifyOtpRequest = {
      email: email.trim().toLowerCase(),
      otp: otp.replace(/\s+/g, "").trim(),
    };

    return this.request<any>(
      "/api/auth/customer/forgot-password/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * 6. FORGOT PASSWORD - RESET PASSWORD
   * POST /api/auth/customer/forgot-password/reset
   */
  async forgotPasswordReset(
    data: CustomerForgotPasswordResetRequest
  ): Promise<any> {
    const targetPassword = data.newPassword || data.password || "";
    const payload = {
      resetToken: data.resetToken || "",
      newPassword: targetPassword,
      confirmPassword: data.confirmPassword || targetPassword,
    };

    return this.request<any>(
      "/api/auth/customer/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * 7. AUTOMATIC TOKEN REFRESH WITH REFRESH TOKEN ROTATION
   * POST /api/auth/customer/refresh
   *
   * Concurrency Protection:
   * Uses single shared promise so multiple simultaneous requests never dispatch
   * duplicate refresh calls using the same old token.
   */
  async refreshTokens(): Promise<CustomerAuthData> {
    if (refreshPromise) {
      return refreshPromise;
    }

    const currentRefreshToken = customerTokenStorage.getRefreshToken();
    if (!currentRefreshToken) {
      customerTokenStorage.clearSession();
      throw new CustomerAuthError("No active refresh token available", 401);
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
          },
          false
        );

        // Atomically replace both tokens (Refresh Token Rotation)
        customerTokenStorage.saveSession(authData);
        return authData;
      } catch (error: unknown) {
        // If refresh fails due to revocation/expiry/replay, clear session
        if (
          error instanceof CustomerAuthError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          customerTokenStorage.clearSession();
        }
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /**
   * 8. EXECUTE AUTHENTICATED CUSTOMER API REQUEST
   * Automatically refreshes the access token once upon receiving a 401 response.
   */
  async customerFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options, true);
    } catch (error: unknown) {
      // On 401 and not already a retry, attempt token refresh once
      if (
        !isRetry &&
        error instanceof CustomerAuthError &&
        error.statusCode === 401
      ) {
        try {
          const authData = await this.refreshTokens();
          const retryHeaders: Record<string, string> = {
            ...((options.headers as Record<string, string>) || {}),
            Authorization: `Bearer ${authData.accessToken}`,
          };

          return await this.customerFetch<T>(
            endpoint,
            {
              ...options,
              headers: retryHeaders,
            },
            true
          );
        } catch (refreshErr) {
          throw refreshErr;
        }
      }

      throw error;
    }
  }

  /**
   * 9. CUSTOMER LOGOUT
   * POST /api/auth/customer/logout
   * Headers: Authorization: Bearer ACCESS_TOKEN
   * Body: { refreshToken: CURRENT_REFRESH_TOKEN }
   */
  async logout(): Promise<CustomerLogoutData> {
    const refreshToken = customerTokenStorage.getRefreshToken();

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
      console.warn("Backend logout request encountered an issue:", error);
    } finally {
      // Clear all local session tokens and cached profile
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
   * Check whether an active customer session exists
   */
  isAuthenticated(): boolean {
    return Boolean(customerTokenStorage.getAccessToken() && customerTokenStorage.getUser());
  }

  // Backward compatibility alias methods
  async registerSendOtp(data: any): Promise<OtpDispatchData> {
    return this.emailRegisterSendOtp(data);
  }
  async registerVerifyOtp(data: any): Promise<CustomerAuthData> {
    return this.emailRegisterVerifyOtp(data);
  }
  async loginSendOtp(mobile: string): Promise<OtpDispatchData> {
    return {
      email: "",
      expiresInMinutes: 5,
      cooldownSeconds: 60,
      message: "Please login using your registered email and password.",
    };
  }
  async loginVerifyOtp(mobile: string, otp: string): Promise<CustomerAuthData> {
    throw new CustomerAuthError("Mobile OTP login is deprecated. Please use email and password login.", 400);
  }
}

export const customerAuthService = new CustomerAuthService();
export default customerAuthService;
