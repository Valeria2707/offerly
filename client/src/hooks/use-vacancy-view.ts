"use client";

import { useSyncExternalStore } from "react";

import {
  VACANCY_VIEW_STORAGE_KEY,
  VACANCY_VIEWS,
  type VacancyView,
} from "@/constants/board";

const listeners = new Set<() => void>();

function readView(): VacancyView {
  try {
    const stored = localStorage.getItem(VACANCY_VIEW_STORAGE_KEY);
    return VACANCY_VIEWS.find((view) => view === stored) ?? "list";
  } catch {
    return "list";
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useVacancyView() {
  const view = useSyncExternalStore<VacancyView>(
    subscribe,
    readView,
    () => "list",
  );

  const setView = (next: VacancyView) => {
    try {
      localStorage.setItem(VACANCY_VIEW_STORAGE_KEY, next);
    } catch {}
    listeners.forEach((listener) => listener());
  };

  return [view, setView] as const;
}
