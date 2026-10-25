"use client";

import { Loader2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { IconButton } from "@/components/core/icon-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatStageDate } from "@/lib/workflow";
import { FIELD_CLASS } from "@/styles/field-styles";
import type { StageNote } from "@/types/workflow";

const NOTE_MAX_LENGTH = 5000;

type StageNotesProps = {
  notes: StageNote[];
  pending: boolean;
  onAdd: (content: string) => void;
  onRemove: (noteId: string) => void;
};

export function StageNotes({
  notes,
  pending,
  onAdd,
  onRemove,
}: StageNotesProps) {
  const t = useTranslations("workflow.notes");
  const tc = useTranslations("common.actions");
  const locale = useLocale();
  const [draft, setDraft] = useState("");

  const submit = () => {
    const content = draft.trim();
    if (!content) return;
    onAdd(content);
    setDraft("");
  };

  return (
    <section className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="font-heading text-base font-bold tracking-tight">
        {t("title")}
      </h2>

      {notes.length > 0 && (
        <ul className="-mr-1 grid max-h-80 gap-2 overflow-y-auto pr-1">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start gap-2 rounded-lg bg-muted p-3"
            >
              <div className="grid min-w-0 flex-1 gap-1">
                <span className="font-mono text-[10px] text-subtle">
                  {formatStageDate(note.createdAt, locale)}
                </span>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>

              <IconButton
                label={t("remove")}
                disabled={pending}
                onClick={() => onRemove(note.id)}
                className="hover:text-destructive"
              >
                <X className="size-3.5" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2">
        <Textarea
          rows={3}
          value={draft}
          maxLength={NOTE_MAX_LENGTH}
          aria-label={t("new")}
          placeholder={t("placeholder")}
          className={cn(
            "field-sizing-fixed max-h-40 resize-none overflow-y-auto py-2.5",
            FIELD_CLASS,
          )}
          onChange={(event) => setDraft(event.target.value)}
        />

        {draft.trim() && (
          <div className="flex gap-2">
            <Button size="sm" disabled={pending} onClick={submit}>
              {pending && <Loader2 className="animate-spin" />}
              {tc("save")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => setDraft("")}
            >
              {tc("cancel")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
