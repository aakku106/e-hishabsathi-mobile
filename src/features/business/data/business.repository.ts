import { getDatabase } from "@/database/sqlite";
import { mapCamelCase } from "@/database/helpers";

import type { Business, CreateBusinessInput } from "../types";
import type { BusinessType } from "@/shared/constants/businessTypes";

type BusinessRow = {
  id: number;
  name: string;
  type: string;
  pan: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
};

const BUSINESS_TYPES: BusinessType[] = [
  "retail",
  "wholesale",
  "restaurant",
  "service",
  "other",
];

function isBusinessType(value: string): value is BusinessType {
  return (BUSINESS_TYPES as string[]).includes(value);
}

export async function fetchBusiness(): Promise<Business | null> {
  const db = getDatabase();
  if (!db) return null;

  const row = await db.getFirstAsync<BusinessRow>(
    "SELECT id, name, type, pan, phone, address, created_at FROM businesses ORDER BY id ASC LIMIT 1",
  );
  if (!row) return null;

  const business = mapCamelCase<Omit<Business, "type">>(
    row as unknown as Record<string, unknown>,
  );
  return { ...business, type: isBusinessType(row.type) ? row.type : "other" };
}

export async function createBusiness(
  input: CreateBusinessInput,
): Promise<Business> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const result = await db.runAsync(
    `INSERT INTO businesses (name, type, pan, phone, address, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    input.name,
    input.type ?? "retail",
    input.pan ?? null,
    input.phone ?? null,
    input.address ?? null,
  );

  const row = await db.getFirstAsync<BusinessRow>(
    "SELECT id, name, type, pan, phone, address, created_at FROM businesses WHERE id = ?",
    result.lastInsertRowId,
  );
  if (!row) throw new Error("Failed to load created business");

  const business = mapCamelCase<Omit<Business, "type">>(
    row as unknown as Record<string, unknown>,
  );
  return { ...business, type: isBusinessType(row.type) ? row.type : "other" };
}

export async function updateBusinessType(
  id: number,
  type: BusinessType,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.runAsync("UPDATE businesses SET type = ? WHERE id = ?", type, id);
}

export async function updateBusiness(
  id: number,
  input: Partial<CreateBusinessInput>,
): Promise<void> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  await db.runAsync(
    `UPDATE businesses SET name = ?, pan = ?, phone = ?, address = ? WHERE id = ?`,
    input.name ?? "",
    input.pan ?? null,
    input.phone ?? null,
    input.address ?? null,
    id,
  );
}
