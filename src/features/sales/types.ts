export type SalesEntry = {
  id: number;
  product: string;
  quantity: number;
  price: number;
  amount: number;
  customer: string | null;
  costPrice: number | null;
  soldAt: string;
};

export type CreateSalesEntryInput = {
  product: string;
  quantity: number;
  price: number;
  amount: number;
  customer?: string | null;
  costPrice?: number | null;
};

export type SalesSummary = {
  totalAmount: number;
  totalQuantity: number;
  entryCount: number;
};
