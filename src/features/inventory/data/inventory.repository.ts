import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";

import type {
  CreateProductInput,
  Product,
  ProductSummary,
} from "../types";

type ProductRow = {
  id: number;
  name: string;
  category: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

const LOW_STOCK_THRESHOLD = 10;

function mapProduct(row: ProductRow): Product {
  const product = mapCamelCase<Omit<Product, "stockQuantity">>(
    row as unknown as Record<string, unknown>,
  );
  return { ...product, stockQuantity: row.stock_quantity };
}

export async function fetchProducts(): Promise<Product[]> {
  const db = getDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync<ProductRow>(
    "SELECT id, name, category, price, cost_price, stock_quantity, created_at, updated_at FROM products ORDER BY name COLLATE NOCASE ASC",
  );
  return rows.map(mapProduct);
}

export async function createProduct(input: CreateProductInput): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.runAsync(
    `INSERT INTO products (name, category, price, cost_price, stock_quantity, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    input.name,
    input.category ?? null,
    input.price,
    input.costPrice ?? null,
    input.stockQuantity ?? 0,
  );
}

export async function updateProduct(
  id: number,
  input: Partial<CreateProductInput>,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.runAsync(
    `UPDATE products
     SET name = ?, category = ?, price = ?, cost_price = ?, updated_at = datetime('now')
     WHERE id = ?`,
    input.name ?? "",
    input.category ?? null,
    input.price ?? 0,
    input.costPrice ?? null,
    id,
  );
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync("DELETE FROM products WHERE id = ?", id);
}

export async function adjustProductStock(
  id: number,
  delta: number,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.runAsync(
    "UPDATE products SET stock_quantity = MAX(0, stock_quantity + ?), updated_at = datetime('now') WHERE id = ?",
    delta,
    id,
  );
}

export async function fetchProductSummary(): Promise<ProductSummary> {
  const db = getDatabase();
  if (!db) {
    return { productCount: 0, totalUnits: 0, totalStockValue: 0, lowStockCount: 0 };
  }

  const row = await db.getFirstAsync<{
    productCount: number;
    totalUnits: number;
    totalStockValue: number;
    lowStockCount: number;
  }>(
    `SELECT COUNT(*) as productCount,
            COALESCE(SUM(stock_quantity), 0) as totalUnits,
            COALESCE(SUM(price * stock_quantity), 0) as totalStockValue,
            COALESCE(SUM(CASE WHEN stock_quantity < ? THEN 1 ELSE 0 END), 0) as lowStockCount
     FROM products`,
    LOW_STOCK_THRESHOLD,
  );

  return {
    productCount: row?.productCount ?? 0,
    totalUnits: row?.totalUnits ?? 0,
    totalStockValue: row?.totalStockValue ?? 0,
    lowStockCount: row?.lowStockCount ?? 0,
  };
}
