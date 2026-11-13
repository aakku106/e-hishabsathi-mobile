import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import { ENTITY_TYPE, enqueueRecord } from "@/database/edge";
import { applyStockDelta, findOrCreateProduct } from "@/database/products";
import { generateUuid } from "@/shared/utils/uuid";

import type {
  CreatePurchaseEntryInput,
  PurchaseEntry,
} from "../types";

type PurchaseRow = {
  id: number;
  product: string;
  product_id: number | null;
  quantity: number;
  price: number;
  amount: number;
  purchased_at: string;
};

export async function fetchPurchaseEntries(): Promise<PurchaseEntry[]> {
  const db = getDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync<PurchaseRow>(
    "SELECT id, product, product_id, quantity, price, amount, purchased_at FROM purchase_entries ORDER BY purchased_at DESC, id DESC LIMIT 100",
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

  const clientUuid = generateUuid();

  await db.withTransactionAsync(async () => {
    // A purchase is what puts stock on the shelf, so it always resolves to a
    // product row (creating one for a name that isn't in inventory yet).
    const productId =
      input.productId ??
      (await findOrCreateProduct(db, input.product, {
        price: input.price,
        costPrice: input.price,
      }));

    await db.runAsync(
      `INSERT INTO purchase_entries (product, product_id, quantity, price, amount, client_uuid, purchased_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      input.product,
      productId,
      input.quantity,
      input.price,
      input.amount,
      clientUuid,
    );

    await applyStockDelta(db, productId, input.quantity);

    // The latest purchase price becomes the cost price used for profit, and
    // doubles as the default selling price while the product has none.
    await db.runAsync(
      `UPDATE products
       SET cost_price = ?,
           price = CASE WHEN price <= 0 THEN ? ELSE price END,
           updated_at = datetime('now')
       WHERE id = ?`,
      input.price,
      input.price,
      productId,
    );

    await enqueueRecord({
      clientEntryId: clientUuid,
      entityType: ENTITY_TYPE.PURCHASE_BATCH,
      payloadJson: JSON.stringify({
        product: input.product,
        productId,
        quantity: input.quantity,
        price: input.price,
        amount: input.amount,
      }),
      entryDate: new Date().toISOString().slice(0, 10),
    });
  });
}

export async function deletePurchaseEntry(id: number): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{
      product_id: number | null;
      quantity: number;
    }>("SELECT product_id, quantity FROM purchase_entries WHERE id = ?", id);

    await db.runAsync("DELETE FROM purchase_entries WHERE id = ?", id);

    // Removing a purchase removes the stock it brought in.
    if (row?.product_id) {
      await applyStockDelta(db, row.product_id, -row.quantity);
    }
  });
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
