/** Дані лендінгу; тексти лежать у `messages/*.json` → `landing`. */

import { sectionHref } from "@/constants/routes";

export const NAV_LINKS = [
  { href: sectionHref("features"), key: "features" },
  { href: sectionHref("howItWorks"), key: "howItWorks" },
] as const;

export const HERO_STATS = [
  { value: "18", key: "vacancies" },
  { value: "7", key: "interviews" },
  { value: "1", key: "offers" },
] as const;

export const APPLICATION_STAGES = [
  "submitted",
  "hr",
  "technical",
  "final",
  "offer",
] as const;

export const CURRENT_STAGE_INDEX = 2;

export const HOW_IT_WORKS_STEPS = ["link", "plan", "notes"] as const;

export const FEATURES = [
  { key: "funnel", accent: "bg-primary" },
  { key: "memory", accent: "bg-ai" },
  { key: "reminders", accent: "bg-terracotta" },
] as const;
