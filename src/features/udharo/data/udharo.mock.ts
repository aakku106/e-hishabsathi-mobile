import type { UdharoEntry } from "../types";

export type { UdharoEntry };

export type UdharoEntryMock = {
  name: string;
  amount: string;
};

export const UDHARO_ENTRIES: UdharoEntryMock[] = [
  {
    name: "Rahul Timelsena",
    amount: "Rs. 240",
  },
  {
    name: "Sita Kirana",
    amount: "Rs. 11,500",
  },
  {
    name: "Maya Suppliers",
    amount: "Rs. 38,000",
  },
];
