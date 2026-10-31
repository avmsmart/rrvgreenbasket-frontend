import { apiClient, setAuthToken, removeAuthToken, getAuthToken } from "./api-client";
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

export const authService = {
  /**
   * Authenticate admin user credentials (Step 1)
   * Predefined administrator account validation.
   * If 2FA is active, prepares Google Authenticator challenge and transitions to Step 2.
   * If 2FA is disabled, directly issues JWT and completes login.
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const is2FAGloballyActive = getSaved2FAEnabled();
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const savedAccount = findAdminAccount(normalizedEmail);

    // If an account or predefined credentials exist, check password
    if (savedAccount) {
      if (savedAccount.passwordHash && savedAccount.passwordHash !== credentials.password) {
        return {
          success: false,
          requires2FA: false,
          nextStep: "credentials",
          error: "Incorrect password. The predefined administrator password is Admin@123.",
        };
      }
    } else {
      // Check if credentials match predefined admin password anyway
      if (credentials.password !== PREDEFINED_ADMIN_CREDENTIALS.password) {
        return {
          success: false,
          requires2FA: false,
          nextStep: "credentials",
          error: "Invalid administrator credentials. Please check your email or password.",
        };
      }
    }

    const adminUser: AdminUser = savedAccount || {
      ...MOCK_ADMIN_USER_DATA,
      email: credentials.email || MOCK_ADMIN_USER_DATA.email,
    };

    const requires2FA = savedAccount?.twoFactorEnabled !== undefined
      ? savedAccount.twoFactorEnabled
      : is2FAGloballyActive;

    if (requires2FA) {
      const tempToken = `tmp_2fa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Generate standard Google Authenticator TOTP URI, QR Code & current valid code
      const totpSecret = PREDEFINED_ADMIN_TOTP_SECRET;
      const totpUri = getTotpUri(credentials.email, totpSecret);
      const totpQrCode = await generateTotpQrDataUrl(totpUri);
      const previewCode = await generateTotpCode(totpSecret);

      return {
        success: true,
        requires2FA: true,
        nextStep: "two_factor",
        tempToken,
        targetEmail: credentials.email,
        targetPhone: adminUser.phone,
        previewCode,
        totpSecret,
        totpQrCode,
      };
    }

    // If 2FA is OFF, set JWT session immediately
    const token = generateMockJwt(adminUser.id, credentials.email);
    setAuthToken(token);

    return {
      success: true,
      requires2FA: false,
      nextStep: "success",
    };
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
      await apiClient.post("/auth/logout", {}, {}, {});
    } catch {
      // Ignore network errors on logout
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Fetch currently logged-in administrator profile
   */
  async getCurrentUser(): Promise<AdminUser> {
    return apiClient.get<AdminUser>("/auth/me", {}, MOCK_ADMIN_USER_DATA);
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

