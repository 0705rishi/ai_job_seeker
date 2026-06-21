import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { Job } from "./useJobs";

export interface SavedJob {
  _id: string;
  seekerId: string;
  jobId: Job;
  savedAt: string;
}

interface SavedJobsResponse {
  success: boolean;
  data: SavedJob[];
}

export const useSavedJobs = () => {
  const queryClient = useQueryClient();

  // Get list of saved jobs
  const useGetSavedJobs = () => {
    return useQuery<SavedJobsResponse>({
      queryKey: ["savedJobs"],
      queryFn: async () => {
        const response = await api.get("/saved");
        return response.data;
      },
    });
  };

  // Bookmark / save a job
  const useSaveJob = () => {
    return useMutation<any, Error, string>({
      mutationFn: async (jobId) => {
        const response = await api.post(`/saved/${jobId}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      },
    });
  };

  // Remove bookmark / unsave a job
  const useUnsaveJob = () => {
    return useMutation<any, Error, string>({
      mutationFn: async (jobId) => {
        const response = await api.delete(`/saved/${jobId}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      },
    });
  };

  return {
    useGetSavedJobs,
    useSaveJob,
    useUnsaveJob,
  };
};

export default useSavedJobs;
