"use client";

import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("calendar.settings");
  const feed = settings.calendarToken
    ? CALENDAR_ROUTES.subscriptionFeed(settings.calendarToken)
    : null;

  return (
    <section className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <h2 className="font-heading text-base font-bold">{t("title")}</h2>

      <div className="grid gap-3">
        <CheckboxRow
          id="reminder-before-interview"
          label={t("beforeInterview")}
          checked={settings.beforeInterview}
          onChange={(beforeInterview) => onChange({ beforeInterview })}
        />
        <CheckboxRow
          id="reminder-after-stage"
          label={t("afterStage")}
          checked={settings.afterStage}
          onChange={(afterStage) => onChange({ afterStage })}
        />
        <CheckboxRow
          id="reminder-before-deadline"
          label={t("beforeDeadline")}
          checked={settings.beforeDeadline}
          onChange={(beforeDeadline) => onChange({ beforeDeadline })}
        />
        <CheckboxRow
          id="reminder-silence"
          label={t("silence")}
          checked={settings.silence}
          onChange={(silence) => onChange({ silence })}
        />
        <CheckboxRow
          id="reminder-weekly-digest"
          label={t("weeklyDigest")}
          checked={settings.weeklyDigest}
          onChange={(weeklyDigest) => onChange({ weeklyDigest })}
        />
      </div>

      <div className="grid gap-4 border-t border-foreground/10 pt-5">
        <CheckboxRow
          id="reminder-email"
          label={email ? t("emailTo", { email }) : t("email")}
          checked={settings.emailEnabled}
          onChange={(emailEnabled) => onChange({ emailEnabled })}
        />

        <div className="flex flex-wrap items-end gap-3">
          <QuietField
            id="reminder-quiet-from"
            label={t("quietFrom")}
            value={settings.quietFrom}
            disabled={pending || !settings.emailEnabled}
            onCommit={(quietFrom) => onChange({ quietFrom })}
          />

          <QuietField
            id="reminder-quiet-to"
            label={t("quietTo")}
            value={settings.quietTo}
            disabled={pending || !settings.emailEnabled}
            onCommit={(quietTo) => onChange({ quietTo })}
          />

          <p className="pb-2 text-xs text-muted-foreground">
            {t("quietHint")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-foreground/10 pt-5">
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          {feed
            ? t("feedReady")
            : t("feedHint")}
        </p>

        {feed ? (
          <Button
            size="sm"
            nativeButton={false}
            render={
              <a href={feed.replace(/^https?:/, "webcal:")}>
                <CalendarPlus />
                {t("addToCalendar")}
              </a>
            }
          />
        ) : (
          <Button size="sm" disabled={pending} onClick={onSubscribe}>
            <CalendarPlus />
            {t("addToCalendar")}
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
