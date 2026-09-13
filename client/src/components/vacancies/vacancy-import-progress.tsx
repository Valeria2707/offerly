"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const STEP_INTERVAL_MS = 1800;

export function VacancyImportProgress({
  sourceUrl,
}: {
  sourceUrl: string | null;
}) {
  const steps = [
    sourceUrl ? "Сторінку вакансії зчитано" : "Текст оголошення прочитано",
    "Основні поля розпізнано — посада, компанія, локація, зарплата",
    "Витяг вимог і нормалізація навичок",
    "Перевірка на дублікати серед ваших вакансій",
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIndex((index) => Math.min(index + 1, steps.length - 1)),
      STEP_INTERVAL_MS,
    );

    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-24">
      <div className="grid justify-items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-ai-muted font-mono text-[10px] tracking-wider text-ai">
          AI
        </span>

        <div className="grid justify-items-center gap-1 text-center">
          <h1 className="font-heading text-xl font-bold tracking-tight">
            AI аналізує вакансію
          </h1>
          <p className="font-mono text-xs break-all text-subtle">
            {sourceUrl ?? "вставлений текст оголошення"}
          </p>
        </div>
      </div>

      <ol className="grid w-full max-w-md gap-3">
        {steps.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;

          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                active && "bg-ai-muted text-foreground",
                done && "bg-card text-foreground ring-1 ring-foreground/[0.07]",
                !done && !active && "bg-card/60 text-subtle",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-ai text-background",
                  !done && !active && "bg-secondary",
                )}
              >
                {done && <Check className="size-3" aria-hidden />}
                {active && (
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                )}
              </span>

              {step}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
