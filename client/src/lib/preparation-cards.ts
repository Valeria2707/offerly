import type { Translator } from "@/lib/i18n";
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

export function preparationCards(
  data: PreparationData,
  t: Translator,
): PreparationCard[] {
  const materials = t("preparation.cards.materials");

  switch (data.type) {
    case "CV_COVER_LETTER":
      return [
        {
          kind: "list",
          caption: materials,
          title: t("preparation.cards.cvTips"),
          items: data.content.cvTips,
        },
        {
          kind: "text",
          caption: materials,
          title: t("preparation.cards.coverLetter"),
          body: data.content.coverLetterDraft,
        },
        {
          kind: "terms",
          caption: materials,
          title: t("preparation.cards.keywords"),
          terms: data.content.tailoredKeywords,
        },
      ];

    case "HR_SCREENING":
      return [
        {
          kind: "text",
          caption: materials,
          title: t("preparation.cards.pitch"),
          body: data.content.elevatorPitch,
        },
        ...questionCards(
          t("preparation.cards.expectedQuestion"),
          data.content.commonQuestions,
        ),
        {
          kind: "list",
          caption: materials,
          title: t("preparation.cards.askRecruiter"),
          items: data.content.questionsToAskInterviewer,
        },
      ];

    case "TECHNICAL":
      return [
        {
          kind: "terms",
          caption: materials,
          title: t("preparation.cards.stack"),
          terms: data.content.targetStack,
        },
        ...questionCards(
          t("preparation.cards.theoryQuestion"),
          data.content.theoreticalQuestions,
        ),
        ...data.content.codingTasks.map((task, index): PreparationCard => ({
          kind: "task",
          caption: t("preparation.cards.practiceTask"),
          title: t("preparation.cards.task", { index: index + 1 }),
          body: task.task,
          hint: task.hint,
        })),
      ];

    case "CUSTOM":
      return [
        {
          kind: "text",
          caption: materials,
          title: t("preparation.cards.expected"),
          body: data.content.instructions,
        },
        ...questionCards(t("preparation.cards.question"), data.content.items),
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
