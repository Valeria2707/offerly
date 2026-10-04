"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { IconButton } from "@/components/core/icon-button";
import { Input } from "@/components/ui/input";
import {
  formatStageDate,
  fromDateInput,
  toDateInput,
  toDateTimeInput,
} from "@/lib/workflow";

type DateFieldProps = {
  label: string;
  name: string;
  emptyLabel: string;
  value: string | null;
  withTime?: boolean;
  disabled?: boolean;
  onChange: (iso: string | null) => void;
};

export function DateField({
  label,
  name,
  emptyLabel,
  value,
  withTime = false,
  disabled,
  onChange,
}: DateFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const close = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const commit = () => {
    const iso = draft === null ? null : fromDateInput(draft);

    if (iso && !Number.isNaN(new Date(iso).getTime()) && iso !== value)
      onChange(iso);

    close();
  };

  if (isEditing)
    return (
      <Input
        type={withTime ? "datetime-local" : "date"}
        aria-label={label}
        autoFocus
        disabled={disabled}
        value={
          draft ?? (withTime ? toDateTimeInput(value) : toDateInput(value))
        }
        className="h-8 w-fit rounded-lg text-xs"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") close();
        }}
      />
    );

  if (!value)
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsEditing(true)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-input px-3 text-xs text-subtle transition-colors hover:border-ring hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        <Plus className="size-3.5" />
        {emptyLabel}
      </button>
    );

  return (
    <div className="flex h-8 items-center gap-2 rounded-lg bg-muted pr-1 pl-3">
      <span className="font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
        {name}
      </span>

      <button
        type="button"
        disabled={disabled}
        aria-label={`Змінити: ${label}`}
        onClick={() => setIsEditing(true)}
        className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none disabled:pointer-events-none"
      >
        {formatStageDate(value)}
      </button>

      <IconButton
        label={`Очистити: ${label}`}
        disabled={disabled}
        onClick={() => onChange(null)}
        className="hover:text-destructive"
      >
        <X className="size-3.5" />
      </IconButton>
    </div>
  );
}
