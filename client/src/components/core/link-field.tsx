"use client";

import { ExternalLink, Plus, X } from "lucide-react";
import { useState } from "react";

import { IconButton } from "@/components/core/icon-button";
import { Input } from "@/components/ui/input";

type LinkFieldProps = {
  label: string;
  name: string;
  emptyLabel: string;
  value: string | null;
  disabled?: boolean;
  onChange: (url: string | null) => void;
};

function normalize(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function LinkField({
  label,
  name,
  emptyLabel,
  value,
  disabled,
  onChange,
}: LinkFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const close = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const commit = () => {
    const url = draft === null ? null : normalize(draft);

    if (url && url !== value) onChange(url);

    close();
  };

  if (isEditing)
    return (
      <Input
        type="url"
        aria-label={label}
        autoFocus
        disabled={disabled}
        value={draft ?? value ?? ""}
        placeholder="https://…"
        className="h-8 w-72 rounded-lg text-xs"
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
    <div className="flex h-8 max-w-full items-center gap-2 rounded-lg bg-muted pr-1 pl-3">
      <span className="font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
        {name}
      </span>

      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <span className="truncate">{new URL(value).hostname}</span>
        <ExternalLink className="size-3 shrink-0" />
      </a>

      <IconButton
        label={`Змінити: ${label}`}
        disabled={disabled}
        onClick={() => setIsEditing(true)}
        className="text-[11px]"
      >
        <span aria-hidden>···</span>
      </IconButton>

      <IconButton
        label={`Прибрати: ${label}`}
        disabled={disabled}
        onClick={() => onChange(null)}
        className="hover:text-destructive"
      >
        <X className="size-3.5" />
      </IconButton>
    </div>
  );
}
