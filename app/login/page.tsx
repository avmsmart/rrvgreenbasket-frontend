
"use client";

import { useState } from "react";

type Mode = "login" | "register" | "forgot";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function updateField(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (mode === "register") {
      if (form.mobile.length !== 10) {
        setMessage("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (form.password.length < 8) {
        setMessage("Password must contain at least 8 characters.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match. Please try again.");
        return;
      }

      setMessage(
        "Registration form validated successfully. Connect the registration API to create your account."
      );
      return;
    }

    if (mode === "forgot") {
      setMessage(
        "Your details are validated. Password recovery requires backend integration."
      );
      return;
    }

    if (form.password.length < 8) {
      setMessage("Please enter a valid password.");
      return;
    }

    setMessage(
      "Your login details are validated. Connect the authentication API to sign in."
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 caret-green-700 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100";

  return (
    <main className="min-h-screen bg-[#f5f8f1] text-[#183b29]">
      <header className="flex items-center justify-between border-b border-green-100 bg-white px-5 py-4 sm:px-10">
        <a href="/" className="flex items-center gap-2">
          <span className="text-3xl">🧺</span>
          <span>
            <span className="block text-lg font-extrabold leading-tight">
              RRV Green Basket
            </span>
            <span className="text-xs text-green-700">
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

      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-2 lg:px-10">
        <div className="relative hidden min-h-[620px] overflow-hidden rounded-3xl bg-green-900 lg:block">
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
              local farmers and delivered to your doorstep.
            </p>

            <div className="mt-7 space-y-3 text-sm font-medium">
              <p>✓ Freshness and quality you can trust</p>
              <p>✓ Directly from local farmers</p>
              <p>✓ Convenient doorstep delivery</p>
              <p>✓ Supporting local communities</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg rounded-3xl border border-green-100 bg-white p-6 shadow-xl sm:p-9">
          <div className="mb-7 text-center">
            <div className="mb-3 text-4xl">🌿</div>

            <p className="text-sm font-bold uppercase tracking-widest text-green-700">
              Welcome to RRV Green Basket
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              {mode === "login"
                ? "Welcome Back"
                : mode === "register"
                  ? "Create an Account"
                  : "Forgot Password?"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {mode === "login"
                ? "Login to your RRV Green Basket account"
                : mode === "register"
                  ? "Join us and get fresh groceries delivered to your home."
                  : "Enter your registered email to begin password recovery."}
            </p>
          </div>

          {mode !== "forgot" && (
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-green-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                className={`rounded-lg py-3 text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-green-700 text-white shadow"
                    : "text-green-800 hover:bg-green-100"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
                className={`rounded-lg py-3 text-sm font-bold transition ${
                  mode === "register"
                    ? "bg-green-700 text-white shadow"
                    : "text-green-800 hover:bg-green-100"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <label className="block text-sm font-semibold">
                Full Name *
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="e.g. Karthik Dasari"
                  autoComplete="name"
                  className={inputClass}
                />
              </label>
            )}

            {mode !== "forgot" && (
              <>
                {mode === "register" && (
                  <label className="block text-sm font-semibold">
                    Mobile Number *
                    <input
                      required
                      name="mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setForm({ ...form, mobile: value });
                        setMessage("");
                      }}
                      placeholder="e.g. 98765 43210"
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </label>
                )}

                <label className="block text-sm font-semibold">
                  {mode === "login"
                    ? "Email Address or Mobile Number *"
                    : "Email Address *"}

                  <input
                    required
                    name="email"
                    type={mode === "login" ? "text" : "email"}
                    inputMode={mode === "login" ? "text" : "email"}
                    value={form.email}
                    onChange={updateField}
                    placeholder={
                      mode === "login"
                        ? "Enter email or mobile number"
                        : "e.g. name@example.com"
                    }
                    autoComplete={
                      mode === "login" ? "username" : "email"
                    }
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Password *

                  <div className="relative">
                    <input
                      required
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={updateField}
                      placeholder="Enter your password"
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      className={`${inputClass} pr-20`}
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                {mode === "register" && (
                  <label className="block text-sm font-semibold">
                    Confirm Password *

                    <input
                      required
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={updateField}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      minLength={8}
                      className={inputClass}
                    />
                  </label>
                )}
              </>
            )}

            {mode === "forgot" && (
              <label className="block text-sm font-semibold">
                Registered Email Address *

                <input
                  required
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="e.g. name@example.com"
                  className={inputClass}
                />
              </label>
            )}

            {mode === "login" && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-green-700"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setMessage("");
                  }}
                  className="font-semibold text-green-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {mode === "register" && (
              <label className="flex items-start gap-2 text-xs leading-5 text-gray-600">
                <input
                  required
                  type="checkbox"
                  className="mt-1 accent-green-700"
                />

                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="font-semibold text-green-700 underline"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="font-semibold text-green-700 underline"
                  >
                    Privacy Policy
                  </a>.
                </span>
              </label>
            )}

            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-700 px-5 py-4 font-bold text-white shadow-md transition hover:bg-green-800 active:scale-[0.99]"
            >
              {mode === "login"
                ? "Login →"
                : mode === "register"
                  ? "Create Account →"
                  : "Continue →"}
            </button>
          </form>

          {/* Mobile Authentication Button */}
          {mode === "login" && (
            <a
              href="/mobile-auth"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-green-700 bg-white py-3.5 text-sm font-bold text-green-800 transition hover:bg-green-50"
            >
              <span>📱</span>
              Continue with Mobile Number
              <span>→</span>
            </a>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className="mt-5 w-full text-sm font-semibold text-green-700 hover:underline"
            >
              ← Back to Login
            </button>
          )}

          {mode !== "forgot" && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">
                  OR CONTINUE WITH
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["Google", "PhonePe", "Apple"].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() =>
                      setMessage(
                        `${provider} sign-in requires provider authentication integration.`
                      )
                    }
                    className="rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:bg-green-50"
                  >
                    {provider}
                  </button>
                ))}
              </div>

              <p className="mt-7 text-center text-sm text-gray-500">
                {mode === "login"
                  ? "New to RRV Green Basket?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setMessage("");
                  }}
                  className="font-bold text-green-700 hover:underline"
                >
                  {mode === "login" ? "Register Now" : "Login"}
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
