import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Calendar, ArrowRight } from "lucide-react";
import useApplications, { Application } from "../features/useApplications";
import MatchRing from "../components/match-ring/MatchRing";
import JobDetailsDrawer from "../components/jobs/JobDetailsDrawer";

export const ApplicationsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const { useGetMyApplications } = useApplications();
  const { data, isLoading, error } = useGetMyApplications();

  const applications = data?.data || [];

  // Filter application list
  const filteredApps = statusFilter === "all"
    ? applications
    : applications.filter(app => app.status === statusFilter);

  // Stats calculations
  const totalApplied = applications.length;
  const underReview = applications.filter(a => a.status === "review").length;
  const shortlisted = applications.filter(a => a.status === "shortlisted").length;
  const responseRate = totalApplied > 0 
    ? Math.round(((underReview + shortlisted) / totalApplied) * 100) 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-indigo-tint text-indigo border-indigo/10";
      case "review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "shortlisted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-canvas text-text-muted";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white border border-border rounded-card h-28 space-y-3 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-border rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white border border-border rounded-card max-w-md mx-auto space-y-4">
        <AlertCircle size={36} className="text-rose mx-auto" />
        <h3 className="text-lg font-bold text-ink">Tracker Error</h3>
        <p className="text-sm text-text-muted">We encountered an issue retrieving your applications tracking list.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo text-white text-sm font-medium rounded-button hover:bg-opacity-90">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-ink">Application Tracker</h1>
        <p className="text-text-muted mt-1">Track status updates and interview schedules for your submitted profiles.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-card border border-border shadow-card">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Total Applications</span>
          <div className="mt-2 text-4xl font-mono font-bold text-indigo">{totalApplied}</div>
        </div>
        <div className="p-6 bg-white rounded-card border border-border shadow-card">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Shortlisted / Interviews</span>
          <div className="mt-2 text-4xl font-mono font-bold text-emerald">{shortlisted}</div>
        </div>
        <div className="p-6 bg-white rounded-card border border-border shadow-card">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Response Rate</span>
          <div className="mt-2 text-4xl font-mono font-bold text-amber">{responseRate}%</div>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {/* Status Filter Tab Bar */}
        <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
          {["all", "applied", "review", "shortlisted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all capitalize whitespace-nowrap ${
                statusFilter === status
                  ? "border-indigo text-indigo"
                  : "border-transparent text-text-muted hover:text-ink"
              }`}
            >
              {status === "all" ? "All Applications" : status === "review" ? "Under Review" : status}
            </button>
          ))}
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-16 text-center bg-white border border-border rounded-card max-w-md mx-auto space-y-4">
            <CheckSquare size={40} className="text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-ink">No applications found</h3>
            <p className="text-sm text-text-muted">
              {statusFilter === "all"
                ? "You haven't submitted any job applications yet."
                : `You don't have any applications currently marked as "${statusFilter === "review" ? "Under Review" : statusFilter}".`}
            </p>
            {statusFilter === "all" && (
              <Link to="/jobs" className="px-6 py-2 bg-indigo text-white text-sm font-medium rounded-button hover:bg-opacity-90 inline-block">
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div
                key={app._id}
                onClick={() => setSelectedApp(app)}
                className="p-5 bg-white border border-border rounded-card hover:border-indigo/35 hover:shadow-card-hover transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-lg bg-indigo-tint text-indigo flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {app.jobId?.company ? app.jobId.company.slice(0, 2) : "JB"}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-ink leading-snug hover:text-indigo transition-colors">
                      {app.jobId?.title || "Unknown Position"}
                    </h3>
                    <p className="text-sm text-text-muted mt-0.5">{app.jobId?.company || "Unknown Company"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end">
                  {/* Applied date */}
                  <span className="text-xs text-text-muted inline-flex items-center gap-1">
                    <Calendar size={12} /> {new Date(app.appliedAt).toLocaleDateString()}
                  </span>

                  {/* Status Badges */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getStatusColor(app.status)}`}>
                    {app.status === "review" ? "under review" : app.status}
                  </span>

                  {/* Small Match Ring */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Score</span>
                    <MatchRing score={app.matchScore} size="small" />
                  </div>

                  <ArrowRight size={16} className="text-text-muted hidden md:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details drawer */}
      {selectedApp && selectedApp.jobId && (
        <JobDetailsDrawer
          job={selectedApp.jobId}
          match={{
            score: selectedApp.matchScore,
            semantic: 0,
            skillOverlap: 0,
            contextBoost: 0,
            matchedSkills: [],
            missingSkills: [],
            locationMatch: true,
            workModeMatch: true,
            explanation: `You applied to this job on ${new Date(selectedApp.appliedAt).toLocaleDateString()}. Status: ${selectedApp.status.toUpperCase()}.`,
          }}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

// SVG components to bypass missing lucide-react typings
const AlertCircle = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default ApplicationsPage;
