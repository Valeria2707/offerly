export function getErrorCode(error: unknown): string {
  return error instanceof Error ? error.constructor.name.slice(0, 50) : 'UnknownError';
}
