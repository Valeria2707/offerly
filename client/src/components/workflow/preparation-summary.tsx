import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { PreparationCard } from "@/lib/preparation-cards";
import { preparationStats } from "@/lib/preparation-cards";
import type { PreparationType } from "@/types/preparation";

export function PreparationSummary({
  type,
  cards,
  href,
}: {
  type: PreparationType;
  cards: PreparationCard[];
  href: string;
}) {
  const t = useTranslations("preparation");
  const { answered, total } = preparationStats(cards);
  const percent = total === 0 ? 100 : Math.round((answered / total) * 100);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid min-w-0 flex-1 gap-1.5">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium">{t("summary.ready")}</span>
          <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">
            {t(`types.${type}`)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {total > 0
            ? t("summary.progress", { cards: cards.length, answered, total })
            : t("summary.materials", { cards: cards.length })}
        </p>

        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("summary.progressLabel")}
          className="mt-1 h-1.5 max-w-64 overflow-hidden rounded-full bg-secondary"
        >
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Button nativeButton={false} render={<Link href={href} />}>
        {answered > 0 ? t("summary.continue") : t("summary.start")}
        <ArrowRight />
      </Button>
    </div>
  );
}
