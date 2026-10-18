"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";

import { CheckboxRow } from "@/components/core/checkbox-row";
import { TextField } from "@/components/core/text-field";
import { Button } from "@/components/ui/button";
import { CALENDAR_ROUTES } from "@/constants/api";
import type { ReminderSettings, ReminderSettingsPatch } from "@/types/calendar";

export function ReminderSettingsCard({
  settings,
  email,
  pending,
  onChange,
  onSubscribe,
}: {
  settings: ReminderSettings;
  email: string | null;
  pending: boolean;
  onChange: (patch: ReminderSettingsPatch) => void;
  onSubscribe: () => void;
}) {
  const feed = settings.calendarToken
    ? CALENDAR_ROUTES.subscriptionFeed(settings.calendarToken)
    : null;

  return (
    <section className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <h2 className="font-heading text-base font-bold">Про що нагадувати</h2>

      <div className="grid gap-3">
        <CheckboxRow
          id="reminder-before-interview"
          label="За 24 години до співбесіди"
          checked={settings.beforeInterview}
          onChange={(beforeInterview) => onChange({ beforeInterview })}
        />
        <CheckboxRow
          id="reminder-after-stage"
          label="Внести результат після етапу"
          checked={settings.afterStage}
          onChange={(afterStage) => onChange({ afterStage })}
        />
        <CheckboxRow
          id="reminder-before-deadline"
          label="За 2 дні до дедлайну"
          checked={settings.beforeDeadline}
          onChange={(beforeDeadline) => onChange({ beforeDeadline })}
        />
        <CheckboxRow
          id="reminder-silence"
          label="Тиша від компанії понад 10 днів"
          checked={settings.silence}
          onChange={(silence) => onChange({ silence })}
        />
        <CheckboxRow
          id="reminder-weekly-digest"
          label="Тижневий підсумок у понеділок"
          checked={settings.weeklyDigest}
          onChange={(weeklyDigest) => onChange({ weeklyDigest })}
        />
      </div>

      <div className="grid gap-4 border-t border-foreground/10 pt-5">
        <CheckboxRow
          id="reminder-email"
          label={email ? `Дублювати листом на ${email}` : "Дублювати листом"}
          checked={settings.emailEnabled}
          onChange={(emailEnabled) => onChange({ emailEnabled })}
        />

        <div className="flex flex-wrap items-end gap-3">
          <QuietField
            id="reminder-quiet-from"
            label="Тиша з"
            value={settings.quietFrom}
            disabled={pending || !settings.emailEnabled}
            onCommit={(quietFrom) => onChange({ quietFrom })}
          />

          <QuietField
            id="reminder-quiet-to"
            label="до"
            value={settings.quietTo}
            disabled={pending || !settings.emailEnabled}
            onCommit={(quietTo) => onChange({ quietTo })}
          />

          <p className="pb-2 text-xs text-muted-foreground">
            У ці години листи не надсилаються
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-foreground/10 pt-5">
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          {feed
            ? "Співбесіди з’являться у вашому календарі й оновлюватимуться самі."
            : "Можна додати співбесіди у ваш звичайний календар — тоді про них нагадає телефон."}
        </p>

        {feed ? (
          <Button
            size="sm"
            nativeButton={false}
            render={
              <a href={feed.replace(/^https?:/, "webcal:")}>
                <CalendarPlus />
                Додати в календар
              </a>
            }
          />
        ) : (
          <Button size="sm" disabled={pending} onClick={onSubscribe}>
            <CalendarPlus />
            Додати в календар
          </Button>
        )}
      </div>
    </section>
  );
}

function QuietField({
  id,
  label,
  value,
  disabled,
  onCommit,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <TextField
      id={id}
      label={label}
      type="time"
      wrapperClassName="w-30"
      className="h-9"
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft && draft !== value) onCommit(draft);
        else setDraft(value);
      }}
    />
  );
}
