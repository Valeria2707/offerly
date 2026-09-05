import { ValidationError } from 'class-validator';

export function getValidationPaths(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const current = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints ? [current] : [];
    return [...own, ...getValidationPaths(error.children ?? [], current)];
  });
}
