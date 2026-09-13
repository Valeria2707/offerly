import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

function pluralizeDays(days: number) {
  const lastTwo = days % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "днів";

  const last = days % 10;
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дні";
  return "днів";
}

export function formatDaysAgo(isoDate: string) {
  const days = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 86_400_000,
  );

  return days <= 0 ? "сьогодні" : `${days} ${pluralizeDays(days)}`;
}
