"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import { CreateStageTypeDialog } from "@/components/stage-types/create-stage-type-dialog";
import { StageTypeCard } from "@/components/stage-types/stage-type-card";
import { StageTypeGridSkeleton } from "@/components/stage-types/stage-type-grid-skeleton";
import { Button } from "@/components/ui/button";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { STAGE_CATEGORY_LABELS } from "@/constants/workflow";
import {
  useCreateStageType,
  useDeleteStageType,
  useStageTypes,
} from "@/hooks/use-workflow";
import { ApiError } from "@/lib/api-client";
import { stageName } from "@/lib/workflow";
import {
  STAGE_CATEGORIES,
  type StageCategory,
  type StageType,
} from "@/types/workflow";

type Filter = StageCategory | "all";

const FILTERS: Filter[] = ["all", ...STAGE_CATEGORIES];

const FILTER_LABELS: Record<Filter, string> = {
  all: "Усі",
  ...STAGE_CATEGORY_LABELS,
};

export default function StageTypesPage() {
  const { data: stageTypes, isPending, error } = useStageTypes();
  const createStageType = useCreateStageType();
  const deleteStageType = useDeleteStageType();

  const [filter, setFilter] = useState<Filter>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<StageType | null>(null);

  const notify = (cause: unknown) =>
    toast.error(
      cause instanceof ApiError ? cause.message : DEFAULT_API_ERROR_MESSAGE,
      { id: "stage-type-error" },
    );

  const visible =
    filter === "all"
      ? (stageTypes ?? [])
      : (stageTypes ?? []).filter((type) => type.category === filter);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Довідник типів етапів
          </h1>
          <p className="text-sm text-muted-foreground">
            стандартні типи для будь-якого процесу відбору — використовуйте як є
            або створіть власний
          </p>
        </div>

        <Button
          onClick={() => setIsCreating(true)}
          disabled={createStageType.isPending}
        >
          <Plus />
          Створити власний тип
        </Button>
      </header>

      {isCreating && (
        <CreateStageTypeDialog
          pending={createStageType.isPending}
          onClose={() => setIsCreating(false)}
          onCreate={(draft) =>
            createStageType.mutate(draft, {
              onSuccess: () => setIsCreating(false),
              onError: notify,
            })
          }
        />
      )}

      {typeToDelete && (
        <ConfirmDialog
          title="Видалити тип етапу?"
          description={`«${stageName(typeToDelete.name)}» зникне з довідника. Етапи, уже додані до вакансій, залишаться на місці.`}
          confirmLabel="Видалити"
          pending={deleteStageType.isPending}
          onCancel={() => setTypeToDelete(null)}
          onConfirm={() =>
            deleteStageType.mutate(typeToDelete.id, {
              onSuccess: () => setTypeToDelete(null),
              onError: notify,
            })
          }
        />
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={filter === item ? "default" : "secondary"}
            className="rounded-full text-xs"
            onClick={() => setFilter(item)}
          >
            {FILTER_LABELS[item]}
          </Button>
        ))}
      </div>

      <FormError error={error} />

      {isPending ? (
        <StageTypeGridSkeleton />
      ) : visible.length === 0 ? (
        <p className="rounded-xl bg-card px-6 py-16 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          У цій категорії поки немає типів.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((type) => (
            <StageTypeCard
              key={type.id}
              type={type}
              pending={deleteStageType.isPending}
              onRemove={setTypeToDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
