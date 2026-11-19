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
  /**
   * When true, every line must match an existing inventory product; unknown
   * names throw instead of creating a product. Mirrors the Sales page setting.
   */
  requireInventory?: boolean;
};

export type SalesSummary = {
  totalAmount: number;
  totalQuantity: number;
  entryCount: number;
};
