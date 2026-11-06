import { apiClient, setAuthToken, removeAuthToken, getAuthToken, ApiError } from "./api-client";
import {
  AdminUser,
  LoginCredentials,
  AuthResponse,
  LoginResult,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResult,
  ForgotPasswordResult,
  TotpSetupInfo,
} from "@/types";
import {
  MOCK_ADMIN_USER_DATA,
  getSaved2FAEnabled,
  findAdminAccount,
  saveAdminAccount,
  PREDEFINED_ADMIN_CREDENTIALS,
} from "@/data";
import {
  PREDEFINED_ADMIN_TOTP_SECRET,
  generateTotpCode,
  verifyTotpCode,
  getTotpUri,
  generateTotpQrDataUrl,
  getTotpSecondsRemaining,
  formatSecretKey,
} from "@/lib/totp-service";

// Helper to generate a realistic JWT token string (Header.Payload.Signature)
function generateMockJwt(userId: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      email,
      role: "ROLE_ADMIN",
      iss: "RRV_GREEN_BASKET_AUTH_SERVER",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    })
  );
  const signature = btoa("rrv_hmac_sha256_mock_sig_" + Date.now()).replace(/=+$/, "");
  return `${header}.${payload}.${signature}`;
}

export interface BackendAdminUser {
  publicId?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
  status?: string;
  roles?: string[];
}

export interface BackendAdminLoginData {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresInSeconds?: number;
  user: BackendAdminUser;
}

export interface BackendAdminLoginResponse {
  success: boolean;
  message?: string;
  data: BackendAdminLoginData;
  timestamp?: string;
}

