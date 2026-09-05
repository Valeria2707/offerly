import { ROUTES } from "@/constants/routes";

export const APP_NAV_ITEMS = [
  { label: "Дешборд", accent: "bg-subtle", href: ROUTES.dashboard },
  { label: "Мої вакансії", accent: "bg-primary", href: null },
  { label: "Аналітика", accent: "bg-ai", href: null },
  { label: "Нагадування", accent: "bg-terracotta", href: null },
  { label: "Профіль", accent: "bg-foreground", href: ROUTES.profile },
] as const;

export type AppNavItem = (typeof APP_NAV_ITEMS)[number];
