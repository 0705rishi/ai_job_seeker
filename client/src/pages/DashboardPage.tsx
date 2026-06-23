import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Globe, ArrowRight, Sparkles, Briefcase } from "lucide-react";
import useAuthStore from "../store/auth.store";
import useRecommendations, { Recommendation } from "../features/useRecommendations";
import MatchRing from "../components/match-ring/MatchRing";
import JobDetailsDrawer from "../components/jobs/JobDetailsDrawer";
import useApplications from "../features/useApplications";

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [activeRecDetails, setActiveRecDetails] = useState<Recommendation | null>(null);

  const { useGetRecommendations } = useRecommendations();
  const { data: recData, isLoading: isRecLoading, error: recError } = useGetRecommendations();

  const { useGetMyApplications } = useApplications();
  const { data: appsData, isLoading: isAppsLoading, error: appsError } = useGetMyApplications();

  const onboardingRequired = recData?.data?.onboardingRequired ?? false;
  const recommendations = recData?.data?.recommendations || [];
  const topMatch = recommendations[0] || null;
  const otherMatches = recommendations.slice(1);

  const myApplications = appsData?.data || [];
  const totalApplied = myApplications.length;
  const underReview = myApplications.filter(a => a.status === "review").length;
  const shortlisted = myApplications.filter(a => a.status === "shortlisted").length;
  const responseRate = totalApplied > 0 
    ? Math.round(((underReview + shortlisted) / totalApplied) * 100) 
    : 0;

  const isLoading = isRecLoading || isAppsLoading;
  const error = recError || appsError;

  // loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border rounded w-1/3 animate-pulse" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white border border-border rounded-card h-28 space-y-3 animate-pulse">
              <div className="h-4 bg-border rounded w-1/2" />
              <div className="h-8 bg-border rounded w-1/3" />
            </div>
          ))}
        </div>

        {/* Spotlight Card Skeleton */}
        <div className="p-6 bg-white border border-border rounded-card h-64 space-y-4 animate-pulse">
          <div className="h-4 bg-border rounded w-1/4" />
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-full bg-border" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-border rounded w-1/2" />
              <div className="h-4 bg-border rounded w-1/3" />
              <div className="h-4 bg-border rounded w-3/4" />
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white border border-border rounded-card h-44 space-y-4 animate-pulse">
              <div className="h-5 bg-border rounded w-2/3" />
              <div className="h-4 bg-border rounded w-1/2" />
              <div className="h-4 bg-border rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white border border-border rounded-card max-w-md mx-auto space-y-4">
        <AlertCircle size={36} className="text-rose mx-auto" />
        <h3 className="text-lg font-bold text-ink">Recommendations Error</h3>
        <p className="text-sm text-text-muted">We encountered an issue calculating your match recommendations. Please try refreshing.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-indigo text-white text-sm font-medium rounded-button hover:bg-opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-ink">
          Welcome back, {user?.name || "Seeker"}!
        </h1>
        <p className="text-text-muted mt-1">
          Here is your personalized, AI-ranked job recommendation analysis.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface rounded-card border border-border/80 shadow-premium hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Match-ready jobs
              </span>
              <div className="mt-3 text-4xl font-mono font-bold text-indigo">
                {onboardingRequired ? 0 : recommendations.length}
              </div>
            </div>
            <span className="p-2.5 rounded-lg bg-indigo-tint/50 text-indigo shrink-0">
              <Sparkles size={18} />
            </span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-card border border-border/80 shadow-premium hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Applications sent
              </span>
              <div className="mt-3 text-4xl font-mono font-bold text-emerald">{totalApplied}</div>
            </div>
            <span className="p-2.5 rounded-lg bg-emerald-tint/50 text-emerald shrink-0">
              <Briefcase size={18} />
            </span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-card border border-border/80 shadow-premium hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-amber" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Response rate
              </span>
              <div className="mt-3 text-4xl font-mono font-bold text-amber">{responseRate}%</div>
            </div>
            <span className="p-2.5 rounded-lg bg-amber-tint/50 text-amber shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </span>
          </div>
        </div>
      </div>

      {/* Onboarding Needed Banner */}
      {onboardingRequired ? (
        <div className="p-8 glass-card rounded-card flex flex-col md:flex-row gap-6 items-center relative overflow-hidden transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-coral/5 via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-coral/10 rounded-full blur-[40px] pointer-events-none glowing-blob" />
          
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-coral/10 border border-coral/10 animate-ping opacity-75" />
            <div className="relative w-12 h-12 bg-gradient-to-tr from-coral to-coral/80 text-white rounded-full flex items-center justify-center shadow-md">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xl font-bold text-ink font-display">Complete your profile to unlock recommendations</h3>
            <p className="text-text-muted mt-1 text-sm leading-relaxed">
              Upload your resume and let Gemini parse your skills, education, and projects to align you with top matching opportunities.
            </p>
          </div>
          
          <Link
            to="/profile"
            className="md:ml-auto px-6 py-3 bg-indigo text-white text-sm font-bold rounded-button shadow-premium hover:shadow-indigo/25 hover:-translate-y-0.5 active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center shrink-0 relative z-10"
          >
            Go to Profile
          </Link>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-card max-w-md mx-auto space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-tint/5 to-transparent pointer-events-none" />
          <div className="w-16 h-16 rounded-full bg-canvas border border-border flex items-center justify-center mx-auto text-text-muted">
            <Briefcase size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-ink font-display">No matching jobs found</h3>
            <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
              There are currently no active job postings. Please complete/expand your profile or check back later.
            </p>
          </div>
          <Link
            to="/profile"
            className="px-6 py-2.5 bg-indigo text-white text-xs font-semibold rounded-button shadow-premium hover:bg-opacity-95 active:scale-95 inline-block transition-all"
          >
            Update Profile
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Match Spotlight */}
          {topMatch && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-indigo uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={14} className="text-indigo" /> Top Match Spotlight
              </h2>
              
              <div 
                className="p-6 md:p-8 bg-surface border border-indigo/25 rounded-card shadow-premium hover:border-indigo/40 hover:-translate-y-1 hover:shadow-card transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer relative overflow-hidden group"
                onClick={() => setActiveRecDetails(topMatch)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/5 rounded-full blur-[40px] pointer-events-none transition-all duration-300 group-hover:scale-150" />
                <div className="absolute top-0 left-0 w-[4px] h-full bg-indigo" />
                
                <div className="space-y-4 flex-1 relative z-10">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo/10 to-indigo/20 border border-indigo/10 text-indigo flex items-center justify-center text-lg font-bold uppercase shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      {topMatch.job.company.slice(0, 2)}
                    </span>
                    <div>
                      <h3 className="font-bold text-xl text-ink leading-tight">{topMatch.job.title}</h3>
                      <p className="text-indigo text-sm font-semibold mt-0.5">{topMatch.job.company}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-text-muted line-clamp-2">
                    {topMatch.job.description}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold bg-canvas text-text-muted px-2.5 py-1 rounded-full border border-border/40 inline-flex items-center gap-1">
                      <MapPin size={10} /> {topMatch.job.location}
                    </span>
                    <span className="text-[11px] font-semibold bg-indigo-tint/50 text-indigo px-2.5 py-1 rounded-full border border-indigo/5 inline-flex items-center gap-1">
                      <Globe size={10} /> {topMatch.job.workMode.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-tint/50 text-emerald px-2.5 py-1 rounded-full border border-emerald/5">
                      {topMatch.job.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-canvas border border-border/40 p-3 rounded-lg flex items-center gap-2">
                    <Award size={16} className="text-indigo shrink-0" />
                    <p className="text-xs text-ink/90 font-medium leading-relaxed">
                      {topMatch.match.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 border-border/30 pt-4 md:pt-0 gap-4 relative z-10">
                  <MatchRing score={topMatch.match.score} size="large" />
                  <button
                    type="button"
                    className="text-indigo text-sm font-bold hover:underline inline-flex items-center gap-1 self-center"
                  >
                    View Breakdown <ArrowRight size={15} className="transform group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Jobs Grid */}
          {otherMatches.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-display font-semibold text-ink">Other Recommended Jobs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherMatches.map((rec) => (
                  <div
                    key={rec.job._id}
                    className="p-6 bg-surface rounded-card border border-border/80 shadow-premium hover:border-indigo/35 hover:-translate-y-1 hover:shadow-card transition-all duration-300 flex flex-col justify-between h-[210px] cursor-pointer group relative overflow-hidden"
                    onClick={() => setActiveRecDetails(rec)}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo/5 rounded-full blur-2xl pointer-events-none transition-all duration-300 group-hover:scale-150" />
                    
                    <div className="flex justify-between items-start gap-4 relative z-10">
                      <div className="space-y-1 pr-4">
                        <h3 className="font-bold text-base text-ink line-clamp-1 group-hover:text-indigo transition-colors duration-200">
                          {rec.job.title}
                        </h3>
                        <p className="text-sm text-indigo font-semibold">{rec.job.company}</p>
                      </div>
                      <MatchRing score={rec.match.score} size="medium" />
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2 mt-2 leading-relaxed relative z-10">
                      {rec.match.explanation}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30 relative z-10">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold bg-canvas text-text-muted px-2.5 py-1 rounded-full border border-border/40 inline-flex items-center gap-1">
                          <MapPin size={9} /> {rec.job.location}
                        </span>
                        <span className="text-[10px] font-semibold bg-indigo-tint/50 text-indigo px-2.5 py-1 rounded-full border border-indigo/5 inline-flex items-center gap-1">
                          <Globe size={9} /> {rec.job.workMode.toUpperCase()}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="text-indigo text-xs font-bold hover:underline inline-flex items-center gap-1 group-hover:text-indigo-hover transition-colors"
                      >
                        Details <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Drawer Overlay */}
      {activeRecDetails && (
        <JobDetailsDrawer
          job={activeRecDetails.job}
          match={activeRecDetails.match}
          onClose={() => setActiveRecDetails(null)}
        />
      )}
    </div>
  );
};

// SVG components to bypass missing lucide-react typings
const AlertCircle = ({ size, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const Award = ({ size, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export default DashboardPage;
