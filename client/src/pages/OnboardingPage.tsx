import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Upload, Sparkles, AlertCircle } from "lucide-react";
import useProfile, { SeekerProfileData, Education, Project, Experience } from "../features/useProfile";

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, parseResume, isUpdatingProfile } = useProfile();
  
  const [step, setStep] = useState<"upload" | "parsing" | "form">("upload");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [preferences, setPreferences] = useState({
    roles: [] as string[],
    locations: [] as string[],
    workMode: "any" as "remote" | "onsite" | "hybrid" | "any",
  });
  const [resumeUrl, setResumeUrl] = useState("");

  // Input helpers
  const [newSkill, setNewSkill] = useState("");
  const [newRolePref, setNewRolePref] = useState("");
  const [newLocPref, setNewLocPref] = useState("");

  // Temporary row inputs
  const [tempEdu, setTempEdu] = useState<Education>({ degree: "", institution: "", year: new Date().getFullYear() });
  const [tempProj, setTempProj] = useState<Project>({ title: "", description: "", tech: [] });
  const [tempExp, setTempExp] = useState<Experience>({ role: "", org: "", durationMonths: 0, summary: "" });
  const [tempProjTech, setTempProjTech] = useState("");

  // Sync existing profile if any
  useEffect(() => {
    if (profile) {
      setEducation(profile.education || []);
      setSkills(profile.skills || []);
      setProjects(profile.projects || []);
      setExperience(profile.experience || []);
      setPreferences(profile.preferences || { roles: [], locations: [], workMode: "any" });
      setResumeUrl(profile.resumeUrl || "");
    }
  }, [profile]);

  // Handle file drop/select
  const handleFileUpload = async (file: File) => {
    setErrorMsg("");
    setStep("parsing");
    try {
      const result = await parseResume(file);
      if (result?.success && result.data) {
        const parsed = result.data;
        setEducation(parsed.education || []);
        setSkills(parsed.skills || []);
        setProjects(parsed.projects || []);
        setExperience(parsed.experience || []);
        setResumeUrl(parsed.resumeUrl || "");
        setStep("form");
        setSuccessMsg("Resume parsed successfully! Please review the details below.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || "Failed to parse resume. You can enter details manually.");
      setStep("form");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Completeness calculator
  const calculateCompleteness = () => {
    let score = 0;
    if (education.length > 0) score += 15;
    if (skills.length > 0) score += 25;
    if (projects.length > 0) score += 20;
    if (experience.length > 0) score += 20;
    if (preferences.roles.length > 0) score += 10;
    if (preferences.locations.length > 0) score += 10;
    return score;
  };

  const completeness = calculateCompleteness();

  // Helper additions
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addEdu = () => {
    if (tempEdu.degree.trim() && tempEdu.institution.trim()) {
      setEducation([...education, tempEdu]);
      setTempEdu({ degree: "", institution: "", year: new Date().getFullYear() });
    }
  };

  const removeEdu = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addProj = () => {
    if (tempProj.title.trim() && tempProj.description.trim()) {
      const techArray = tempProjTech.split(",").map(t => t.trim()).filter(Boolean);
      setProjects([...projects, { ...tempProj, tech: techArray }]);
      setTempProj({ title: "", description: "", tech: [] });
      setTempProjTech("");
    }
  };

  const removeProj = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addExp = () => {
    if (tempExp.role.trim() && tempExp.org.trim() && tempExp.summary.trim()) {
      setExperience([...experience, tempExp]);
      setTempExp({ role: "", org: "", durationMonths: 0, summary: "" });
    }
  };

  const removeExp = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addRolePref = () => {
    if (newRolePref.trim() && !preferences.roles.includes(newRolePref.trim())) {
      setPreferences({ ...preferences, roles: [...preferences.roles, newRolePref.trim()] });
      setNewRolePref("");
    }
  };

  const removeRolePref = (role: string) => {
    setPreferences({ ...preferences, roles: preferences.roles.filter(r => r !== role) });
  };

  const addLocPref = () => {
    if (newLocPref.trim() && !preferences.locations.includes(newLocPref.trim())) {
      setPreferences({ ...preferences, locations: [...preferences.locations, newLocPref.trim()] });
      setNewLocPref("");
    }
  };

  const removeLocPref = (loc: string) => {
    setPreferences({ ...preferences, locations: preferences.locations.filter(l => l !== loc) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const profilePayload: SeekerProfileData = {
        education,
        skills,
        projects,
        experience,
        preferences,
        resumeUrl: resumeUrl || undefined,
      };
      await updateProfile(profilePayload);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || "Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-4 md:p-8">
      {/* Step 1: File Upload Screen */}
      {step === "upload" && (
        <div className="bg-white rounded-card shadow-card border border-border p-8 md:p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-indigo-tint text-indigo rounded-full flex items-center justify-center mx-auto">
            <Upload size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-semibold text-ink">Let's build your profile</h1>
            <p className="text-text-muted mt-2">
              Upload your resume in PDF or LaTeX format. We'll extract your skills, experience, and projects automatically.
            </p>
          </div>

          <label className="border-2 border-dashed border-border hover:border-indigo/50 hover:bg-canvas rounded-card p-10 flex flex-col items-center justify-center cursor-pointer transition-all h-48">
            <Upload size={24} className="text-text-muted" />
            <span className="mt-2 text-sm font-medium text-ink">Click to upload or drag resume here</span>
            <span className="text-xs text-text-muted mt-1">PDF, TXT, or TEX up to 5MB</span>
            <input
              type="file"
              accept=".pdf,.tex,.txt"
              className="hidden"
              onChange={onFileChange}
            />
          </label>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => setStep("form")}
              className="text-indigo text-sm font-medium hover:underline"
            >
              Skip — I'll fill it manually
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Parsing Animation Screen */}
      {step === "parsing" && (
        <div className="bg-white rounded-card shadow-card border border-border p-12 text-center max-w-md mx-auto space-y-6 animate-pulse">
          <div className="w-16 h-16 bg-coral-tint text-coral rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-ink">Reading your resume...</h2>
            <p className="text-text-muted text-sm mt-1">Gemini AI is parsing your skills, education, and achievements.</p>
          </div>
          {/* Skeleton Loaders */}
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-border rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-border rounded w-5/6 mx-auto animate-pulse" />
            <div className="h-4 bg-border rounded w-1/2 mx-auto animate-pulse" />
          </div>
        </div>
      )}

      {/* Step 3: Review Form Screen */}
      {step === "form" && (
        <div className="space-y-6">
          {/* Completeness Bar */}
          <div className="sticky top-0 z-40 bg-canvas py-2 border-b border-border">
            <div className="flex justify-between items-center text-sm font-semibold mb-2">
              <span className="text-ink">Profile Completeness</span>
              <span className="text-indigo">{completeness}%</span>
            </div>
            <div className="w-full bg-border h-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo h-full transition-all duration-500 rounded-full"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-semibold text-ink">Review Your Profile</h1>
            <p className="text-text-muted mt-1">Confirm or edit the details parsed from your resume.</p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-4 bg-rose-tint border border-rose/20 rounded-button text-sm text-rose flex items-center gap-2">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 bg-indigo-tint border border-indigo/20 rounded-button text-sm text-indigo flex items-center gap-2">
              <Sparkles size={18} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Education */}
            <div className="bg-white p-6 rounded-card border border-border space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-border pb-2 flex items-center gap-2">
                🎓 Education
              </h2>
              {/* Existing Education Row */}
              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-canvas border border-border rounded-button">
                      <div>
                        <span className="font-semibold text-sm text-ink block">{edu.degree}</span>
                        <span className="text-xs text-text-muted">{edu.institution} • Graduation Year: {edu.year}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEdu(idx)}
                        className="text-rose hover:bg-rose-tint p-1.5 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No education rows added yet.</p>
              )}

              {/* Add Education Row form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border/50">
                <input
                  type="text"
                  placeholder="Degree e.g. B.Tech Computer Science"
                  value={tempEdu.degree}
                  onChange={(e) => setTempEdu({ ...tempEdu, degree: e.target.value })}
                  className="px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                />
                <input
                  type="text"
                  placeholder="Institution/College name"
                  value={tempEdu.institution}
                  onChange={(e) => setTempEdu({ ...tempEdu, institution: e.target.value })}
                  className="px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Year"
                    value={tempEdu.year || ""}
                    onChange={(e) => setTempEdu({ ...tempEdu, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-24 px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                  />
                  <button
                    type="button"
                    onClick={addEdu}
                    className="flex-1 bg-indigo text-white text-xs font-semibold rounded-button flex items-center justify-center gap-1 hover:bg-opacity-90 active:scale-95"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Technical Skills */}
            <div className="bg-white p-6 rounded-card border border-border space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-border pb-2">
                🛠️ Technical Skills
              </h2>
              {/* Skill chips */}
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-tint text-indigo font-medium text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="hover:text-rose transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              {/* Add Skill field */}
              <div className="flex gap-2 max-w-sm pt-2">
                <input
                  type="text"
                  placeholder="React, TypeScript, AWS, etc."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 bg-indigo text-white font-medium rounded-button text-sm flex items-center justify-center hover:bg-opacity-90 active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* 3. Projects */}
            <div className="bg-white p-6 rounded-card border border-border space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-border pb-2">
                💻 Projects
              </h2>
              {/* Existing projects */}
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="p-4 bg-canvas border border-border rounded-card relative">
                      <button
                        type="button"
                        onClick={() => removeProj(idx)}
                        className="absolute top-3 right-3 text-rose hover:bg-rose-tint p-1.5 rounded-full"
                      >
                        <X size={16} />
                      </button>
                      <h3 className="font-bold text-sm text-ink">{proj.title}</h3>
                      <p className="text-xs text-text-muted mt-1">{proj.description}</p>
                      {proj.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {proj.tech.map((t, i) => (
                            <span key={i} className="text-[11px] font-semibold bg-indigo-tint/55 text-indigo px-2 py-0.5 rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No projects added yet.</p>
              )}

              {/* Add Project form */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={tempProj.title}
                  onChange={(e) => setTempProj({ ...tempProj, title: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                />
                <textarea
                  placeholder="1-2 sentences describing what this project does and achievements..."
                  rows={2}
                  value={tempProj.description}
                  onChange={(e) => setTempProj({ ...tempProj, description: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tech stack (comma separated e.g. React, Node.js)"
                    value={tempProjTech}
                    onChange={(e) => setTempProjTech(e.target.value)}
                    className="flex-1 px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                  />
                  <button
                    type="button"
                    onClick={addProj}
                    className="px-6 bg-indigo text-white text-xs font-semibold rounded-button flex items-center justify-center gap-1 hover:bg-opacity-90 active:scale-95"
                  >
                    <Plus size={16} /> Add Project
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Experience */}
            <div className="bg-white p-6 rounded-card border border-border space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-border pb-2">
                💼 Experience
              </h2>
              {/* Existing experience */}
              {experience.length > 0 ? (
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-canvas border border-border rounded-card relative">
                      <button
                        type="button"
                        onClick={() => removeExp(idx)}
                        className="absolute top-3 right-3 text-rose hover:bg-rose-tint p-1.5 rounded-full"
                      >
                        <X size={16} />
                      </button>
                      <h3 className="font-bold text-sm text-ink">{exp.role}</h3>
                      <span className="text-xs text-text-muted block">{exp.org} • {exp.durationMonths} Months</span>
                      <p className="text-xs text-text-muted mt-2">{exp.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No experience added yet.</p>
              )}

              {/* Add Experience form */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Position/Role e.g. Intern Developer"
                    value={tempExp.role}
                    onChange={(e) => setTempExp({ ...tempExp, role: e.target.value })}
                    className="px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                  />
                  <input
                    type="text"
                    placeholder="Company/Organization name"
                    value={tempExp.org}
                    onChange={(e) => setTempExp({ ...tempExp, org: e.target.value })}
                    className="px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Duration (Months)"
                    value={tempExp.durationMonths || ""}
                    onChange={(e) => setTempExp({ ...tempExp, durationMonths: parseInt(e.target.value) || 0 })}
                    className="w-36 px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                  />
                  <input
                    type="text"
                    placeholder="Achievements / Key tasks summary"
                    value={tempExp.summary}
                    onChange={(e) => setTempExp({ ...tempExp, summary: e.target.value })}
                    className="flex-1 px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
                  />
                  <button
                    type="button"
                    onClick={addExp}
                    className="px-6 bg-indigo text-white text-xs font-semibold rounded-button flex items-center justify-center gap-1 hover:bg-opacity-90 active:scale-95"
                  >
                    <Plus size={16} /> Add Exp
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Career Preferences */}
            <div className="bg-white p-6 rounded-card border border-border space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-border pb-2">
                🎯 Career Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Roles */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-ink">Target Roles</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {preferences.roles.map((role, idx) => (
                      <span key={idx} className="text-xs bg-canvas border border-border text-ink px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        {role}
                        <button type="button" onClick={() => removeRolePref(role)}>
                          <X size={12} className="text-text-muted hover:text-rose" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Frontend Developer"
                      value={newRolePref}
                      onChange={(e) => setNewRolePref(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRolePref())}
                      className="flex-1 px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none"
                    />
                    <button type="button" onClick={addRolePref} className="px-3 bg-indigo text-white rounded-button hover:bg-opacity-95">
                      +
                    </button>
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-ink">Preferred Locations</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {preferences.locations.map((loc, idx) => (
                      <span key={idx} className="text-xs bg-canvas border border-border text-ink px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        {loc}
                        <button type="button" onClick={() => removeLocPref(loc)}>
                          <X size={12} className="text-text-muted hover:text-rose" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={newLocPref}
                      onChange={(e) => setNewLocPref(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocPref())}
                      className="flex-1 px-3 py-2 bg-canvas border border-border rounded-button text-sm focus:outline-none"
                    />
                    <button type="button" onClick={addLocPref} className="px-3 bg-indigo text-white rounded-button hover:bg-opacity-95">
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Work Mode */}
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-ink">Work Mode</label>
                <div className="grid grid-cols-4 gap-3">
                  {["any", "remote", "hybrid", "onsite"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, workMode: mode as any })}
                      className={`py-2 text-xs font-semibold rounded-button border text-center transition-all ${
                        preferences.workMode === mode
                          ? "bg-indigo-tint text-indigo border-indigo"
                          : "bg-white text-text-muted border-border hover:bg-canvas"
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="px-6 py-2.5 bg-white border border-border text-ink font-medium rounded-button text-sm hover:bg-canvas"
              >
                Re-upload Resume
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-8 py-2.5 bg-indigo text-white font-medium rounded-button text-sm hover:bg-opacity-95 disabled:opacity-50 min-w-[150px]"
              >
                {isUpdatingProfile ? "Saving Profile..." : "Save and Continue"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
