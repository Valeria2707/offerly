"use client";

import { Trash2 } from "lucide-react";

import { DateField } from "@/components/core/date-field";
import { IconButton } from "@/components/core/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageCategoryBadge } from "@/components/workflow/stage-category-badge";
import {
  CLOSED_STAGE_STATUSES,
  STAGE_STATUS_LABELS,
} from "@/constants/workflow";
import { formatStageDate, stageName } from "@/lib/workflow";
import {
  STAGE_STATUSES,
  type StageStatus,
  type WorkflowStage,
  type WorkflowStagePatch,
} from "@/types/workflow";

type StageDetailsProps = {
  stage: WorkflowStage;
  pending: boolean;
  onUpdate: (patch: WorkflowStagePatch) => void;
  onRemove: () => void;
};

export function StageDetails({
  stage,
  pending,
  onUpdate,
  onRemove,
}: StageDetailsProps) {
  const name = stageName(stage.name);

  const isClosed = CLOSED_STAGE_STATUSES.includes(stage.status);
  const history = [
    stage.scheduledAt && `зустріч ${formatStageDate(stage.scheduledAt)}`,
    stage.deadlineAt && `дедлайн ${formatStageDate(stage.deadlineAt)}`,
    stage.completedAt && `завершено ${formatStageDate(stage.completedAt)}`,
  ].filter(Boolean);

  return (
    <section className="grid gap-3 rounded-xl bg-card px-5 py-4 ring-1 ring-foreground/10">
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-base font-bold tracking-tight">
          {name}
        </h2>
        <StageCategoryBadge category={stage.category} />

        <span className="flex-1" />

        <Select
          value={stage.status}
          disabled={pending}
          onValueChange={(status) =>
            onUpdate({ status: status as StageStatus })
          }
        >
          <SelectTrigger
            size="sm"
            aria-label={`Статус етапу «${name}»`}
            className="w-44 rounded-lg border-transparent bg-muted text-xs shadow-none"
          >
            <SelectValue>
              {(status: StageStatus) => STAGE_STATUS_LABELS[status]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STAGE_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {STAGE_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <IconButton
          label={`Видалити етап «${name}»`}
          disabled={pending}
          onClick={onRemove}
          className="hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </IconButton>
      </header>

      {isClosed ? (
        history.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <p className="font-mono text-[11px] text-subtle">
              {history.join(" · ")}
            </p>
          </>
        )
      ) : (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-wrap items-center gap-2">
            <DateField
              label="Дата і час зустрічі"
              name="зустріч"
              emptyLabel="призначити зустріч"
              value={stage.scheduledAt}
              withTime
              disabled={pending}
              onChange={(scheduledAt) => onUpdate({ scheduledAt })}
            />

            <DateField
              label="Дедлайн"
              name="дедлайн"
              emptyLabel="дедлайн"
              value={stage.deadlineAt}
              disabled={pending}
              onChange={(deadlineAt) => onUpdate({ deadlineAt })}
            />
          </div>
        </>
      )}
    </section>
  );
}
