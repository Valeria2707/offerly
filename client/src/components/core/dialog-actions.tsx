import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DialogActions({
  submitLabel,
  variant = "default",
  pending,
  disabled,
  onCancel,
  onSubmit,
}: {
  submitLabel: string;
  variant?: "default" | "destructive";
  pending: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Button type="button" variant="secondary" onClick={onCancel}>
        Скасувати
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
