export type SalesEntry = {
  id: number;
  product: string;
  productId: number | null;
  quantity: number;
  price: number;
  amount: number;
  customer: string | null;
  costPrice: number | null;
  extraDetail: string | null;
  extraValue: string | null;
  color: string | null;
  clientBatchId: string | null;
  soldAt: string;
};

export type CreateSalesEntryInput = {
  product: string;
  productId?: number | null;
  quantity: number;
  price: number;
  amount: number;
  customer?: string | null;
  costPrice?: number | null;
  extraDetail?: string | null;
  extraValue?: string | null;
  color?: string | null;
};

export type CreateSalesBatchInput = {
  items: CreateSalesEntryInput[];
  /** Customer name, required when `paymentType` is `udharo`. */
  customer?: string | null;
  paymentType?: "cash" | "udharo";
  dueDate?: string | null;
};

export type SalesSummary = {
  totalAmount: number;
  totalQuantity: number;
  entryCount: number;
};
