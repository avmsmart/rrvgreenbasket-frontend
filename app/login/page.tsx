"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
  Clock,
  Leaf,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import {
  CustomerAuthError,
  normalizeMobileNumber,
} from "@/services/customer-auth.service";

type AuthMode = "login" | "register" | "forgot-password";
type RegisterStep = "form" | "otp";
type ForgotStep = "email" | "otp" | "reset" | "success";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = "rrv_remember_email";

/* ------------------------------------------------------------------ */
/* Reusable UI pieces                                                  */
/* ------------------------------------------------------------------ */

const inputBase =
  "w-full rounded-xl border border-transparent bg-[#f1f3f2] py-2.5 text-sm text-gray-900 placeholder:text-gray-500 caret-[#2f6f5e] outline-none transition [&::-ms-clear]:hidden [&::-ms-reveal]:hidden focus:border-[#3a7d6b] focus:bg-white focus:ring-4 focus:ring-[#3a7d6b]/15";

const primaryBtn =
  "flex w-full items-center justify-center gap-2 rounded-full bg-[#3a7d6b] py-2.5 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(47,111,94,0.25)] transition hover:bg-[#2f6a5a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

function Spinner({ label }: { label: string }) {
  return (
    <>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>{label}</span>
    </>
  );
}

/** Styled notification card used for both errors and success messages. */
function Alert({
  variant,
  title,
  children,
  onClose,
}: {
  variant: "error" | "success";
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`relative mt-4 flex items-start gap-3 overflow-hidden rounded-xl border py-3 pl-4 pr-9 shadow-sm ${
        isError
          ? "border-red-100 bg-red-50/70"
          : "border-green-200 bg-[#f1f9f4]"
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${
          isError ? "bg-red-500" : "bg-[#3a7d6b]"
        }`}
      />
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isError ? "bg-red-100 text-red-600" : "bg-green-100 text-[#2f6f5e]"
        }`}
      >
        {isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className={`text-[13px] font-semibold ${isError ? "text-red-700" : "text-[#2f6f5e]"}`}>
          {title}
        </p>
        <div className={`mt-0.5 text-xs leading-relaxed ${isError ? "text-red-600/90" : "text-gray-600"}`}>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="absolute right-2.5 top-2.5 rounded-full p-1 text-gray-400 transition hover:bg-black/5 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function Field(props: {
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  password?: boolean;
  inputMode?: "numeric";
  maxLength?: number;
  prefix?: string;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  const { icon, password, prefix, onChange, invalid, ...rest } = props;
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3.5 text-gray-700">{icon}</span>
      {prefix && (
        <span className="absolute left-10 text-[13px] font-bold text-gray-600">
          {prefix}
        </span>
      )}
      <input
        required
        type={password ? (show ? "text" : "password") : rest.type || "text"}
        value={rest.value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={rest.placeholder}
        autoComplete={rest.autoComplete}
        inputMode={rest.inputMode}
        maxLength={rest.maxLength}
        className={`${inputBase} ${invalid ? "!border-red-500 !ring-2 !ring-red-100" : ""} ${prefix ? "pl-[4.5rem]" : "pl-10"} ${
          password ? "pr-10" : "pr-4"
        }`}
      />
      {password && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 text-gray-600 transition hover:text-gray-900"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

function MatchHint({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return null;
  const ok = password === confirm;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
        ok ? "text-[#2f6f5e]" : "text-red-600"
      }`}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      {ok ? "Passwords match" : "Passwords do not match"}
    </p>
  );
}

