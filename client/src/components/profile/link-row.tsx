"use client";

import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { FIELD_CLASS } from "@/styles/field-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/types/profile";

export function LinkRow({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  const { register } = useFormContext<ProfileData>();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <Input
        aria-label="Назва посилання"
        placeholder="label"
        className={cn(
          "h-9 w-24 rounded-md bg-card px-2.5 font-mono text-[11px]",
          FIELD_CLASS,
        )}
        {...register(`basics.links.${index}.label`)}
      />
      <Input
        aria-label="URL"
        type="url"
        placeholder="https://…"
        className={cn("h-9 min-w-0 flex-1 bg-transparent px-2", FIELD_CLASS)}
        {...register(`basics.links.${index}.url`)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Видалити посилання"
        className="text-subtle"
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  );
}
