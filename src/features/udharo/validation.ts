import { z } from "zod";

import { nonNegativeNumber, requiredText } from "@/shared/utils/validation";

import type { UdharoStatus } from "./types";

export const CreateUdharoEntrySchema = z.object({
  name: requiredText,
  amount: nonNegativeNumber,
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
