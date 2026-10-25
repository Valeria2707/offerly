import { enUS, uk } from "date-fns/locale";

import type { Locale } from "@/constants/i18n";

export function dateFnsLocale(locale: Locale) {
  return locale === "en" ? enUS : uk;
}
