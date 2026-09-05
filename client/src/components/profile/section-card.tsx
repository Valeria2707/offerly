"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useFormContext, type Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/types/profile";

type SectionCardProps = {
  title: string;
  path: string;
  name: Path<ProfileData>;
  count?: number;
  className?: string;
  children: ReactNode;
};

export function SectionCard({
  title,
  path,
  name,
  count,
  className,
  children,
}: SectionCardProps) {
  const { resetField } = useFormContext<ProfileData>();
  const [editing, setEditing] = useState(false);

  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl bg-card p-6 ring-1 transition-shadow",
        editing ? "ring-primary/40" : "ring-foreground/[0.07]",
        className,
      )}
    >
      <header className="mb-5 flex items-center gap-3">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        <span className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">
          {path}
          {count === undefined ? "" : ` · ${count}`}
        </span>

        {editing ? (
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Завершити редагування: ${title}`}
              className="text-primary"
              onClick={() => setEditing(false)}
            >
              <Check />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Скасувати зміни: ${title}`}
              className="text-subtle"
              onClick={() => {
                resetField(name);
                setEditing(false);
              }}
            >
              <X />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Редагувати секцію: ${title}`}
            className="ml-auto text-subtle"
            onClick={() => setEditing(true)}
          >
            <Pencil />
          </Button>
        )}
      </header>

      <fieldset disabled={!editing} className="grid min-w-0 gap-5">
        {children}
      </fieldset>
    </section>
  );
}
