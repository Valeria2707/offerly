import { ROUTES } from "@/constants/routes";

export const APP_NAV_SECTIONS = [
  {
    title: null,
    items: [{ label: "Дешборд", accent: "bg-subtle", href: ROUTES.dashboard }],
  },
  {
    title: "Пошук роботи",
    items: [
      { label: "Мої вакансії", accent: "bg-primary", href: ROUTES.vacancies },
      { label: "Нагадування", accent: "bg-terracotta", href: null },
      { label: "Аналітика", accent: "bg-ai", href: null },
    ],
  },
  {
    title: "Налаштування",
    items: [
      {
        label: "Довідник етапів",
        accent: "bg-muted-foreground",
        href: ROUTES.stageTypes,
      },
      { label: "Профіль", accent: "bg-foreground", href: ROUTES.profile },
    ],
  },
] as const;

export type AppNavItem =
  (typeof APP_NAV_SECTIONS)[number]["items"][number];
