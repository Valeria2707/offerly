"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import { CreateStageTypeDialog } from "@/components/stage-types/create-stage-type-dialog";
import { StageTypeCard } from "@/components/stage-types/stage-type-card";
import { StageTypeGridSkeleton } from "@/components/stage-types/stage-type-grid-skeleton";
import { Button } from "@/components/ui/button";
import {
  useCreateStageType,
  useDeleteStageType,
  useStageTypes,
} from "@/hooks/use-workflow";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useStageName } from "@/hooks/use-stage-name";
import {
  STAGE_CATEGORIES,
  type StageCategory,
  type StageType,
} from "@/types/workflow";

type Filter = StageCategory | "all";

const FILTERS: Filter[] = ["all", ...STAGE_CATEGORIES];

export default function StageTypesPage() {
  const t = useTranslations();
  const stageName = useStageName();
  const errorMessage = useErrorMessage();
  const { data: stageTypes, isPending, error } = useStageTypes();
  const createStageType = useCreateStageType();
  const deleteStageType = useDeleteStageType();

  const [filter, setFilter] = useState<Filter>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<StageType | null>(null);

  const notify = (cause: unknown) =>
    toast.error(errorMessage(cause), { id: "stage-type-error" });

  const visible =
    filter === "all"
      ? (stageTypes ?? [])
      : (stageTypes ?? []).filter((type) => type.category === filter);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("stageTypes.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("stageTypes.description")}
          </p>
        </div>

        <Button
          onClick={() => setIsCreating(true)}
          disabled={createStageType.isPending}
        >
          <Plus />
          {t("stageTypes.create")}
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
          title={t("stageTypes.delete.title")}
          description={t("stageTypes.delete.description", {
            name: stageName(typeToDelete.name),
          })}
          confirmLabel={t("common.actions.delete")}
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
            {item === "all"
              ? t("stageTypes.all")
              : t(`workflow.category.${item}`)}
          </Button>
        ))}
      </div>

      <FormError error={error} />

      {isPending ? (
        <StageTypeGridSkeleton />
      ) : visible.length === 0 ? (
        <p className="rounded-xl bg-card px-6 py-16 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          {t("stageTypes.empty")}
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
