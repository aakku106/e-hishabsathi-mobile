import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import { createLedgerEntry, findOrCreateCustomer } from "@/database/edge";

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
  customer_id: string | null;
  phone_number: string | null;
  created_at: string;
};

const FALLBACK_ENTRIES: UdharoEntry[] = UDHARO_ENTRIES.map((entry, index) => ({
  id: index + 1,
  name: entry.name,
  amount: Number.parseFloat(entry.amount.replace(/[^0-9.-]/g, "")) || 0,
  dueDate: null,
  status: "on_track",
  customerId: null,
  phoneNumber: null,
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
    `SELECT u.id, u.name, u.amount, u.due_date, u.status, u.customer_id, u.created_at,
            c.phone_number
     FROM udharo_entries u
     LEFT JOIN local_udaaro_customers c ON c.id = u.customer_id
     ORDER BY u.created_at DESC, u.id DESC LIMIT 100`,
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

  const entryDate = new Date().toISOString().slice(0, 10);

  await db.withTransactionAsync(async () => {
    // One customer row per name, shared with credit sales.
    const customerId = await findOrCreateCustomer({
      fullName: input.name,
      phoneNumber: input.phoneNumber ?? null,
    });

    const entry = await db.runAsync(
      `INSERT INTO udharo_entries (name, amount, due_date, status, customer_id, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      input.name,
      input.amount,
      input.dueDate ?? null,
      input.status ?? "on_track",
      customerId,
    );

    await createLedgerEntry({
      customerId,
      transactionType: "CREDIT_GIVEN",
      amount: input.amount,
      transactionDate: entryDate,
      udharoEntryId: entry.lastInsertRowId,
    });

    if (input.status === "paid") {
      await createLedgerEntry({
        customerId,
        transactionType: "PAYMENT_RECEIVED",
        amount: input.amount,
        transactionDate: entryDate,
        udharoEntryId: entry.lastInsertRowId,
      });
    }
  });
}

export async function deleteUdharoEntry(id: number): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.withTransactionAsync(async () => {
    // The ledger rows belong to this entry, so they go with it.
    await db.runAsync(
      "DELETE FROM local_udaaro_ledger WHERE udharo_entry_id = ?",
      id,
    );
    await db.runAsync("DELETE FROM udharo_entries WHERE id = ?", id);
  });
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
