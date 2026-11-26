import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import { APP_DB_NAME } from "@/config/app";
import { migrateDatabase } from "./migrations";
import { seedDatabase } from "./seeds";

let database: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Thrown when the web build cannot get an exclusive handle on the OPFS
 * database because another tab (or a lingering worker) still holds it.
 */
export class DatabaseLockedError extends Error {
  constructor() {
    super(
      "The local database is already open in another tab. Close the other tabs and reload to keep saving data on this device.",
    );
    this.name = "DatabaseLockedError";
  }
}

/**
 * expo-sqlite on web keeps the database in OPFS and needs one exclusive
 * `FileSystemSyncAccessHandle` per file. A second tab makes
 * `createSyncAccessHandle()` fail with `NoModificationAllowedError` (or
 * `InvalidStateError` on older Chromium). expo-sqlite re-wraps the worker
 * error as `new Error(String(cause))`, so the name only survives in the
 * message.
 *
 * Retrying is not an option: the web worker caches the wasm module before
 * creating the VFS, so after a failed attempt every later call throws
 * `Invalid VFS state` instead.
 */
function isWebDatabaseLockError(error: unknown): boolean {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  return (
    message.includes("NoModificationAllowedError") ||
    message.includes("InvalidStateError") ||
    message.includes("another open Access Handle")
  );
}

async function openDatabase(): Promise<SQLiteDatabase> {
  try {
    return await openDatabaseAsync(APP_DB_NAME);
  } catch (error) {
    if (Platform.OS === "web" && isWebDatabaseLockError(error)) {
      throw new DatabaseLockedError();
    }
    throw error;
  }
}

/**
 * SQLite disables foreign key enforcement on every new connection, so the
 * schema's `ON DELETE SET NULL` / `ON DELETE CASCADE` rules only work after
 * this runs. `PRAGMA foreign_keys` is a no-op inside a transaction, which is
 * why it must happen before `migrateDatabase()` opens one.
 */
async function enableForeignKeys(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  const row = await db.getFirstAsync<{ foreign_keys: number }>(
    "PRAGMA foreign_keys",
  );
  if (row?.foreign_keys !== 1) {
    throw new Error("SQLite foreign key enforcement could not be enabled.");
  }
}

export function getDatabase(): SQLiteDatabase | null {
  return database;
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  if (database) return database;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await openDatabase();

    try {
      await enableForeignKeys(db);
      await migrateDatabase(db);
      await seedDatabase(db);
    } catch (error) {
      // Don't leave a half-initialized database holding the OPFS handle.
      await db.closeAsync().catch(() => {});
      throw error;
    }

    database = db;
    return db;
  })();

  try {
    return await initPromise;
  } catch (error) {
    initPromise = null;
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    const db = database;
    database = null;
    initPromise = null;
    // `closeAsync` keeps web off the synchronous SQLite bridge.
    await db.closeAsync();
  }
}
