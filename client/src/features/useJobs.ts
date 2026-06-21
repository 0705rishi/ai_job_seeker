import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";

export interface Job {
  _id: string;
  recruiterId: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  workMode: "remote" | "onsite" | "hybrid" | "any";
  type: "full-time" | "part-time" | "internship" | "contract" | "temporary";
  source: "internal" | "external";
  externalUrl?: string;
  status: "active" | "closed";
  createdAt: string;
}

interface JobsQueryFilters {
  search?: string;
  location?: string;
  workMode?: string;
  type?: string;
  page?: number;
  limit?: number;
}

interface JobsResponse {
  success: boolean;
  data: {
    jobs: Job[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface JobDetailResponse {
  success: boolean;
  data: Job;
}

export const useJobs = (filters?: JobsQueryFilters) => {
  const queryClient = useQueryClient();

  // Query to get list of jobs
  const useGetJobs = () => {
    return useQuery<JobsResponse>({
      queryKey: ["jobs", filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.search) params.append("search", filters.search);
          if (filters.location) params.append("location", filters.location);
          if (filters.workMode) params.append("workMode", filters.workMode);
          if (filters.type) params.append("type", filters.type);
          if (filters.page) params.append("page", filters.page.toString());
          if (filters.limit) params.append("limit", filters.limit.toString());
        }
        const response = await api.get(`/jobs?${params.toString()}`);
        return response.data;
      },
    });
  };

  // Query to get a single job detail
  const useGetJobById = (id: string) => {
    return useQuery<JobDetailResponse>({
      queryKey: ["job", id],
      queryFn: async () => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Mutation to create a job
  const useCreateJob = () => {
    return useMutation<any, Error, Omit<Job, "_id" | "recruiterId" | "createdAt" | "status" | "source">>({
      mutationFn: async (jobData) => {
        const response = await api.post("/jobs", jobData);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
      },
    });
  };

  // Mutation to update a job
  const useUpdateJob = (id: string) => {
    return useMutation<any, Error, Partial<Job>>({
      mutationFn: async (jobData) => {
        const response = await api.put(`/jobs/${id}`, jobData);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        queryClient.invalidateQueries({ queryKey: ["job", id] });
      },
    });
  };

  // Mutation to delete a job
  const useDeleteJob = () => {
    return useMutation<any, Error, string>({
      mutationFn: async (id) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
      },
    });
  };

  return {
    useGetJobs,
    useGetJobById,
    useCreateJob,
    useUpdateJob,
    useDeleteJob,
  };
};

export default useJobs;
