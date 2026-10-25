"use client";

import {
  Bell,
  Calendar,
  Clock,
  Hourglass,
  PartyPopper,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { BOARD_STRIPE_CLASSES, type BoardColumn } from "@/constants/board";
import { vacancyRoute } from "@/constants/routes";
import { useStageName } from "@/hooks/use-stage-name";
import { boardNote, type BoardNote } from "@/lib/board";
import { cn } from "@/lib/utils";
import type { Vacancy } from "@/types/vacancy";
import type { WorkflowSummary } from "@/types/workflow";

const NOTE_ICONS: Record<BoardNote["icon"], typeof Bell> = {
  calendar: Calendar,
  clock: Clock,
  bell: Bell,
  hourglass: Hourglass,
  send: Send,
  offer: PartyPopper,
  x: X,
};

const NOTE_CLASSES: Record<BoardNote["tone"], string> = {
  muted: "bg-muted text-muted-foreground",
  warning: "bg-warning-muted text-warning",
  success: "bg-success-muted text-success",
};

export function BoardCard({
  vacancy,
  summary,
  column,
  silentDays,
  draggable,
  moving,
  onDragStart,
  onDragEnd,
}: {
  vacancy: Vacancy;
  summary: WorkflowSummary | undefined;
  column: BoardColumn;
  silentDays: number | null;
  draggable: boolean;
  moving: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const stageName = useStageName();
  const note = boardNote(vacancy, summary, column, silentDays, t, locale);
  const NoteIcon = note ? NOTE_ICONS[note.icon] : null;
  const stage = column === "submitted" ? null : summary?.reachedStage;

  return (
    <Link
      href={vacancyRoute(vacancy.id)}
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "grid overflow-hidden rounded-xl bg-card ring-1 ring-foreground/[0.07] transition-opacity",
        column === "offer" && "ring-success/30",
        column === "rejected" && "bg-muted",
        draggable && "cursor-grab active:cursor-grabbing",
        moving && "pointer-events-none opacity-50",
      )}
    >
      <span
        className={cn(
          "grid gap-0.5 border-t-[3px] px-3 py-2.5",
          BOARD_STRIPE_CLASSES[column],
        )}
      >
        <span
          className={cn(
            "text-[13px] leading-snug font-medium",
            column === "rejected" && "text-muted-foreground",
          )}
        >
          {vacancy.title}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">
          {vacancy.company}
          {stage && ` · ${stageName(stage.name)}`}
        </span>
      </span>

      {note && NoteIcon && (
        <span
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-[11px]",
            NOTE_CLASSES[note.tone],
          )}
        >
          <NoteIcon aria-hidden className="size-3 shrink-0" />
          <span className="truncate">{note.text}</span>
        </span>
      )}
    </Link>
  );
}
