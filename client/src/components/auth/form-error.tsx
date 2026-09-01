import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { ApiError } from "@/lib/api-client";

export function FormError({ error }: { error: unknown }) {
  if (!error) return null;

  const message =
    error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;

  return (
    <p
      role="alert"
      className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
    >
      {message}
    </p>
  );
}
