import type { SQLiteDatabase } from "expo-sqlite";

import { SEED_DEMO_DATA } from "@/config/app";
import { logger } from "@/shared/utils/logger";

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
  });

  logger.info("Seeded demo data (business only)");
}