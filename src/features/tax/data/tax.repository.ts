import dayjs from "dayjs";

import { getDatabase } from "@/database/sqlite";

import { VAT_RATE, type TaxSummary } from "../types";

export function taxMonthOptions(count = 12): { label: string; value: string }[] {
  const options: { label: string; value: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, "month");
    options.push({
      label: date.format("MMM YYYY"),
      value: date.format("YYYY-MM"),
    });
  }
  return options;
}

export async function fetchTaxSummary(month: string): Promise<TaxSummary> {
  const db = getDatabase();
  const monthStart = `${month}-01T00:00:00`;
  const monthEnd = dayjs(`${month}-01`).add(1, "month").format("YYYY-MM-01T00:00:00");

  if (!db) {
    return {
      month,
      taxableSales: 0,
      saleCount: 0,
      inputPurchases: 0,
      purchaseCount: 0,
      outputVat: 0,
      inputVat: 0,
      netVatPayable: 0,
    };
  }

  const sales = await db.getFirstAsync<{
    amount: number;
    count: number;
  }>(
    "SELECT COALESCE(SUM(amount), 0) as amount, COUNT(*) as count FROM sales_entries WHERE sold_at >= ? AND sold_at < ?",
    monthStart,
    monthEnd,
  );

  const purchases = await db.getFirstAsync<{
    amount: number;
    count: number;
  }>(
    "SELECT COALESCE(SUM(amount), 0) as amount, COUNT(*) as count FROM purchase_entries WHERE purchased_at >= ? AND purchased_at < ?",
    monthStart,
    monthEnd,
  );

  const taxableSales = sales?.amount ?? 0;
  const inputPurchases = purchases?.amount ?? 0;
  const outputVat = taxableSales * VAT_RATE;
  const inputVat = inputPurchases * VAT_RATE;

  return {
    month,
    taxableSales,
    saleCount: sales?.count ?? 0,
    inputPurchases,
    purchaseCount: purchases?.count ?? 0,
    outputVat,
    inputVat,
    netVatPayable: outputVat - inputVat,
  };
}
