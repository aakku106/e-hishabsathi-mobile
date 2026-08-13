import { z } from "zod";

import { positiveNumber } from "@/shared/utils/validation";

export const CreateProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  category: z.string().trim().optional().nullable(),
  price: positiveNumber,
  costPrice: z.coerce.number().positive().optional().nullable(),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
});

export type CreateProductFormValues = z.infer<typeof CreateProductSchema>;

export function parseProductInput(input: CreateProductFormValues) {
  return CreateProductSchema.parse(input);
}
