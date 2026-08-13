import type { SQLiteDatabase } from "expo-sqlite";

import { SEED_DEMO_DATA } from "@/config/app";
import { logger } from "@/shared/utils/logger";

function isoDaysAgo(days: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/**
 * Seeds demo entries so the alpha build shows realistic data on first launch.
 * Only runs when the tables are completely empty and SEED_DEMO_DATA is enabled.
 */
export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  if (!SEED_DEMO_DATA) return;

  const sales = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sales_entries",
  );
  if ((sales?.count ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO businesses (name, type, pan, phone, address) VALUES (?, ?, ?, ?, ?)`,
      "My Kirana Store",
      "retail",
      null,
      null,
      null,
    );

    const salesSeeds: [string, number, number, number][] = [
      ["Pant", 1, 1000, 7],
      ["Pant", 2, 250, 5],
      ["Kurtha", 4, 167.5, 3],
      ["Black Pants", 20, 500, 0],
      ["Red Socks", 13, 100, 0],
      ["Gray Hat", 3, 300, 0],
      ["Pink Skirt", 1, 350, 0],
    ];
    for (const [product, quantity, price, daysAgo] of salesSeeds) {
      await db.runAsync(
        `INSERT INTO sales_entries (product, quantity, price, amount, sold_at) VALUES (?, ?, ?, ?, ?)`,
        product,
        quantity,
        price,
        quantity * price,
        isoDaysAgo(daysAgo),
      );
    }

    const purchaseSeeds: [string, number, number][] = [
      ["Pant", 5, 800],
      ["Kurtha", 10, 120],
    ];
    for (const [product, quantity, price] of purchaseSeeds) {
      await db.runAsync(
        `INSERT INTO purchase_entries (product, quantity, price, amount, purchased_at) VALUES (?, ?, ?, ?, ?)`,
        product,
        quantity,
        price,
        quantity * price,
        isoDaysAgo(1, 10),
      );
    }

    const udharoSeeds: [string, number, number][] = [
      ["Rahul Timelsena", 240, 3],
      ["Sita Kirana", 11500, 0],
      ["Maya Suppliers", 38000, 8],
    ];
    for (const [name, amount, dueInDays] of udharoSeeds) {
      await db.runAsync(
        `INSERT INTO udharo_entries (name, amount, due_date, status, created_at) VALUES (?, ?, ?, ?, ?)`,
        name,
        amount,
        isoDaysAgo(-dueInDays),
        "on_track",
        isoDaysAgo(dueInDays),
      );
    }

    const productSeeds: [string, string | null, number, number, number][] = [
      ["Pant", "Clothing", 1000, 800, 20],
      ["Kurtha", "Clothing", 670, 120, 15],
      ["Black Pants", "Clothing", 500, 300, 30],
      ["Red Socks", "Clothing", 100, 50, 50],
      ["Gray Hat", "Clothing", 300, 180, 12],
      ["Pink Skirt", "Clothing", 350, 200, 10],
    ];
    for (const [name, category, price, costPrice, stock] of productSeeds) {
      await db.runAsync(
        `INSERT INTO products (name, category, price, cost_price, stock_quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        name,
        category,
        price,
        costPrice,
        stock,
      );
    }
  });

  logger.info("Seeded demo data");
}
