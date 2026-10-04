import type { PreparationType } from "@/types/preparation";

export const PREPARATION_TYPE_LABELS: Record<PreparationType, string> = {
  CV_COVER_LETTER: "CV і супровідний лист",
  HR_SCREENING: "Розмовна співбесіда",
  TECHNICAL: "Технічна співбесіда",
  CUSTOM: "Власний формат",
};

export const PREPARATION_CTA_LABELS: Record<PreparationType, string> = {
  CV_COVER_LETTER: "Згенерувати CV і супровідний лист",
  HR_SCREENING: "Згенерувати підготовку до розмови",
  TECHNICAL: "Згенерувати технічну підготовку",
  CUSTOM: "Згенерувати підготовку",
};

export const PREPARATION_HIGHLIGHTS: Record<
  PreparationType,
  { title: string; detail: string }[]
> = {
  CV_COVER_LETTER: [
    { title: "Поради до CV", detail: "що підтягнути саме під цю вакансію" },
    {
      title: "Чернетка супровідного листа",
      detail: "готовий текст, який лишиться відредагувати",
    },
    {
      title: "Ключові слова",
      detail: "формулювання з опису вакансії",
    },
  ],
  HR_SCREENING: [
    {
      title: "Розповідь про себе",
      detail: "коротка структура під цю роль",
    },
    {
      title: "Очікувані питання",
      detail: "з підказками й очікуваними відповідями",
    },
    {
      title: "Що запитати у відповідь",
      detail: "щоб розмова не була односторонньою",
    },
  ],
  TECHNICAL: [
    { title: "Стек під вакансію", detail: "що саме перевірятимуть" },
    {
      title: "Теоретичні питання",
      detail: "з підказками й очікуваними відповідями",
    },
    {
      title: "Практичні задачі",
      detail: "під рівень і технології вакансії",
    },
  ],
  CUSTOM: [
    { title: "Опис етапу", detail: "структурований за вашим контекстом" },
    {
      title: "Питання для підготовки",
      detail: "з підказками й очікуваними відповідями",
    },
  ],
};

export const CV_STAGE_CODE = "submitted";
export const TECHNICAL_SCREENING_CODES = ["pre_tech_screening"];
export const NO_PREPARATION_STAGE_CODES = ["rejection"];

export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const USER_ANSWER_MAX_LENGTH = 10_000;

export const PREPARATION_ERROR_MESSAGES: Record<number, string> = {
  400: "Опишіть, що очікується на цьому етапі.",
  409: "Підготовка для цього етапу вже існує.",
  422: "AI повернув некоректну відповідь. Спробуйте згенерувати ще раз.",
  503: "AI-підготовка зараз недоступна.",
};
