"use client";

import { ExternalLink, Mail, Pencil, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DialogActions } from "@/components/core/dialog-actions";
import { IconButton } from "@/components/core/icon-button";
import { TextField } from "@/components/core/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { urlHost } from "@/lib/utils";
import type { RecruiterContact, Vacancy } from "@/types/vacancy";

const FIELDS = [
  { key: "recruiterName", type: "text", autoComplete: "name" },
  { key: "recruiterEmail", type: "email", autoComplete: "email" },
  { key: "recruiterPhone", type: "tel", autoComplete: "tel" },
  { key: "recruiterUrl", type: "url", autoComplete: "url" },
] as const;

const toDraft = (vacancy: Vacancy): Record<keyof RecruiterContact, string> => ({
  recruiterName: vacancy.recruiterName ?? "",
  recruiterEmail: vacancy.recruiterEmail ?? "",
  recruiterPhone: vacancy.recruiterPhone ?? "",
  recruiterUrl: vacancy.recruiterUrl ?? "",
});

const toContact = (
  draft: Record<keyof RecruiterContact, string>,
): RecruiterContact => ({
  recruiterName: draft.recruiterName.trim() || null,
  recruiterEmail: draft.recruiterEmail.trim() || null,
  recruiterPhone: draft.recruiterPhone.trim() || null,
  recruiterUrl: draft.recruiterUrl.trim() || null,
});

export function RecruiterCard({
  vacancy,
  pending,
  onSave,
}: {
  vacancy: Vacancy;
  pending: boolean;
  onSave: (contact: RecruiterContact) => void;
}) {
  const t = useTranslations("vacancies.recruiter");
  const [draft, setDraft] = useState<Record<
    keyof RecruiterContact,
    string
  > | null>(null);

  const hasContact = FIELDS.some(({ key }) => vacancy[key]);

  return (
    <section className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <header className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold tracking-tight">
          {t("title")}
        </h2>
        {hasContact && (
          <IconButton
            label={t("edit")}
            disabled={pending}
            onClick={() => setDraft(toDraft(vacancy))}
          >
            <Pencil className="size-4" />
          </IconButton>
        )}
      </header>

      {hasContact ? (
        <ul className="grid gap-2.5 text-sm">
          {vacancy.recruiterName && (
            <li className="flex items-center gap-2.5">
              <User aria-hidden className="size-4 shrink-0 text-subtle" />
              {vacancy.recruiterName}
            </li>
          )}
          {vacancy.recruiterEmail && (
            <li className="flex min-w-0 items-center gap-2.5">
              <Mail aria-hidden className="size-4 shrink-0 text-subtle" />
              <a
                href={`mailto:${vacancy.recruiterEmail}`}
                className="truncate text-primary hover:underline"
              >
                {vacancy.recruiterEmail}
              </a>
            </li>
          )}
          {vacancy.recruiterPhone && (
            <li className="flex items-center gap-2.5">
              <Phone aria-hidden className="size-4 shrink-0 text-subtle" />
              <a
                href={`tel:${vacancy.recruiterPhone}`}
                className="text-primary hover:underline"
              >
                {vacancy.recruiterPhone}
              </a>
            </li>
          )}
          {vacancy.recruiterUrl && (
            <li className="flex min-w-0 items-center gap-2.5">
              <ExternalLink
                aria-hidden
                className="size-4 shrink-0 text-subtle"
              />
              <a
                href={vacancy.recruiterUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-primary hover:underline"
              >
                {urlHost(vacancy.recruiterUrl)}
              </a>
            </li>
          )}
        </ul>
      ) : (
        <div className="grid justify-items-start gap-3">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => setDraft(toDraft(vacancy))}
          >
            {t("add")}
          </Button>
        </div>
      )}

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => !open && setDraft(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="grid gap-3">
              {FIELDS.map((field) => (
                <TextField
                  key={field.key}
                  id={field.key}
                  label={t(`fields.${field.key}`)}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={t(`placeholders.${field.key}`)}
                  value={draft[field.key]}
                  onChange={(event) =>
                    setDraft({ ...draft, [field.key]: event.target.value })
                  }
                />
              ))}
            </div>
          )}

          <DialogActions
            submitLabel={t("save")}
            pending={pending}
            disabled={false}
            onCancel={() => setDraft(null)}
            onSubmit={() => {
              if (draft) onSave(toContact(draft));
              setDraft(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
