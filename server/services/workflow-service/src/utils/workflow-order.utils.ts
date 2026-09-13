export function isCompleteStageOrder(
  existingIds: string[],
  groups: string[][]
): boolean {
  const requested = groups.flat();
  return (
    requested.length === existingIds.length &&
    new Set(requested).size === requested.length &&
    existingIds.every((id) => requested.includes(id))
  );
}
