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
  apiRequest<AuthTokens>(API_ROUTES.login, {
    method: "POST",
    body: input,
    token: null,
  });

export const registerRequest = (input: RegisterInput) =>
  apiRequest<AuthTokens>(API_ROUTES.register, {
    method: "POST",
    body: input,
    token: null,
  });

export const googleRequest = (idToken: string) =>
  apiRequest<AuthTokens>(API_ROUTES.google, {
    method: "POST",
    body: { idToken },
    token: null,
  });

export const forgotPasswordRequest = (email: string) =>
  apiRequest<void>(API_ROUTES.forgotPassword, {
    method: "POST",
    body: { email },
    token: null,
  });

export const resetPasswordRequest = (input: ResetPasswordInput) =>
  apiRequest<void>(API_ROUTES.resetPassword, {
    method: "POST",
    body: input,
    token: null,
  });

export const logoutRequest = () =>
  apiRequest<void>(API_ROUTES.logout, { method: "POST" });

export const currentUserRequest = () => apiRequest<Profile>(API_ROUTES.me);
