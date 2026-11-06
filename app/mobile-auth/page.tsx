"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { CustomerAuthError, normalizeMobileNumber } from "@/services/customer-auth.service";

type Step = "mobile" | "otp" | "profile";

function MobileAuthPageContent() {
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
  } = useCustomerAuth();

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(true);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push(redirectTarget);
    }
  }, [isAuthenticated, isAuthLoading, redirectTarget, router]);

  // Focus OTP input on step transition
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  // Cooldown countdown
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

  // Step 1: Send Login or Register OTP
  async function handleSendOtp() {
    const cleanedMobile = mobile.replace(/\D/g, "");
    if (cleanedMobile.length !== 10) {
      setMessage("Please enter a valid 10-digit mobile number.");
      setIsError(true);
      return;
    }

    setMessage("");
    setIsError(false);
    setLoading(true);

    const normalized = normalizeMobileNumber(cleanedMobile);

    try {
      // First attempt login OTP
      const res = await loginSendOtp(normalized);
      setCooldown(res.cooldownSeconds || 60);
      setMessage(res.message || `Verification OTP sent to ${normalized}`);
      setIsExistingUser(true);
      setOtp("");
      setStep("otp");
    } catch (err: unknown) {
      if (err instanceof CustomerAuthError) {
        if (err.statusCode === 404) {
          // Customer not registered -> switch to profile completion
          setIsExistingUser(false);
          setMessage("Mobile number not registered. Please enter your name to register.");
          setIsError(false);
          setStep("profile");
        } else if (err.statusCode === 429 && err.retryAfterSeconds) {
          setCooldown(err.retryAfterSeconds);
          setMessage(err.message);
          setIsError(true);
        } else {
          setMessage(err.message);
          setIsError(true);
        }
      } else {
        setMessage("Unable to connect to authentication server. Please try again.");
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify Login or Registration OTP
  async function handleVerifyOtp() {
    const cleanOtp = otp.replace(/\D/g, "").trim();
    if (cleanOtp.length !== 6) {
      setMessage("Please enter a valid 6-digit verification code.");
      setIsError(true);
      return;
    }

    setMessage("");
    setIsError(false);
    setLoading(true);

    const normalized = normalizeMobileNumber(mobile);

    try {
      if (isExistingUser) {
        await loginVerifyOtp(normalized, cleanOtp);
      } else {
        await registerVerifyOtp({
          mobileNumber: normalized,
          otp: cleanOtp,
          fullName: name.trim() || undefined,
          email: email.trim() || undefined,
        });
      }

      setMessage("Authentication successful! Redirecting...");
      setTimeout(() => {
        router.push(redirectTarget);
      }, 600);
    } catch (err: unknown) {
      if (err instanceof CustomerAuthError) {
        setMessage(err.message);
      } else {
        setMessage("Incorrect OTP or session expired. Please try again.");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    setOtp("");
    setMessage("");
    setIsError(false);
    setLoading(true);

    const normalized = normalizeMobileNumber(mobile);

    try {
      if (isExistingUser) {
        const res = await loginSendOtp(normalized);
        setCooldown(res.cooldownSeconds || 60);
        setMessage(res.message || `Fresh verification OTP sent to ${normalized}`);
      } else {
        const res = await registerSendOtp({
          fullName: name.trim() || "Customer",
          mobileNumber: normalized,
          email: email.trim() || undefined,
        });
        setCooldown(res.cooldownSeconds || 60);
        setMessage(res.message || `Fresh verification OTP sent to ${normalized}`);
      }
    } catch (err: unknown) {
      if (err instanceof CustomerAuthError) {
        setMessage(err.message);
        if (err.statusCode === 429 && err.retryAfterSeconds) {
          setCooldown(err.retryAfterSeconds);
        }
      } else {
        setMessage("Failed to resend verification code.");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  // Step 3 (New User): Dispatch registration OTP after capturing profile
  async function handleRegisterSendOtp() {
    if (!name.trim() || name.trim().length < 2) {
      setMessage("Please enter your full name (at least 2 characters).");
      setIsError(true);
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    const normalized = normalizeMobileNumber(mobile);

    try {
      const res = await registerSendOtp({
        fullName: name.trim(),
        mobileNumber: normalized,
        email: email.trim() || undefined,
      });

      setCooldown(res.cooldownSeconds || 60);
      setMessage(res.message || `Verification OTP has been dispatched to ${normalized}`);
      setStep("otp");
    } catch (err: unknown) {
      if (err instanceof CustomerAuthError) {
        setMessage(err.message);
        if (err.statusCode === 429 && err.retryAfterSeconds) {
          setCooldown(err.retryAfterSeconds);
        }
      } else {
        setMessage("Registration failed. Please verify your details.");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 caret-green-700 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition";

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-9 border border-green-100">
        <div className="mb-8 text-center">
          <a href="/" className="text-2xl font-extrabold text-green-800">
            RRV Green Basket
          </a>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
            Fresh groceries, delivered to your doorstep.
          </p>
        </div>

        {/* Progress pill indicator */}
        <div className="mb-7 flex justify-center gap-2">
          {(["mobile", "profile", "otp"] as Step[]).map((item, index) => {
            const activeIndex = ["mobile", "profile", "otp"].indexOf(step);
            return (
              <div
                key={item}
                className={`h-1.5 w-16 rounded-full transition-colors ${
                  index <= activeIndex ? "bg-green-700" : "bg-gray-200"
                }`}
              />
            );
          })}
        </div>

        {/* Step: Enter Mobile */}
        {step === "mobile" && (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Sign In with Mobile
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
              Enter your mobile number to receive a verification OTP.
            </p>

            <label className="mt-6 block text-xs font-bold text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>

            <div className="mt-1 flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-green-700 focus-within:ring-2 focus-within:ring-green-100 bg-white">
              <span className="flex items-center bg-gray-50 px-3.5 text-xs font-bold text-gray-600 border-r border-gray-200 select-none">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setMessage("");
                }}
                placeholder="Enter 10-digit number"
                className="w-full bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 caret-green-700 outline-none"
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || mobile.replace(/\D/g, "").length !== 10}
              className="mt-6 w-full rounded-xl bg-green-700 py-3.5 font-bold text-white text-sm transition hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Checking Account...</span>
                </>
              ) : (
                <span>Continue →</span>
              )}
            </button>
          </div>
        )}

        {/* Step: Complete Profile (New User) */}
        {step === "profile" && (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Complete Registration
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
              Just a few details before receiving your OTP.
            </p>

            <label className="mt-5 block text-xs font-bold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setMessage("");
              }}
              placeholder="e.g. Mahendra Kumar"
              className={`${inputClass} mt-1`}
            />

            <label className="mt-4 block text-xs font-bold text-gray-700">
              Email Address <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
              }}
              placeholder="e.g. mahendra@example.com"
              className={`${inputClass} mt-1`}
            />

            <label className="mt-4 block text-xs font-bold text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              value={`+91 ${mobile}`}
              readOnly
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 font-medium select-none"
            />

            <button
              onClick={handleRegisterSendOtp}
              disabled={loading || !name.trim()}
              className="mt-6 w-full rounded-xl bg-green-700 py-3.5 font-bold text-white text-sm transition hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <span>Send Verification Code →</span>
              )}
            </button>
          </div>
        )}

        {/* Step: Verify OTP */}
        {step === "otp" && (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Verify OTP
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
              Enter the 6-digit code for +91 {mobile}.
            </p>

            <label className="mt-6 block text-xs font-bold text-gray-700 mb-1">
              One-Time Password (OTP)
            </label>

            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setMessage("");
              }}
              placeholder="••••••"
              className={`${inputClass} text-center text-xl font-mono font-bold tracking-[0.4em]`}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.trim().length !== 6}
              className="mt-6 w-full rounded-xl bg-green-700 py-3.5 font-bold text-white text-sm transition hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify &amp; Continue →</span>
              )}
            </button>

            <div className="mt-4 text-center text-xs text-gray-500">
              {cooldown > 0 ? (
                <p>
                  Resend OTP in{" "}
                  <span className="font-bold text-green-800 font-mono">
                    {cooldown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="font-bold text-green-700 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("mobile");
                setOtp("");
                setMessage("");
              }}
              className="mt-4 w-full text-xs font-semibold text-gray-500 hover:text-green-700 text-center"
            >
              ← Change mobile number
            </button>
          </div>
        )}

        {/* Message Banner */}
        {message && (
          <div
            className={`mt-5 rounded-xl p-3 text-center text-xs leading-relaxed ${
              isError
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-7 text-center text-xs text-gray-500">
          Prefer full login page?{" "}
          <a href="/login" className="font-bold text-green-700 hover:underline">
            Go to Customer Login
          </a>
        </p>
      </div>
    </main>
  );
}

export default function MobileAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-green-50">
          <div className="h-8 w-8 rounded-full border-3 border-green-700 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MobileAuthPageContent />
    </Suspense>
  );
}
