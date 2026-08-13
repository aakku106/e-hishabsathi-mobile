import { z } from "zod";

import { nonNegativeNumber, positiveNumber } from "@/shared/utils/validation";

export const CreatePurchaseEntrySchema = z.object({
  product: z.string().trim().min(1, "Product name is required"),
  quantity: positiveNumber,
  price: positiveNumber,
  amount: nonNegativeNumber,
});

export type CreatePurchaseEntryFormValues = z.infer<
  typeof CreatePurchaseEntrySchema
>;

export function parsePurchaseEntryInput(
  input: CreatePurchaseEntryFormValues,
) {
  return CreatePurchaseEntrySchema.parse(input);
}
