"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { IconButton } from "@/components/core/icon-button";
import { cn } from "@/lib/utils";
import { currentStageIndex, formatStageDate, stageName } from "@/lib/workflow";
import type { WorkflowStage } from "@/types/workflow";

type StageStepperProps = {
  stages: WorkflowStage[];
  selectedId: string;
  pending: boolean;
  onSelect: (stageId: string) => void;
  onMove: (index: number, offset: number) => void;
};

function circleClass(isDone: boolean, isCurrent: boolean) {
  if (isDone) return "bg-primary text-primary-foreground";
  if (isCurrent) return "bg-terracotta text-primary-foreground";
  return "bg-secondary text-subtle";
}

export function StageStepper({
  stages,
  selectedId,
  pending,
  onSelect,
  onMove,
}: StageStepperProps) {
  const current = currentStageIndex(stages);

  return (
    <ol className="flex items-start overflow-x-auto px-1.5 pt-1.5 pb-1">
      {stages.map((stage, index) => {
        const name = stageName(stage.name);
        const isDone = stage.status === "completed";
        const isSelected = stage.id === selectedId;

        return (
          <li
            key={stage.id}
            className="relative grid min-w-32 flex-1 shrink-0 justify-items-center gap-1.5"
          >
            <button
              type="button"
              aria-current={isSelected ? "step" : undefined}
              aria-label={`Етап ${index + 1}: ${name}`}
              onClick={() => onSelect(stage.id)}
              className="absolute inset-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />

            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-px flex-1",
                  index === 0 ? "bg-transparent" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px]",
                  circleClass(isDone, index === current),
                  isSelected &&
                    "ring-2 ring-foreground/25 ring-offset-2 ring-offset-background",
                )}
              >
                {isDone ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "h-px flex-1",
                  index === stages.length - 1 ? "bg-transparent" : "bg-border",
                )}
              />
            </div>

            <span
              className={cn(
                "px-2 text-center text-xs",
                isSelected ? "font-medium" : "text-muted-foreground",
              )}
            >
              {name}
            </span>

            <span className="font-mono text-[10px] text-subtle">
              {formatStageDate(stage.completedAt ?? stage.scheduledAt) ?? " "}
            </span>

            {isSelected && (
              <div className="relative flex gap-1">
                <IconButton
                  label={`Перемістити «${name}» лівіше`}
                  disabled={pending || index === 0}
                  onClick={() => onMove(index, -1)}
                >
                  <ChevronLeft className="size-3.5" />
                </IconButton>
                <IconButton
                  label={`Перемістити «${name}» правіше`}
                  disabled={pending || index === stages.length - 1}
                  onClick={() => onMove(index, 1)}
                >
                  <ChevronRight className="size-3.5" />
                </IconButton>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
