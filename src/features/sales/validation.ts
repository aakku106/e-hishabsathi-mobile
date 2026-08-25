import { z } from "zod";

import { nonNegativeNumber, positiveNumber } from "@/shared/utils/validation";

export const CreateSalesEntrySchema = z.object({
  product: z.string().trim().min(1, "Product name is required"),
  quantity: positiveNumber,
  price: positiveNumber,
  amount: nonNegativeNumber,
  customer: z.string().trim().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  extraDetail: z.string().trim().optional().nullable(),
  extraValue: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
});

export type CreateSalesEntryFormValues = z.infer<typeof CreateSalesEntrySchema>;

export function parseSalesEntryInput(input: CreateSalesEntryFormValues) {
  return CreateSalesEntrySchema.parse(input);
}
