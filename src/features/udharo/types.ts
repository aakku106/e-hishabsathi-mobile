export type UdharoStatus = "on_track" | "overdue" | "paid";

export type UdharoEntry = {
  id: number;
  name: string;
  amount: number;
  dueDate: string | null;
  status: UdharoStatus;
  createdAt: string;
};

export type CreateUdharoEntryInput = {
  name: string;
  amount: number;
  dueDate?: string | null;
  status?: UdharoStatus;
};

export type UdharoSummary = {
  totalAmount: number;
  entryCount: number;
  overdueCount: number;
};
