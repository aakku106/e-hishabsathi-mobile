import type { SalesEntry } from "../types";

export type { SalesEntry };

export type SalesEntryMock = {
  product: string;
  quantity: number;
  amount: number;
};

export const SALES_ENTRIES: SalesEntryMock[] = [
  {
    product: "Pant",
    quantity: 1,
    amount: 1000,
  },
  {
    product: "Pant",
    quantity: 2,
    amount: 500,
  },
  {
    product: "Kurtha",
    quantity: 4,
    amount: 670,
  },
];
