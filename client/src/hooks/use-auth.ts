"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  profileRequest,
  registerRequest,
  resetPasswordRequest,
} from "@/api/auth";
import { ROUTES } from "@/constants/routes";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { LoginInput, RegisterInput } from "@/types/auth";

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

function useAuthSuccess() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return async (accessToken: string) => {
    setAccessToken(accessToken);
    await queryClient.invalidateQueries({ queryKey: authKeys.profile });
    router.push(ROUTES.home);
  };
}

export function useLogin() {
  const onAuthenticated = useAuthSuccess();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (tokens) => onAuthenticated(tokens.accessToken),
  });
}

export function useRegister() {
  const onAuthenticated = useAuthSuccess();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await registerRequest(input);
      const credentials: LoginInput = {
        email: input.email,
        password: input.password,
      };
      return loginRequest(credentials);
    },
    onSuccess: (tokens) => onAuthenticated(tokens.accessToken),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken();
      if (token) await logoutRequest(token);
    },
    onSettled: () => {
      clearAccessToken();
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
