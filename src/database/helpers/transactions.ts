import type { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

/**
 * Runs `task` in a transaction that other async queries cannot interleave.
 *
 * `withTransactionAsync` reuses the main connection, so an unrelated query
 * awaited elsewhere in the app can land between two statements of the
 * callback. expo-sqlite's exclusive variant opens a separate connection and
 * keeps the write lock for the whole callback, which is what a checkout needs:
 * stock, sales rows, the outbox entry, and the udharo receivable must commit
 * or roll back as one unit.
 *
 * The exclusive connection is new, so it does not inherit
 * `PRAGMA foreign_keys = ON` from `initDatabase()`, and the pragma is a no-op
 * inside a transaction. Checkout only inserts references it creates or reads
 * inside this callback, so foreign-key enforcement is not needed there; every
 * other write path still runs on the main connection with enforcement on.
 *
 * Web cannot open a second OPFS connection, so it falls back to a regular
 * transaction on the single connection.
 */
export async function withExclusiveTransaction(
  db: SQLiteDatabase,
  task: (txn: SQLiteDatabase) => Promise<void>,
): Promise<void> {
  if (Platform.OS === "web") {
    await db.withTransactionAsync(() => task(db));
    return;
  }

  await db.withExclusiveTransactionAsync(task);
}
