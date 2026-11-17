import { PRODUCT_STOCK_VALUE_EXPRESSION } from "@/database/products";
import { getDatabase } from "@/database/sqlite";

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
export const PRODUCTS_PAGE_SIZE = 50;

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    costPrice: row.cost_price,
    stockQuantity: row.stock_quantity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const rows = await db.getAllAsync<ProductRow>(
    "SELECT id, name, category, price, cost_price, stock_quantity, created_at, updated_at FROM products ORDER BY name COLLATE NOCASE ASC",
  );
  return rows.map(mapProduct);
}

export async function fetchProductsPage(
  limit: number,
  offset: number,
): Promise<Product[]> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const rows = await db.getAllAsync<ProductRow>(
    `SELECT id, name, category, price, cost_price, stock_quantity, created_at, updated_at
     FROM products
     ORDER BY name COLLATE NOCASE ASC
     LIMIT ? OFFSET ?`,
    limit,
    offset,
  );
  return rows.map(mapProduct);
}

export async function fetchProductSummary(): Promise<ProductSummary> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const row = await db.getFirstAsync<ProductSummary>(
    `SELECT COUNT(*) as productCount,
            COALESCE(SUM(stock_quantity), 0) as totalUnits,
            COALESCE(SUM(${PRODUCT_STOCK_VALUE_EXPRESSION}), 0) as totalStockValue,
            COALESCE(SUM(CASE WHEN stock_quantity < ? THEN 1 ELSE 0 END), 0) as lowStockCount
     FROM products`,
    LOW_STOCK_THRESHOLD,
  );

  if (!row) throw new Error("Inventory summary query returned no result");
  return row;
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
     SET name = COALESCE(?, name),
         category = ?,
         price = COALESCE(?, price),
         cost_price = ?,
         stock_quantity = COALESCE(?, stock_quantity),
         updated_at = datetime('now')
     WHERE id = ?`,
    input.name ?? null,
    input.category ?? null,
    input.price ?? null,
    input.costPrice ?? null,
    input.stockQuantity ?? null,
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
