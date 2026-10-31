
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Step = "mobile" | "otp" | "profile";

export default function MobileAuthPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step !== "otp" || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, seconds]);

  function sendOtp() {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setMessage("Demo OTP: 123456. No SMS has been sent.");
    setSeconds(30);
    setOtp("");
    setStep("otp");
  }

  function verifyOtp() {
    if (otp !== "123456") {
      setMessage("Incorrect OTP. Please enter 123456 for this demo.");
      return;
    }

    setMessage("");

    const savedProfile = localStorage.getItem("rrv-customer-profile");

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);

        if (profile.mobile === mobile) {
          localStorage.setItem("rrv-customer-authenticated", "true");
          router.push("/");
          return;
        }
      } catch {
        localStorage.removeItem("rrv-customer-profile");
      }
    }

    setStep("profile");
  }

  function resendOtp() {
    setOtp("");
    setSeconds(30);
    setMessage("Demo OTP: 123456. No SMS has been sent.");
  }

  function completeProfile() {
    if (!name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    const profile = {
      name: name.trim(),
      mobile,
      email: email.trim(),
    };

    localStorage.setItem("rrv-customer-profile", JSON.stringify(profile));
    localStorage.setItem("rrv-customer-authenticated", "true");

    router.push("/");
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 caret-green-700 outline-none focus:border-green-700";

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-9">
        <div className="mb-8 text-center">
          <a href="/" className="text-2xl font-extrabold text-green-800">
            RRV Green Basket
          </a>
          <p className="mt-2 text-sm text-gray-500">
            Fresh groceries, delivered to your doorstep.
          </p>
        </div>

        <div className="mb-7 flex justify-center gap-2">
          {(["mobile", "otp", "profile"] as Step[]).map((item, index) => (
            <div
              key={item}
              className={`h-1.5 w-16 rounded-full ${
                index <= ["mobile", "otp", "profile"].indexOf(step)
                  ? "bg-green-700"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {step === "mobile" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Login with Mobile
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your mobile number to continue.
            </p>

            <label className="mt-7 block text-sm font-semibold text-gray-700">
              Mobile Number
            </label>

            <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-green-700">
              <span className="flex items-center bg-gray-100 px-4 text-gray-700">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 10-digit number"
                className="w-full bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 caret-green-700 outline-none"
                style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
              />
            </div>

            <button
              onClick={sendOtp}
              className="mt-6 w-full rounded-xl bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800"
            >
              Continue
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Verify OTP
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter the six-digit code for +91 {mobile}.
            </p>

            <label className="mt-7 block text-sm font-semibold text-gray-700">
              One-Time Password
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className={`${inputClass} mt-2 text-center text-xl tracking-[0.5em]`}
              style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
            />

            <button
              onClick={verifyOtp}
              className="mt-6 w-full rounded-xl bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800"
            >
              Verify OTP
            </button>

            <div className="mt-5 text-center text-sm text-gray-500">
              {seconds > 0 ? (
                <p>Resend OTP in {seconds}s</p>
              ) : (
                <button
                  onClick={resendOtp}
                  className="font-semibold text-green-700 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setStep("mobile");
                setMessage("");
              }}
              className="mt-4 w-full text-sm font-semibold text-gray-600 hover:text-green-700"
            >
              Change mobile number
            </button>
          </>
        )}

        {step === "profile" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Just a few details before you start shopping.
            </p>

            <label className="mt-6 block text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={`${inputClass} mt-2`}
              style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
            />

            <label className="mt-5 block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`${inputClass} mt-2`}
              style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
            />

            <label className="mt-5 block text-sm font-semibold text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              value={`+91 ${mobile}`}
              readOnly
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-900"
              style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
            />

            <button
              onClick={completeProfile}
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Complete Registration"}
            </button>
          </>
        )}

        {message && (
          <p className="mt-5 rounded-lg bg-green-50 p-3 text-center text-sm text-green-800">
            {message}
          </p>
        )}

        <p className="mt-7 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-green-700 hover:underline">
            Login
          </a>
        </p>

        <p className="mt-5 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
