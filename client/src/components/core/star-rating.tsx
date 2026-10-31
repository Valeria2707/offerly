"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const STARS = [1, 2, 3, 4, 5];

export function StarRating({
  value,
  label,
  disabled,
  onChange,
}: {
  value: number | null;
  label: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-0.5">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${label}: ${star}`}
          disabled={disabled}
          className="rounded p-0.5 text-subtle transition-colors hover:text-warning disabled:pointer-events-none"
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              "size-4",
              value !== null && star <= value && "fill-warning text-warning",
            )}
          />
        </button>
      ))}
    </div>
  );
}
