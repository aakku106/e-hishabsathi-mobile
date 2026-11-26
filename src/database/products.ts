import type { SQLiteDatabase } from "expo-sqlite";

export const PRODUCT_STOCK_VALUE_EXPRESSION =
  "COALESCE(cost_price, 0) * stock_quantity";

export type ProductHint = {
  /** Selling price to use if the product has to be created. */
  price?: number | null;
  /** Cost price to use if the product has to be created. */
  costPrice?: number | null;
  /** Initial stock to use if the product has to be created. */
  stockQuantity?: number | null;
};

/**
 * Returns the id of an existing product with this name (case-insensitive), or
 * `null` when the name is not in inventory.
 */
export async function findProductIdByName(
  db: SQLiteDatabase,
  name: string,
): Promise<number | null> {
  const row = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM products WHERE name = ? COLLATE NOCASE LIMIT 1",
    name.trim(),
  );
  return row?.id ?? null;
}

/**
 * Returns the id of the product with this name (case-insensitive), creating the
 * product when it doesn't exist yet.
 *
 * Sales and purchases both call this so every entry is linked to the inventory
 * row whose stock it moves, even when the merchant typed a brand-new name.
 */
export async function findOrCreateProduct(
  db: SQLiteDatabase,
  name: string,
  hint: ProductHint = {},
): Promise<number> {
  const trimmed = name.trim();

  const existingId = await findProductIdByName(db, trimmed);
  if (existingId !== null) return existingId;

  const result = await db.runAsync(
    `INSERT INTO products (name, category, price, cost_price, stock_quantity, created_at, updated_at)
     VALUES (?, NULL, ?, ?, ?, datetime('now'), datetime('now'))`,
    trimmed,
    hint.price ?? hint.costPrice ?? 0,
    hint.costPrice ?? null,
    hint.stockQuantity ?? 0,
  );

  return result.lastInsertRowId;
}

/**
 * Moves stock by `delta` (positive for purchases, negative for sales).
 *
 * Negative stock is allowed on purpose. Deleting a purchase whose units were
 * already sold must leave the product at `stock_quantity - sold`, otherwise
 * the inventory silently stops matching the sales/purchase entries and the
 * drift is hidden. The inventory UI shows the negative figure.
 */
export async function applyStockDelta(
  db: SQLiteDatabase,
  productId: number,
  delta: number,
): Promise<void> {
  if (!delta) return;

  await db.runAsync(
    "UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = datetime('now') WHERE id = ?",
    delta,
    productId,
  );
}
