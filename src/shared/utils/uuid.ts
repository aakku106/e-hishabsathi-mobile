import * as Crypto from "expo-crypto";

export function generateUuid(): string {
  return Crypto.randomUUID();
}
