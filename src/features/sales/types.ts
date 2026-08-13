export type SalesEntry = {
  id: number;
  product: string;
  quantity: number;
  price: number;
  amount: number;
  customer: string | null;
  costPrice: number | null;
  extraDetail: string | null;
  extraValue: string | null;
  color: string | null;
  soldAt: string;
};

export type CreateSalesEntryInput = {
  product: string;
  quantity: number;
  price: number;
  amount: number;
  customer?: string | null;
  costPrice?: number | null;
  extraDetail?: string | null;
  extraValue?: string | null;
  color?: string | null;
};

export type SalesSummary = {
  totalAmount: number;
  totalQuantity: number;
  entryCount: number;
};
