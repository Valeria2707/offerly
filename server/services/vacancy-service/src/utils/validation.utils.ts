import { ValidationError } from 'class-validator';
export function getValidationPaths(
  errors: ValidationError[],
  parent = ''
): string[] {
  return errors.flatMap((error) => {
    const current = parent ? `${parent}.${error.property}` : error.property;
    return [
      ...(error.constraints ? [current] : []),
      ...getValidationPaths(error.children ?? [], current)
    ];
  });
}
