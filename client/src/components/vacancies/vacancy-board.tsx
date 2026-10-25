"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { BoardCard } from "@/components/vacancies/board-card";
import {
  BOARD_COLUMNS,
  BOARD_HEADER_CLASSES,
  type BoardColumn,
} from "@/constants/board";
import { boardColumn, canMove } from "@/lib/board";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/types/calendar";
import type { Vacancy } from "@/types/vacancy";
import type { WorkflowSummary } from "@/types/workflow";

type Dragged = { vacancy: Vacancy; from: BoardColumn };

export function VacancyBoard({
  vacancies,
  summaries,
  reminders,
  movingId,
  onMove,
}: {
  vacancies: Vacancy[];
  summaries: Map<string, WorkflowSummary> | undefined;
  reminders: Reminder[];
  movingId: string | null;
  onMove: (vacancy: Vacancy, target: BoardColumn) => void;
}) {
  const t = useTranslations("vacancies.board");
  const [dragged, setDragged] = useState<Dragged | null>(null);
  const [over, setOver] = useState<BoardColumn | null>(null);

  const silence = new Map(
    reminders
      .filter((reminder) => reminder.kind === "silence")
      .map((reminder) => [reminder.vacancyId, Math.abs(reminder.days)]),
  );

  const columnOf = (vacancy: Vacancy) =>
    boardColumn(summaries?.get(vacancy.id));

  const accepts = (column: BoardColumn) =>
    dragged !== null && canMove(dragged.from, column);

  const reset = () => {
    setDragged(null);
    setOver(null);
  };

  return (
    <div className="overflow-x-auto px-px pb-2">
      <div className="grid min-w-[60rem] grid-cols-6">
        {BOARD_COLUMNS.map((column) => {
          const items = vacancies.filter(
            (vacancy) => columnOf(vacancy) === column,
          );

          return (
            <section
              key={column}
              aria-label={t(`columns.${column}`)}
              onDragOver={(event) => {
                if (!accepts(column)) return;
                event.preventDefault();
                setOver(column);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(event) => {
                event.preventDefault();
                if (dragged && accepts(column)) onMove(dragged.vacancy, column);
                reset();
              }}
              className={cn(
                "grid min-h-72 content-start gap-2 border-l border-border px-2 first:border-l-0 first:pl-0 last:pr-0",
                over === column && "rounded-xl bg-secondary/60",
              )}
            >
              <header className="grid gap-1 pb-2">
                <span
                  className={cn(
                    "text-2xl leading-none font-semibold",
                    BOARD_HEADER_CLASSES[column],
                  )}
                >
                  {items.length}
                </span>
                <h2
                  className={cn(
                    "font-mono text-[10px] tracking-[0.12em] text-subtle uppercase",
                    BOARD_HEADER_CLASSES[column],
                  )}
                >
                  {t(`columns.${column}`)}
                </h2>
              </header>

              {items.map((vacancy) => (
                <BoardCard
                  key={vacancy.id}
                  vacancy={vacancy}
                  summary={summaries?.get(vacancy.id)}
                  column={column}
                  silentDays={silence.get(vacancy.id) ?? null}
                  draggable={column !== "rejected" && movingId === null}
                  moving={movingId === vacancy.id}
                  onDragStart={() => setDragged({ vacancy, from: column })}
                  onDragEnd={reset}
                />
              ))}

              {over === column && (
                <div className="grid h-14 place-items-center rounded-xl border border-dashed border-primary text-[11px] text-primary">
                  {t("dropHere")}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
