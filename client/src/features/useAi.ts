import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export interface AtsSuggestion {
  icon: string;
  title: string;
  why: string;
  impact: "high" | "medium" | "low";
}

export interface AtsResult {
  score: number;
  suggestions: AtsSuggestion[];
}

export interface SkillGapItem {
  skill: string;
  resource: string;
  lift: number;
}

interface AtsScoreResponse {
  success: boolean;
  data: AtsResult;
}

interface SkillGapResponse {
  success: boolean;
  data: SkillGapItem[];
}

interface CoverLetterResponse {
  success: boolean;
  data: {
    coverLetter: string;
  };
}

interface LatexResumeResponse {
  success: boolean;
  data: {
    latex: string;
  };
}

export const useAi = () => {
  // Query ATS Score
  const useGetAtsScore = () => {
    return useQuery<AtsScoreResponse, Error>({
      queryKey: ["atsScore"],
      queryFn: async () => {
        const response = await api.post("/ai/resume-score");
        return response.data;
      },
      retry: false,
    });
  };

  // Mutation to analyze gaps for a specific job
  const useGetSkillGap = () => {
    return useMutation<SkillGapResponse, Error, { jobId: string }>({
      mutationFn: async ({ jobId }) => {
        const response = await api.post("/ai/skill-gap", { jobId });
        return response.data;
      },
    });
  };

  // Mutation to generate tailored cover letter
  const useGenerateCoverLetter = () => {
    return useMutation<CoverLetterResponse, Error, { jobId: string }>({
      mutationFn: async ({ jobId }) => {
        const response = await api.post("/ai/cover-letter", { jobId });
        return response.data;
      },
    });
  };

  // Mutation to generate LaTeX code
  const useGenerateLatexResume = () => {
    return useMutation<LatexResumeResponse, Error, void>({
      mutationFn: async () => {
        const response = await api.post("/ai/latex-resume");
        return response.data;
      },
    });
  };

  return {
    useGetAtsScore,
    useGetSkillGap,
    useGenerateCoverLetter,
    useGenerateLatexResume,
  };
};

export default useAi;
