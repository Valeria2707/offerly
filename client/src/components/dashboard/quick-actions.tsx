import { useTranslations } from "next-intl";

import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ROUTES } from "@/constants/routes";

const QUICK_ACTIONS = [
  { href: ROUTES.vacancies, key: "addVacancy" },
  { href: ROUTES.profile, key: "updateProfile" },
  { href: ROUTES.analytics, key: "viewAnalytics" },
] as const;

export function QuickActions() {
  const t = useTranslations("dashboard.quickActions");

  return (
    <DashboardCard title={t("title")}>
      <ul className="grid gap-2">
        {QUICK_ACTIONS.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="block rounded-lg bg-muted px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {t(action.key)}
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
