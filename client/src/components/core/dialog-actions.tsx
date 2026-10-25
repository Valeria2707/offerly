import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function DialogActions({
  submitLabel,
  cancelLabel,
  variant = "default",
  pending,
  disabled,
  onCancel,
  onSubmit,
}: {
  submitLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  pending: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations("common.actions");

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Button type="button" variant="secondary" onClick={onCancel}>
        {cancelLabel ?? t("cancel")}
      </Button>
      <Button
        type="button"
        variant={variant}
        disabled={disabled || pending}
        onClick={onSubmit}
      >
        {pending && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}
