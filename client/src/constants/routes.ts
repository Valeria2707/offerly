export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
} as const;

export const SECTIONS = {
  features: "features",
  howItWorks: "how-it-works",
} as const;

export const sectionHref = (section: keyof typeof SECTIONS) =>
  `#${SECTIONS[section]}` as const;
