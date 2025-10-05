export const isNotNull = <T,>(item: T | null): item is T => item !== null

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
