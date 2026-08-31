/** Контент і дані лендінгу. Компоненти лише рендерять їх. */

import { sectionHref } from "@/constants/routes";

export const NAV_LINKS = [
  { href: sectionHref("features"), label: "Можливості" },
  { href: sectionHref("howItWorks"), label: "Як це працює" },
] as const;

export const HERO_STATS = [
  { value: "18", label: "вакансій під контролем" },
  { value: "7", label: "співбесід" },
  { value: "1", label: "оффер" },
] as const;

export const APPLICATION_STAGES = [
  "Подано",
  "HR",
  "Технічна",
  "Фінальна",
  "Оффер",
] as const;

export const CURRENT_STAGE_INDEX = 2;

export const AI_NOTE =
  "До технічної 2 дні. Нагадаю завтра й покажу, що варто повторити.";

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Вставте посилання на вакансію",
    description:
      "AI зчитує вимоги, стек і рівень — далі ви просто ведете цю вакансію етапами.",
  },
  {
    title: "Готуйтеся за планом під конкретний етап",
    description:
      "Перед HR, технічною чи фінальною — окремий набір питань і тем, а не загальний чекліст.",
  },
  {
    title: "Занотуйте, як минуло",
    description:
      "Кілька рядків одразу після дзвінка: що питали, де просіли. З цього збирається наступна підготовка.",
  },
] as const;

export const FEATURES = [
  {
    accent: "bg-primary",
    title: "Уся воронка на одному екрані",
    description:
      "Скільки вакансій у роботі, де ви зараз по кожній і де мовчать другий тиждень.",
  },
  {
    accent: "bg-ai",
    title: "Пам’ять між співбесідами",
    description:
      "AI зіставляє питання й відмови з різних компаній і показує, яка слабкість повторюється.",
  },
  {
    accent: "bg-terracotta",
    title: "Нагадування, що не забувають",
    description:
      "Follow-up після тиші, нотатка по гарячих слідах протягом 3 годин, дедлайни офферів.",
  },
] as const;
