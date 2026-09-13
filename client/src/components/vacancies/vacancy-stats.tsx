import { INTERVIEW_STATUSES } from "@/constants/vacancy";
import { cn } from "@/lib/utils";
import type { Vacancy } from "@/types/vacancy";

export function VacancyStats({ vacancies }: { vacancies: Vacancy[] }) {
  const countBy = (match: (vacancy: Vacancy) => boolean) =>
    vacancies.filter(match).length;

  const cards = [
    { label: "Подано", value: countBy((item) => item.status === "applied") },
    {
      label: "Співбесіди",
      value: countBy((item) => INTERVIEW_STATUSES.includes(item.status)),
    },
    {
      label: "Відмови",
      value: countBy((item) => item.status === "rejected"),
      className: "text-destructive",
    },
    {
      label: "Оффери",
      value: countBy((item) => item.status === "offer"),
      className: "text-success",
      cardClassName: "bg-success-muted ring-success/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-xl bg-card p-4 ring-1 ring-foreground/10",
            card.cardClassName,
          )}
        >
          <span className="font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
            {card.label}
          </span>
          <p className={cn("mt-2 text-2xl font-semibold", card.className)}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
