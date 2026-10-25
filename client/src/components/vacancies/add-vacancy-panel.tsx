"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DialogActions } from "@/components/core/dialog-actions";
import { FieldLabel } from "@/components/core/field-label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";

const MIN_TEXT_LENGTH = 100;

export type VacancyImportInput = { url: string } | { text: string };

type AddVacancyPanelProps = {
  pending: boolean;
  onImport: (input: VacancyImportInput) => void;
};

export function AddVacancyPanel({ pending, onImport }: AddVacancyPanelProps) {
  const t = useTranslations("vacancies.add");
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const handleOpenChange = (open: boolean) => {
    if (pending) return;

    setIsOpen(open);

    if (!open) {
      setUrl("");
      setText("");
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={pending}>
        <Plus />
        {t("title")}
      </Button>

      <Dialog open={isOpen && !pending} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description")}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="url">
            <TabsList className="h-10 w-full bg-secondary p-1">
              <TabsTrigger value="url" className="data-active:bg-card">
                {t("byUrl")}
              </TabsTrigger>
              <TabsTrigger value="text" className="data-active:bg-card">
                {t("byText")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-5 grid gap-2">
              <FieldLabel htmlFor="vacancy-url">
                {t("urlLabel")}
              </FieldLabel>
              <Input
                id="vacancy-url"
                type="url"
                value={url}
                placeholder="https://jobs.example.io/careers/…"
                className={cn("h-11", FIELD_CLASS)}
                onChange={(event) => setUrl(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("urlHint")}
              </p>

              <DialogActions
                submitLabel={t("parse")}
                pending={pending}
                disabled={!url.trim()}
                onCancel={() => handleOpenChange(false)}
                onSubmit={() => onImport({ url })}
              />
            </TabsContent>

            <TabsContent value="text" className="mt-5 grid gap-2">
              <FieldLabel htmlFor="vacancy-text">{t("textLabel")}</FieldLabel>
              <Textarea
                id="vacancy-text"
                rows={8}
                value={text}
                placeholder={t("textPlaceholder")}
                className={cn(
                  "field-sizing-fixed max-h-56 resize-none overflow-y-auto py-2.5",
                  FIELD_CLASS,
                )}
                onChange={(event) => setText(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("textMin", {
                  min: MIN_TEXT_LENGTH,
                  current: text.trim().length,
                })}
              </p>

              <DialogActions
                submitLabel={t("parse")}
                pending={pending}
                disabled={text.trim().length < MIN_TEXT_LENGTH}
                onCancel={() => handleOpenChange(false)}
                onSubmit={() => onImport({ text })}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
