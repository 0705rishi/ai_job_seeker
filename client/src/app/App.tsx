import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Briefcase, FileText, CheckSquare, User, Compass, LogOut } from "lucide-react";
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

// Phase 1 Mock Screen Components
const LandingScreen = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold font-display text-ink max-w-3xl leading-tight">
        Find the jobs that <span className="text-indigo">actually fit you</span>
      </h1>
      <p className="mt-6 text-lg text-text-muted max-w-xl">
        Upload your resume. We'll show you where you match — and what's one step away.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/signup"
          className="px-8 py-3 bg-indigo text-white font-medium rounded-button hover:bg-opacity-90 active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
        >
          Get started free
        </Link>
        <Link
          to="/login"
          className="px-8 py-3 bg-white border border-border text-ink font-medium rounded-button hover:bg-canvas transition-all text-center min-h-[44px] flex items-center justify-center"
        >
          See how it works
        </Link>
      </div>
    </div>
  );
};



// Mock Recruiter screen removed, now using RecruiterDashboardPage.

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const isAuthPage = ["/", "/login", "/signup"].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <header className="border-b border-border bg-white py-4 px-6 flex items-center justify-between">
          <Link to="/" className="text-xl font-display font-bold tracking-tight text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo flex items-center justify-center text-white text-xs font-mono">G</span>
            AI Job Seeker
          </Link>
          {!isAuthenticated && (
            <div className="flex gap-4">
              <Link to="/login" className="text-sm font-medium text-text-muted hover:text-indigo">Log In</Link>
              <Link to="/signup" className="text-sm font-medium text-indigo hover:underline">Sign Up</Link>
            </div>
          )}
        </header>
        <main className="flex-1 flex items-center justify-center p-6">{children}</main>
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
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border p-6 space-y-6">
        <Link to="/" className="text-xl font-display font-bold tracking-tight text-ink flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo flex items-center justify-center text-white text-xs font-mono">G</span>
          AI Job Seeker
        </Link>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-tint text-indigo"
                    : "text-text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose hover:bg-rose-tint rounded-button transition-all"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <header className="md:hidden border-b border-border bg-white py-4 px-6 flex items-center justify-between">
          <span className="text-lg font-display font-bold tracking-tight text-ink flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-indigo flex items-center justify-center text-white text-[10px] font-mono">G</span>
            AI Job Seeker
          </span>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-full bg-rose-tint text-rose flex items-center justify-center text-xs font-bold"
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </header>
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border py-2 px-4 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
                isActive ? "text-indigo" : "text-text-muted"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export const AppContent = () => {
  const { isMeLoading } = useAuth();

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
