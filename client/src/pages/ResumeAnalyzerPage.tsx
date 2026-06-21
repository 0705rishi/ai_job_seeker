import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Download, ExternalLink, Sparkles, Award, CheckCircle2, AlertTriangle, ShieldCheck, Briefcase, Loader2 } from "lucide-react";
import useAi, { AtsSuggestion } from "../features/useAi";
import useProfile from "../features/useProfile";
import useRecommendations from "../features/useRecommendations";

export const ResumeAnalyzerPage: React.FC = () => {
  const { useGetAtsScore, useGenerateLatexResume, useGetSkillGap } = useAi();
  const { profile, isLoadingProfile } = useProfile();
  const { useGetRecommendations } = useRecommendations();
  
  const { data: atsData, isLoading: isLoadingAts, error: atsError } = useGetAtsScore();
  const { data: recommendationsData } = useGetRecommendations();
  
  const generateLatex = useGenerateLatexResume();
  const getSkillGap = useGetSkillGap();

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [analyzingJobGap, setAnalyzingJobGap] = useState(false);
  const [jobGapSkills, setJobGapSkills] = useState<Array<{ skill: string; resource: string; lift: number }>>([]);
  const [latexCode, setLatexCode] = useState<string>("");

  if (isLoadingProfile || isLoadingAts) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border animate-pulse rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white border border-border rounded-card p-6 h-[250px] flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-border border-t-indigo animate-spin" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-24 bg-border animate-pulse rounded-card" />
            <div className="h-24 bg-border animate-pulse rounded-card" />
            <div className="h-24 bg-border animate-pulse rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  // Handle case where profile does not exist or has no resume text uploaded
  if (!profile || !profile.resumeUrl) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-border rounded-card shadow-sm space-y-6">
        <div className="w-16 h-16 bg-rose-tint text-rose rounded-full flex items-center justify-center mx-auto">
          <FileText size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display text-ink">No Resume Uploaded</h2>
          <p className="text-sm text-text-muted">
            We need your parsed resume to perform ATS and skill gap analysis. Please upload your resume in your profile.
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo text-white font-medium rounded-button hover:bg-opacity-95 transition-all text-sm"
        >
          Go to Profile Onboarding
        </Link>
      </div>
    );
  }

  if (atsError) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-border rounded-card shadow-sm space-y-4">
        <div className="w-12 h-12 bg-rose-tint text-rose rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-bold text-ink">ATS Scan Failed</h2>
        <p className="text-sm text-text-muted">
          {atsError.message || "We encountered an issue reading your resume details."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo text-white text-sm font-medium rounded-button"
        >
          Retry Scan
        </button>
      </div>
    );
  }

  const result = atsData?.data || { score: 0, suggestions: [] };
  const score = result.score;
  
  // Grade definitions
  const getGrade = (val: number) => {
    if (val >= 75) return { label: "Strong", color: "text-emerald", bg: "bg-emerald-tint", border: "border-emerald/30" };
    if (val >= 50) return { label: "Getting there", color: "text-amber", bg: "bg-amber-tint", border: "border-amber/30" };
    return { label: "Needs work", color: "text-rose", bg: "bg-rose-tint", border: "border-rose/30" };
  };

  const grade = getGrade(score);

  // Map icons to suggestion cards dynamically
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Award": return <Award className="text-indigo" size={18} />;
      case "Briefcase": return <Briefcase className="text-indigo" size={18} />;
      case "Check": return <CheckCircle2 className="text-emerald" size={18} />;
      case "Sparkles": return <Sparkles className="text-indigo" size={18} />;
      default: return <FileText className="text-indigo" size={18} />;
    }
  };

  // Generate and set up LaTeX snippet
  const handleLatexGeneration = async () => {
    try {
      const res = await generateLatex.mutateAsync();
      if (res?.success) {
        setLatexCode(res.data.latex);
      }
    } catch (err) {
      alert("Failed to generate LaTeX resume. Please check console.");
    }
  };

  // Download LaTeX snippet file locally
  const handleDownloadTex = () => {
    if (!latexCode) return;
    const blob = new Blob([latexCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.preferences?.roles?.[0] || "Resume"}_AI_Generated.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger skill gap analysis for a chosen job
  const handleJobSelect = async (jobId: string) => {
    setSelectedJobId(jobId);
    if (!jobId) {
      setJobGapSkills([]);
      return;
    }
    setAnalyzingJobGap(true);
    try {
      const res = await getSkillGap.mutateAsync({ jobId });
      if (res?.success) {
        setJobGapSkills(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingJobGap(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-ink flex items-center gap-2">
          <Sparkles className="text-indigo" size={28} /> AI Resume Analyzer
        </h1>
        <p className="text-sm text-text-muted mt-1.5">
          Scan your resume using Google Gemini AI and optimize it for Applicant Tracking Systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* ATS Score Column */}
        <div className="bg-white border border-border rounded-card p-6 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">ATS Score</h3>
          
          {/* Animated Gauge placeholder */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#F0F2F5"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={score >= 75 ? "#12B886" : score >= 50 ? "#F5A524" : "#F43F5E"}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (score / 100) * 251.2}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono text-ink leading-none">{score}</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5">out of 100</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full border ${grade.border} ${grade.bg} ${grade.color} text-xs font-bold uppercase tracking-wider`}>
            {grade.label}
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Based on core developer keywords, project descriptions completeness, and academic background layout details.
          </p>
        </div>

        {/* Actionable Suggestions Column */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-1.5">
            <ShieldCheck className="text-indigo" size={20} /> Priority Recommendations
          </h2>

          <div className="space-y-4">
            {result.suggestions.map((s: AtsSuggestion, index: number) => (
              <div
                key={index}
                className="p-5 bg-white border border-border rounded-card hover:shadow-card-hover transition-all flex items-start gap-4"
              >
                <div className="p-2.5 bg-canvas rounded-xl shrink-0 mt-0.5">
                  {getIcon(s.icon)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-ink leading-tight">{s.title}</h4>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full leading-none ${
                      s.impact === "high"
                        ? "bg-rose-tint text-rose"
                        : s.impact === "medium"
                        ? "bg-amber-tint text-amber"
                        : "bg-indigo-tint text-indigo"
                    }`}>
                      {s.impact} impact
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{s.why}</p>
                </div>
              </div>
            ))}

            {result.suggestions.length === 0 && (
              <div className="text-center p-8 bg-white border border-border rounded-card text-text-muted text-sm">
                No optimization suggestions found. Your resume looks fully optimized!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Job Keyword Analysis Section */}
      <div className="p-6 bg-white border border-border rounded-card shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold font-display text-ink">Check Against Target Job</h2>
          <p className="text-xs text-text-muted mt-1">
            Compare your profile keywords directly against a specific active job posting to find missing requirements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedJobId}
            onChange={(e) => handleJobSelect(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-border bg-white text-ink text-sm rounded-button focus:outline-none focus:border-indigo"
          >
            <option value="">-- Select a job to evaluate --</option>
            {recommendationsData?.data?.recommendations?.map((rec) => (
              <option key={rec.job._id} value={rec.job._id}>
                {rec.job.title} at {rec.job.company} (Match Score: {rec.match.score}%)
              </option>
            ))}
          </select>
          {selectedJobId && (
            <Link
              to={`/jobs/${selectedJobId}/gap`}
              className="px-6 py-2.5 bg-indigo-tint text-indigo font-semibold text-sm rounded-button hover:bg-opacity-80 active:scale-95 transition-all text-center flex items-center justify-center gap-1"
            >
              Go to Full Gap & Learning Path <ExternalLink size={14} />
            </Link>
          )}
        </div>

        {analyzingJobGap && (
          <div className="flex justify-center p-6 items-center gap-2 text-text-muted text-sm font-medium">
            <Loader2 size={16} className="animate-spin text-indigo" />
            Analyzing job keyword gaps...
          </div>
        )}

        {!analyzingJobGap && selectedJobId && jobGapSkills.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h4 className="font-bold text-xs text-ink uppercase tracking-wider">Missing Required Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {jobGapSkills.map((gap, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-rose-tint text-rose border border-rose/10 px-3 py-1 rounded-full flex items-center gap-1"
                  title={gap.resource}
                >
                  {gap.skill} <span className="text-[10px] text-text-muted font-normal">(+{gap.lift}% score)</span>
                </span>
              ))}
            </div>
            <p className="text-xs text-text-muted italic leading-relaxed">
              *Add these keywords and qualifications to your profile to lift your compatibility and improve your dashboard match score.
            </p>
          </div>
        )}

        {!analyzingJobGap && selectedJobId && jobGapSkills.length === 0 && (
          <div className="text-sm text-emerald font-semibold flex items-center gap-1.5 pt-2 border-t border-border/60">
            <CheckCircle2 size={16} /> All technical skill requirements match perfectly! No missing keywords found.
          </div>
        )}
      </div>

      {/* LaTeX Resume Output & Overleaf Integration */}
      <div className="p-6 bg-white border border-border rounded-card shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold font-display text-ink">Generate LaTeX / Overleaf Resume</h2>
          <p className="text-xs text-text-muted mt-1">
            Export your structured profile into an ATS-friendly, clean LaTeX template and refine it inside Overleaf.
          </p>
        </div>

        {!latexCode ? (
          <button
            onClick={handleLatexGeneration}
            disabled={generateLatex.isPending}
            className="px-6 py-3 bg-indigo text-white font-medium text-sm rounded-button hover:bg-opacity-95 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {generateLatex.isPending && <Loader2 size={16} className="animate-spin" />}
            Compile LaTeX Resume Code
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-canvas border border-border rounded-card p-4 font-mono text-xs text-ink max-h-48 overflow-y-auto whitespace-pre-wrap">
              {latexCode}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {/* Overleaf form submission */}
              <form
                action="https://www.overleaf.com/docs"
                method="POST"
                target="_blank"
                className="inline-block"
              >
                <input type="hidden" name="snip" value={latexCode} />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo text-white font-medium text-sm rounded-button hover:bg-opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  Open in Overleaf <ExternalLink size={16} />
                </button>
              </form>

              <button
                onClick={handleDownloadTex}
                className="px-6 py-2.5 bg-white border border-border text-ink font-semibold text-sm rounded-button hover:bg-canvas active:scale-95 transition-all flex items-center gap-1.5"
              >
                Download .tex File <Download size={16} />
              </button>

              <button
                onClick={() => setLatexCode("")}
                className="px-4 py-2.5 text-text-muted hover:text-rose text-sm font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
