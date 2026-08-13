export type PurchaseEntry = {
  id: number;
  product: string;
  quantity: number;
  price: number;
  amount: number;
  purchasedAt: string;
};

export type CreatePurchaseEntryInput = {
  product: string;
  quantity: number;
  price: number;
  amount: number;
};
