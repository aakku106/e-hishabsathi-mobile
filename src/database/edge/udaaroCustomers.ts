import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";
import { generateUuid } from "@/shared/utils/uuid";

import type { LocalUdaaroCustomer } from "./types";

type CustomerRow = {
  id: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  created_at: string;
};

export type CreateCustomerInput = {
  fullName: string;
  phoneNumber?: string | null;
  address?: string | null;
};

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<string> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const id = generateUuid();
  await db.runAsync(
    `INSERT INTO local_udaaro_customers (id, full_name, phone_number, address)
     VALUES (?, ?, ?, ?)`,
    id,
    input.fullName,
    input.phoneNumber ?? null,
    input.address ?? null,
  );
  return id;
}

/**
 * Finds a customer by name (case-insensitive) or creates one. Used by the
 * udharo screen and by credit sales, so both paths share a single customer
 * identity instead of duplicating names.
 */
export async function findOrCreateCustomer(
  input: CreateCustomerInput,
): Promise<string> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const existing = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM local_udaaro_customers WHERE full_name = ? COLLATE NOCASE LIMIT 1",
    input.fullName.trim(),
  );

  if (existing) {
    if (input.phoneNumber) {
      await db.runAsync(
        "UPDATE local_udaaro_customers SET phone_number = ? WHERE id = ?",
        input.phoneNumber,
        existing.id,
      );
    }
    return existing.id;
  }

  return createCustomer({ ...input, fullName: input.fullName.trim() });
}

export async function fetchCustomers(): Promise<LocalUdaaroCustomer[]> {
  const db = getDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync<CustomerRow>(
    "SELECT * FROM local_udaaro_customers ORDER BY full_name COLLATE NOCASE ASC",
  );

  return rows.map((row) =>
    mapCamelCase<LocalUdaaroCustomer>(row as unknown as Record<string, unknown>),
  );
}

export async function fetchCustomerById(
  id: string,
): Promise<LocalUdaaroCustomer | null> {
  const db = getDatabase();
  if (!db) return null;

  const row = await db.getFirstAsync<CustomerRow>(
    "SELECT * FROM local_udaaro_customers WHERE id = ?",
    id,
  );
  if (!row) return null;

  return mapCamelCase<LocalUdaaroCustomer>(
    row as unknown as Record<string, unknown>,
  );
}

export async function updateCustomer(
  id: string,
  input: Partial<CreateCustomerInput>,
): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync(
    `UPDATE local_udaaro_customers
     SET full_name = COALESCE(?, full_name),
         phone_number = ?,
         address = ?
     WHERE id = ?`,
    input.fullName ?? null,
    input.phoneNumber ?? null,
    input.address ?? null,
    id,
  );
}

export async function deleteCustomer(id: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync(
    "DELETE FROM local_udaaro_customers WHERE id = ?",
    id,
  );
}
