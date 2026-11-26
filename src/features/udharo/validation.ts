import { z } from "zod";

import { positiveNumber, requiredText } from "@/shared/utils/validation";

import type { UdharoStatus } from "./types";

export const CreateUdharoEntrySchema = z.object({
  name: requiredText,
  // `local_udaaro_ledger.amount` rejects zero, and the ledger insert runs in
  // the same transaction, so a zero amount would silently roll back the save.
  amount: positiveNumber,
  phoneNumber: z.string().trim().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["on_track", "overdue", "paid"]).default("on_track"),
});

export type CreateUdharoEntryFormValues = z.infer<
  typeof CreateUdharoEntrySchema
>;

export const UDHARO_STATUSES: { label: string; value: UdharoStatus }[] = [
  { label: "On track", value: "on_track" },
  { label: "Overdue", value: "overdue" },
  { label: "Paid", value: "paid" },
];

export function parseUdharoEntryInput(input: CreateUdharoEntryFormValues) {
  return CreateUdharoEntrySchema.parse(input);
}
