import { z } from "zod";

export const optionalText = z.string().trim().optional().nullable();

export const requiredText = z
  .string()
  .trim()
  .min(1, "This field is required");

export const positiveNumber = z
  .coerce
  .number()
  .positive("Must be a positive number");

export const nonNegativeNumber = z
  .coerce
  .number()
  .nonnegative("Must be zero or more");

export const amountString = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return false;
      const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) && parsed >= 0;
    },
    { message: "Enter a valid amount" },
  );

export function zodErrorMessages(error: z.ZodError): Record<string, string> {
  const messages: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!messages[key]) messages[key] = issue.message;
  }
  return messages;
}