function OtpInput({
  inputRef,
  value,
  onChange,
  disabled = false,
  status = "idle",
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  status?: "idle" | "verifying" | "verified";
}) {
  const isVerifying = status === "verifying";
  const isVerified = status === "verified";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        required
        disabled={disabled}
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="••••••"
        className={`w-full rounded-2xl border-2 py-2.5 text-center font-mono text-xl font-black tracking-[0.4em] outline-none transition placeholder:text-gray-300 ${
          isVerified
            ? "border-emerald-500 bg-emerald-50/40 text-emerald-800 ring-4 ring-emerald-500/15"
            : isVerifying
            ? "border-[#3a7d6b] bg-[#f0fdf4]/50 text-gray-900 ring-4 ring-[#3a7d6b]/15 animate-pulse"
            : "border-gray-200 bg-white text-gray-900 focus:border-green-600 focus:ring-4 focus:ring-green-100"
        } ${disabled ? "cursor-not-allowed opacity-90" : ""}`}
      />
      {isVerified && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 animate-in zoom-in duration-200">
          <CheckCircle2 className="h-5 w-5" />
        </span>
      )}
      {isVerifying && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a7d6b]">
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[#3a7d6b] border-t-transparent" />
        </span>
      )}
    </div>
  );
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-3 text-center">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-[#2f6f5e] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{children}</span>
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6Z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.400 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100Z" />
      <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.600-5.900c-2.100 1.400-4.900 2.300-8.300 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48Z" />
    </svg>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <img
        src="/images/auth/logo1.png"
        alt="RRV Green Basket logo"
        className="h-12 w-12 shrink-0 object-contain"
      />

      <div className="min-w-0">
        <p className="whitespace-nowrap text-lg font-extrabold leading-tight tracking-tight text-green-900 sm:text-xl">
          RRV Green Basket
        </p>
        <p className="whitespace-nowrap text-xs font-medium text-gray-700 sm:text-sm">
          Freshness Delivered Daily
        </p>
      </div>
    </div>
  );
}

