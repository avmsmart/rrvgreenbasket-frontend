"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { CustomerAuthError, normalizeMobileNumber } from "@/services/customer-auth.service";

type Mode = "login" | "register";
type AuthStep = "form" | "otp";

function CustomerLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const {
    customer,
    isAuthenticated,
    isLoading: isAuthLoading,
    loginSendOtp,
    loginVerifyOtp,
    registerSendOtp,
    registerVerifyOtp,
    logout,
  } = useCustomerAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<AuthStep>("form");

  // Form Fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  // OTP Fields
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeRemainingText, setTimeRemainingText] = useState("");

  // Status & UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"general" | "already_registered" | "not_registered">("general");

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus OTP input when switching to OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  // Resend cooldown countdown ticker
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

  // Expiration countdown ticker
  useEffect(() => {
    if (!expiresAt || step !== "otp") return;

    const updateRemaining = () => {
      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) {
        setTimeRemainingText("Expired");
        return;
      }
      const totalSeconds = Math.floor(remainingMs / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      setTimeRemainingText(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, step]);

  // Clear messages when mode changes
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setStep("form");
    setOtp("");
    setErrorMessage(null);
    setSuccessMessage(null);
    setErrorType("general");
  };

  // Step 2: Handle Sending OTP (Login or Register)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setErrorType("general");

    const cleanedMobile = mobile.replace(/\D/g, "");
    if (cleanedMobile.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (mode === "register") {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage("Please enter your full name (at least 2 characters).");
        return;
      }
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
      if (!termsAccepted) {
        setErrorMessage("Please accept the Terms & Conditions and Privacy Policy.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const normalized = normalizeMobileNumber(cleanedMobile);

      if (mode === "login") {
        const response = await loginSendOtp(normalized);
        const cooldownSecs = response.cooldownSeconds || 60;
        const expiryMins = response.expiresInMinutes || 5;

        setCooldown(cooldownSecs);
        setExpiresAt(Date.now() + expiryMins * 60 * 1000);
        setSuccessMessage(
          response.message || `Verification OTP has been dispatched to ${normalized}.`
        );
        setStep("otp");
      } else {
        const response = await registerSendOtp({
          fullName: name.trim(),
          mobileNumber: normalized,
          email: email.trim() || undefined,
        });

        const cooldownSecs = response.cooldownSeconds || 60;
        const expiryMins = response.expiresInMinutes || 5;

        setCooldown(cooldownSecs);
        setExpiresAt(Date.now() + expiryMins * 60 * 1000);
        setSuccessMessage(
          response.message || `Verification OTP has been dispatched to ${normalized}.`
        );
        setStep("otp");
      }
    } catch (err: unknown) {
      if (err instanceof CustomerAuthError) {
        setErrorMessage(err.message);
        if (err.statusCode === 409) {
          setErrorType("already_registered");
        } else if (err.statusCode === 404) {
          setErrorType("not_registered");
        } else if (err.statusCode === 429 && err.retryAfterSeconds) {
          setCooldown(err.retryAfterSeconds);
        }
      } else {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while communicating with the server."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Handle Verifying OTP (Login or Register)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = otp.replace(/\D/g, "").trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    const cleanedMobile = mobile.replace(/\D/g, "");
    const normalized = normalizeMobileNumber(cleanedMobile);

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await loginVerifyOtp(normalized, cleanOtp);
      } else {
        await registerVerifyOtp({
          mobileNumber: normalized,
          otp: cleanOtp,
          fullName: name.trim() || undefined,
          email: email.trim() || undefined,
        });
      }

      setSuccessMessage("Authentication successful! Redirecting to storefront...");
      setTimeout(() => {
        router.push(redirectTarget);
      }, 800);
    } catch (err: unknown) {
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

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 caret-green-700 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100";

  return (
    <main className="min-h-screen bg-[#f5f8f1] text-[#183b29]">
      {/* Top Navigation Header */}
      <header className="flex items-center justify-between border-b border-green-100 bg-white px-5 py-4 sm:px-10">
        <a href="/" className="flex items-center gap-2">
          <span className="text-3xl">🧺</span>
          <span>
            <span className="block text-lg font-extrabold leading-tight">
              RRV Green Basket
            </span>
            <span className="text-xs text-green-700 font-medium">
              Freshness Delivered Daily
            </span>
          </span>
        </a>

        <a
          href="/"
          className="text-sm font-semibold text-green-800 hover:underline"
        >
          Back to Home
        </a>
      </header>

      {/* Main Split Section */}
      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-2 lg:px-10">
        {/* Left Column: Organic Farm Branding */}
        <div className="relative hidden min-h-[620px] overflow-hidden rounded-3xl bg-green-900 lg:block shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85"
            alt="Fresh vegetables and fruits"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#092b19]/95 via-[#092b19]/35 to-transparent" />

          <div className="absolute bottom-0 left-0 p-10 text-white">
            <p className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
              Freshness Delivered Daily
            </p>

            <h1 className="max-w-lg text-5xl font-extrabold leading-tight">
              Fresh Food, Happier Homes.
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-white/90">
              Discover fresh fruits, vegetables and groceries sourced from
              local farmers and delivered directly to your doorstep.
            </p>

            <div className="mt-7 space-y-3 text-sm font-medium">
              <p>✓ Passwordless &amp; secure phone verification</p>
              <p>✓ Sourced directly from local farmers</p>
              <p>✓ Convenient same-day doorstep delivery</p>
              <p>✓ Supporting local agricultural communities</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Customer Authentication Card */}
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-green-100 bg-white p-6 shadow-xl sm:p-9">
          
          {/* Already Authenticated Banner */}
          {!isAuthLoading && isAuthenticated && customer && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                Active Session Detected
              </p>
              <p className="mt-1 text-sm font-extrabold text-green-900">
                Signed in as {customer.fullName || customer.mobileNumber}
              </p>
              <p className="mt-0.5 text-xs text-green-700">
                {customer.mobileNumber} {customer.email ? `• ${customer.email}` : ""}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <a
                  href={redirectTarget}
                  className="rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-green-800 transition"
                >
                  Continue Shopping →
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                  }}
                  className="rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Heading */}
          <div className="mb-7 text-center">
            <div className="mb-3 text-4xl">🌿</div>

            <p className="text-xs font-bold uppercase tracking-widest text-green-700">
              Welcome to RRV Green Basket
            </p>

            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {step === "otp"
                ? "Verify Mobile Code"
                : mode === "login"
                  ? "Customer Sign In"
                  : "Create an Account"}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              {step === "otp"
                ? `Enter the 6-digit code sent to +91 ${mobile}`
                : mode === "login"
                  ? "Enter your mobile number to sign in passwordless via OTP."
                  : "Join us and get fresh farm produce delivered to your home."}
            </p>
          </div>

          {/* Mode Switcher Tabs (Only visible on initial form step) */}
          {step === "form" && (
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-green-50 p-1">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={`rounded-lg py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-green-700 text-white shadow"
                    : "text-green-800 hover:bg-green-100"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("register")}
                className={`rounded-lg py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition ${
                  mode === "register"
                    ? "bg-green-700 text-white shadow"
                    : "text-green-800 hover:bg-green-100"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Alert Box */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 leading-relaxed animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-2">
                <span className="font-bold">⚠️</span>
                <div className="flex-1">
                  <p>{errorMessage}</p>

                  {/* Contextual Action if Customer already exists */}
                  {errorType === "already_registered" && (
                    <button
                      type="button"
                      onClick={() => handleModeChange("login")}
                      className="mt-2 inline-block font-bold text-green-800 underline hover:text-green-900"
                    >
                      Switch to Sign In →
                    </button>
                  )}

                  {/* Contextual Action if Customer not registered */}
                  {errorType === "not_registered" && (
                    <button
                      type="button"
                      onClick={() => handleModeChange("register")}
                      className="mt-2 inline-block font-bold text-green-800 underline hover:text-green-900"
                    >
                      Create an Account Now →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success Alert Box */}
          {successMessage && (
            <div
              role="status"
              className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-3.5 text-xs text-green-800 leading-relaxed animate-in fade-in duration-150 flex items-center gap-2"
            >
              <span className="text-base">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* =========================================================================
              STEP 1: FORM VIEW (Collect Mobile or Registration Details)
             ========================================================================= */}
          {step === "form" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name (Registration only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. Mahendra Kumar"
                    autoComplete="name"
                    className={inputClass}
                  />
                </div>
              )}

              {/* Mobile Number (Login & Registration) */}
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white transition focus-within:border-green-700 focus-within:ring-2 focus-within:ring-green-100">
                  <span className="flex items-center bg-gray-50 px-3.5 text-xs font-bold text-gray-600 border-r border-gray-200 select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setMobile(val);
                      setErrorMessage(null);
                    }}
                    placeholder="Enter 10-digit mobile number"
                    autoComplete="tel"
                    className="w-full bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 caret-green-700 outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  A 6-digit one-time password (OTP) will be dispatched to this number.
                </p>
              </div>

              {/* Email Address (Registration) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Email Address <span className="text-gray-400 font-normal">(Optional for order receipts)</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. mahendra@example.com"
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
              )}

              {/* Terms Checkbox (Registration only) */}
              {mode === "register" && (
                <label className="flex items-start gap-2.5 text-xs leading-5 text-gray-600 select-none pt-1">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-700 accent-green-700"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="/terms" className="font-bold text-green-700 underline hover:text-green-800">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="font-bold text-green-700 underline hover:text-green-800">
                      Privacy Policy
                    </a>.
                  </span>
                </label>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || mobile.replace(/\D/g, "").length !== 10}
                className="w-full mt-2 rounded-xl bg-green-700 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-green-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <span>
                    Get Verification Code →
                  </span>
                )}
              </button>

              {/* Bottom Quick Switch Link */}
              <p className="mt-5 text-center text-xs text-gray-500">
                {mode === "login" ? (
                  <>
                    New to RRV Green Basket?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("register")}
                      className="font-bold text-green-700 hover:underline"
                    >
                      Register Now
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("login")}
                      className="font-bold text-green-700 hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </form>
          )}

          {/* =========================================================================
              STEP 2: OTP VERIFICATION VIEW
             ========================================================================= */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  6-Digit Verification Code
                </label>

                <div className="relative">
                  <input
                    ref={otpInputRef}
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(val);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••"
                    className="w-full rounded-2xl border-2 border-gray-300 bg-white py-3.5 text-center text-2xl font-mono font-black tracking-[0.4em] text-gray-900 placeholder:text-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none transition"
                  />
                </div>

                {/* Expiry indicator */}
                {timeRemainingText && (
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Code expires in:</span>
                    <span className={`font-mono font-bold ${timeRemainingText === "Expired" ? "text-red-600" : "text-green-800"}`}>
                      ⏱ {timeRemainingText}
                    </span>
                  </div>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting || otp.trim().length !== 6}
                className="w-full rounded-xl bg-green-700 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-green-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>
                    {mode === "register"
                      ? "Verify & Create Account →"
                      : "Verify & Sign In →"}
                  </span>
                )}
              </button>

              {/* Resend OTP Section with Cooldown */}
              <div className="pt-2 text-center text-xs">
                {cooldown > 0 ? (
                  <p className="text-gray-500 font-medium">
                    Resend code available in{" "}
                    <span className="font-bold text-green-800 font-mono">
                      {cooldown}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSendOtp()}
                    className="font-bold text-green-700 hover:text-green-800 hover:underline disabled:opacity-50"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                )}
              </div>

              {/* Back / Change Mobile Number */}
              <div className="pt-2 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-green-800 hover:underline transition"
                >
                  ← Change mobile number
                </button>
              </div>
            </form>
          )}

          {/* Security & Farm Fresh Guarantee */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400 select-none">
            <span>🔒</span>
            <span>256-Bit SSL Secured • Passwordless Verification</span>
          </div>

        </div>
      </section>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f8f1] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-3 border-green-700 border-t-transparent animate-spin" />
        </div>
      }
    >
      <CustomerLoginPageContent />
    </Suspense>
  );
}
