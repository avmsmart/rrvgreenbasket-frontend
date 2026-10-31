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
  BackendAuthResponseData,
  BackendUserSummary,
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

// Temporary storage for real backend JWT tokens during active 2FA verification challenges
const pending2FASessions = new Map<
  string,
  { token: string; refreshToken?: string; user?: AdminUser }
>();

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
    // 1. Live Spring Boot Backend Authentication (proxied to avoid browser CORS)
    try {
      const backendAuth = await apiClient.post<BackendAuthResponseData>(
        "/auth/admin/login",
        {
          email: normalizedEmail,
          password: credentials.password,
        },
        { skipAuth: true }
      );

      if (backendAuth && backendAuth.accessToken) {
        const backendUser = backendAuth.user;
        const adminUser: AdminUser = {
          id: backendUser?.publicId || "ADM-001",
          name: "Admin",
          role: backendUser?.role === "ADMIN" ? "Super Admin" : backendUser?.role || "Super Admin",
          avatarInitial: "A",
          email: backendUser?.email || normalizedEmail,
          phone: backendUser?.mobileNumber || "+91 98765 43210",
          location: "Kurnool, Andhra Pradesh, India",
          storeName: "RRV Green Basket",
          operatingHours: "06:00 AM – 10:00 PM",
          orderCutoff: "10:00 PM",
          status: backendUser?.status === "ACTIVE" ? "Active (Accepting Orders)" : "Active",
          permissions: [
            "All Modules Access",
            "Order Management",
            "Inventory Control",
            "Financial Reports",
            "Partner Management",
          ],
          twoFactorEnabled: is2FAGloballyActive,
        };

        if (is2FAGloballyActive) {
          const tempToken = `tmp_2fa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const totpSecret = PREDEFINED_ADMIN_TOTP_SECRET;
          const totpUri = getTotpUri(normalizedEmail, totpSecret);
          const totpQrCode = await generateTotpQrDataUrl(totpUri);
          const previewCode = await generateTotpCode(totpSecret);

          // Stash real backend tokens in pending map until 2FA is verified
          pending2FASessions.set(tempToken, {
            token: backendAuth.accessToken,
            refreshToken: backendAuth.refreshToken,
            user: adminUser,
          });

          return {
            success: true,
            requires2FA: true,
            nextStep: "two_factor",
            tempToken,
            targetEmail: normalizedEmail,
            targetPhone: adminUser.phone,
            previewCode,
            totpSecret,
            totpQrCode,
          };
        }

        // If 2FA is OFF, commit real backend tokens immediately
        setAuthToken(backendAuth.accessToken, backendAuth.refreshToken);

        return {
          success: true,
          requires2FA: false,
          nextStep: "success",
        };
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 423 || !err.isNetworkError) {
          return {
            success: false,
            requires2FA: false,
            nextStep: "credentials",
            error: err.message || "Invalid administrator credentials.",
          };
        }
      }
      // If network error/server offline, proceed to local fallback below
    }

    // 2. High-Fidelity Local Fallback (when backend server is unreachable)
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

    const pendingSession = request.tempToken ? pending2FASessions.get(request.tempToken) : null;
    const token = pendingSession?.token || generateMockJwt(adminUser.id, request.email);
    const adminUserToReturn = pendingSession?.user || adminUser;
    setAuthToken(token, pendingSession?.refreshToken);
    if (request.tempToken) {
      pending2FASessions.delete(request.tempToken);
    }

    return {
      success: true,
      user: adminUserToReturn,
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
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("rrv_green_basket_refresh_token")
          : null;
      await apiClient.post(
        "/auth/logout",
        {},
        { params: refreshToken ? { refreshToken } : undefined },
        {}
      );
    } catch {
      // Ignore network errors on logout
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Fetch currently logged-in administrator profile from /api/auth/me
   */
  async getCurrentUser(): Promise<AdminUser> {
    try {
      const data = await apiClient.get<BackendUserSummary>("/auth/me");
      if (data && data.publicId) {
        return {
          id: data.publicId,
          name: "Admin",
          role: data.role === "ADMIN" ? "Super Admin" : data.role,
          avatarInitial: "A",
          email: data.email,
          phone: data.mobileNumber || "+91 98765 43210",
          location: "Kurnool, Andhra Pradesh, India",
          storeName: "RRV Green Basket",
          operatingHours: "06:00 AM – 10:00 PM",
          orderCutoff: "10:00 PM",
          status: data.status === "ACTIVE" ? "Active (Accepting Orders)" : data.status,
          permissions: [
            "All Modules Access",
            "Order Management",
            "Inventory Control",
            "Financial Reports",
            "Partner Management",
          ],
          twoFactorEnabled: getSaved2FAEnabled(),
        };
      }
    } catch {
      // Backend offline fallback
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

