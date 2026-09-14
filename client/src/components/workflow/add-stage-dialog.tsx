"use client";

import { useState } from "react";

import { DialogActions } from "@/components/core/dialog-actions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { STAGE_CATEGORY_LABELS } from "@/constants/workflow";
import { stageName, stageTypeMeta } from "@/lib/workflow";
import {
  STAGE_CATEGORIES,
  type StageCategory,
  type StageType,
} from "@/types/workflow";

type AddStageDialogProps = {
  stageTypes: StageType[];
  pending: boolean;
  onClose: () => void;
  onAdd: (stageTypeIds: string[]) => void;
};

export function AddStageDialog({
  stageTypes,
  pending,
  onClose,
  onAdd,
}: AddStageDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (stageTypeId: string) =>
    setSelected((current) =>
      current.includes(stageTypeId)
        ? current.filter((id) => id !== stageTypeId)
        : [...current, stageTypeId],
    );

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Додати етап</DialogTitle>
          <DialogDescription>
            оберіть один або кілька типів — порядок потім міняється стрілками
          </DialogDescription>
        </DialogHeader>

        <div className="-mr-2 grid max-h-80 gap-4 overflow-y-auto pr-2">
          {STAGE_CATEGORIES.map((category: StageCategory) => {
            const types = stageTypes.filter(
              (type) => type.category === category,
            );

            if (types.length === 0) return null;

            return (
              <section key={category} className="grid gap-1">
                <h3 className="px-1 font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
                  {STAGE_CATEGORY_LABELS[category]}
                </h3>

                {types.map((type) => (
                  <Label
                    key={type.id}
                    htmlFor={`stage-type-${type.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 font-normal transition-colors hover:bg-muted has-[[data-checked]]:bg-secondary"
                  >
                    <Checkbox
                      id={`stage-type-${type.id}`}
                      checked={selected.includes(type.id)}
                      onCheckedChange={() => toggle(type.id)}
                    />

                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="truncate text-sm">
                        {stageName(type.name)}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {stageTypeMeta(type)}
                      </span>
                    </span>
                  </Label>
                ))}
              </section>
            );
          })}
        </div>

        <DialogActions
          submitLabel={
            selected.length > 1 ? `Додати · ${selected.length}` : "Додати"
          }
          pending={pending}
          disabled={selected.length === 0}
          onCancel={onClose}
          onSubmit={() => onAdd(selected)}
        />
      </DialogContent>
    </Dialog>
  );
}
