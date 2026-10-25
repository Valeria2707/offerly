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
  PREPARATION_TYPES,
  type GeneratePreparationInput,
  type PreparationType,
} from "@/types/preparation";

type PreparationEmptyProps = {
  // null — власний тип етапу: формат обирає користувач,
  // а бекенд вимагає опис того, що очікується.
  expectedType: PreparationType | null;
  pending: boolean;
  onGenerate: (input: GeneratePreparationInput) => void;
};

export function PreparationEmpty({
  expectedType,
  pending,
  onGenerate,
}: PreparationEmptyProps) {
  const t = useTranslations("preparation");
  const [instructions, setInstructions] = useState("");
  const [chosenType, setChosenType] = useState<PreparationType>("CUSTOM");

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
            onValueChange={(value) => setChosenType(value as PreparationType)}
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
