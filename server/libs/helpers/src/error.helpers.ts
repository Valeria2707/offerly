export function getErrorCode(error: unknown, maxLength = 50): string {
  return error instanceof Error
    ? error.constructor.name.slice(0, maxLength)
    : 'UnknownError';
}

const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { driverError } = error as { driverError?: { code?: unknown } };
  return driverError?.code === PG_UNIQUE_VIOLATION;
}
