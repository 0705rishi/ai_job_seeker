import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, BookOpen, CheckCircle2, ChevronRight, FileText, Copy, Loader2, RefreshCw } from "lucide-react";
import useJobs from "../features/useJobs";
import useRecommendations from "../features/useRecommendations";
import useAi, { SkillGapItem } from "../features/useAi";

export const SkillGapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const jobId = id || "";

  const { useGetJobById } = useJobs();
  const { useGetJobMatch } = useRecommendations();
  const { useGetSkillGap, useGenerateCoverLetter } = useAi();

  const { data: jobData, isLoading: isLoadingJob, error: jobError } = useGetJobById(jobId);
  const { data: matchData, isLoading: isLoadingMatch } = useGetJobMatch(jobId);
  
  const getSkillGapMutation = useGetSkillGap();
  const generateCoverLetterMutation = useGenerateCoverLetter();

  const [gaps, setGaps] = useState<SkillGapItem[]>([]);
  const [loadingGaps, setLoadingGaps] = useState(true);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trigger skill gap analysis
  useEffect(() => {
    if (!jobId) return;
    
    let isMounted = true;
    setLoadingGaps(true);
    
    getSkillGapMutation.mutateAsync({ jobId })
      .then((res) => {
        if (isMounted && res.success) {
          setGaps(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load skill gaps", err);
      })
      .finally(() => {
        if (isMounted) setLoadingGaps(false);
      });

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleGenerateCoverLetter = async () => {
    setGeneratingLetter(true);
    try {
      const res = await generateCoverLetterMutation.mutateAsync({ jobId });
      if (res?.success) {
        setCoverLetter(res.data.coverLetter);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate cover letter.");
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingJob || isLoadingMatch || loadingGaps) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border animate-pulse rounded-md w-1/4" />
        <div className="h-32 bg-white border border-border rounded-card p-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white border border-border rounded-card p-6 animate-pulse" />
          <div className="h-64 bg-white border border-border rounded-card p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (jobError || !jobData?.data) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-border rounded-card shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-ink">Job Not Found</h2>
        <p className="text-sm text-text-muted">The job details you are searching for are not available.</p>
        <Link to="/jobs" className="px-4 py-2 bg-indigo text-white text-sm font-medium rounded-button inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const job = jobData.data;
  const match = matchData?.data?.match || { score: 0, matchedSkills: [], missingSkills: [] };
  
  // Calculate potential match score
  const totalLift = gaps.reduce((sum, item) => sum + item.lift, 0);
  const potentialScore = Math.min(100, match.score + totalLift);

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-indigo transition-colors">
        <ArrowLeft size={14} /> Back to Job Catalog
      </Link>

      {/* Header Info */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-tint text-indigo">
          AI Skill-Gap Analyzer
        </span>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-ink mt-2">
          {job.title} <span className="text-text-muted font-normal">at</span> <span className="text-indigo">{job.company}</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          {job.location} • {job.workMode.toUpperCase()}
        </p>
      </div>

      {/* Score Uplift Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-tint/40 to-coral-tint/30 border border-indigo/10 rounded-card flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-bold text-base text-ink">Optimize Compatibility</h3>
          <p className="text-xs text-text-muted max-w-lg leading-relaxed">
            You currently have a <span className="text-indigo font-bold">{match.score}%</span> match score for this role. Learning the missing skills can lift your score up to <span className="text-emerald font-bold">{potentialScore}%</span>.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center p-3 bg-white border border-border rounded-xl">
            <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider">Current</span>
            <span className="text-xl font-bold font-mono text-indigo">{match.score}%</span>
          </div>
          <ChevronRight className="text-text-muted hidden md:block" size={20} />
          <div className="text-center p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
            <span className="block text-[10px] text-emerald font-bold uppercase tracking-wider">Potential</span>
            <span className="text-xl font-bold font-mono text-emerald">{potentialScore}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Missing Skills & Resources */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-1.5">
            <BookOpen className="text-rose" size={20} /> Skills to Learn
          </h2>

          <div className="space-y-4">
            {gaps.map((item, idx) => (
              <div
                key={idx}
                className="p-5 bg-white border border-border rounded-card hover:border-coral/20 hover:shadow-card-hover transition-all flex justify-between items-start gap-4"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-bold bg-rose-tint text-rose border border-rose/10 px-2.5 py-0.5 rounded-full inline-block">
                    {item.skill}
                  </span>
                  <p className="text-xs text-text-muted leading-relaxed font-medium">
                    {item.resource}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-bold font-mono text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
                    +{item.lift}%
                  </span>
                </div>
              </div>
            ))}

            {gaps.length === 0 && (
              <div className="p-8 text-center bg-white border border-border rounded-card text-text-muted text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="text-emerald" size={18} />
                No skill gaps found! You are fully qualified for this job.
              </div>
            )}
          </div>
        </div>

        {/* Tailored Cover Letter Generator */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-1.5">
            <FileText className="text-indigo" size={20} /> Tailored Cover Letter
          </h2>

          <div className="bg-white border border-border rounded-card p-6 shadow-sm space-y-4">
            {!coverLetter ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs text-text-muted leading-relaxed">
                  Generate a cover letter specifically draft-tailored to highlight how your profile matches {job.company}'s requirements.
                </p>
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingLetter}
                  className="px-6 py-2.5 bg-indigo text-white font-medium text-sm rounded-button hover:bg-opacity-95 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {generatingLetter ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Drafting letter...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Draft Cover Letter
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  className="w-full p-4 border border-border text-xs text-ink font-mono bg-canvas rounded-xl focus:outline-none focus:border-indigo"
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo hover:underline"
                  >
                    <Copy size={14} /> {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                  
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingLetter}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-indigo"
                  >
                    <RefreshCw size={12} className={generatingLetter ? "animate-spin" : ""} /> Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matched Skills */}
      <div className="p-6 bg-white border border-border rounded-card shadow-sm space-y-4">
        <h3 className="font-bold text-xs text-text-muted uppercase tracking-wider">Already Matched Skills</h3>
        <div className="flex flex-wrap gap-2">
          {match.matchedSkills.map((skill: string, idx: number) => (
            <span
              key={idx}
              className="text-xs font-semibold bg-emerald/10 text-emerald-700 border border-emerald/20 px-3 py-1 rounded-full flex items-center gap-1"
            >
              {skill} ✓
            </span>
          ))}
          {match.matchedSkills.length === 0 && (
            <p className="text-xs text-text-muted italic">No overlapping skills found in profile details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
