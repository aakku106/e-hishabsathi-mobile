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
