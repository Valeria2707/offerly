import type { PreparationData, QuestionAnswerItem } from "@/types/preparation";

export type PreparationCard =
  | { kind: "question"; caption: string; item: QuestionAnswerItem }
  | { kind: "text"; caption: string; title: string; body: string }
  | { kind: "terms"; caption: string; title: string; terms: string[] }
  | { kind: "list"; caption: string; title: string; items: string[] }
  | {
      kind: "task";
      caption: string;
      title: string;
      body: string;
      hint: string;
    };

const questionCards = (
  caption: string,
  items: QuestionAnswerItem[],
): PreparationCard[] =>
  items.map((item) => ({ kind: "question", caption, item }));

export function preparationCards(data: PreparationData): PreparationCard[] {
  switch (data.type) {
    case "CV_COVER_LETTER":
      return [
        {
          kind: "list",
          caption: "матеріали",
          title: "Що підтягнути в CV",
          items: data.content.cvTips,
        },
        {
          kind: "text",
          caption: "матеріали",
          title: "Чернетка супровідного листа",
          body: data.content.coverLetterDraft,
        },
        {
          kind: "terms",
          caption: "матеріали",
          title: "Ключові слова під вакансію",
          terms: data.content.tailoredKeywords,
        },
      ];

    case "HR_SCREENING":
      return [
        {
          kind: "text",
          caption: "матеріали",
          title: "Розповідь про себе",
          body: data.content.elevatorPitch,
        },
        ...questionCards("очікуване питання", data.content.commonQuestions),
        {
          kind: "list",
          caption: "матеріали",
          title: "Що запитати в рекрутера",
          items: data.content.questionsToAskInterviewer,
        },
      ];

    case "TECHNICAL":
      return [
        {
          kind: "terms",
          caption: "матеріали",
          title: "Стек під вакансію",
          terms: data.content.targetStack,
        },
        ...questionCards(
          "теоретичне питання",
          data.content.theoreticalQuestions,
        ),
        ...data.content.codingTasks.map((task, index): PreparationCard => ({
          kind: "task",
          caption: "практична задача",
          title: `Задача ${index + 1}`,
          body: task.task,
          hint: task.hint,
        })),
      ];

    case "CUSTOM":
      return [
        {
          kind: "text",
          caption: "матеріали",
          title: "Що очікується на етапі",
          body: data.content.instructions,
        },
        ...questionCards("питання", data.content.items),
      ];
  }
}

export function preparationStats(cards: PreparationCard[]): {
  answered: number;
  total: number;
} {
  const questions = cards.filter((card) => card.kind === "question");

  return {
    answered: questions.filter((card) => card.item.userAnswer?.trim()).length,
    total: questions.length,
  };
}
