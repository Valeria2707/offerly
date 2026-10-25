import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { cn } from "@/lib/utils";
import type { SkillDemand as Skill } from "@/types/analytics";

export function SkillDemand({ skills }: { skills: Skill[] }) {
  return (
    <AnalyticsCard
      title="Навички, які просять найчастіше"
      caption={
        skills.length
          ? "Помаранчеві - немає у твоєму профілі"
          : "У вакансіях за цей період немає обовʼязкових навичок"
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
