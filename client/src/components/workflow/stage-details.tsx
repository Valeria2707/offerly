"use client";

import { Trash2 } from "lucide-react";

import { FieldLabel } from "@/components/core/field-label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageCategoryBadge } from "@/components/workflow/stage-category-badge";
import { STAGE_STATUS_LABELS } from "@/constants/workflow";
import { formatStageDate, stageName } from "@/lib/workflow";
import {
  STAGE_STATUSES,
  type StageStatus,
  type WorkflowStage,
} from "@/types/workflow";

type StageDetailsProps = {
  stage: WorkflowStage;
  pending: boolean;
  onStatusChange: (status: StageStatus) => void;
  onRemove: () => void;
};

export function StageDetails({
  stage,
  pending,
  onStatusChange,
  onRemove,
}: StageDetailsProps) {
  const name = stageName(stage.name);

  return (
    <section className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">
            {name}
          </h2>
          <StageCategoryBadge category={stage.category} />
        </div>

        <Button
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={onRemove}
        >
          <Trash2 />
          Видалити етап
        </Button>
      </header>

      <div className="flex flex-wrap items-end gap-6">
        <div className="grid gap-2">
          <FieldLabel>Статус</FieldLabel>
          <Select
            value={stage.status}
            disabled={pending}
            onValueChange={(status) => onStatusChange(status as StageStatus)}
          >
            <SelectTrigger
              aria-label={`Статус етапу «${name}»`}
              className="w-52 rounded-lg border-transparent bg-muted text-xs shadow-none"
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
        </div>

        <dl className="flex gap-6">
          <div className="grid gap-2">
            <dt>
              <FieldLabel>Заплановано</FieldLabel>
            </dt>
            <dd className="font-mono text-xs text-muted-foreground">
              {formatStageDate(stage.scheduledAt) ?? "—"}
            </dd>
          </div>

          <div className="grid gap-2">
            <dt>
              <FieldLabel>Дедлайн</FieldLabel>
            </dt>
            <dd className="font-mono text-xs text-muted-foreground">
              {formatStageDate(stage.deadlineAt) ?? "—"}
            </dd>
          </div>

          <div className="grid gap-2">
            <dt>
              <FieldLabel>Завершено</FieldLabel>
            </dt>
            <dd className="font-mono text-xs text-muted-foreground">
              {formatStageDate(stage.completedAt) ?? "—"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
