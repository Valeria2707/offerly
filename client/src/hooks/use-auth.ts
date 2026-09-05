"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  forgotPasswordRequest,
  googleRequest,
  loginRequest,
  logoutRequest,
  profileRequest,
  registerRequest,
  resetPasswordRequest,
} from "@/api/auth";
import { ROUTES } from "@/constants/routes";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { AuthTokens } from "@/types/auth";

export const authKeys = {
  profile: ["auth", "profile"] as const,
};

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => profileRequest(getAccessToken()!),
    enabled: Boolean(accessToken),
    retry: false,
  });
}

function useSessionStart() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return async (tokens: AuthTokens) => {
    setSession(tokens);
    await queryClient.invalidateQueries({ queryKey: authKeys.profile });
    router.replace(ROUTES.dashboard);
  };
}

export function useLogin() {
  const startSession = useSessionStart();

  return useMutation({ mutationFn: loginRequest, onSuccess: startSession });
}

export function useRegister() {
  const startSession = useSessionStart();

  return useMutation({ mutationFn: registerRequest, onSuccess: startSession });
}

export function useGoogleAuth() {
  const startSession = useSessionStart();

  return useMutation({ mutationFn: googleRequest, onSuccess: startSession });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken();
      if (token) await logoutRequest(token);
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.push(ROUTES.home);
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPasswordRequest });
}
