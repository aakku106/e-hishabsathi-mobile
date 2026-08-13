import type { SQLiteDatabase } from "expo-sqlite";

import { logger } from "@/shared/utils/logger";
import { MIGRATIONS } from "../schema";

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion > MIGRATIONS.length) {
    logger.warn(
      `Database version ${currentVersion} is newer than the app schema (${MIGRATIONS.length}). Skipping migrations.`,
    );
    return;
  }

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);

  for (const migration of pending) {
    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync(migration.sql);
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
      });
      logger.info(
        `Applied migration v${migration.version} (${migration.name})`,
      );
    } catch (error) {
      logger.error(
        `Migration v${migration.version} (${migration.name}) failed`,
        error,
      );
      throw error;
    }
  }
}
