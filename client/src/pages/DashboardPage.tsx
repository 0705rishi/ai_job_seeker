import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Globe, ArrowRight, Sparkles, Briefcase } from "lucide-react";
import useAuthStore from "../store/auth.store";
import useRecommendations, { Recommendation } from "../features/useRecommendations";
import MatchRing from "../components/match-ring/MatchRing";
import JobDetailsDrawer from "../components/jobs/JobDetailsDrawer";

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [activeRecDetails, setActiveRecDetails] = useState<Recommendation | null>(null);

  const { useGetRecommendations } = useRecommendations();
  const { data, isLoading, error } = useGetRecommendations();

  const onboardingRequired = data?.data?.onboardingRequired ?? false;
  const recommendations = data?.data?.recommendations || [];
  const topMatch = recommendations[0] || null;
  const otherMatches = recommendations.slice(1);

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
        <h1 className="text-3xl font-display font-semibold text-ink">
          Welcome back, {user?.name || "Seeker"}!
        </h1>
        <p className="text-text-muted mt-1">
          Here is your personalized, AI-ranked job recommendation analysis.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-card border border-border shadow-card hover:shadow-card-hover transition-all">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Match-ready jobs
          </span>
          <div className="mt-2 text-4xl font-mono font-bold text-indigo">
            {onboardingRequired ? 0 : recommendations.length}
          </div>
        </div>
        <div className="p-6 bg-white rounded-card border border-border shadow-card hover:shadow-card-hover transition-all">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Applications sent
          </span>
          <div className="mt-2 text-4xl font-mono font-bold text-emerald">4</div>
        </div>
        <div className="p-6 bg-white rounded-card border border-border shadow-card hover:shadow-card-hover transition-all">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Response rate
          </span>
          <div className="mt-2 text-4xl font-mono font-bold text-amber">75%</div>
        </div>
      </div>

      {/* Onboarding Needed Banner */}
      {onboardingRequired ? (
        <div className="p-8 bg-coral-tint border border-coral/20 rounded-card flex flex-col md:flex-row gap-6 items-center">
          <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center text-coral shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">Complete your profile to unlock recommendations</h3>
            <p className="text-text-muted mt-1 text-sm">
              Upload your resume and let Gemini parse your skills, education, and projects to align you with top matching opportunities.
            </p>
          </div>
          <Link
            to="/profile"
            className="md:ml-auto px-6 py-2.5 bg-indigo text-white text-sm font-medium rounded-button hover:bg-opacity-95 text-center min-h-[44px] flex items-center justify-center shrink-0"
          >
            Go to Profile
          </Link>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-16 text-center bg-white border border-border rounded-card max-w-md mx-auto space-y-4">
          <Briefcase size={40} className="text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-ink">No matching jobs found</h3>
          <p className="text-sm text-text-muted">
            There are currently no active job postings. Please complete/expand your profile or check back later.
          </p>
          <Link
            to="/profile"
            className="px-6 py-2 bg-indigo text-white text-sm font-medium rounded-button hover:bg-opacity-90 inline-block"
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
                <Sparkles size={14} /> Top Match Spotlight
              </h2>
              
              <div 
                className="p-6 md:p-8 bg-white border border-indigo/20 rounded-card shadow-card hover:border-indigo/40 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
                onClick={() => setActiveRecDetails(topMatch)}
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-xl bg-indigo-tint text-indigo flex items-center justify-center text-lg font-bold uppercase shrink-0">
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
                    <span className="text-[11px] font-semibold bg-canvas text-text-muted px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                      <MapPin size={10} /> {topMatch.job.location}
                    </span>
                    <span className="text-[11px] font-semibold bg-indigo-tint/50 text-indigo px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                      <Globe size={10} /> {topMatch.job.workMode.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-tint/50 text-emerald px-2.5 py-1 rounded-full">
                      {topMatch.job.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-indigo-tint/30 border border-indigo/5 p-3 rounded-lg flex items-center gap-2">
                    <Award size={16} className="text-indigo shrink-0" />
                    <p className="text-xs text-indigo-950 font-medium">
                      {topMatch.match.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 border-border pt-4 md:pt-0 gap-4">
                  <MatchRing score={topMatch.match.score} size="large" />
                  <button
                    type="button"
                    className="text-indigo text-sm font-semibold hover:underline inline-flex items-center gap-1 self-center"
                  >
                    View Breakdown <ArrowRight size={16} />
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
                    className="p-6 bg-white rounded-card border border-border hover:border-indigo/30 hover:shadow-card-hover transition-all flex flex-col justify-between h-[210px] cursor-pointer"
                    onClick={() => setActiveRecDetails(rec)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 pr-4">
                        <h3 className="font-bold text-base text-ink line-clamp-1 hover:text-indigo transition-colors">
                          {rec.job.title}
                        </h3>
                        <p className="text-sm text-indigo font-semibold">{rec.job.company}</p>
                      </div>
                      <MatchRing score={rec.match.score} size="medium" />
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2 mt-2">
                      {rec.match.explanation}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold bg-canvas text-text-muted px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <MapPin size={9} /> {rec.job.location}
                        </span>
                        <span className="text-[10px] font-semibold bg-indigo-tint/50 text-indigo px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Globe size={9} /> {rec.job.workMode.toUpperCase()}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="text-indigo text-xs font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Details <ArrowRight size={14} />
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
