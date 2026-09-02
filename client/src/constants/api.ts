export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const API_ROUTES = {
  register: "/auth/register",
  login: "/auth/login",
  google: "/auth/google",
  refresh: "/auth/refresh",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  logout: "/auth/logout",
  me: "/auth/me",
} as const;

export const API_ERROR_MESSAGES: Record<number, string> = {
  400: "Перевірте введені дані.",
  401: "Невірний email або пароль.",
  409: "Користувач з таким email уже існує.",
  429: "Забагато спроб. Спробуйте трохи пізніше.",
};

export const DEFAULT_API_ERROR_MESSAGE =
  "Не вдалося зв’язатися із сервером. Спробуйте ще раз.";
