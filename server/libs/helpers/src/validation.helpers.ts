export interface ValidationIssue {
  property: string;
  constraints?: Record<string, string>;
  children?: ValidationIssue[];
}

export function getValidationPaths(
  errors: ValidationIssue[],
  parent = "",
): string[] {
  return errors.flatMap((error) => {
    const current = parent ? `${parent}.${error.property}` : error.property;
    return [
      ...(error.constraints ? [current] : []),
      ...getValidationPaths(error.children ?? [], current),
    ];
  });
}
