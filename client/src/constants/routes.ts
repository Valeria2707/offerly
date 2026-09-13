export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  profile: "/profile",
  vacancies: "/vacancies",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const vacancyImportRoute = (importId: string) =>
  `${ROUTES.vacancies}/imports/${importId}` as const;

export const SECTIONS = {
  features: "features",
  howItWorks: "how-it-works",
} as const;

export const sectionHref = (section: keyof typeof SECTIONS) =>
  `#${SECTIONS[section]}` as const;
