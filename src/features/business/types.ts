import type { BusinessType } from "@/shared/constants/businessTypes";

export type Business = {
  id: number;
  name: string;
  type: BusinessType;
  pan: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
};

export type CreateBusinessInput = {
  name: string;
  type?: BusinessType;
  pan?: string | null;
  phone?: string | null;
  address?: string | null;
};
