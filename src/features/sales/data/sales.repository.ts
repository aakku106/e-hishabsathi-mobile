import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import { ENTITY_TYPE, enqueueRecord } from "@/database/edge";
import { generateUuid } from "@/shared/utils/uuid";

import { SALES_ENTRIES } from "./sales.mock";
import type {
  CreateSalesEntryInput,
  SalesEntry,
  SalesSummary,
} from "../types";

type SalesRow = {
  id: number;
  product: string;
  quantity: number;
  price: number;
  amount: number;
  customer: string | null;
  cost_price: number | null;
  extra_detail: string | null;
  extra_value: string | null;
  color: string | null;
  sold_at: string;
};

const FALLBACK_ENTRIES: SalesEntry[] = SALES_ENTRIES.map((entry, index) => ({
  id: index + 1,
  product: entry.product,
  quantity: entry.quantity,
  price: entry.quantity > 0 ? entry.amount / entry.quantity : 0,
  amount: entry.amount,
  customer: null,
  costPrice: null,
  extraDetail: null,
  extraValue: null,
  color: null,
  soldAt: new Date().toISOString(),
}));

export async function fetchSalesEntries(): Promise<SalesEntry[]> {
  const db = getDatabase();
  if (!db) return FALLBACK_ENTRIES;

  const rows = await db.getAllAsync<SalesRow>(
    "SELECT id, product, quantity, price, amount, customer, cost_price, extra_detail, extra_value, color, sold_at FROM sales_entries ORDER BY sold_at DESC, id DESC LIMIT 100",
  );

  return rows.map((row) =>
    mapCamelCase<SalesEntry>(row as unknown as Record<string, unknown>),
  );
}

export async function createSalesEntry(
  input: CreateSalesEntryInput,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const clientUuid = generateUuid();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO sales_entries (product, quantity, price, amount, customer, cost_price, extra_detail, extra_value, color, client_uuid, sold_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      input.product,
      input.quantity,
      input.price,
      input.amount,
      input.customer ?? null,
      input.costPrice ?? null,
      input.extraDetail ?? null,
      input.extraValue ?? null,
      input.color ?? null,
      clientUuid,
    );

    await enqueueRecord({
      clientEntryId: clientUuid,
      entityType: ENTITY_TYPE.BATCH_SALE_ITEM,
      payloadJson: JSON.stringify({
        product: input.product,
        quantity: input.quantity,
        price: input.price,
        amount: input.amount,
        customer: input.customer ?? null,
        costPrice: input.costPrice ?? null,
        extraDetail: input.extraDetail ?? null,
        extraValue: input.extraValue ?? null,
        color: input.color ?? null,
      }),
      entryDate: new Date().toISOString().slice(0, 10),
    });
  });
}

export async function deleteSalesEntry(id: number): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync("DELETE FROM sales_entries WHERE id = ?", id);
}

export async function fetchSalesSummary(): Promise<SalesSummary> {
  const db = getDatabase();
  if (!db) {
    return FALLBACK_ENTRIES.reduce(
      (summary, entry) => ({
        totalAmount: summary.totalAmount + entry.amount,
        totalQuantity: summary.totalQuantity + entry.quantity,
        entryCount: summary.entryCount + 1,
      }),
      { totalAmount: 0, totalQuantity: 0, entryCount: 0 },
    );
  }

  const row = await db.getFirstAsync<{
    totalAmount: number;
    totalQuantity: number;
    entryCount: number;
  }>(
    "SELECT COALESCE(SUM(amount), 0) as totalAmount, COALESCE(SUM(quantity), 0) as totalQuantity, COUNT(*) as entryCount FROM sales_entries",
  );

  return {
    totalAmount: row?.totalAmount ?? 0,
    totalQuantity: row?.totalQuantity ?? 0,
    entryCount: row?.entryCount ?? 0,
  };
}
