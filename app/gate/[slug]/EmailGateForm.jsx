"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, ChevronLeft } from "lucide-react";

export default function EmailGateForm({ slug, leadTitle }) {
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/urls/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setStep("otp");
      setCountdown(60);
      // Focus first digit box on step change
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit change
  const handleDigitChange = (index, value) => {
    // Clean to numeric only
    const cleanVal = value.replace(/[^0-9]/g, "");

    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    // Handle full paste (e.g. 6 digits pasted into one input)
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single digit input
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto advance to next input
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("").trim();

    if (fullOtp.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/urls/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email: email.trim(),
          otp: fullOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setVerifiedSuccess(true);

      // Redirect immediately to destination URL
      setTimeout(() => {
        window.location.href = data.destinationUrl;
      }, 500);
    } catch (err) {
      setError(err.message || "Invalid verification code");
      setLoading(false);
    }
  };

  if (verifiedSuccess) {
    return (
      <div className="py-6 space-y-3 animate-in fade-in duration-300">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-zinc-950 dark:text-white">
          Email Verified Successfully!
        </p>
        <p className="text-xs text-zinc-500">
          Redirecting you to the destination link...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left">
      {step === "email" ? (
        /* Step 1: Email Entry */
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoFocus
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 pl-10 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
              />
            </div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              We will send a 6-digit one-time code to confirm your email.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Sending Verification Code...
              </>
            ) : (
              <>
                Send Verification Code
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Step 2: 6-Digit OTP Entry */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <div className="text-xs">
              <span className="text-zinc-400">Code sent to: </span>
              <strong className="text-zinc-900 dark:text-white font-mono">
                {email}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError("");
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white underline underline-offset-2 flex items-center gap-0.5"
            >
              <ChevronLeft className="h-3 w-3" />
              Change
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center">
              Enter 6-Digit Security Code
            </label>

            {/* 6 Individual Code Inputs */}
            <div className="flex items-center justify-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-12 w-11 rounded-xl border border-zinc-200 bg-zinc-50/70 text-center font-mono text-lg font-bold text-zinc-950 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-white dark:focus:border-white dark:focus:ring-white transition-all"
                />
              ))}
            </div>

            <p className="text-[11px] text-zinc-400 text-center pt-1">
              Check your inbox (or spam) for the one-time passcode.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otpDigits.join("").length < 6}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Verifying Code...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Verify & Access Link
              </>
            )}
          </button>

          {/* Resend Action */}
          <div className="text-center pt-1">
            {countdown > 0 ? (
              <span className="text-[11px] text-zinc-400">
                Resend code in <strong>{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-[11px] font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white underline underline-offset-2 cursor-pointer"
              >
                Resend verification code
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
