import { getDatabase } from "@/database/sqlite";
import { generateUuid } from "@/shared/utils/uuid";

import type {
  LedgerTransactionType,
  LocalUdaaroLedgerEntry,
} from "./types";

type LedgerRow = {
  id: string;
  customer_id: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  notes: string | null;
  is_cleared: number;
  created_at: string;
};

export type CreateLedgerEntryInput = {
  customerId: string;
  transactionType: LedgerTransactionType;
  amount: number;
  transactionDate: string;
  notes?: string | null;
};

function mapLedgerRow(row: LedgerRow): LocalUdaaroLedgerEntry {
  return {
    id: row.id,
    customerId: row.customer_id,
    transactionType: row.transaction_type as LedgerTransactionType,
    amount: row.amount,
    transactionDate: row.transaction_date,
    notes: row.notes,
    isCleared: row.is_cleared === 1,
    createdAt: row.created_at,
  };
}

export async function createLedgerEntry(
  input: CreateLedgerEntryInput,
): Promise<string> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const id = generateUuid();
  await db.runAsync(
    `INSERT INTO local_udaaro_ledger (id, customer_id, transaction_type, amount, transaction_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    input.customerId,
    input.transactionType,
    input.amount,
    input.transactionDate,
    input.notes ?? null,
  );
  return id;
}

export async function fetchLedgerForCustomer(
  customerId: string,
): Promise<LocalUdaaroLedgerEntry[]> {
  const db = getDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync<LedgerRow>(
    "SELECT * FROM local_udaaro_ledger WHERE customer_id = ? ORDER BY transaction_date DESC, created_at DESC",
    customerId,
  );

  return rows.map(mapLedgerRow);
}

/** Net outstanding balance: CREDIT_GIVEN (borrow) minus PAYMENT_RECEIVED (repay). */
export async function fetchCustomerBalance(
  customerId: string,
): Promise<number> {
  const db = getDatabase();
  if (!db) return 0;

  const row = await db.getFirstAsync<{ balance: number }>(
    `SELECT COALESCE(
       SUM(CASE WHEN transaction_type = 'CREDIT_GIVEN' THEN amount ELSE -amount END),
       0
     ) as balance
     FROM local_udaaro_ledger
     WHERE customer_id = ?`,
    customerId,
  );

  return row?.balance ?? 0;
}

export async function markLedgerEntryCleared(
  id: string,
  cleared = true,
): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync(
    "UPDATE local_udaaro_ledger SET is_cleared = ? WHERE id = ?",
    cleared ? 1 : 0,
    id,
  );
}
