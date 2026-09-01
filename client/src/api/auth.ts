import { API_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  AuthTokens,
  LoginInput,
  Profile,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/auth";

export const loginRequest = (input: LoginInput) =>
  apiRequest<AuthTokens>(API_ROUTES.login, { method: "POST", body: input });

export const registerRequest = (input: RegisterInput) =>
  apiRequest<Profile>(API_ROUTES.register, { method: "POST", body: input });

export const forgotPasswordRequest = (email: string) =>
  apiRequest<void>(API_ROUTES.forgotPassword, {
    method: "POST",
    body: { email },
  });

export const resetPasswordRequest = (input: ResetPasswordInput) =>
  apiRequest<void>(API_ROUTES.resetPassword, { method: "POST", body: input });

export const logoutRequest = (token: string) =>
  apiRequest<void>(API_ROUTES.logout, { method: "POST", token });

export const profileRequest = (token: string) =>
  apiRequest<Profile>(API_ROUTES.me, { token });
