import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import { generateUuid } from "@/shared/utils/uuid";

import type {
  BackupStatus,
  LocalUdaaroBackupLog,
} from "./types";

type BackupLogRow = {
  id: string;
  backup_at: string;
  record_count: number;
  status: string;
  remote_ref: string | null;
  created_at: string;
};

export type CreateBackupLogInput = {
  backupAt: string;
  recordCount: number;
};

export async function createBackupLog(
  input: CreateBackupLogInput,
): Promise<string> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const id = generateUuid();
  await db.runAsync(
    `INSERT INTO local_udaaro_backup_log (id, backup_at, record_count)
     VALUES (?, ?, ?)`,
    id,
    input.backupAt,
    input.recordCount,
  );
  return id;
}

export async function updateBackupStatus(
  id: string,
  status: BackupStatus,
  remoteRef?: string | null,
): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync(
    `UPDATE local_udaaro_backup_log
     SET status = ?, remote_ref = ?
     WHERE id = ?`,
    status,
    remoteRef ?? null,
    id,
  );
}

export async function fetchBackupLogs(): Promise<LocalUdaaroBackupLog[]> {
  const db = getDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync<BackupLogRow>(
    "SELECT * FROM local_udaaro_backup_log ORDER BY backup_at DESC",
  );

  return rows.map((row) =>
    mapCamelCase<LocalUdaaroBackupLog>(row as unknown as Record<string, unknown>),
  );
}
