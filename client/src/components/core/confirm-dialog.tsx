"use client";

import { DialogActions } from "@/components/core/dialog-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  pending,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogActions
          submitLabel={confirmLabel}
          variant="destructive"
          pending={pending}
          disabled={false}
          onCancel={onCancel}
          onSubmit={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
