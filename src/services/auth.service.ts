import { apiClient, setAuthToken, removeAuthToken, getAuthToken } from "./api-client";
import {
  AdminUser,
  LoginCredentials,
  AuthResponse,
  LoginResult,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResult,
  ForgotPasswordResult,
} from "@/types";
import { MOCK_ADMIN_USER_DATA, getSaved2FAEnabled } from "@/data";

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
   * If 2FA is active, returns a temporary session token and triggers Step 2.
   * If 2FA is disabled, directly issues JWT and completes login.
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const is2FAActive = getSaved2FAEnabled();

    // Prepare realistic fallback for when backend API is offline
    const fallbackResponse: AuthResponse = {
      user: {
        ...MOCK_ADMIN_USER_DATA,
        twoFactorEnabled: is2FAActive,
      },
      token: generateMockJwt(MOCK_ADMIN_USER_DATA.id, credentials.email || MOCK_ADMIN_USER_DATA.email),
      expiresIn: 86400 * 30,
      requires2FA: is2FAActive,
      tempToken: is2FAActive ? `tmp_2fa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` : undefined,
    };

    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        {
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe ?? true,
        },
        { skipAuth: true },
        fallbackResponse
      );

      // Check whether 2FA is required based on response or local store setting
      const requires2FA = Boolean(response?.requires2FA ?? is2FAActive);

      if (requires2FA) {
        return {
          success: true,
          requires2FA: true,
          nextStep: "two_factor",
          tempToken: response?.tempToken || fallbackResponse.tempToken,
          targetEmail: credentials.email || MOCK_ADMIN_USER_DATA.email,
          targetPhone: MOCK_ADMIN_USER_DATA.phone,
        };
      }

      // If 2FA is OFF, set JWT session immediately
      const token = response?.token || fallbackResponse.token;
      if (token) {
        setAuthToken(token, response?.refreshToken);
      }

      return {
        success: true,
        requires2FA: false,
        nextStep: "success",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      return {
        success: false,
        requires2FA: false,
        nextStep: "credentials",
        error: message,
      };
    }
  },

  /**
   * Verify 6-digit Authenticator Code (Step 2)
   */
  async verify2FA(request: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResult> {
    const cleanCode = request.code.replace(/\s+/g, "");

    // Validate 6 digits format
    if (!/^\d{6}$/.test(cleanCode)) {
      return {
        success: false,
        error: "Please enter a valid 6-digit verification code.",
      };
    }

    const fallbackResponse: AuthResponse = {
      user: MOCK_ADMIN_USER_DATA,
      token: generateMockJwt(MOCK_ADMIN_USER_DATA.id, request.email || MOCK_ADMIN_USER_DATA.email),
      expiresIn: 86400 * 30,
    };

    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/verify-2fa",
        request,
        { skipAuth: true },
        fallbackResponse
      );

      const token = response?.token || fallbackResponse.token;
      if (token) {
        setAuthToken(token, response?.refreshToken);
      }

      return {
        success: true,
        user: response?.user || MOCK_ADMIN_USER_DATA,
        token,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification code is invalid or has expired.";
      return {
        success: false,
        error: message,
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

