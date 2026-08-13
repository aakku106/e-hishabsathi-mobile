import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import { generateUuid } from "@/shared/utils/uuid";

import type {
  EntityType,
  LocalSyncQueueEntry,
  SyncStatus,
} from "./types";

type EnqueueInput = {
  clientEntryId: string;
  entityType: EntityType;
  payloadJson: string;
  entryDate: string;
};

type SyncQueueRow = {
  id: string;
  client_entry_id: string;
  entity_type: string;
  payload_json: string;
  sync_status: string;
  retry_count: number;
  entry_date: string;
  last_attempt_at: string | null;
  created_at: string;
};

export async function enqueueRecord(
  input: EnqueueInput,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.runAsync(
    `INSERT INTO local_sync_queue (id, client_entry_id, entity_type, payload_json, entry_date)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (client_entry_id) DO NOTHING`,
    generateUuid(),
    input.clientEntryId,
    input.entityType,
    input.payloadJson,
    input.entryDate,
  );
}

export async function fetchQueueEntries(
  status?: SyncStatus,
): Promise<LocalSyncQueueEntry[]> {
  const db = getDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync<SyncQueueRow>(
    status
      ? "SELECT * FROM local_sync_queue WHERE sync_status = ? ORDER BY created_at ASC"
      : "SELECT * FROM local_sync_queue ORDER BY created_at ASC",
    ...(status ? [status] : []),
  );

  return rows.map((row) =>
    mapCamelCase<LocalSyncQueueEntry>(
      row as unknown as Record<string, unknown>,
    ),
  );
}

export async function markSyncing(ids: string[]): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  for (const id of ids) {
    await db.runAsync(
      `UPDATE local_sync_queue
       SET sync_status = 'SYNCING', last_attempt_at = datetime('now')
       WHERE id = ?`,
      id,
    );
  }
}

export async function markSynced(ids: string[]): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  for (const id of ids) {
    await db.runAsync(
      "UPDATE local_sync_queue SET sync_status = 'SYNCED' WHERE id = ?",
      id,
    );
  }
}

export async function markFailed(ids: string[]): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  for (const id of ids) {
    await db.runAsync(
      `UPDATE local_sync_queue
       SET sync_status = 'FAILED', retry_count = retry_count + 1, last_attempt_at = datetime('now')
       WHERE id = ?`,
      id,
    );
  }
}

/**
 * Retention rule: a local row is deleted only once it is BOTH `SYNCED`
 * AND past its 7-day edit window (evaluated per entry_date).
 */
export async function purgeSyncedOlderThan(days = 7): Promise<number> {
  const db = getDatabase();
  if (!db) return 0;

  const result = await db.runAsync(
    `DELETE FROM local_sync_queue
     WHERE sync_status = 'SYNCED'
       AND entry_date < date('now', ?)`,
    `-${days} days`,
  );
  return result.changes ?? 0;
}
