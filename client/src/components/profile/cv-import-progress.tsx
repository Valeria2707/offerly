"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  CV_IMPORT_STEP_DURATION_MS,
  CV_IMPORT_STEPS,
} from "@/constants/cv-import";
import { cn } from "@/lib/utils";

export function CvImportProgress({ filename }: { filename: string | null }) {
  const t = useTranslations("profile.cv");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((value) => Math.min(value + 1, CV_IMPORT_STEPS.length - 1)),
      CV_IMPORT_STEP_DURATION_MS,
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid justify-items-center gap-6 py-24">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-ai-muted font-mono text-[10px] tracking-wider text-ai">
        AI
      </span>

      <div className="grid justify-items-center gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold">
          {t("parsing")}
        </h2>
        <p className="font-mono text-[11px] text-subtle">
          {t("parsingHint", { filename: filename ?? t("document") })}
        </p>
      </div>

      <ol className="grid w-full max-w-md gap-2">
        {CV_IMPORT_STEPS.map((key, index) => {
          const done = index < step;
          const active = index === step;

          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                done && "bg-card text-foreground ring-1 ring-foreground/[0.07]",
                active && "bg-ai-muted text-foreground ring-1 ring-ai/25",
                !done && !active && "bg-muted text-subtle",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  done && "bg-success text-primary-foreground",
                  active && "bg-ai text-primary-foreground",
                  !done && !active && "bg-secondary",
                )}
              >
                {done && <Check className="size-3" />}
                {active && <Loader2 className="size-3 animate-spin" />}
              </span>
              {t(`steps.${key}`)}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
