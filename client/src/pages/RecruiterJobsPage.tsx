import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase, MapPin, Globe, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import useAuthStore from "../store/auth.store";
import useJobs from "../features/useJobs";

// Schema for job creation
const jobFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  company: z.string().min(1, "Company name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  workMode: z.enum(["remote", "onsite", "hybrid", "any"]),
  type: z.enum(["full-time", "part-time", "internship", "contract", "temporary"]),
  skillsInput: z.string().optional(),
  requirementsInput: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export const RecruiterJobsPage = () => {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  
  // Lists and mutations
  const { useGetJobs, useCreateJob, useDeleteJob } = useJobs({ limit: 100 });
  const { data: jobsData, isLoading: isLoadingJobs } = useGetJobs();
  const createJobMutation = useCreateJob();
  const deleteJobMutation = useDeleteJob();

  const recruiterJobs = (jobsData?.data?.jobs || []).filter(
    (job) => job.recruiterId === user?._id
  );

  const [skills, setSkills] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);

  // React hook form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      workMode: "any",
      type: "full-time",
      company: user?.name ? `${user.name} Ltd` : "",
    },
  });

  // Handle adding skill
  const [skillText, setSkillText] = useState("");
  const handleAddSkill = (e: React.MouseEvent) => {
    e.preventDefault();
    if (skillText.trim() && !skills.includes(skillText.trim())) {
      setSkills([...skills, skillText.trim()]);
      setSkillText("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Handle adding requirement
  const [reqText, setReqText] = useState("");
  const handleAddRequirement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (reqText.trim() && !requirements.includes(reqText.trim())) {
      setRequirements([...requirements, reqText.trim()]);
      setReqText("");
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  // Submit handler
  const onSubmit = async (values: JobFormValues) => {
    try {
      await createJobMutation.mutateAsync({
        title: values.title,
        company: values.company,
        description: values.description,
        location: values.location,
        workMode: values.workMode,
        type: values.type,
        skills,
        requirements,
      });

      // Reset form and state
      reset();
      setSkills([]);
      setRequirements([]);
      setIsCreating(false);
    } catch (err) {
      alert("Failed to create job posting");
    }
  };

  const handleDelete = async (jobId: string) => {
    if (confirm("Are you sure you want to close and remove this job posting?")) {
      try {
        await deleteJobMutation.mutateAsync(jobId);
      } catch (err) {
        alert("Failed to delete job posting");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {isCreating && (
          <button
            onClick={() => setIsCreating(false)}
            className="text-text-muted hover:text-ink p-1 rounded-full hover:bg-canvas"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink">
            {isCreating ? "Post a New Opening" : "My Job Postings"}
          </h1>
          <p className="text-text-muted mt-1">
            {isCreating
              ? "Specify requirements and skills to compute seeker matches."
              : "Review and manage job postings you have published."}
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => {
              reset();
              setSkills([]);
              setRequirements([]);
              setIsCreating(true);
            }}
            className="ml-auto px-5 py-2.5 bg-indigo text-white text-sm font-semibold rounded-button hover:bg-opacity-95 flex items-center gap-2"
          >
            <Plus size={16} /> Post Job
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-card p-6 md:p-8 border border-border shadow-card space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Junior Backend Developer"
                {...register("title")}
                className={`w-full px-4 py-2 bg-canvas border rounded-button text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/20 ${
                  errors.title ? "border-rose" : "border-border focus:border-indigo"
                }`}
              />
              {errors.title && <p className="text-xs text-rose font-medium">{errors.title.message}</p>}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Tech Solutions"
                {...register("company")}
                className={`w-full px-4 py-2 bg-canvas border rounded-button text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/20 ${
                  errors.company ? "border-rose" : "border-border focus:border-indigo"
                }`}
              />
              {errors.company && <p className="text-xs text-rose font-medium">{errors.company.message}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Location</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Remote, or Hybrid"
                {...register("location")}
                className={`w-full px-4 py-2 bg-canvas border rounded-button text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/20 ${
                  errors.location ? "border-rose" : "border-border focus:border-indigo"
                }`}
              />
              {errors.location && <p className="text-xs text-rose font-medium">{errors.location.message}</p>}
            </div>

            {/* Work Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Work Mode</label>
              <select
                {...register("workMode")}
                className="w-full px-3 py-2 bg-canvas border border-border rounded-button text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
              >
                <option value="any">Flexible / Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Job Type</label>
              <select
                {...register("type")}
                className="w-full px-3 py-2 bg-canvas border border-border rounded-button text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Description</label>
            <textarea
              rows={4}
              placeholder="Outline the role, team responsibilities, and qualifications requested..."
              {...register("description")}
              className={`w-full px-4 py-2 bg-canvas border rounded-button text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/20 ${
                errors.description ? "border-rose" : "border-border focus:border-indigo"
              }`}
            />
            {errors.description && <p className="text-xs text-rose font-medium">{errors.description.message}</p>}
          </div>

          {/* Requirements (Chips adding list) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Key Requirements</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Write clean code, 6+ months experience"
                value={reqText}
                onChange={(e) => setReqText(e.target.value)}
                className="flex-1 px-4 py-2 bg-canvas border border-border rounded-button text-sm text-ink focus:outline-none focus:border-indigo"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-4 py-2 bg-indigo-tint text-indigo text-xs font-semibold rounded-button hover:bg-indigo hover:text-white transition-all"
              >
                Add
              </button>
            </div>
            {requirements.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-text-muted bg-canvas p-2.5 rounded-lg border border-border">
                    <span>{req}</span>
                    <button type="button" onClick={() => handleRemoveRequirement(req)} className="text-rose hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Tag chips */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider block">Skills Required</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React, Node.js, TypeScript"
                value={skillText}
                onChange={(e) => setSkillText(e.target.value)}
                className="flex-1 px-4 py-2 bg-canvas border border-border rounded-button text-sm text-ink focus:outline-none focus:border-indigo"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-tint text-indigo text-xs font-semibold rounded-button hover:bg-indigo hover:text-white transition-all"
              >
                Add Tag
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill, idx) => (
                  <span key={idx} className="text-xs bg-indigo-tint text-indigo px-3 py-1 rounded-full inline-flex items-center gap-1.5 font-medium">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="flex-1 py-3 bg-canvas border border-border text-ink font-semibold rounded-button text-sm hover:bg-border/20 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-indigo text-white font-semibold rounded-button text-sm hover:bg-opacity-95 disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Publish Job Listing
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
          {isLoadingJobs ? (
            <div className="p-12 text-center animate-pulse space-y-3">
              <div className="h-4 bg-border rounded w-1/4 mx-auto" />
              <div className="h-8 bg-border rounded w-1/2 mx-auto" />
            </div>
          ) : recruiterJobs.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Briefcase size={40} className="text-text-muted mx-auto" />
              <h3 className="text-lg font-bold text-ink">No active listings</h3>
              <p className="text-sm text-text-muted">You haven't posted any job openings yet. Tap the button above to publish one.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recruiterJobs.map((job) => (
                <div key={job._id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-canvas/5 transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-ink">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-text-muted pt-1">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                      <span className="inline-flex items-center gap-1"><Globe size={12} /> {job.workMode.toUpperCase()}</span>
                      <span>• {job.type.replace("-", " ")}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="px-4 py-2 border border-rose/20 text-rose text-xs font-semibold rounded-button hover:bg-rose-tint transition-all"
                    >
                      Close Posting
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterJobsPage;
