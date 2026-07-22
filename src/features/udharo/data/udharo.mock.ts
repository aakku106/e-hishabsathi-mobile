export type UdharoEntry = {
  name: string;
  amount: string;
  due: string;
  status: string;
};

export const UDHARO_ENTRIES: UdharoEntry[] = [
  {
    name: "Rahul Traders",
    amount: "Rs. 24,000",
    due: "Due in 3 days",
    status: "On track",
  },
  {
    name: "Sita Kirana",
    amount: "Rs. 11,500",
    due: "Due today",
    status: "Needs follow-up",
  },
  {
    name: "Maya Suppliers",
    amount: "Rs. 38,000",
    due: "Overdue 8 days",
    status: "Overdue",
  },
];