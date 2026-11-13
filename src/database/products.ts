import type { SQLiteDatabase } from "expo-sqlite";

export type ProductHint = {
  /** Selling price to use if the product has to be created. */
  price?: number | null;
  /** Cost price to use if the product has to be created. */
  costPrice?: number | null;
  /** Initial stock to use if the product has to be created. */
  stockQuantity?: number | null;
};

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

  const existing = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM products WHERE name = ? COLLATE NOCASE LIMIT 1",
    trimmed,
  );
  if (existing) return existing.id;

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
 * Stock is clamped at zero so a mistyped sale can't leave negative inventory.
 */
export async function applyStockDelta(
  db: SQLiteDatabase,
  productId: number,
  delta: number,
): Promise<void> {
  if (!delta) return;

  await db.runAsync(
    "UPDATE products SET stock_quantity = MAX(0, stock_quantity + ?), updated_at = datetime('now') WHERE id = ?",
    delta,
    productId,
  );
}
