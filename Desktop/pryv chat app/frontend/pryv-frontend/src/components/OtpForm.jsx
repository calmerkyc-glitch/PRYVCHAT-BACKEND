import { useState, useEffect, useRef } from "react";
import API from "../utils/api.js";

export default function OtpForm({ userData, onVerified, onError, onBack }) {
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const inputsRef = useRef([]);

  const destination = userData?.email || userData?.phone || "your email or phone";
  const destinationLabel = userData?.email ? "Email" : userData?.phone ? "Phone" : "Contact";
  const currentOtp = otpValues.join("");

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timerId = window.setTimeout(() => setResendTimer((current) => current - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [resendTimer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    onError(null);

    if (currentOtp.length < 6 || otpValues.some((value) => value === "")) {
      onError("Please enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/verify-otp", { ...userData, otp: currentOtp });
      onVerified(res.data.user, res.data.token);
    } catch (err) {
      onError(err.response?.data?.error || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const nextOtp = [...otpValues];
    nextOtp[index] = digit;
    setOtpValues(nextOtp);

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      const nextOtp = [...otpValues];
      nextOtp[index - 1] = "";
      setOtpValues(nextOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextOtp = Array(6)
      .fill("")
      .map((_, index) => pasted[index] || "");
    setOtpValues(nextOtp);
    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();
    event.preventDefault();
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    onError(null);

    try {
      setLoading(true);
      await API.post("/auth/register", userData);
      setResendTimer(45);
    } catch (err) {
      onError(err.response?.data?.error || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 pt-2 pb-4 sm:px-6 sm:pt-3 sm:pb-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_-22px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => onBack?.()}
            aria-label="Back"
            title="Back"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-950 text-white shadow-lg ring-1 ring-indigo-900 hover:bg-indigo-900 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 transition"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-200/40">
              <img src="/splash.png" alt="Pryv logo" className="h-9 w-9 object-contain" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Pryv</p>
              <p className="text-lg font-black text-indigo-950">Pryv Chat</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_32px_70px_-34px_rgba(15,23,42,0.22)] sm:p-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 shadow-sm shadow-indigo-200/50">
              <svg className="h-8 w-8 text-indigo-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="8" width="12" height="10" rx="2" />
                <path d="M8 8V6a4 4 0 0 1 8 0v2" />
              </svg>
            </div>
          </div>

          <div className="text-center mt-5 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Verify your account</h1>
            <p className="mx-auto max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
              We&apos;ve sent a 6-digit code to <span className="font-semibold text-slate-900">{destinationLabel}</span> at <span className="font-semibold text-slate-900">{destination}</span>.
            </p>
            <p className="mx-auto max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
              If you don&apos;t see it, check your email spam folder or SMS messages.
            </p>
          </div>

          <form onSubmit={handleVerify} className="mt-6 space-y-5">
            <div className="grid grid-cols-6 gap-2 sm:gap-3.5">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  aria-label={`OTP digit ${index + 1}`}
                  value={value}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-12 w-full rounded-[10px] border border-slate-200 bg-slate-50 text-center text-2xl font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-indigo-950 px-5 py-3 text-base font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verifying...
                </span>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </form>

          <div className="mt-3 text-sm text-slate-500">
            Resend available in <span className="font-semibold text-slate-900">00:{String(resendTimer).padStart(2, "0")}</span> when ready.
          </div>

          <div className="mt-5 flex flex-col items-center justify-center gap-2 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row">
            <span>Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || loading}
              className="font-semibold text-indigo-950 transition hover:text-indigo-700 disabled:text-slate-400"
            >
              {resendTimer > 0 ? `Resend in 00:${String(resendTimer).padStart(2, "0")}` : "Resend code"}
            </button>
          </div>

          <div className="mt-4 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs uppercase tracking-[0.3em] text-slate-500 shadow-sm shadow-slate-200/70">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-indigo-950 shadow-sm shadow-indigo-200/30">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 4v5c0 5.523-3.582 10.74-8 12-4.418-1.26-8-6.477-8-12V7l8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <span>YOUR CONNECTION IS ENCRYPTED AND SECURE.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
