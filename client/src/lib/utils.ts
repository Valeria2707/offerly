import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Locale } from "@/constants/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string | undefined) {
  if (!name) return "";

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDaysAgo(isoDate: string, locale: Locale) {
  const days = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 86_400_000,
  );

  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    days > 0 ? -days : 0,
    "day",
  );
}
