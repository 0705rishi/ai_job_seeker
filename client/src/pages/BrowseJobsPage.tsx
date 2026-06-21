import React, { useState } from "react";
import { Search, MapPin, Briefcase, Globe, ArrowRight } from "lucide-react";
import useJobs, { Job } from "../features/useJobs";
import useRecommendations from "../features/useRecommendations";
import JobDetailsDrawer from "../components/jobs/JobDetailsDrawer";

export const BrowseJobsPage = () => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

  const [activeJobDetails, setActiveJobDetails] = useState<Job | null>(null);

  // Instantiating hook with active filters
  const { useGetJobs } = useJobs({
    search: search || undefined,
    location: location || undefined,
    workMode: workMode !== "all" ? workMode : undefined,
    type: type !== "all" ? type : undefined,
    page,
    limit: 10,
  });

  const { data, isLoading, error } = useGetJobs();
  const jobs = data?.data?.jobs || [];
  const pagination = data?.data?.pagination;

  // Retrieve match score breakdown for details drawer
  const { useGetJobMatch } = useRecommendations();
  const { data: matchData } = useGetJobMatch(
    activeJobDetails?._id || "",
    !!activeJobDetails
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setLocation("");
    setWorkMode("all");
    setType("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink">Explore Jobs</h1>
          <p className="text-text-muted mt-1">Find your next opportunity across tech roles and locations.</p>
        </div>
      </div>

      {/* Filter / Search panel */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-card p-6 border border-border shadow-card grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4 space-y-1">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Job title, company or keywords"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-border rounded-button text-sm text-ink placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-3 space-y-1">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="e.g. Bengaluru"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-border rounded-button text-sm text-ink placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Work Mode</label>
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="w-full px-3 py-2.5 bg-canvas border border-border rounded-button text-sm text-ink focus:outline-none"
          >
            <option value="all">Any Mode</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Job Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 bg-canvas border border-border rounded-button text-sm text-ink focus:outline-none"
          >
            <option value="all">Any Type</option>
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div className="md:col-span-1 flex gap-2 w-full">
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo text-white text-sm font-semibold rounded-button hover:bg-opacity-95 flex items-center justify-center"
          >
            Find
          </button>
        </div>
      </form>

      {/* Grid of Job cards / Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 4, 6].map((i) => (
            <div key={i} className="p-6 bg-white border border-border rounded-card h-44 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-2/3">
                  <div className="h-5 bg-border rounded" />
                  <div className="h-4 bg-border rounded w-1/2" />
                </div>
                <div className="w-12 h-12 bg-border rounded" />
              </div>
              <div className="h-4 bg-border rounded w-3/4" />
              <div className="flex gap-2">
                <div className="h-6 bg-border rounded w-16" />
                <div className="h-6 bg-border rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-white border border-border rounded-card max-w-md mx-auto space-y-4">
          <AlertCircle size={36} className="text-rose mx-auto" />
          <h3 className="text-lg font-bold text-ink">Failed to load jobs</h3>
          <p className="text-sm text-text-muted">There was a network error retrieving the job openings feed. Please try reloading the page.</p>
          <button onClick={handleResetFilters} className="px-6 py-2 bg-indigo text-white text-sm font-medium rounded-button hover:bg-opacity-90">
            Reset Filters
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center bg-white border border-border rounded-card max-w-md mx-auto space-y-4">
          <Briefcase size={40} className="text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-ink">No matching jobs found</h3>
          <p className="text-sm text-text-muted">We couldn't find any job postings matching your filters. Try resetting the filters or modifying search keywords.</p>
          <button onClick={handleResetFilters} className="px-6 py-2 bg-indigo text-white text-sm font-medium rounded-button hover:bg-opacity-90">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="p-6 bg-white rounded-card border border-border hover:border-indigo/40 hover:shadow-card-hover transition-all flex flex-col justify-between h-48 cursor-pointer"
              onClick={() => setActiveJobDetails(job)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-ink line-clamp-1 hover:text-indigo transition-colors">{job.title}</h3>
                  <p className="text-sm text-indigo font-medium">{job.company}</p>
                </div>
                <span className="w-10 h-10 rounded-lg bg-indigo-tint text-indigo flex items-center justify-center text-sm font-bold uppercase shrink-0">
                  {job.company.slice(0, 2)}
                </span>
              </div>

              <p className="text-xs text-text-muted line-clamp-2 mt-2">{job.description}</p>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold bg-canvas text-text-muted px-2.5 py-1 rounded-full flex items-center gap-1">
                    <MapPin size={10} /> {job.location}
                  </span>
                  <span className="text-[11px] font-semibold bg-indigo-tint/50 text-indigo px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Globe size={10} /> {job.workMode.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold bg-canvas text-text-muted px-2.5 py-1 rounded-full">
                    {job.type.toUpperCase()}
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
      )}

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-border rounded-button text-sm text-ink hover:bg-canvas disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-border rounded-button text-sm text-ink hover:bg-canvas disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal Overlay */}
      {activeJobDetails && (
        <JobDetailsDrawer
          job={activeJobDetails}
          match={matchData?.data?.match || null}
          onClose={() => setActiveJobDetails(null)}
        />
      )}
    </div>
  );
};

// Simple AlertCircle & X replacement if missing from local lucide typings
const AlertCircle = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);


export default BrowseJobsPage;
