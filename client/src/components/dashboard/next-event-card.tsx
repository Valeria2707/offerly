import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  stagePreparationRoute,
  vacancyStageRoute,
} from "@/constants/routes";
import { dayTitle, eventTime, type CalendarEntry } from "@/lib/calendar";
import { countdownLabel } from "@/lib/dashboard";
import { stageName } from "@/lib/workflow";
import type { Vacancy } from "@/types/vacancy";

export function NextEventCard({
  entry,
  vacancy,
  now,
}: {
  entry: CalendarEntry;
  vacancy: Vacancy | null;
  now: Date;
}) {
  const { event } = entry;

  return (
    <section className="grid content-between gap-4 rounded-xl bg-primary p-6 text-primary-foreground">
      <div className="grid gap-2">
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase opacity-75">
          Наступна подія · {countdownLabel(entry.at, now)}
        </span>
        <h2 className="font-heading text-xl font-bold">
          {stageName(event.name)}
        </h2>
        {vacancy && (
          <p className="text-sm opacity-80">
            {vacancy.company} · {vacancy.title}
          </p>
        )}
        <p className="text-sm font-medium first-letter:uppercase">
          {dayTitle(entry.at)} · {eventTime(entry.at)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          nativeButton={false}
          className="bg-card text-primary hover:bg-card/90"
          render={
            <Link href={stagePreparationRoute(event.vacancyId, event.stageId)} />
          }
        >
          Підготуватись
        </Button>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          render={
            <Link href={vacancyStageRoute(event.vacancyId, event.stageId)} />
          }
        >
          Відкрити вакансію
        </Button>
      </div>
    </section>
  );
}
