import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PREPARATION_TYPE_LABELS } from "@/constants/preparation";
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
  const { answered, total } = preparationStats(cards);
  const percent = total === 0 ? 100 : Math.round((answered / total) * 100);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid min-w-0 flex-1 gap-1.5">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium">Підготовка готова</span>
          <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">
            {PREPARATION_TYPE_LABELS[type]}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {total > 0
            ? `${cards.length} карток · ${answered} з ${total} питань з відповіддю`
            : `${cards.length} карток з матеріалами`}
        </p>

        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогрес підготовки"
          className="mt-1 h-1.5 max-w-64 overflow-hidden rounded-full bg-secondary"
        >
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Button render={<Link href={href} />}>
        {answered > 0 ? "Продовжити підготовку" : "Почати підготовку"}
        <ArrowRight />
      </Button>
    </div>
  );
}
