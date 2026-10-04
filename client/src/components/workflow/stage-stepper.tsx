"use client";

import { Check, X } from "lucide-react";

import { useDragReorder } from "@/hooks/use-drag-reorder";
import { cn } from "@/lib/utils";
import { currentStageIndex, formatStageDate, stageName } from "@/lib/workflow";
import type { StageStatus, WorkflowStage } from "@/types/workflow";

type StageStepperProps = {
  stages: WorkflowStage[];
  selectedId: string;
  pending: boolean;
  onSelect: (stageId: string) => void;
  onReorder: (from: number, to: number) => void;
};

function circleClass(status: StageStatus, isCurrent: boolean) {
  if (status === "completed") return "bg-primary text-primary-foreground";
  if (status === "cancelled") return "bg-rejected text-primary-foreground";
  if (isCurrent) return "bg-terracotta text-primary-foreground";
  return "bg-secondary text-subtle";
}

export function StageStepper({
  stages,
  selectedId,
  pending,
  onSelect,
  onReorder,
}: StageStepperProps) {
  const current = currentStageIndex(stages);

  const drag = useDragReorder(onReorder, pending);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!event.altKey || pending) return;

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      onReorder(index, index - 1);
    }

    if (event.key === "ArrowRight" && index < stages.length - 1) {
      event.preventDefault();
      onReorder(index, index + 1);
    }
  };

  return (
    <ol className="flex items-start overflow-x-auto px-1.5 pt-1.5 pb-1">
      {stages.map((stage, index) => {
        const name = stageName(stage.name);
        const isRejected = stage.status === "cancelled";
        const isSelected = stage.id === selectedId;
        return (
          <li
            key={stage.id}
            {...drag.getItemProps(index)}
            className={cn(
              "relative grid min-w-32 flex-1 shrink-0 cursor-grab justify-items-center gap-1.5 active:cursor-grabbing",
              drag.isDragging(index) && "opacity-40",
            )}
          >
            <button
              type="button"
              aria-current={isSelected ? "step" : undefined}
              aria-label={`Етап ${index + 1}: ${name}`}
              aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
              onClick={() => onSelect(stage.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
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
                  "flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] transition-shadow",
                  circleClass(stage.status, index === current),
                  isSelected &&
                    "ring-2 ring-foreground/25 ring-offset-2 ring-offset-background",
                  drag.isDropTarget(index) &&
                    "ring-2 ring-terracotta ring-offset-2 ring-offset-background",
                )}
              >
                {stage.status === "completed" ? (
                  <Check className="size-3.5" />
                ) : isRejected ? (
                  <X className="size-3.5" />
                ) : (
                  index + 1
                )}
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
                isRejected && "text-rejected",
              )}
            >
              {name}
            </span>

            <span className="font-mono text-[10px] text-subtle">
              {formatStageDate(stage.completedAt ?? stage.scheduledAt) ?? "—"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