/** Illustration: Local RRV Green Basket login image */
function Illustration({ className = "" }: { className?: string }) {
  return (
    <img
      src="/images/auth/login_image.png"
      alt="RRV Green Basket - Fresh fruits and vegetables"
      className={`w-full h-auto object-contain ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function CustomerLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const {
    customer,
    isAuthenticated,
    isLoading: isAuthLoading,
    login,
    registerSendOtp,
    registerVerifyOtp,
    forgotPasswordSendOtp,
    forgotPasswordVerifyOtp,
    forgotPasswordReset,
    logout,
  } = useCustomerAuth();

  // Mode and step
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Register
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);
  const [regOtp, setRegOtp] = useState("");

  // Forgot password
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpResetToken, setFpResetToken] = useState("");
  const [fpOtpStatus, setFpOtpStatus] = useState<"idle" | "verifying" | "verified">("idle");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const isVerifyingRef = useRef(false);

  // Timers
  const [cooldown, setCooldown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeRemainingText, setTimeRemainingText] = useState("");

  // Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [errorType, setErrorType] = useState<
    "general" | "already_registered" | "not_registered"
  >("general");

  const regOtpInputRef = useRef<HTMLInputElement>(null);
  const fpOtpInputRef = useRef<HTMLInputElement>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Schedule the post-login redirect (cancelled if the page unmounts). */
  const scheduleRedirect = (delay: number) => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
    redirectTimer.current = setTimeout(() => router.push(redirectTarget), delay);
  };

  // Fresh page load: never show a leftover "Redirecting..." message,
  // restore the remembered email, and cancel any pending redirect on leave.
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) setLoginEmail(saved);
    } catch {
      /* storage unavailable */
    }
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  // Auto-focus OTP inputs
  useEffect(() => {
    if (mode === "register" && registerStep === "otp") {
      setTimeout(() => regOtpInputRef.current?.focus(), 150);
    } else if (mode === "forgot-password" && forgotStep === "otp") {
      setTimeout(() => fpOtpInputRef.current?.focus(), 150);
    }
  }, [mode, registerStep, forgotStep]);

  // Resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry countdown
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const ms = expiresAt - Date.now();
      if (ms <= 0) return setTimeRemainingText("Expired");
      const s = Math.floor(ms / 1000);
      setTimeRemainingText(
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const clearAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setErrorType("general");
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setRegisterStep("form");
    setForgotStep("email");
    setRegOtp("");
    setFpOtp("");
    setFpResetToken("");
    setFpOtpStatus("idle");
    isVerifyingRef.current = false;
    setFpNewPassword("");
    setFpConfirmPassword("");
    setExpiresAt(null);
    setTimeRemainingText("");
    clearAlerts();
  };

  /** Shared submit wrapper: loading flag + consistent error handling. */
  const run = async (
    fn: () => Promise<void>,
    fallback: string,
    onAuthError?: (err: CustomerAuthError) => void
  ) => {
    setIsSubmitting(true);
    try {
      await fn();
    } catch (err: unknown) {
      if (err instanceof CustomerAuthError) {
        setErrorMessage(err.message);
        onAuthError?.(err);
      } else {
        setErrorMessage(err instanceof Error ? err.message : fallback);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTimers = (res: { cooldownSeconds?: number; expiresInMinutes?: number }) => {
    setCooldown(res.cooldownSeconds || 60);
    setExpiresAt(Date.now() + (res.expiresInMinutes || 5) * 60 * 1000);
  };

  // ---------------- LOGIN ----------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) return setErrorMessage("Please enter a valid email address.");
    if (!loginPassword) return setErrorMessage("Please enter your password.");

    await run(
      async () => {
        const authData = await login(cleanEmail, loginPassword);
        try {
          if (rememberMe) localStorage.setItem(REMEMBER_KEY, cleanEmail);
          else localStorage.removeItem(REMEMBER_KEY);
        } catch {
          /* storage unavailable */
        }
        setSuccessMessage(`Welcome back, ${authData.user?.fullName || "Customer"}! Redirecting...`);
        scheduleRedirect(700);
      },
      "Sign in failed. Please check your credentials and try again.",
      (err) => {
        if (err.statusCode === 404) {
          // Not registered: send the customer to the Create Account page
          // with their email/password pre-filled.
          setRegEmail(cleanEmail);
          setRegPassword(loginPassword);
          setRegConfirmPassword("");
          handleModeChange("register");
          setErrorMessage("No account found with this email. Please create your account to continue.");
        }
      }
    );
  };

  // ---------------- REGISTER ----------------
  const handleRegisterSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    clearAlerts();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanMobile = regMobile.replace(/\D/g, "");

    if (regFullName.trim().length < 2)
      return setErrorMessage("Please enter your full name (at least 2 characters).");
    if (!EMAIL_RE.test(cleanEmail)) return setErrorMessage("Please enter a valid email address.");
    if (cleanMobile.length !== 10)
      return setErrorMessage("Please enter a valid 10-digit mobile number.");
    if (regPassword.length < 8)
      return setErrorMessage("Password must be at least 8 characters long.");
    if (regPassword !== regConfirmPassword)
      return setErrorMessage("Passwords do not match. Please re-enter.");
    if (!regTermsAccepted)
      return setErrorMessage("Please accept the Terms of Service and Privacy Policy to register.");

    await run(
      async () => {
        const res = await registerSendOtp({
          fullName: regFullName.trim(),
          email: cleanEmail,
          mobileNumber: normalizeMobileNumber(cleanMobile),
          password: regPassword,
        });
        startTimers(res);
        setSuccessMessage(
          res.message || `A 6-digit verification code has been dispatched to ${cleanEmail}.`
        );
        setRegisterStep("otp");
      },
      "Failed to dispatch verification code. Please try again.",
      (err) => {
        if (err.statusCode === 409) setErrorType("already_registered");
        else if (err.statusCode === 429 && err.retryAfterSeconds) setCooldown(err.retryAfterSeconds);
      }
    );
  };

  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    const cleanOtp = regOtp.replace(/\D/g, "").trim();
    if (cleanOtp.length !== 6)
      return setErrorMessage("Please enter the complete 6-digit verification code.");

    await run(async () => {
      const authData = await registerVerifyOtp({
        email: regEmail.trim().toLowerCase(),
        otp: cleanOtp,
        fullName: regFullName.trim(),
        mobileNumber: normalizeMobileNumber(regMobile.replace(/\D/g, "")),
      });
      setSuccessMessage(
        `Welcome to RRV Green Basket, ${authData.user?.fullName || "Customer"}! Your account is active. Redirecting...`
      );
      scheduleRedirect(800);
    }, "Verification failed. The code may be incorrect or expired.");
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleFpSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    clearAlerts();
    const cleanEmail = fpEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail))
      return setErrorMessage("Please enter your registered email address.");

    await run(
      async () => {
        const res = await forgotPasswordSendOtp(cleanEmail);
        startTimers(res);
        setSuccessMessage(res.message || `Password reset code has been sent to ${cleanEmail}.`);
        setForgotStep("otp");
      },
      "Failed to dispatch reset code. Please check your email.",
      (err) => {
        if (err.statusCode === 404) setErrorType("not_registered");
        else if (err.statusCode === 429 && err.retryAfterSeconds) setCooldown(err.retryAfterSeconds);
      }
    );
  };

  const handleFpVerifyOtp = async (e?: React.FormEvent, otpOverride?: string) => {
    e?.preventDefault();
    if (isVerifyingRef.current) return;
    clearAlerts();
    const cleanOtp = (typeof otpOverride === "string" ? otpOverride : fpOtp).replace(/\D/g, "").trim();
    if (cleanOtp.length !== 6)
      return setErrorMessage("Please enter the 6-digit code received on your email.");

    isVerifyingRef.current = true;
    setFpOtpStatus("verifying");
    setIsSubmitting(true);

    try {
      const res = await forgotPasswordVerifyOtp(fpEmail.trim().toLowerCase(), cleanOtp);
      const token = res?.resetToken || res?.data?.resetToken || res?.token || "";
      setFpResetToken(token);
      setFpOtpStatus("verified");
      setSuccessMessage(
        res?.message ||
          res?.data?.message ||
          "OTP verified. Use the reset token to set your new password within 15 minutes."
      );

      // Brief transition delay so customer sees the verified animation before entering new password
      setTimeout(() => {
        setForgotStep("reset");
        setFpOtpStatus("idle");
        isVerifyingRef.current = false;
      }, 1000);
    } catch (err: unknown) {
      setFpOtpStatus("idle");
      isVerifyingRef.current = false;
      if (err instanceof CustomerAuthError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Verification failed. Please check the code and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFpResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!fpResetToken) {
      return setErrorMessage("Reset token is missing or expired. Please verify your OTP again.");
    }
    if (fpNewPassword.length < 8)
      return setErrorMessage("New password must be at least 8 characters long.");
    if (fpNewPassword !== fpConfirmPassword)
      return setErrorMessage("Passwords do not match. Please re-enter.");

    await run(async () => {
      const res = await forgotPasswordReset({
        resetToken: fpResetToken,
        newPassword: fpNewPassword,
        confirmPassword: fpConfirmPassword,
      });
      setForgotStep("success");
      setSuccessMessage(
        res?.message ||
          res?.data?.message ||
          "Password reset successfully. Please log in with your new password."
      );
    }, "Failed to reset password. Please try again.");
  };

  // ---------------- Copy ----------------
  const title =
    mode === "login"
      ? "Welcome Back"
      : mode === "register"
      ? registerStep === "form"
        ? "Create Account"
        : "Verify Your Email"
      : { email: "Reset Password", otp: "Verify Reset Code", reset: "Set New Password", success: "All Set!" }[forgotStep];

  const subtitle =
    mode === "login"
      ? "Sign in to continue your fresh shopping"
      : mode === "register"
      ? registerStep === "form"
        ? "Create your account for fresh farm deliveries"
        : `We sent a 6-digit code to ${regEmail}.`
      : {
          email: "Enter your registered email to receive an OTP.",
          otp: `Enter the 6-digit code sent to ${fpEmail}.`,
          reset: "Enter a new secure password for your account.",
          success: "You can now sign in with your new password.",
        }[forgotStep];

  const errorTitle =
    errorType === "not_registered"
      ? "Account not found"
      : errorType === "already_registered"
      ? "Already registered"
      : "Something went wrong";

  const otpStep =
    (mode === "register" && registerStep === "otp") ||
    (mode === "forgot-password" && forgotStep === "otp");
  const successTitle =
    mode === "forgot-password" && fpOtpStatus === "verified"
      ? "OTP Verified"
      : otpStep
      ? "Verification code sent"
      : "Success";

  const expiryRow = timeRemainingText ? (
    timeRemainingText === "Expired" ? (
      <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>This code has expired. Please request a new one below.</span>
      </div>
    ) : (
      <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500">
        <span>Code valid for</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 font-semibold tabular-nums text-[#2f6f5e]">
          <Clock className="h-3 w-3" />
          {timeRemainingText}
        </span>
      </div>
    )
  ) : null;

  const resendRow = (label: string, onResend: () => void) => (
    <div className="text-center text-sm">
      {cooldown > 0 ? (
        <p className="font-medium text-gray-500">
          Resend code in <span className="font-bold tabular-nums text-[#2f6f5e]">{cooldown}s</span>
        </p>
      ) : (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onResend}
          className="font-bold text-[#2f6f5e] hover:underline disabled:opacity-50"
        >
          {label}
        </button>
      )}
    </div>
  );

  const submitLabel = (idle: string, busy: string) =>
    isSubmitting ? (
      <Spinner label={busy} />
    ) : (
      <>
        <span>{idle}</span>
        <ArrowRight className="h-4 w-4" />
      </>
    );

  return (
    <main className="font-sans min-h-screen bg-[#ffffff] px-4 pb-6 text-slate-900 sm:px-6 lg:px-8">
      {/* Top navigation */}
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-start gap-3 py-3">
        <a
          href="/"
          aria-label="Back to Home"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#2f6f5e] transition hover:bg-green-50 hover:text-green-900"
        >
          <ArrowLeft size={23} strokeWidth={2.5} />
        </a>
        <Brand />
      </nav>

      {/* Desktop: image (left) | divider | form (right) */}
      <div className="mx-auto mt-2 grid w-full max-w-6xl lg:mt-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* ================= DESKTOP ILLUSTRATION (stays put while the form changes) ================= */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <div className="relative flex w-full max-w-[34rem] flex-col items-center overflow-hidden rounded-[2rem] border border-green-100 bg-gradient-to-br from-[#f4faf6] via-white to-[#e6f3ea] px-8 py-8 shadow-[0_20px_50px_rgba(47,111,94,0.10)]">
              {/* soft background glows */}
              <span className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-green-200/40 blur-3xl" />
              <span className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-lime-200/40 blur-3xl" />

              <span className="relative inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2f6f5e] shadow-sm">
                <Leaf className="h-3.5 w-3.5 text-lime-600" />
                100% farm fresh
              </span>

              <Illustration className="relative mx-auto mt-8 w-full max-w-md" />

              <h2 className="relative mt-6 text-center text-2xl font-semibold leading-snug text-[#2f6f5e]">
                Fresh from the farm,
                <br />
                to your doorstep
              </h2>
              <p className="relative mt-2 max-w-sm text-center text-sm font-light leading-relaxed text-gray-500">
                Handpicked fruits, vegetables and daily essentials, delivered with care.
              </p>


            </div>
          </div>
        </aside>

        {/* Divider line */}
        <div
          aria-hidden="true"
          className="hidden w-px self-stretch bg-gradient-to-b from-transparent via-green-200 to-transparent lg:block"
        />

        {/* ================= FORM COLUMN ================= */}
        <div className="relative mx-auto flex w-full max-w-xl flex-col px-2 pb-8 pt-1 sm:px-6 lg:max-w-none lg:px-12 lg:py-8">
          {/* Mobile illustration (below the aligned header) */}
          <Illustration className="mx-auto mt-0 h-36 w-full max-w-xs object-contain sm:h-44 lg:hidden" />

          {/* Page title and subtitle */}
          <div className="mt-1 text-center lg:mt-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[#2f6f5e] sm:text-[28px]">
              {title}
              <Leaf className="mb-3 ml-1 inline h-5 w-5 -rotate-12 text-lime-600" />
            </h1>
            <p className="mx-auto mt-1 max-w-xs text-sm font-light text-gray-500">
              {subtitle}
            </p>
          </div>

          {/* Active session (hidden right after signing out) */}
          {!signedOut && !isAuthLoading && isAuthenticated && customer && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2f6f5e]">Active session</p>
                  <p className="truncate text-sm font-extrabold">
                    {customer.fullName || "Customer Account"}
                  </p>
                  <p className="truncate text-xs text-slate-600">
                    {customer.email}
                    {customer.mobileNumber ? ` • ${customer.mobileNumber}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (redirectTimer.current) clearTimeout(redirectTimer.current);
                    await logout();
                    setSignedOut(true);
                    clearAlerts();
                  }}
                  className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
              <a
                href={redirectTarget}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-2.5 text-xs font-bold text-white transition hover:bg-green-800"
              >
                <span>Continue to Store</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Alerts */}
          {errorMessage && (
            <Alert variant="error" title={errorTitle} onClose={clearAlerts}>
              <p>{errorMessage}</p>
              {errorType === "already_registered" && (
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className="mt-1.5 font-semibold text-[#2f6f5e] underline"
                >
                  Already have an account? Sign In →
                </button>
              )}
              {errorType === "not_registered" && (
                <button
                  type="button"
                  onClick={() => handleModeChange("register")}
                  className="mt-1.5 font-semibold text-[#2f6f5e] underline"
                >
                  New customer? Create an Account Now →
                </button>
              )}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success" title={successTitle} onClose={clearAlerts}>
              <p>{successMessage}</p>
            </Alert>
          )}

          <div className="mt-6">
            {/* ============ LOGIN ============ */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Field
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  value={loginEmail}
                  onChange={(v) => {
                    setLoginEmail(v);
                    clearAlerts();
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  password
                  value={loginPassword}
                  onChange={(v) => {
                    setLoginPassword(v);
                    clearAlerts();
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer select-none items-center gap-2.5 text-[13px] font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 bg-white text-white transition peer-checked:border-[#3a7d6b] peer-checked:bg-[#3a7d6b] peer-focus-visible:ring-4 peer-focus-visible:ring-green-100">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFpEmail(loginEmail);
                      handleModeChange("forgot-password");
                    }}
                    className="text-[13px] font-semibold text-[#B91C1C] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !loginEmail || !loginPassword}
                  className={`${primaryBtn} mt-2`}
                >
                  {submitLabel("Sign In", "Signing in...")}
                </button>

                {/* Google sign-in (coming soon) */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-500">or</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGoogleNotice(true);
                    setTimeout(() => setGoogleNotice(false), 3000);
                  }}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white py-2.5 text-[15px] font-semibold text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:bg-gray-50 active:scale-[0.99]"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
                {googleNotice && (
                  <p role="status" className="text-center text-xs font-medium text-amber-700">
                    Login with Google is coming soon. Please sign in with your email for now.
                  </p>
                )}

                <p className="pt-4 text-center text-[13px] text-gray-700">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("register")}
                    className="font-bold text-[#2f6f5e] hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </form>
            )}

            {/* ============ REGISTER: FORM ============ */}
            {mode === "register" && registerStep === "form" && (
              <form onSubmit={handleRegisterSendOtp} className="space-y-3.5">
                <Field
                  icon={<User className="h-4 w-4" />}
                  value={regFullName}
                  onChange={(v) => {
                    setRegFullName(v);
                    clearAlerts();
                  }}
                  placeholder="Full name"
                  autoComplete="name"
                />
                <Field
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  value={regEmail}
                  onChange={(v) => {
                    setRegEmail(v);
                    clearAlerts();
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                <Field
                  icon={<Phone className="h-4 w-4" />}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  prefix="+91"
                  value={regMobile}
                  onChange={(v) => {
                    setRegMobile(v.replace(/\D/g, "").slice(0, 10));
                    clearAlerts();
                  }}
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                />
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  password
                  value={regPassword}
                  onChange={(v) => {
                    setRegPassword(v);
                    clearAlerts();
                  }}
                  placeholder="Password (min 8 characters)"
                  autoComplete="new-password"
                />
                <div>
                  <Field
                    icon={<Lock className="h-4 w-4" />}
                    password
                    value={regConfirmPassword}
                    invalid={!!regConfirmPassword && regPassword !== regConfirmPassword}
                    onChange={(v) => {
                      setRegConfirmPassword(v);
                      clearAlerts();
                    }}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                  <MatchHint password={regPassword} confirm={regConfirmPassword} />
                </div>

                <label className="flex select-none items-start gap-2.5 pt-1 text-xs leading-5 text-gray-700">
                  <input
                    type="checkbox"
                    checked={regTermsAccepted}
                    onChange={(e) => setRegTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-700"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="/terms" className="font-bold text-[#2f6f5e] underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="/privacy" className="font-bold text-[#2f6f5e] underline">Privacy Policy</a>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !regFullName.trim() ||
                    !regEmail.trim() ||
                    regMobile.length !== 10 ||
                    regPassword.length < 8 ||
                    regPassword !== regConfirmPassword ||
                    !regTermsAccepted
                  }
                  className={`${primaryBtn} mt-2`}
                >
                  {submitLabel("Send Verification Code", "Sending code...")}
                </button>

                <p className="pt-3 text-center text-[13px] text-gray-700">
                  Already registered?{" "}
                  <button type="button" onClick={() => handleModeChange("login")} className="font-bold text-[#2f6f5e] hover:underline">
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* ============ REGISTER: OTP ============ */}
            {mode === "register" && registerStep === "otp" && (
              <form onSubmit={handleRegisterVerifyOtp} className="space-y-5">
                <div>
                  <OtpInput
                    inputRef={regOtpInputRef}
                    value={regOtp}
                    onChange={(v) => {
                      setRegOtp(v);
                      clearAlerts();
                    }}
                  />
                  {expiryRow}
                </div>
                <button type="submit" disabled={isSubmitting || regOtp.length !== 6} className={primaryBtn}>
                  {submitLabel("Verify & Create Account", "Activating...")}
                </button>
                {resendRow("Didn't receive code? Resend OTP", () => handleRegisterSendOtp())}
                <BackLink
                  onClick={() => {
                    setRegisterStep("form");
                    setRegOtp("");
                    clearAlerts();
                  }}
                >
                  Edit registration details
                </BackLink>
              </form>
            )}

            {/* ============ FORGOT PASSWORD ============ */}
            {mode === "forgot-password" && forgotStep === "email" && (
              <form onSubmit={handleFpSendOtp} className="space-y-4">
                <Field
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  value={fpEmail}
                  onChange={(v) => {
                    setFpEmail(v);
                    clearAlerts();
                  }}
                  placeholder="Registered email address"
                  autoComplete="email"
                />
                <button type="submit" disabled={isSubmitting || !fpEmail.trim()} className={`${primaryBtn} mt-2`}>
                  {submitLabel("Send Reset Code", "Sending code...")}
                </button>
                <BackLink onClick={() => handleModeChange("login")}>Back to Sign In</BackLink>
              </form>
            )}

            {mode === "forgot-password" && forgotStep === "otp" && (
              <form
                onSubmit={(e) => handleFpVerifyOtp(e)}
                className="space-y-5"
              >
                <div>
                  <OtpInput
                    inputRef={fpOtpInputRef}
                    value={fpOtp}
                    disabled={isSubmitting || fpOtpStatus === "verifying" || fpOtpStatus === "verified"}
                    status={fpOtpStatus}
                    onChange={(v) => {
                      setFpOtp(v);
                      clearAlerts();
                      if (v.length === 6 && fpOtpStatus === "idle" && !isSubmitting && !isVerifyingRef.current) {
                        handleFpVerifyOtp(undefined, v);
                      }
                    }}
                  />
                  {/* Verifying / Verified Animated Status Indicator */}
                  {fpOtpStatus === "verifying" && (
                    <div className="mt-2.5 flex items-center justify-center gap-2 rounded-xl bg-green-50/70 border border-green-200/60 py-2 px-3 text-xs font-semibold text-[#2f6f5e] animate-pulse">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#2f6f5e] border-t-transparent" />
                      <span>Verifying code...</span>
                    </div>
                  )}
                  {fpOtpStatus === "verified" && (
                    <div className="mt-2.5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 py-2 px-3 text-xs font-bold text-emerald-700 animate-in zoom-in-95 duration-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-in zoom-in" />
                      <span>Code Verified Successfully!</span>
                    </div>
                  )}
                  {fpOtpStatus === "idle" && expiryRow}
                </div>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    fpOtp.length !== 6 ||
                    fpOtpStatus === "verifying" ||
                    fpOtpStatus === "verified"
                  }
                  className={`${primaryBtn} ${
                    fpOtpStatus === "verified"
                      ? "!bg-emerald-600 !shadow-[0_6px_14px_rgba(16,185,129,0.3)]"
                      : ""
                  }`}
                >
                  {fpOtpStatus === "verifying" ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying...</span>
                    </span>
                  ) : fpOtpStatus === "verified" ? (
                    <span className="flex items-center gap-2 text-white">
                      <CheckCircle2 className="h-5 w-5 animate-in zoom-in" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    submitLabel("Verify Code", "Verifying...")
                  )}
                </button>
                {resendRow("Resend Reset Code", () => handleFpSendOtp())}
                <BackLink
                  onClick={() => {
                    setForgotStep("email");
                    setFpOtp("");
                    setFpResetToken("");
                    setFpOtpStatus("idle");
                    isVerifyingRef.current = false;
                    clearAlerts();
                  }}
                >
                  Change email address
                </BackLink>
              </form>
            )}

            {mode === "forgot-password" && forgotStep === "reset" && (
              <form onSubmit={handleFpResetPassword} className="space-y-4">
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  password
                  value={fpNewPassword}
                  onChange={(v) => {
                    setFpNewPassword(v);
                    clearAlerts();
                  }}
                  placeholder="New password (min 8 characters)"
                  autoComplete="new-password"
                />
                <div>
                  <Field
                    icon={<Lock className="h-4 w-4" />}
                    password
                    value={fpConfirmPassword}
                    invalid={!!fpConfirmPassword && fpNewPassword !== fpConfirmPassword}
                    onChange={(v) => {
                      setFpConfirmPassword(v);
                      clearAlerts();
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <MatchHint password={fpNewPassword} confirm={fpConfirmPassword} />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || fpNewPassword.length < 8 || fpNewPassword !== fpConfirmPassword}
                  className={`${primaryBtn} mt-2`}
                >
                  {submitLabel("Reset Password", "Resetting...")}
                </button>
              </form>
            )}

            {mode === "forgot-password" && forgotStep === "success" && (
              <button
                type="button"
                onClick={() => {
                  setLoginEmail(fpEmail);
                  setLoginPassword("");
                  handleModeChange("login");
                }}
                className={primaryBtn}
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f3f8f1]">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-green-700 border-t-transparent" />
        </div>
      }
    >
      <CustomerLoginPageContent />
    </Suspense>
  );
}