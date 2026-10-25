import { useTranslations } from "next-intl";

import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { cn } from "@/lib/utils";
import type { SkillDemand as Skill } from "@/types/analytics";

export function SkillDemand({ skills }: { skills: Skill[] }) {
  const t = useTranslations("analytics.skills");

  return (
    <AnalyticsCard
      title={t("title")}
      caption={
        skills.length
          ? t("gapHint")
          : t("empty")
      }
    >
      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill.name}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium",
                skill.inProfile
                  ? "bg-success-muted text-success"
                  : "bg-warning-muted text-warning",
              )}
            >
              {skill.name} · {skill.count}
            </li>
          ))}
        </ul>
      )}
    </AnalyticsCard>
  );
}
