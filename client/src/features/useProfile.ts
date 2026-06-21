import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
}

export interface Experience {
  role: string;
  org: string;
  durationMonths: number;
  summary: string;
}

export interface Preferences {
  roles: string[];
  locations: string[];
  workMode: "remote" | "onsite" | "hybrid" | "any";
}

export interface SeekerProfileData {
  education: Education[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
  preferences: Preferences;
  resumeUrl?: string;
  completeness?: number;
}

interface ProfileResponse {
  success: boolean;
  data: SeekerProfileData | null;
}

export const useProfile = () => {
  const queryClient = useQueryClient();

  // Query to get owner profile
  const { data: profileData, isLoading, error, refetch } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/profile");
      return response.data;
    },
  });

  // Mutation to update profile
  const updateProfileMutation = useMutation<any, Error, SeekerProfileData>({
    mutationFn: async (data) => {
      const response = await api.put("/profile", data);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.setQueryData(["profile"], res);
      // Re-trigger jobs/recommendations if they are cached
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });

  // Mutation to parse resume file
  const parseResumeMutation = useMutation<any, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("resume", file);
      
      const response = await api.post("/profile/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    profile: profileData?.data || null,
    isLoadingProfile: isLoading,
    profileError: error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,
    parseResume: parseResumeMutation.mutateAsync,
    isParsingResume: parseResumeMutation.isPending,
    parseResumeError: parseResumeMutation.error,
    refetchProfile: refetch,
  };
};

export default useProfile;
