import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";

import type {
  CreatePurchaseEntryInput,
  PurchaseEntry,
} from "../types";

type PurchaseRow = {
  id: number;
  product: string;
  quantity: number;
  price: number;
  amount: number;
  purchased_at: string;
};

export async function fetchPurchaseEntries(): Promise<PurchaseEntry[]> {
  const db = getDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync<PurchaseRow>(
    "SELECT id, product, quantity, price, amount, purchased_at FROM purchase_entries ORDER BY purchased_at DESC, id DESC LIMIT 100",
  );

  return rows.map((row) =>
    mapCamelCase<PurchaseEntry>(row as unknown as Record<string, unknown>),
  );
}

export async function createPurchaseEntry(
  input: CreatePurchaseEntryInput,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.runAsync(
    `INSERT INTO purchase_entries (product, quantity, price, amount, purchased_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    input.product,
    input.quantity,
    input.price,
    input.amount,
  );
}

export async function deletePurchaseEntry(id: number): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync("DELETE FROM purchase_entries WHERE id = ?", id);
}

export async function fetchPurchaseSummary(): Promise<{
  totalAmount: number;
  totalQuantity: number;
  entryCount: number;
}> {
  const db = getDatabase();
  if (!db) {
    return { totalAmount: 0, totalQuantity: 0, entryCount: 0 };
  }

  const row = await db.getFirstAsync<{
    totalAmount: number;
    totalQuantity: number;
    entryCount: number;
  }>(
    "SELECT COALESCE(SUM(amount), 0) as totalAmount, COALESCE(SUM(quantity), 0) as totalQuantity, COUNT(*) as entryCount FROM purchase_entries",
  );

  return {
    totalAmount: row?.totalAmount ?? 0,
    totalQuantity: row?.totalQuantity ?? 0,
    entryCount: row?.entryCount ?? 0,
  };
}
