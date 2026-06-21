import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { Job } from "./useJobs";

export interface MatchBreakdown {
  score: number;
  semantic: number;
  skillOverlap: number;
  contextBoost: number;
  matchedSkills: string[];
  missingSkills: string[];
  locationMatch: boolean;
  workModeMatch: boolean;
  explanation: string;
}

export interface Recommendation {
  job: Job;
  match: MatchBreakdown;
}

interface RecommendationsResponse {
  success: boolean;
  data: {
    recommendations: Recommendation[];
    onboardingRequired: boolean;
    message?: string;
  };
}

interface JobMatchResponse {
  success: boolean;
  data: {
    match: MatchBreakdown | null;
    onboardingRequired: boolean;
    message?: string;
  };
}

export const useRecommendations = () => {
  const useGetRecommendations = () => {
    return useQuery<RecommendationsResponse>({
      queryKey: ["recommendations"],
      queryFn: async () => {
        const response = await api.get("/recommendations");
        return response.data;
      },
    });
  };

  const useGetJobMatch = (jobId: string, enabled: boolean = true) => {
    return useQuery<JobMatchResponse>({
      queryKey: ["jobMatch", jobId],
      queryFn: async () => {
        const response = await api.get(`/jobs/${jobId}/match`);
        return response.data;
      },
      enabled: !!jobId && enabled,
    });
  };

  return {
    useGetRecommendations,
    useGetJobMatch,
  };
};

export default useRecommendations;
