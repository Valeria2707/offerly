"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { DialogActions } from "@/components/core/dialog-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { REJECTION_REASONS, type RejectionReason } from "@/types/workflow";

export type RejectionDialogMode = "reject" | "edit";

export function RejectionReasonDialog({
  mode,
  stageName,
  initialReason,
  pending,
  onClose,
  onSave,
}: {
  mode: RejectionDialogMode;
  stageName: string;
  initialReason: RejectionReason | null;
  pending: boolean;
  onClose: () => void;
  onSave: (reason: RejectionReason | null) => void;
}) {
  const t = useTranslations("workflow");
  const [reason, setReason] = useState(initialReason);

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("rejection.title")}</DialogTitle>
          <DialogDescription>{stageName}</DialogDescription>
        </DialogHeader>

        <div
          role="radiogroup"
          aria-label={t("details.rejectionReason")}
          className="-mr-2 grid max-h-80 gap-0.5 overflow-y-auto pr-2"
        >
          {REJECTION_REASONS.map((item) => (
            <label
              key={item}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted",
                reason === item &&
                  "bg-rejected-muted text-rejected hover:bg-rejected-muted",
              )}
            >
              <input
                type="radio"
                name="rejection-reason"
                value={item}
                checked={reason === item}
                onChange={() => setReason(item)}
                className="size-3.5 accent-rejected"
              />
              {t(`rejectionReasons.${item}`)}
            </label>
          ))}
        </div>

        <DialogActions
          submitLabel={
            mode === "reject"
              ? t("rejection.saveRejection")
              : t("rejection.save")
          }
          cancelLabel={mode === "reject" ? t("rejection.skip") : undefined}
          variant={mode === "reject" ? "destructive" : "default"}
          pending={pending}
          disabled={reason === null}
          onCancel={() => (mode === "reject" ? onSave(null) : onClose())}
          onSubmit={() => onSave(reason)}
        />
      </DialogContent>
    </Dialog>
  );
}
