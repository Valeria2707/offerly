"use client";

import { useErrorMessage } from "@/hooks/use-error-message";

export function FormError({ error }: { error: unknown }) {
  const errorMessage = useErrorMessage();

  if (!error) return null;

  return (
    <p
      role="alert"
      className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
    >
      {errorMessage(error)}
    </p>
  );
}
