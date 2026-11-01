"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { FieldLabel } from "@/components/core/field-label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INSTRUCTIONS_MAX_LENGTH,
  PREPARATION_HIGHLIGHTS,
} from "@/constants/preparation";
import {
  PREPARATION_LANGUAGES,
  PREPARATION_TYPES,
  isPreparationType,
  type GeneratePreparationInput,
  type PreparationLanguage,
  type PreparationType,
} from "@/types/preparation";

type PreparationEmptyProps = {
  expectedType: PreparationType | null;
  defaultLanguage: PreparationLanguage;
  pending: boolean;
  onGenerate: (input: GeneratePreparationInput) => void;
};

export function PreparationEmpty({
  expectedType,
  defaultLanguage,
  pending,
  onGenerate,
}: PreparationEmptyProps) {
  const t = useTranslations("preparation");
  const [instructions, setInstructions] = useState("");
  const [chosenType, setChosenType] = useState<PreparationType>("CUSTOM");
  const [language, setLanguage] =
    useState<PreparationLanguage>(defaultLanguage);

  const type = expectedType ?? chosenType;
  const isPersonalStage = expectedType === null;
  const trimmed = instructions.trim();

  return (
    <div className="grid gap-5">
      <ul className="grid gap-2.5">
        {PREPARATION_HIGHLIGHTS[type].map((highlight) => (
          <li key={highlight} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-muted text-success"
            >
              <Check className="size-3" />
            </span>
            <span className="text-sm text-muted-foreground">
              <b className="font-semibold text-foreground">
                {t(`highlights.${highlight}.title`)}
              </b>{" "}
              {t(`highlights.${highlight}.detail`)}
            </span>
          </li>
        ))}
      </ul>

      <div className="h-px bg-border" />

      {isPersonalStage && (
        <div className="grid gap-2">
          <FieldLabel htmlFor="preparation-type">{t("format")}</FieldLabel>
          <Select
            value={chosenType}
            disabled={pending}
            onValueChange={(value) => {
              if (isPreparationType(value)) setChosenType(value);
            }}
          >
            <SelectTrigger id="preparation-type" className="w-64 rounded-lg">
              <SelectValue>
                {(value: PreparationType) => t(`types.${value}`)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PREPARATION_TYPES.map((item) => (
                <SelectItem key={item} value={item} className="text-xs">
                  {t(`types.${item}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-2">
        <FieldLabel>{t("language")}</FieldLabel>
        <div
          role="group"
          aria-label={t("language")}
          className="flex w-fit gap-1 rounded-lg bg-secondary p-1"
        >
          {PREPARATION_LANGUAGES.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={item === language ? "default" : "ghost"}
              aria-pressed={item === language}
              disabled={pending}
              onClick={() => setLanguage(item)}
            >
              {t(`languages.${item}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <FieldLabel htmlFor="preparation-instructions">
          {isPersonalStage
            ? t("instructionsRequired")
            : t("instructionsOptional")}
        </FieldLabel>
        <Textarea
          id="preparation-instructions"
          rows={3}
          value={instructions}
          maxLength={INSTRUCTIONS_MAX_LENGTH}
          placeholder={t("instructionsPlaceholder")}
          className="field-sizing-fixed max-h-48 resize-none overflow-y-auto rounded-lg px-3.5 py-2.5"
          onChange={(event) => setInstructions(event.target.value)}
        />
      </div>

      <Button
        className="justify-self-start"
        disabled={pending || (isPersonalStage && !trimmed)}
        onClick={() =>
          onGenerate({
            language,
            ...(isPersonalStage ? { type: chosenType } : {}),
            ...(trimmed ? { instructions: trimmed } : {}),
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {t(`cta.${type}`)}
      </Button>
    </div>
  );
}