export const authService = {
  /**
   * Authenticate administrator credentials against Spring Boot REST API
   * POST /api/auth/admin/login
   *
   * Flow:
   * 1. Validate email and password presence and format.
   * 2. Send credentials to POST /api/auth/admin/login.
   * 3. On success (200), securely store accessToken and refreshToken; map and store admin user.
   *    Bypasses 2FA for direct email + password login.
   * 4. On failure, map HTTP error status (401, 423, 400, 500, network error) to exact user-facing messages.
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const normalizedEmail = (credentials.email || "").trim();
    const password = credentials.password || "";

    // 1. Validate fields
    if (!normalizedEmail || !password) {
      return {
        success: false,
        requires2FA: false,
        nextStep: "credentials",
        error: "Please enter both your email address and password.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        requires2FA: false,
        nextStep: "credentials",
        error: "Please enter a valid email address.",
      };
    }

    // 2. Dispatch real API request to Spring Boot Admin Auth API
    try {
      const response = await apiClient.post<BackendAdminLoginData | BackendAdminLoginResponse>(
        "/api/auth/admin/login",
        {
          email: normalizedEmail,
          password: password,
        },
        { skipAuth: true }
      );

      // Handle both enveloped and unwrapped responses from apiClient
      const payload: BackendAdminLoginData =
        response && typeof response === "object" && "data" in response && (response as BackendAdminLoginResponse).data?.accessToken
          ? (response as BackendAdminLoginResponse).data
          : (response as unknown as BackendAdminLoginData);

      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;
      const userObj: BackendAdminUser = payload?.user || {};

      if (!accessToken) {
        throw new ApiError("Authentication failed: No access token returned by server.", 500);
      }

      // Securely store tokens
      setAuthToken(accessToken, refreshToken);

      // Map backend user to AdminUser without hardcoding CUSTOMER or PENDING
      const role = userObj.role || (Array.isArray(userObj.roles) && userObj.roles[0]) || "ADMIN";
      const status = userObj.status || "ACTIVE";
      const userEmail = userObj.email || normalizedEmail;
      const emailPrefix = userEmail.split("@")[0] || "Administrator";
      const name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      const adminUser: AdminUser = {
        id: userObj.publicId || `ADM-${Date.now().toString().slice(-4)}`,
        name: name,
        role: role,
        email: userEmail,
        phone: userObj.mobileNumber || "+91 98765 43210",
        location: "Bengaluru, India",
        avatarInitial: name.charAt(0).toUpperCase(),
        storeName: "RRV Green Basket",
        operatingHours: "06:00 AM - 10:00 PM",
        orderCutoff: "08:00 PM",
        status: status,
        permissions: Array.isArray(userObj.roles) && userObj.roles.length > 0 ? userObj.roles : ["ALL"],
        twoFactorEnabled: false,
        lastLogin: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("rrv_green_basket_admin_user", JSON.stringify(adminUser));
        } catch {
          // ignore storage errors
        }
      }

      return {
        success: true,
        requires2FA: false,
        nextStep: "success",
      };
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // HTTP 401: Invalid credentials
        if (err.status === 401) {
          return {
            success: false,
            requires2FA: false,
            nextStep: "credentials",
            error: "Invalid email or password. Please verify your credentials.",
          };
        }

        // HTTP 423: Account locked
        if (err.status === 423) {
          return {
            success: false,
            requires2FA: false,
            nextStep: "credentials",
            error: "Account is temporarily locked. Please contact system support.",
          };
        }

        // HTTP 400: Validation errors
        if (err.status === 400) {
          let validationMsg = "Validation failed. Please verify your email and password.";
          if (err.data && typeof err.data === "object") {
            const errObj = err.data as Record<string, unknown>;
            if (typeof errObj.message === "string" && errObj.message) {
              validationMsg = errObj.message;
            } else if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
              validationMsg = errObj.errors.join(", ");
            }
          } else if (err.message && !err.message.includes("API request failed")) {
            validationMsg = err.message;
          }

          return {
            success: false,
            requires2FA: false,
            nextStep: "credentials",
            error: validationMsg,
          };
        }

        // HTTP 500: Server error
        if (err.status === 500) {
          return {
            success: false,
            requires2FA: false,
            nextStep: "credentials",
            error: "Server error occurred during authentication. Please try again later.",
          };
        }

        // Unreachable / Network Error / Offline
        if (err.isNetworkError || err.status === 0) {
          const baseUrl = apiClient.getBaseUrl();
          return {
            success: false,
            requires2FA: false,
            nextStep: "credentials",
            error: `Unable to connect to the authentication server (${baseUrl}). Please ensure the backend is running and reachable.`,
          };
        }

        return {
          success: false,
          requires2FA: false,
          nextStep: "credentials",
          error: err.message || "Authentication failed. Please verify your credentials.",
        };
      }

      const fallbackMsg = err instanceof Error ? err.message : "An unexpected error occurred during authentication.";
      return {
        success: false,
        requires2FA: false,
        nextStep: "credentials",
        error: fallbackMsg,
      };
    }
  },

  /**
   * Register a new Administrator Account
   */
  async register(data: import("@/types").RegisterAdminData): Promise<import("@/types").RegisterResult> {
    const existing = findAdminAccount(data.email);
    if (existing) {
      return {
        success: false,
        requires2FA: false,
        error: "An administrator with this email address already exists. Please sign in instead.",
      };
    }

    const newAccount: import("@/types").RegisteredAdminAccount = {
      id: `ADM-${Date.now().toString().slice(-4)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || "Super Admin",
      storeName: data.storeName || "RRV Green Basket",
      location: "Kurnool, Andhra Pradesh, India",
      avatarInitial: data.name.charAt(0).toUpperCase(),
      status: "Active (Accepting Orders)",
      permissions: [
        "All Modules Access",
        "Order Management",
        "Inventory Control",
        "Financial Reports",
        "Partner Management",
      ],
      twoFactorEnabled: data.twoFactorEnabled ?? true,
      passwordHash: data.password,
      createdAt: new Date().toISOString(),
    };

    saveAdminAccount(newAccount);

    if (newAccount.twoFactorEnabled) {
      const tempToken = `tmp_reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      let previewCode: string | undefined;

      // Dispatch real email OTP to the newly registered email
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            name: data.name,
          }),
        });
        const json = await res.json();
        previewCode = json.previewCode;
      } catch (e) {
        console.warn("[AuthService] Error calling /api/auth/send-otp on registration:", e);
      }

      return {
        success: true,
        user: newAccount,
        requires2FA: true,
        tempToken,
        previewCode,
      };
    }

    // If 2FA is disabled, log in directly
    const token = generateMockJwt(newAccount.id, newAccount.email);
    setAuthToken(token);

    return {
      success: true,
      user: newAccount,
      requires2FA: false,
    };
  },

  /**
   * Verify 6-digit Google Authenticator TOTP Code (Step 2)
   */
  async verify2FA(request: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResult> {
    const cleanCode = request.code.replace(/\s+/g, "").trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return {
        success: false,
        error: "Please enter a valid 6-digit Google Authenticator code.",
      };
    }

    const savedAccount = findAdminAccount(request.email);
    const adminUser = savedAccount || MOCK_ADMIN_USER_DATA;

    // Verify against standard RFC 6238 TOTP (Google Authenticator)
    const isTotpValid = await verifyTotpCode(cleanCode, PREDEFINED_ADMIN_TOTP_SECRET);

    // If local TOTP validation fails, also try checking backend API if available
    if (!isTotpValid) {
      let backendAccepted = false;
      try {
        const apiRes = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: request.email,
            code: cleanCode,
          }),
        });
        const json = await apiRes.json();
        if (apiRes.ok && json.success) {
          backendAccepted = true;
        }
      } catch {
        // Backend offline fallback
      }

      if (!backendAccepted) {
        return {
          success: false,
          error: "Invalid 6-digit code. Please enter the current code shown in your Google Authenticator app.",
        };
      }
    }

    const token = generateMockJwt(adminUser.id, request.email);
    setAuthToken(token);

    return {
      success: true,
      user: adminUser,
      token,
    };
  },

  /**
   * Retrieves Google Authenticator setup information (Secret, QR Data URL, and URI)
   */
  async getTotpSetupInfo(email: string = "admin@rrvgreenbasket.com"): Promise<TotpSetupInfo> {
    const secret = PREDEFINED_ADMIN_TOTP_SECRET;
    const uri = getTotpUri(email, secret);
    const qrDataUrl = await generateTotpQrDataUrl(uri);
    return {
      secret,
      formattedSecret: formatSecretKey(secret),
      uri,
      qrDataUrl,
    };
  },

  /**
   * Get current live TOTP code and seconds remaining for testing/development
   */
  async getCurrentTotpCode(secret: string = PREDEFINED_ADMIN_TOTP_SECRET): Promise<{
    code: string;
    secondsRemaining: number;
  }> {
    const code = await generateTotpCode(secret);
    const secondsRemaining = getTotpSecondsRemaining();
    return { code, secondsRemaining };
  },

  /**
   * Resend a fresh OTP code to user's email
   */
  async resendOtp(email: string, name?: string): Promise<{ success: boolean; message: string; previewCode?: string }> {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || "Administrator",
        }),
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message || `A new code has been sent to ${email}`,
        previewCode: data.previewCode,
      };
    } catch {
      return {
        success: false,
        message: "Failed to dispatch email. Please check your network.",
      };
    }
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    try {
      await apiClient.post(
        "/auth/forgot-password",
        { email },
        { skipAuth: true },
        { success: true }
      );
      return {
        success: true,
        message: `Password reset instructions have been sent to ${email}. Please check your inbox.`,
      };
    } catch {
      return {
        success: true,
        message: `If an account exists for ${email}, a reset link has been dispatched.`,
      };
    }
  },

  /**
   * Log out admin user and clear JWT session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/admin/logout", {}, { skipAuth: false }).catch(() => {});
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("rrv_green_basket_admin_user");
        } catch {
          // ignore
        }
      }
      removeAuthToken();
    }
  },

  /**
   * Fetch currently logged-in administrator profile
   * Restores authenticated admin user from localStorage session, or falls back to standard admin data.
   */
  async getCurrentUser(): Promise<AdminUser> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("rrv_green_basket_admin_user");
        if (stored) {
          return JSON.parse(stored) as AdminUser;
        }
      } catch {
        // ignore parse errors
      }
    }
    return MOCK_ADMIN_USER_DATA;
  },

  /**
   * Update admin profile
   */
  async updateProfile(updates: Partial<AdminUser>): Promise<AdminUser> {
    const fallback: AdminUser = {
      ...MOCK_ADMIN_USER_DATA,
      ...updates,
    };

    return apiClient.put<AdminUser>("/auth/profile", updates, {}, fallback);
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};

