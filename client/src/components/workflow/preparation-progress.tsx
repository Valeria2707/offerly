import type { PreparationCard } from "@/lib/preparation-cards";
import { cn } from "@/lib/utils";

export function PreparationProgress({
  cards,
  index,
}: {
  cards: PreparationCard[];
  index: number;
}) {
  return (
    <ol aria-hidden className="flex flex-wrap gap-1">
      {cards.map((card, position) => (
        <li
          key={position}
          className={cn(
            "h-1 w-5 rounded-full",
            position === index
              ? "bg-terracotta"
              : card.kind === "question" && card.item.userAnswer?.trim()
                ? "bg-primary"
                : "bg-secondary",
          )}
        />
      ))}
    </ol>
  );
}
