export function sum(values: number[]): number {
  return values.reduce(
    (total, value) => total + (Number.isFinite(value) ? value : 0),
    0,
  );
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

export function percentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

export function changePercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export function profit(saleAmount: number, costAmount: number): number {
  return (
    (Number.isFinite(saleAmount) ? saleAmount : 0) -
    (Number.isFinite(costAmount) ? costAmount : 0)
  );
}

export function grossProfit(
  entries: { amount: number; costPrice: number | null }[],
): number {
  return sum(
    entries.map((entry) =>
      entry.costPrice === null || entry.costPrice === undefined ?
        entry.amount * 0.6
      : entry.amount - entry.costPrice,
    ),
  );
}
