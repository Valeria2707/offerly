import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ROUTES } from "@/constants/routes";

const QUICK_ACTIONS = [
  { href: ROUTES.vacancies, label: "+ Додати вакансію" },
  { href: ROUTES.profile, label: "Оновити профіль з CV" },
  { href: ROUTES.analytics, label: "Переглянути аналітику" },
];

export function QuickActions() {
  return (
    <DashboardCard title="Швидкі дії">
      <ul className="grid gap-2">
        {QUICK_ACTIONS.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="block rounded-lg bg-muted px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {action.label}
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
