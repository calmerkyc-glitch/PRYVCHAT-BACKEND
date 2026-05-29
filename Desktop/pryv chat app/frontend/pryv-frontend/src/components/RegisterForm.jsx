import { useState } from "react";
import API from "../utils/api.js";

export default function RegisterForm({ onOtpSent }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSubmitDisabled =
    loading || !form.name.trim() || (!form.email.trim() && !form.phone.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name || (!form.email && !form.phone)) {
      setError("Enter your name and either email or phone.");
      return;
    }

    if (form.email && form.phone) {
      setError("Enter either email or phone, not both.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", form);
      onOtpSent(form);
    } catch (err) {
      const apiError = err.response?.data;
      console.error("Register request failed:", apiError || err.message || err);
      setError(
        apiError?.error || apiError?.details || err.message || "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Logo and Lock Icon */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center">
            <img src="/splash.png" alt="Pryv Chat Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-indigo-600">Pryv Chat</h2>
        </div>
        <button className="p-1.5 hover:bg-gray-200 rounded-lg transition">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
          </svg>
        </button>
      </div>

      {/* Main Form Container */}
      <div className="flex-1 flex items-center justify-center px-3 py-3 sm:px-6 sm:py-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-5 sm:p-7 lg:p-10 space-y-4 sm:space-y-5"
        >
          {/* Heading Section */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Start your journey with military-grade encryption and total privacy.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-indigo-900 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 sm:h-12 rounded-2xl border border-gray-300 bg-gray-50 px-3 sm:px-4 text-sm sm:text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Email or Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-indigo-900 mb-1.5">Email or Phone Number</label>
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    setForm({ ...form, email, phone: email ? "" : form.phone });
                  }}
                  className="w-full h-11 sm:h-12 rounded-2xl border border-gray-300 bg-gray-50 px-3 sm:px-4 text-sm sm:text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
                <input
                  type="tel"
                  placeholder="(123) 456-7890"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const phone = e.target.value;
                    setForm({ ...form, phone, email: phone ? "" : form.email });
                  }}
                  className="w-full h-11 sm:h-12 rounded-2xl border border-gray-300 bg-gray-50 px-3 sm:px-4 text-sm sm:text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Enter email or phone, not both. We will send OTP to one chosen contact.</p>
            </div>
          </div>

          {/* Send OTP Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full h-12 sm:h-14 rounded-2xl bg-indigo-900 text-white font-semibold text-sm sm:text-base transition hover:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending OTP...
              </span>
            ) : (
              "Send OTP"
            )}
            {!loading && (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
          {!loading && isSubmitDisabled && (
            <p className="mt-3 text-sm text-slate-500">
              Enter your full name and a single contact method to receive a one-time login code.
            </p>
          )}

          {/* End-to-End Encrypted Info */}
          <div className="rounded-2xl border border-gray-200 bg-blue-50 p-3 sm:p-4 flex gap-2 sm:gap-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900 text-xs sm:text-sm">End-to-End Encrypted.</p>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5">A one-time code will be sent to your selected contact method.</p>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center py-3 sm:py-4 border-t border-gray-200 bg-white/50">
        <p className="text-xs sm:text-sm text-gray-500 tracking-widest uppercase">
          🔒 Secured by Pryv-P Protocol
        </p>
      </div>
    </div>
  );
}
