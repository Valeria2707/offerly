export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const PROFILE_API_BASE_URL =
  process.env.NEXT_PUBLIC_PROFILE_API_URL ?? "http://localhost:3002/api/v1";

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

export const PROFILE_ROUTES = {
  profile: "/profile",
  cvImports: "/profile/cv-imports",
  cvImport: (id: string) => `/profile/cv-imports/${id}`,
  applyCvImport: (id: string) => `/profile/cv-imports/${id}/apply`,
} as const;

export const API_ERROR_MESSAGES: Record<number, string> = {
  400: "Перевірте введені дані.",
  401: "Невірний email або пароль.",
  409: "Користувач з таким email уже існує.",
  413: "Файл завеликий — максимум 10 МБ.",
  422: "Не вдалося витягти текст із документа. Спробуйте інший файл.",
  429: "Забагато спроб. Спробуйте трохи пізніше.",
  503: "AI-розбір зараз недоступний.",
};

export const DEFAULT_API_ERROR_MESSAGE =
  "Не вдалося зв’язатися із сервером. Спробуйте ще раз.";
