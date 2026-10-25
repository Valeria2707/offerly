"use client";

import { useTranslations } from "next-intl";

import { SYSTEM_STAGE_KEYS } from "@/constants/workflow";
import { isSystemStageName, type StageNameFormatter } from "@/lib/workflow";

export function useStageName(): StageNameFormatter {
  const t = useTranslations("workflow.systemStages");

  return (name) =>
    isSystemStageName(name) ? t(SYSTEM_STAGE_KEYS[name]) : name;
}
