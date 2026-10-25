"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { DateField } from "@/components/core/date-field";
import { IconButton } from "@/components/core/icon-button";
import { LinkField } from "@/components/core/link-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RejectionReasonDialog,
  type RejectionDialogMode,
} from "@/components/workflow/rejection-reason-dialog";
import { StageCategoryBadge } from "@/components/workflow/stage-category-badge";
import { CLOSED_STAGE_STATUSES } from "@/constants/workflow";
import { useStageName } from "@/hooks/use-stage-name";
import { formatStageDate } from "@/lib/workflow";
import {
  STAGE_STATUSES,
  type StageStatus,
  type WorkflowStage,
  type WorkflowStagePatch,
} from "@/types/workflow";

type StageDetailsProps = {
  stage: WorkflowStage;
  withArtifact: boolean;
  pending: boolean;
  frozen: boolean;
  onUpdate: (patch: WorkflowStagePatch) => void;
  onRemove: () => void;
};

export function StageDetails({
  stage,
  withArtifact,
  pending,
  frozen,
  onUpdate,
  onRemove,
}: StageDetailsProps) {
  const t = useTranslations("workflow");
  const locale = useLocale();
  const name = useStageName()(stage.name);
  const [dialog, setDialog] = useState<RejectionDialogMode | null>(null);

  const changeStatus = (status: StageStatus) => {
    if (status === "cancelled" && stage.status !== "cancelled")
      return setDialog("reject");
    onUpdate({ status });
  };

  const isClosed = CLOSED_STAGE_STATUSES.includes(stage.status);
  const reason = stage.status === "cancelled" && (
    <span className="flex items-center gap-1 text-xs text-rejected">
      {stage.rejectionReason
        ? t("rejection.reason", {
            reason: t(`rejectionReasons.${stage.rejectionReason}`),
          })
        : t("rejection.empty")}
      <IconButton
        label={t("rejection.edit")}
        disabled={pending}
        onClick={() => setDialog("edit")}
        className="text-rejected/70 hover:bg-rejected-muted hover:text-rejected"
      >
        <Pencil className="size-3" />
      </IconButton>
    </span>
  );
  const history = [
    stage.scheduledAt &&
      t("details.meetingAt", {
        date: formatStageDate(stage.scheduledAt, locale) ?? "",
      }),
    stage.deadlineAt &&
      t("details.deadlineAt", {
        date: formatStageDate(stage.deadlineAt, locale) ?? "",
      }),
    stage.completedAt &&
      t("details.completedAt", {
        date: formatStageDate(stage.completedAt, locale) ?? "",
      }),
  ].filter(Boolean);

  const artifact = (withArtifact || stage.artifactUrl) && (
    <LinkField
      label={t("details.artifactLabel")}
      name={t("details.artifactName")}
      emptyLabel={t("details.artifactEmpty")}
      value={stage.artifactUrl}
      disabled={pending}
      onChange={(artifactUrl) => onUpdate({ artifactUrl })}
    />
  );

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
          disabled={pending || frozen}
          onValueChange={(status) => changeStatus(status as StageStatus)}
        >
          <SelectTrigger
            size="sm"
            aria-label={t("details.statusLabel", { name })}
            title={
              frozen
                ? t("details.frozen")
                : undefined
            }
            className="w-44 rounded-lg border-transparent bg-muted text-xs shadow-none"
          >
            <SelectValue>
              {(status: StageStatus) => t(`status.${status}`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STAGE_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <IconButton
          label={t("details.removeLabel", { name })}
          disabled={pending}
          onClick={onRemove}
          className="hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </IconButton>
      </header>

      {isClosed ? (
        (history.length > 0 || artifact || reason) && (
          <>
            <div className="h-px bg-border" />
            <div className="flex flex-wrap items-center gap-3">
              {reason}
              {history.length > 0 && (
                <p className="font-mono text-[11px] text-subtle">
                  {history.join(" · ")}
                </p>
              )}
              {artifact}
            </div>
          </>
        )
      ) : (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-wrap items-center gap-2">
            <DateField
              label={t("details.meetingLabel")}
              name={t("details.meetingName")}
              emptyLabel={t("details.meetingEmpty")}
              value={stage.scheduledAt}
              withTime
              disabled={pending}
              onChange={(scheduledAt) => onUpdate({ scheduledAt })}
            />

            <DateField
              label={t("details.deadlineLabel")}
              name={t("details.deadlineName")}
              emptyLabel={t("details.deadlineName")}
              value={stage.deadlineAt}
              disabled={pending}
              onChange={(deadlineAt) => onUpdate({ deadlineAt })}
            />

            {artifact}
          </div>
        </>
      )}

      {dialog && (
        <RejectionReasonDialog
          mode={dialog}
          stageName={name}
          initialReason={stage.rejectionReason}
          pending={pending}
          onClose={() => setDialog(null)}
          onSave={(rejectionReason) => {
            onUpdate(
              dialog === "reject"
                ? { status: "cancelled", rejectionReason }
                : { rejectionReason },
            );
            setDialog(null);
          }}
        />
      )}
    </section>
  );
}
