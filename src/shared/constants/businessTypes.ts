export const BusinessTypes = {
  retail: "retail",
  wholesale: "wholesale",
  restaurant: "restaurant",
  service: "service",
  other: "other",
} as const;

export type BusinessType = (typeof BusinessTypes)[keyof typeof BusinessTypes];
