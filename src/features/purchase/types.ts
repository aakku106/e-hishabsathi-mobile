export type PurchaseEntry = {
  id: number;
  product: string;
  productId: number | null;
  quantity: number;
  price: number;
  amount: number;
  purchasedAt: string;
};

export type CreatePurchaseEntryInput = {
  product: string;
  productId?: number | null;
  quantity: number;
  price: number;
  amount: number;
};
