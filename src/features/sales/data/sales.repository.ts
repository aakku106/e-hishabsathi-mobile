import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import {
  ENTITY_TYPE,
  createLedgerEntry,
  enqueueRecord,
  findOrCreateCustomer,
} from "@/database/edge";
import { applyStockDelta, findOrCreateProduct } from "@/database/products";
import { generateUuid } from "@/shared/utils/uuid";

import { SALES_ENTRIES } from "./sales.mock";
import type {
  CreateSalesBatchInput,
  CreateSalesEntryInput,
  SalesEntry,
  SalesSummary,
} from "../types";

type SalesRow = {
  id: number;
  product: string;
  product_id: number | null;
  quantity: number;
  price: number;
  amount: number;
  customer: string | null;
  cost_price: number | null;
  extra_detail: string | null;
  extra_value: string | null;
  color: string | null;
  client_batch_id: string | null;
  sold_at: string;
};

const FALLBACK_ENTRIES: SalesEntry[] = SALES_ENTRIES.map((entry, index) => ({
  id: index + 1,
  product: entry.product,
  productId: null,
  quantity: entry.quantity,
  price: entry.quantity > 0 ? entry.amount / entry.quantity : 0,
  amount: entry.amount,
  customer: null,
  costPrice: null,
  extraDetail: null,
  extraValue: null,
  color: null,
  clientBatchId: null,
  soldAt: new Date().toISOString(),
}));

export async function fetchSalesEntries(): Promise<SalesEntry[]> {
  const db = getDatabase();
  if (!db) return FALLBACK_ENTRIES;

  const rows = await db.getAllAsync<SalesRow>(
    "SELECT id, product, product_id, quantity, price, amount, customer, cost_price, extra_detail, extra_value, color, client_batch_id, sold_at FROM sales_entries ORDER BY sold_at DESC, id DESC LIMIT 100",
  );

  return rows.map((row) =>
    mapCamelCase<SalesEntry>(row as unknown as Record<string, unknown>),
  );
}

/**
 * Records one or more sale lines as a single checkout.
 *
 * Every line is linked to an inventory product and decrements its stock. When
 * `paymentType` is `udharo`, the checkout also creates one receivable for the
 * customer (and the matching ledger credit) for the batch total, so a credit
 * sale moves inventory and udharo together.
 */
export async function createSalesBatch(
  input: CreateSalesBatchInput,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");
  if (input.items.length === 0) return;

  const customerName = input.customer?.trim() || null;
  if (input.paymentType === "udharo" && !customerName) {
    throw new Error("Customer name is required for an udharo sale");
  }

  const batchId = generateUuid();
  const entryDate = new Date().toISOString().slice(0, 10);

  await db.withTransactionAsync(async () => {
    let batchTotal = 0;

    for (const item of input.items) {
      // Resolve the inventory row first so the sale can move its stock and
      // inherit the cost price that profit is calculated from.
      const productId =
        item.productId ??
        (await findOrCreateProduct(db, item.product, { price: item.price }));

      const product = await db.getFirstAsync<{ cost_price: number | null }>(
        "SELECT cost_price FROM products WHERE id = ?",
        productId,
      );
      const costPrice = item.costPrice ?? product?.cost_price ?? null;
      const clientUuid = generateUuid();

      await db.runAsync(
        `INSERT INTO sales_entries (product, product_id, quantity, price, amount, customer, cost_price, extra_detail, extra_value, color, client_uuid, client_batch_id, sold_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        item.product,
        productId,
        item.quantity,
        item.price,
        item.amount,
        customerName,
        costPrice,
        item.extraDetail ?? null,
        item.extraValue ?? null,
        item.color ?? null,
        clientUuid,
        batchId,
      );

      await applyStockDelta(db, productId, -item.quantity);

      await enqueueRecord({
        clientEntryId: clientUuid,
        entityType: ENTITY_TYPE.BATCH_SALE_ITEM,
        payloadJson: JSON.stringify({
          product: item.product,
          productId,
          quantity: item.quantity,
          price: item.price,
          amount: item.amount,
          customer: customerName,
          costPrice,
          extraDetail: item.extraDetail ?? null,
          extraValue: item.extraValue ?? null,
          color: item.color ?? null,
          clientBatchId: batchId,
        }),
        entryDate,
      });

      batchTotal += item.amount;
    }

    if (input.paymentType === "udharo" && customerName) {
      const customerId = await findOrCreateCustomer({ fullName: customerName });

      const receivable = await db.runAsync(
        `INSERT INTO udharo_entries (name, amount, due_date, status, customer_id, client_batch_id, created_at)
         VALUES (?, ?, ?, 'on_track', ?, ?, datetime('now'))`,
        customerName,
        batchTotal,
        input.dueDate ?? null,
        customerId,
        batchId,
      );

      await createLedgerEntry({
        customerId,
        transactionType: "CREDIT_GIVEN",
        amount: batchTotal,
        transactionDate: entryDate,
        udharoEntryId: receivable.lastInsertRowId,
      });
    }
  });
}

export async function createSalesEntry(
  input: CreateSalesEntryInput,
): Promise<void> {
  await createSalesBatch({ items: [input] });
}

export async function deleteSalesEntry(id: number): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{
      product_id: number | null;
      quantity: number;
    }>("SELECT product_id, quantity FROM sales_entries WHERE id = ?", id);

    await db.runAsync("DELETE FROM sales_entries WHERE id = ?", id);

    // Removing a sale puts the goods back on the shelf.
    if (row?.product_id) {
      await applyStockDelta(db, row.product_id, row.quantity);
    }
  });
}

export async function fetchSalesSummary(): Promise<SalesSummary> {
  const db = getDatabase();
  if (!db) {
    return { totalAmount: 0, totalQuantity: 0, entryCount: 0 };
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
