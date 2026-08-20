import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import { generateUuid } from "@/shared/utils/uuid";

import { UDHARO_ENTRIES } from "./udharo.mock";
import type {
  CreateUdharoEntryInput,
  UdharoEntry,
  UdharoStatus,
  UdharoSummary,
} from "../types";

type UdharoRow = {
  id: number;
  name: string;
  amount: number;
  due_date: string | null;
  status: string;
  created_at: string;
};

const FALLBACK_ENTRIES: UdharoEntry[] = UDHARO_ENTRIES.map((entry, index) => ({
  id: index + 1,
  name: entry.name,
  amount: Number.parseFloat(entry.amount.replace(/[^0-9.-]/g, "")) || 0,
  dueDate: null,
  status: "on_track",
  createdAt: new Date().toISOString(),
}));

function toStatus(value: string): UdharoStatus {
  if (value === "overdue" || value === "paid") return value;
  return "on_track";
}

export async function fetchUdharoEntries(): Promise<UdharoEntry[]> {
  const db = getDatabase();
  if (!db) return FALLBACK_ENTRIES;

  const rows = await db.getAllAsync<UdharoRow>(
    "SELECT id, name, amount, due_date, status, created_at FROM udharo_entries ORDER BY created_at DESC, id DESC LIMIT 100",
  );

  return rows.map((row) => {
    const entry = mapCamelCase<Omit<UdharoEntry, "status">>(
      row as unknown as Record<string, unknown>,
    );
    return { ...entry, status: toStatus(row.status) };
  });
}

export async function createUdharoEntry(
  input: CreateUdharoEntryInput,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO udharo_entries (name, amount, due_date, status, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      input.name,
      input.amount,
      input.dueDate ?? null,
      input.status ?? "on_track",
    );

    const existing = await db.getFirstAsync<{ id: string }>(
      "SELECT id FROM local_udaaro_customers WHERE full_name = ?",
      input.name,
    );
    let customerId = existing?.id ?? null;
    if (!customerId) {
      customerId = generateUuid();
      await db.runAsync(
        "INSERT INTO local_udaaro_customers (id, full_name, phone_number) VALUES (?, ?, ?)",
        customerId,
        input.name,
        input.phoneNumber ?? null,
      );
    } else if (input.phoneNumber) {
      await db.runAsync(
        "UPDATE local_udaaro_customers SET phone_number = ? WHERE id = ?",
        input.phoneNumber,
        customerId,
      );
    }

    const entryDate = new Date().toISOString().slice(0, 10);
    await db.runAsync(
      `INSERT INTO local_udaaro_ledger (id, customer_id, transaction_type, amount, transaction_date)
       VALUES (?, ?, 'CREDIT_GIVEN', ?, ?)`,
      generateUuid(),
      customerId,
      input.amount,
      entryDate,
    );

    if (input.status === "paid") {
      await db.runAsync(
        `INSERT INTO local_udaaro_ledger (id, customer_id, transaction_type, amount, transaction_date)
         VALUES (?, ?, 'PAYMENT_RECEIVED', ?, ?)`,
        generateUuid(),
        customerId,
        input.amount,
        entryDate,
      );
    }
  });
}

export async function deleteUdharoEntry(id: number): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync("DELETE FROM udharo_entries WHERE id = ?", id);
}

export async function fetchUdharoSummary(): Promise<UdharoSummary> {
  const db = getDatabase();
  if (!db) {
    return {
      totalAmount: FALLBACK_ENTRIES.reduce(
        (sum, entry) => sum + entry.amount,
        0,
      ),
      entryCount: FALLBACK_ENTRIES.length,
      overdueCount: 0,
    };
  }

  const row = await db.getFirstAsync<{
    totalAmount: number;
    entryCount: number;
    overdueCount: number;
  }>(
    `SELECT COALESCE(SUM(amount), 0) as totalAmount,
            COUNT(*) as entryCount,
            SUM(CASE WHEN status = 'overdue' OR (due_date IS NOT NULL AND due_date < datetime('now')) THEN 1 ELSE 0 END) as overdueCount
     FROM udharo_entries`,
  );

  return {
    totalAmount: row?.totalAmount ?? 0,
    entryCount: row?.entryCount ?? 0,
    overdueCount: row?.overdueCount ?? 0,
  };
}
