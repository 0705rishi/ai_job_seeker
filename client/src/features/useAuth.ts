import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "../lib/axios";
import useAuthStore, { User } from "../store/auth.store";

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "seeker" | "recruiter";
}

interface RegisterResponse {
  success: boolean;
  data: {
    message: string;
    userId: string;
    email: string;
  };
}

interface VerifyOtpData {
  email: string;
  code: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    message: string;
    token: string;
    user: User;
  };
}

interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { login, logout, setUser, setLoading, token } = useAuthStore();

  // Query to fetch current user profile
  const { data: meData, error, isLoading: isMeLoading, refetch } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  // Sync current user state
  useEffect(() => {
    if (token) {
      if (meData?.success) {
        setUser(meData.data.user);
        setLoading(false);
      } else if (error) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [meData, error, token, setUser, setLoading, logout]);

  // Register mutation
  const registerMutation = useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data) => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation<AuthResponse, Error, VerifyOtpData>({
    mutationFn: async (data) => {
      const response = await api.post("/auth/verify-otp", data);
      return response.data;
    },
    onSuccess: (res) => {
      login(res.data.token, res.data.user);
      queryClient.setQueryData(["me"], res);
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation<any, Error, { email: string }>({
    mutationFn: async (data) => {
      const response = await api.post("/auth/resend-otp", data);
      return response.data;
    },
  });

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, any>({
    mutationFn: async (data) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (res) => {
      login(res.data.token, res.data.user);
      queryClient.setQueryData(["me"], res);
    },
  });

  return {
    isMeLoading,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifying: verifyOtpMutation.isPending,
    verifyError: verifyOtpMutation.error,
    resendOtp: resendOtpMutation.mutateAsync,
    isResending: resendOtpMutation.isPending,
    resendError: resendOtpMutation.error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
    refetchMe: refetch,
  };
};

export default useAuth;
