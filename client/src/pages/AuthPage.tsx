import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../features/useAuth";

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, verifyOtp, resendOtp, isLoggingIn, isRegistering, isVerifying, isResending } = useAuth();
  
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");

  useEffect(() => {
    if (location.pathname === "/signup") {
      setMode("signup");
    } else if (location.pathname === "/login") {
      setMode("login");
    }
  }, [location.pathname]);
  
  // Registration state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"seeker" | "recruiter">("seeker");
  
  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  
  // Error / Message state
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || "Invalid email or password");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    try {
      await register({ name, email, phone: phone || undefined, password, role });
      setOtpEmail(email);
      setMode("otp");
      setInfoMessage("Registration successful! Please enter the 6-digit OTP code sent to your email.");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || "Failed to register. Email may already be in use.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    try {
      await verifyOtp({ email: otpEmail || email, code: otpCode });
      setInfoMessage("Verification successful! Logging you in...");
      setTimeout(() => {
        navigate(role === "recruiter" ? "/recruiter/dashboard" : "/dashboard");
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || "Invalid or expired OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    setInfoMessage("");
    try {
      await resendOtp({ email: otpEmail || email });
      setInfoMessage("A new verification code has been sent to your email.");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[85vh] w-full max-w-5xl bg-white rounded-card overflow-hidden shadow-card border border-border my-6">
      {/* Left panel: Info Illustration (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink-soft p-12 text-white border-r border-border">
        <div>
          <span className="text-xl font-display font-bold tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo flex items-center justify-center text-white text-xs font-mono">G</span>
            AI Job Seeker
          </span>
          <h2 className="mt-16 text-3xl font-display font-semibold leading-tight">
            Your career starts with the perfect match.
          </h2>
          <p className="mt-4 text-text-muted text-sm max-w-md">
            Our AI-powered scoring matches your skills directly with active openings. See why you match, identify skill gaps, and apply in one click.
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted">
            🔒 Your personal information and resume data are securely protected.
          </p>
        </div>
      </div>

      {/* Right panel: Authentication forms */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold font-display text-ink">
              {mode === "login" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "otp" && "Enter verification code"}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {mode === "login" && "Login to view matches and track applications"}
              {mode === "signup" && "Get started today as a seeker or recruiter"}
              {mode === "otp" && `We sent a 6-digit code to ${otpEmail || "your email"}`}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 mb-6 bg-rose-tint border border-rose/20 rounded-button text-sm text-rose">
              ⚠️ {errorMessage}
            </div>
          )}
          {infoMessage && (
            <div className="p-3 mb-6 bg-indigo-tint border border-indigo/20 rounded-button text-sm text-indigo">
              💡 {infoMessage}
            </div>
          )}

          {/* Forms */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-canvas border border-border rounded-button text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-ink" htmlFor="login-password">
                    Password
                  </label>
                  <a href="#forgot" className="text-xs font-medium text-indigo hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-canvas border border-border rounded-button text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-6 py-3 bg-indigo text-white font-medium rounded-button hover:bg-opacity-95 active:scale-98 transition-all min-h-[44px] flex items-center justify-center text-sm disabled:opacity-50"
              >
                {isLoggingIn ? "Logging in..." : "Log In"}
              </button>

              <p className="text-center text-sm text-text-muted mt-6">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-indigo font-medium hover:underline"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role cards toggle */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setRole("seeker")}
                  className={`p-4 rounded-card border text-left flex flex-col justify-between h-28 transition-all ${
                    role === "seeker"
                      ? "border-indigo bg-indigo-tint/50 text-indigo"
                      : "border-border hover:bg-canvas text-text-muted"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">Seeker</span>
                  <div>
                    <span className="font-bold text-ink block text-sm">Job Seeker</span>
                    <span className="text-xs">Find recommendations</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`p-4 rounded-card border text-left flex flex-col justify-between h-28 transition-all ${
                    role === "recruiter"
                      ? "border-indigo bg-indigo-tint/50 text-indigo"
                      : "border-border hover:bg-canvas text-text-muted"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">Recruiter</span>
                  <div>
                    <span className="font-bold text-ink block text-sm">Recruiter</span>
                    <span className="text-xs">Post jobs & hire</span>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Patel"
                  className="w-full px-4 py-2.5 bg-canvas border border-border rounded-button text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1" htmlFor="signup-email">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-canvas border border-border rounded-button text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1" htmlFor="signup-phone">
                  Phone Number (optional)
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 99999"
                  className="w-full px-4 py-2.5 bg-canvas border border-border rounded-button text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1" htmlFor="signup-password">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 bg-canvas border border-border rounded-button text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-6 py-3 bg-indigo text-white font-medium rounded-button hover:bg-opacity-95 active:scale-98 transition-all min-h-[44px] flex items-center justify-center text-sm disabled:opacity-50"
              >
                {isRegistering ? "Creating account..." : "Sign Up"}
              </button>

              <p className="text-center text-sm text-text-muted mt-6">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-indigo font-medium hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink text-center mb-4">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full tracking-[1.5rem] text-center font-mono font-semibold text-2xl px-4 py-3 bg-canvas border border-border rounded-button text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-indigo text-white font-medium rounded-button hover:bg-opacity-95 active:scale-98 transition-all min-h-[44px] flex items-center justify-center text-sm disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </button>

              <div className="text-center text-sm">
                <span className="text-text-muted">Didn't receive a code? </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-indigo font-medium hover:underline disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-text-muted text-xs hover:text-indigo hover:underline"
                >
                  Change Email / Back to Sign Up
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
