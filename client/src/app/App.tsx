import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Briefcase, FileText, CheckSquare, User, Compass, LogOut, Sparkles } from "lucide-react";
import Providers from "./providers";
import AuthPage from "../pages/AuthPage";
import OnboardingPage from "../pages/OnboardingPage";
import BrowseJobsPage from "../pages/BrowseJobsPage";
import DashboardPage from "../pages/DashboardPage";
import ApplicationsPage from "../pages/ApplicationsPage";
import RecruiterDashboardPage from "../pages/RecruiterDashboardPage";
import RecruiterJobsPage from "../pages/RecruiterJobsPage";
import ResumeAnalyzerPage from "../pages/ResumeAnalyzerPage";
import SkillGapPage from "../pages/SkillGapPage";
import useAuthStore from "../store/auth.store";
import useAuth from "../features/useAuth";
import AiChatbot from "../components/AiChatbot";

// Custom inline SVGs to bypass missing lucide-react typings
const Sun = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const Moon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole?: "seeker" | "recruiter" }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-4 bg-canvas">
        <div className="w-12 h-12 rounded-full border-4 border-indigo/20 border-t-indigo animate-spin" />
        <p className="text-text-muted text-sm font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user && user.role !== allowedRole) {
    return <Navigate to={user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

// Premium Redesigned Landing Screen
const LandingScreen = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} replace />;
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 md:py-24 flex flex-col items-center text-center space-y-12">
      {/* Decorative Blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo/10 blur-[90px] pointer-events-none z-0 glowing-blob" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-tint/70 dark:bg-indigo-tint/10 border border-indigo/15 text-indigo text-xs font-semibold uppercase tracking-wider relative z-10">
        <Sparkles size={12} className="animate-spin text-indigo" />
        <span>AI-powered Career Search Engine</span>
      </div>

      {/* Hero Headings */}
      <div className="space-y-6 relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold font-display text-ink tracking-tight leading-none max-w-4xl mx-auto">
          Match your skills to the <span className="text-indigo bg-gradient-to-r from-indigo to-coral bg-clip-text text-transparent">perfect job</span>
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto font-medium">
          Upload your resume and let Gemini analyze your competencies, calculate precise compatibility scores, and help you draft letters instantly.
        </p>
      </div>

      {/* Call to Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10 w-full max-w-md mx-auto">
        <Link
          to="/signup"
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo text-white font-semibold rounded-button shadow-premium hover:shadow-card hover:bg-opacity-95 text-center min-h-[48px] flex items-center justify-center transition-all duration-300"
        >
          Get started free
        </Link>
        <Link
          to="/login"
          className="w-full sm:w-auto px-8 py-3.5 bg-surface border border-border text-ink font-semibold rounded-button hover:bg-canvas text-center min-h-[48px] flex items-center justify-center transition-all duration-300 shadow-sm"
        >
          Log In
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16 relative z-10">
        <div className="p-6 rounded-card border border-border bg-surface shadow-premium flex flex-col items-center text-center space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
          <span className="w-12 h-12 rounded-xl bg-indigo-tint/50 text-indigo flex items-center justify-center">
            <Compass size={22} />
          </span>
          <h3 className="font-bold text-lg text-ink font-display">Compatibility Scoring</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            See exactly why you match with individual roles, quantified by semantic resume alignment models.
          </p>
        </div>

        <div className="p-6 rounded-card border border-border bg-surface shadow-premium flex flex-col items-center text-center space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
          <span className="w-12 h-12 rounded-xl bg-coral-tint/50 text-coral flex items-center justify-center">
            <FileText size={22} />
          </span>
          <h3 className="font-bold text-lg text-ink font-display">Resume Diagnostics</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Evaluate your ATS profile, find critical missing keyword gaps, and receive suggestions for improvement.
          </p>
        </div>

        <div className="p-6 rounded-card border border-border bg-surface shadow-premium flex flex-col items-center text-center space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
          <span className="w-12 h-12 rounded-xl bg-emerald-tint/50 text-emerald flex items-center justify-center">
            <Sparkles size={22} />
          </span>
          <h3 className="font-bold text-lg text-ink font-display">AI Cover Letters</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Draft tailored, job-specific cover letters and compile downloadable LaTeX resumes in seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

// Application Main Layout
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const isAuthPage = ["/", "/login", "/signup"].includes(location.pathname);

  // Variable Theme State
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col relative overflow-hidden">
        {/* Glow backdrop blobs for landing page */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo/5 dark:bg-indigo/10 blur-[120px] pointer-events-none z-0 glowing-blob" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-coral/5 dark:bg-coral/10 blur-[120px] pointer-events-none z-0 glowing-blob" style={{ animationDelay: "2s" }} />

        <header className="border-b border-border bg-surface/70 backdrop-blur-md py-4 px-6 flex items-center justify-between relative z-10">
          <Link to="/" className="text-xl font-display font-bold tracking-tight text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo flex items-center justify-center text-white text-xs font-mono">G</span>
            AI Job Seeker
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-canvas text-text-muted hover:text-ink transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {!isAuthenticated ? (
              <div className="flex gap-4">
                <Link to="/login" className="text-sm font-medium text-text-muted hover:text-indigo">Log In</Link>
                <Link to="/signup" className="text-sm font-medium text-indigo hover:underline">Sign Up</Link>
              </div>
            ) : (
              <Link to={user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} className="text-sm font-medium text-indigo hover:underline">Dashboard</Link>
            )}
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6 relative z-10">{children}</main>
      </div>
    );
  }

  // Determine navigation items based on user role
  const isRecruiter = user?.role === "recruiter";
  const navItems = isRecruiter
    ? [
        { label: "Dashboard", path: "/recruiter/dashboard", icon: Compass },
        { label: "My Postings", path: "/recruiter/jobs", icon: Briefcase },
      ]
    : [
        { label: "Dashboard", path: "/dashboard", icon: Compass },
        { label: "Browse Jobs", path: "/jobs", icon: Briefcase },
        { label: "Resume Analyzer", path: "/resume", icon: FileText },
        { label: "Applications", path: "/applications", icon: CheckSquare },
        { label: "Profile", path: "/profile", icon: User },
      ];

  return (
    <div className="h-screen bg-canvas flex flex-col relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-indigo/5 dark:bg-indigo/8 blur-[100px] pointer-events-none z-0 glowing-blob animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-coral/5 dark:bg-coral/8 blur-[100px] pointer-events-none z-0 glowing-blob animate-pulse" style={{ animationDelay: "3s" }} />

      {/* Sticky Top Horizontal Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md shadow-premium">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-display font-bold tracking-tight text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo flex items-center justify-center text-white text-xs font-mono">G</span>
            AI Job Seeker
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-tint text-indigo font-semibold"
                      : "text-text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-canvas text-text-muted hover:text-ink transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full text-rose hover:bg-rose-tint transition-all"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Row */}
        <nav className="md:hidden flex items-center gap-1 border-t border-border overflow-x-auto py-2.5 px-4 whitespace-nowrap scrollbar-none bg-surface/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-button text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-indigo-tint text-indigo font-semibold"
                    : "text-text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-6xl w-full mx-auto relative z-10">
        {children}
      </main>
    </div>
  );
};

export const AppContent = () => {
  const { isMeLoading } = useAuth();
  const { isAuthenticated, user } = useAuthStore();

  if (isMeLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-canvas">
        <div className="w-12 h-12 rounded-full border-4 border-indigo/20 border-t-indigo animate-spin" />
        <p className="text-text-muted text-sm mt-4 font-medium">Loading session...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Seeker Gated Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="seeker">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRole="seeker">
              <BrowseJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute allowedRole="seeker">
              <ResumeAnalyzerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/gap"
          element={
            <ProtectedRoute allowedRole="seeker">
              <SkillGapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRole="seeker">
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="seeker">
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Gated Routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterJobsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Floating Career Coach Chatbot */}
      {isAuthenticated && user?.role === "seeker" && <AiChatbot />}
    </AppLayout>
  );
};

export const App = () => {
  return (
    <Providers>
      <Router>
        <AppContent />
      </Router>
    </Providers>
  );
};

export default App;
