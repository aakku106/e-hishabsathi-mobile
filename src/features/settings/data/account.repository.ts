import { getDatabase } from "@/database/sqlite";

const ACCOUNT_DATA_TABLES = [
  "local_udaaro_ledger",
  "local_udaaro_backup_log",
  "local_sync_queue",
  "udharo_entries",
  "sales_entries",
  "purchase_entries",
  "products",
  "local_udaaro_customers",
  "businesses",
  "app_settings",
] as const;

export async function deleteAllAccountData(): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.withTransactionAsync(async () => {
    for (const table of ACCOUNT_DATA_TABLES) {
      await db.runAsync(`DELETE FROM ${table}`);
    }
    await db.runAsync("DELETE FROM sqlite_sequence");
  });
}
