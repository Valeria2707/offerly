import { Check } from "lucide-react";

import {
  AI_NOTE,
  APPLICATION_STAGES,
  CURRENT_STAGE_INDEX,
} from "@/constants/landing";
import { cn } from "@/lib/utils";

export function ApplicationPreview() {
  return (
    <article className="rounded-2xl bg-card p-6 shadow-[0_20px_44px_-28px_rgba(36,31,27,0.45)] ring-1 ring-foreground/10">
      <header className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-medium text-muted-foreground">
          HL
        </span>
        <div className="min-w-0">
          <h3 className="font-heading font-medium">Platform Engineer</h3>
          <p className="truncate text-sm text-muted-foreground">
            Helios Labs · Берлін, гібрид
          </p>
        </div>
      </header>

      <ol className="mt-6 grid grid-cols-5">
        {APPLICATION_STAGES.map((stage, index) => {
          const isDone = index < CURRENT_STAGE_INDEX;
          const isCurrent = index === CURRENT_STAGE_INDEX;
          const isUpcoming = index > CURRENT_STAGE_INDEX;

          return (
            <li
              key={stage}
              className="relative flex flex-col items-center gap-2"
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3 right-1/2 left-[-50%] h-0.5 -translate-y-1/2",
                    isUpcoming ? "bg-border" : "bg-primary",
                  )}
                />
              )}

              <span
                className={cn(
                  "relative z-10 grid size-6 place-items-center rounded-full text-[11px] font-medium",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent && "bg-terracotta text-background",
                  isUpcoming && "bg-secondary text-subtle",
                )}
              >
                {isDone ? (
                  <>
                    <Check className="size-3.5" aria-hidden />
                    <span className="sr-only">пройдено</span>
                  </>
                ) : (
                  index + 1
                )}
              </span>

              <span className="text-[11px] text-subtle">{stage}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex gap-3 rounded-lg bg-muted p-4">
        <span className="font-mono text-[10px] leading-5 tracking-wider text-subtle">
          AI
        </span>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {AI_NOTE}
        </p>
      </div>
    </article>
  );
}
