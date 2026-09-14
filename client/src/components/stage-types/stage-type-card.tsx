"use client";

import { X } from "lucide-react";

import { StageCategoryBadge } from "@/components/workflow/stage-category-badge";
import { isSystemStageType, stageName, stageTypeMeta } from "@/lib/workflow";
import type { StageType } from "@/types/workflow";

export function StageTypeCard({
  type,
  pending,
  onRemove,
}: {
  type: StageType;
  pending: boolean;
  onRemove: (type: StageType) => void;
}) {
  return (
    <article className="grid content-start gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-2">
        <StageCategoryBadge category={type.category} />

        {!isSystemStageType(type) && (
          <button
            type="button"
            disabled={pending}
            aria-label={`Видалити тип «${type.name}»`}
            onClick={() => onRemove(type)}
            className="rounded-md p-1 text-subtle transition-colors hover:bg-secondary hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <h2 className="text-sm font-medium">{stageName(type.name)}</h2>
      <p className="text-xs text-muted-foreground">{stageTypeMeta(type)}</p>
    </article>
  );
}
