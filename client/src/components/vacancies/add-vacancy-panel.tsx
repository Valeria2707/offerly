"use client";

import { Plus } from "lucide-react";
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
        Додати вакансію
      </Button>

      <Dialog open={isOpen && !pending} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Додати вакансію</DialogTitle>
            <DialogDescription>
              за посиланням або текстом — AI розбере деталі й вимоги автоматично
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="url">
            <TabsList className="h-10 w-full bg-secondary p-1">
              <TabsTrigger value="url" className="data-active:bg-card">
                За посиланням
              </TabsTrigger>
              <TabsTrigger value="text" className="data-active:bg-card">
                Вставити текст
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-5 grid gap-2">
              <FieldLabel htmlFor="vacancy-url">
                Посилання на вакансію
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
                Працює з більшістю job-бордів і кар’єрних сторінок компаній.
              </p>

              <DialogActions
                submitLabel="Розібрати"
                pending={pending}
                disabled={!url.trim()}
                onCancel={() => handleOpenChange(false)}
                onSubmit={() => onImport({ url })}
              />
            </TabsContent>

            <TabsContent value="text" className="mt-5 grid gap-2">
              <FieldLabel htmlFor="vacancy-text">Текст оголошення</FieldLabel>
              <Textarea
                id="vacancy-text"
                rows={8}
                value={text}
                placeholder="Скопіюйте опис вакансії з сайту — посаду, компанію, вимоги й умови…"
                className={cn(
                  "field-sizing-fixed max-h-56 resize-none overflow-y-auto py-2.5",
                  FIELD_CLASS,
                )}
                onChange={(event) => setText(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Щонайменше {MIN_TEXT_LENGTH} символів — зараз{" "}
                {text.trim().length}.
              </p>

              <DialogActions
                submitLabel="Розібрати"
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
