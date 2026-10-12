import { APP } from "@/config/app";

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyAmount(
  amount: number,
  symbol: string = APP.currency,
): string {
  return `${symbol} ${Number.isFinite(amount) ? amount.toLocaleString("en-IN") : "0"}`;
}

export function sumAmounts(values: number[]): number {
  return values.reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );
}
