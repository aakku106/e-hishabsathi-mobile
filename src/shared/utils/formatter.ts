import { APP } from "@/config/app";

export function formatCurrency(
  amount: number,
  options: { symbol?: string; decimals?: number } = {},
): string {
  const { symbol = APP.currency, decimals = 0 } = options;
  const value = Number.isFinite(amount) ? amount : 0;
  return `${symbol}${value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("en-IN");
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${Number.isFinite(value) ? value : 0}%`;
}
