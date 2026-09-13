export function getErrorCode(error: unknown, maxLength = 50): string {
  return error instanceof Error
    ? error.constructor.name.slice(0, maxLength)
    : "UnknownError";
}
