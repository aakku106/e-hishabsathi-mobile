export function mapCamelCase<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
): T {
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) =>
      c.toUpperCase(),
    );
    mapped[camelKey] = value;
  }
  return mapped as T;
}

export function mapRowsToCamelCase<T extends Record<string, unknown>>(
  rows: Record<string, unknown>[],
): T[] {
  return rows.map((row) => mapCamelCase<T>(row));
}
