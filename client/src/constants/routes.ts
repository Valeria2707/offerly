export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  profile: "/profile",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const SECTIONS = {
  features: "features",
  howItWorks: "how-it-works",
} as const;

export const sectionHref = (section: keyof typeof SECTIONS) =>
  `#${SECTIONS[section]}` as const;
