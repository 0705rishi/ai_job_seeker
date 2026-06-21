import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { Job } from "./useJobs";

export interface Application {
  _id: string;
  seekerId: string;
  jobId: Job;
  resumeUrl: string;
  matchScore: number;
  status: "applied" | "review" | "shortlisted" | "rejected";
  appliedAt: string;
}

export interface ApplicantProfile {
  education: Array<{ degree: string; institution: string; year: number }>;
  skills: string[];
  projects: Array<{ title: string; description: string; tech: string[] }>;
  experience: Array<{ role: string; org: string; durationMonths: number; summary: string }>;
  preferences: { roles: string[]; locations: string[]; workMode: string };
  completeness: number;
}

export interface ApplicantDetail {
  application: {
    _id: string;
    resumeUrl: string;
    matchScore: number;
    status: "applied" | "review" | "shortlisted" | "rejected";
    appliedAt: string;
  };
  seeker: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profile: ApplicantProfile | null;
  };
}

interface ApplicationsResponse {
  success: boolean;
  data: Application[];
}

interface ApplyResponse {
  success: boolean;
  data: {
    _id: string;
    seekerId: string;
    jobId: string;
    resumeUrl: string;
    matchScore: number;
    status: string;
    appliedAt: string;
  };
}

interface JobApplicantsResponse {
  success: boolean;
  data: ApplicantDetail[];
}

export const useApplications = () => {
  const queryClient = useQueryClient();

  // Query own seeker applications
  const useGetMyApplications = () => {
    return useQuery<ApplicationsResponse>({
      queryKey: ["myApplications"],
      queryFn: async () => {
        const response = await api.get("/applications");
        return response.data;
      },
    });
  };

  // Seeker applies for an internal job
  const useApplyToJob = () => {
    return useMutation<ApplyResponse, Error, { jobId: string }>({
      mutationFn: async (data) => {
        const response = await api.post("/applications", data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["myApplications"] });
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      },
    });
  };

  // Recruiter gets applicants for a specific job posting
  const useGetJobApplicants = (jobId: string) => {
    return useQuery<JobApplicantsResponse>({
      queryKey: ["jobApplicants", jobId],
      queryFn: async () => {
        const response = await api.get(`/jobs/${jobId}/applicants`);
        return response.data;
      },
      enabled: !!jobId,
    });
  };

  // Recruiter updates application status
  const useUpdateApplicationStatus = (jobId?: string) => {
    return useMutation<any, Error, { applicationId: string; status: string }>({
      mutationFn: async ({ applicationId, status }) => {
        const response = await api.patch(`/applications/${applicationId}/status`, { status });
        return response.data;
      },
      onSuccess: () => {
        if (jobId) {
          queryClient.invalidateQueries({ queryKey: ["jobApplicants", jobId] });
        }
        queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      },
    });
  };

  return {
    useGetMyApplications,
    useApplyToJob,
    useGetJobApplicants,
    useUpdateApplicationStatus,
  };
};

export default useApplications;
