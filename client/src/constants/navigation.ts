import { ROUTES } from "@/constants/routes";

/** Підписи лежать у `messages/*.json` → `nav`. */
export const APP_NAV_SECTIONS = [
  {
    key: null,
    items: [{ key: "dashboard", accent: "bg-subtle", href: ROUTES.dashboard }],
  },
  {
    key: "jobSearch",
    items: [
      { key: "vacancies", accent: "bg-primary", href: ROUTES.vacancies },
      { key: "calendar", accent: "bg-terracotta", href: ROUTES.calendar },
      { key: "analytics", accent: "bg-ai", href: ROUTES.analytics },
    ],
  },
  {
    key: "settings",
    items: [
      {
        key: "stageTypes",
        accent: "bg-muted-foreground",
        href: ROUTES.stageTypes,
      },
      { key: "profile", accent: "bg-foreground", href: ROUTES.profile },
    ],
  },
] as const;

export type AppNavItem =
  (typeof APP_NAV_SECTIONS)[number]["items"][number];
