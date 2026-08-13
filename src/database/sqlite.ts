import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import { APP_DB_NAME } from "@/config/app";
import { logger } from "@/shared/utils/logger";
import { migrateDatabase } from "./migrations";
import { seedDatabase } from "./seeds";

let database: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): SQLiteDatabase | null {
  return database;
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  if (database) return database;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await openDatabaseAsync(APP_DB_NAME);
    await migrateDatabase(db);
    await seedDatabase(db);
    database = db;
    return db;
  })();

  try {
    return await initPromise;
  } catch (error) {
    initPromise = null;
    logger.error("Failed to initialize database", error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    database.closeSync();
    database = null;
    initPromise = null;
  }
}
