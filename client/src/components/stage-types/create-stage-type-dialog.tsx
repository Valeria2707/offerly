"use client";

import { useState } from "react";

import { CheckboxRow } from "@/components/core/checkbox-row";
import { DialogActions } from "@/components/core/dialog-actions";
import { FieldLabel } from "@/components/core/field-label";
import { TextField } from "@/components/core/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MAX_STAGE_DURATION_MINUTES,
  STAGE_CATEGORY_LABELS,
} from "@/constants/workflow";
import { cn } from "@/lib/utils";
import {
  STAGE_CATEGORIES,
  type StageCategory,
  type StageTypeDraft,
} from "@/types/workflow";

const EMPTY: StageTypeDraft = {
  name: "",
  category: "technical",
  expectedDurationMinutes: null,
  requiresPreparation: false,
  supportsDeadline: false,
  producesArtifact: false,
};

type CreateStageTypeDialogProps = {
  pending: boolean;
  onClose: () => void;
  onCreate: (draft: StageTypeDraft) => void;
};

export function CreateStageTypeDialog({
  pending,
  onClose,
  onCreate,
}: CreateStageTypeDialogProps) {
  const [draft, setDraft] = useState<StageTypeDraft>(EMPTY);
  const [duration, setDuration] = useState("");

  const minutes = Number(duration);
  const isDurationValid =
    duration === "" ||
    (Number.isInteger(minutes) &&
      minutes >= 1 &&
      minutes <= MAX_STAGE_DURATION_MINUTES);

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Створити тип етапу</DialogTitle>
          <DialogDescription>
            власний тип стає доступним у довіднику поряд зі стандартними
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <TextField
            id="stage-type-name"
            label="Назва типу"
            value={draft.name}
            placeholder="Архітектурне рев’ю"
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />

          <div className="grid gap-2">
            <FieldLabel>Категорія</FieldLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAGE_CATEGORIES.map((category: StageCategory) => (
                <Button
                  key={category}
                  type="button"
                  variant={
                    draft.category === category ? "default" : "secondary"
                  }
                  className={cn(
                    "h-9 px-2 text-xs",
                    draft.category !== category && "bg-muted",
                  )}
                  onClick={() => setDraft({ ...draft, category })}
                >
                  {STAGE_CATEGORY_LABELS[category]}
                </Button>
              ))}
            </div>
          </div>

          <TextField
            id="stage-type-duration"
            label="Очікувана тривалість, хв"
            type="number"
            min={1}
            max={MAX_STAGE_DURATION_MINUTES}
            value={duration}
            placeholder="90"
            aria-invalid={!isDurationValid}
            onChange={(event) => setDuration(event.target.value)}
          />

          <div className="grid gap-3">
            <CheckboxRow
              id="stage-type-preparation"
              label="Потребує підготовки"
              checked={draft.requiresPreparation}
              onChange={(requiresPreparation) =>
                setDraft({ ...draft, requiresPreparation })
              }
            />
            <CheckboxRow
              id="stage-type-deadline"
              label="Має дедлайн"
              checked={draft.supportsDeadline}
              onChange={(supportsDeadline) =>
                setDraft({ ...draft, supportsDeadline })
              }
            />
            <CheckboxRow
              id="stage-type-artifact"
              label="Передбачає артефакт (документ, код)"
              checked={draft.producesArtifact}
              onChange={(producesArtifact) =>
                setDraft({ ...draft, producesArtifact })
              }
            />
          </div>
        </div>

        <DialogActions
          submitLabel="Створити тип"
          pending={pending}
          disabled={!draft.name.trim() || !isDurationValid}
          onCancel={onClose}
          onSubmit={() =>
            onCreate({
              ...draft,
              name: draft.name.trim(),
              expectedDurationMinutes: duration === "" ? null : minutes,
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}
